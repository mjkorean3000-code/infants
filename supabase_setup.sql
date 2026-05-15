-- ==============================================================================
--  OnFans Supabase 초기 설정 가이드
--  ❗ 주의: Supabase SQL Editor에서 아래 STEP 순서대로 하나씩 실행하세요.
--  각 STEP 사이에 에러가 없는지 확인 후 다음 STEP으로 넘어가세요.
-- ==============================================================================


-- ██████████████████████████████████████████████████
-- STEP 1. 기존 데이터 초기화 (완전히 처음부터 시작할 때만 실행)
-- ⚠️ 주의: 기존 데이터가 전부 삭제됩니다.
-- ██████████████████████████████████████████████████

DROP TABLE IF EXISTS public.settlements CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.influencers CASCADE;
DROP TABLE IF EXISTS public.factories CASCADE;
DROP TABLE IF EXISTS public.factory_applications CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS settlement_status CASCADE;
DROP FUNCTION IF EXISTS generate_tracking_link CASCADE;
DROP FUNCTION IF EXISTS set_order_total_amount CASCADE;
DROP FUNCTION IF EXISTS calculate_and_create_settlement CASCADE;
DROP FUNCTION IF EXISTS auto_create_product_on_factory_apply CASCADE;


-- ██████████████████████████████████████████████████
-- STEP 2. 테이블 생성
-- ██████████████████████████████████████████████████

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- [테이블 1] 공장 정보
CREATE TABLE public.factories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact_info VARCHAR(255),
    settlement_account VARCHAR(255) NOT NULL,
    is_dropshipping BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'pending', -- pending | approved | rejected
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- [테이블 2] 인플루언서 (셀러)
CREATE TABLE public.influencers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    instagram_id VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    tracking_link VARCHAR(255) UNIQUE,  -- 승인 시 트리거가 자동 발급 (12자리 랜덤 코드)
    settlement_rate DECIMAL(5,2) NOT NULL DEFAULT 15.00,
    settlement_account VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending', -- pending | approved
    phone VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- [테이블 3] 상품
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factory_id UUID REFERENCES public.factories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_urls TEXT[],
    factory_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    seller_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock_quantity INTEGER NOT NULL DEFAULT 100,
    status VARCHAR(50) DEFAULT 'active',         -- active | inactive | out_of_stock
    category VARCHAR(100) NOT NULL DEFAULT 'fashion',
    assigned_influencer_ids UUID[] DEFAULT '{}', -- 수동 매칭된 인플루언서 ID 배열
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- [테이블 4] 주문
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'preparing', 'shipping', 'delivered', 'cancelled', 'refunded');

CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    influencer_id UUID REFERENCES public.influencers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_contact VARCHAR(255) NOT NULL,
    shipping_address TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0, -- 트리거로 자동 계산
    status order_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- [테이블 5] 정산
CREATE TYPE settlement_status AS ENUM ('pending', 'processing', 'completed');

CREATE TABLE public.settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    factory_amount DECIMAL(10,2) NOT NULL,
    influencer_amount DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) NOT NULL,
    status settlement_status DEFAULT 'pending',
    settled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- [테이블 6] 공장 입점 신청
CREATE TABLE public.factory_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    is_dropshipping BOOLEAN NOT NULL DEFAULT true,
    company_name VARCHAR(255) NOT NULL,
    manager_email VARCHAR(255) NOT NULL,
    main_category VARCHAR(100) NOT NULL,
    product_image_url TEXT,
    consumer_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    supply_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    phone VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- ██████████████████████████████████████████████████
-- STEP 3. 자동화 트리거 (DB 로직)
-- ██████████████████████████████████████████████████

-- [트리거 A] 주문 금액 자동 계산 (quantity × seller_price)
CREATE OR REPLACE FUNCTION set_order_total_amount()
RETURNS TRIGGER AS $$
BEGIN
    SELECT seller_price * NEW.quantity INTO NEW.total_amount
    FROM public.products WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_total
BEFORE INSERT OR UPDATE OF quantity, product_id ON public.orders
FOR EACH ROW EXECUTE FUNCTION set_order_total_amount();

-- [트리거 B] 배송 완료 시 정산 자동 생성
CREATE OR REPLACE FUNCTION calculate_and_create_settlement()
RETURNS TRIGGER AS $$
DECLARE
    v_factory_cost DECIMAL;
    v_settlement_rate DECIMAL;
    v_factory_amount DECIMAL;
    v_margin DECIMAL;
    v_influencer_amount DECIMAL;
    v_platform_fee DECIMAL;
BEGIN
    IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
        SELECT factory_cost INTO v_factory_cost
        FROM public.products WHERE id = NEW.product_id;

        v_factory_amount := v_factory_cost * NEW.quantity;
        v_margin := NEW.total_amount - v_factory_amount;

        IF NEW.influencer_id IS NOT NULL THEN
            SELECT settlement_rate INTO v_settlement_rate
            FROM public.influencers WHERE id = NEW.influencer_id;
            v_influencer_amount := v_margin * (v_settlement_rate / 100.0);
            v_platform_fee := v_margin - v_influencer_amount;
        ELSE
            v_influencer_amount := 0;
            v_platform_fee := v_margin;
        END IF;

        INSERT INTO public.settlements (order_id, factory_amount, influencer_amount, platform_fee)
        VALUES (NEW.id, v_factory_amount, v_influencer_amount, v_platform_fee);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_settlement
AFTER UPDATE OF status ON public.orders
FOR EACH ROW EXECUTE FUNCTION calculate_and_create_settlement();

-- [트리거 C] 인플루언서 승인 시 고유 링크 코드 자동 발급 (12자리 랜덤)
-- 예시: aB3kZ9xQm2Lp  (혼동 문자 0, O, l, 1, I 제외)
CREATE OR REPLACE FUNCTION generate_tracking_link()
RETURNS TRIGGER AS $$
DECLARE
    new_code TEXT;
    chars    TEXT := 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    i        INT;
    attempt  INT := 0;
BEGIN
    IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') AND NEW.tracking_link IS NULL THEN
        LOOP
            new_code := '';
            FOR i IN 1..12 LOOP
                new_code := new_code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
            END LOOP;
            EXIT WHEN NOT EXISTS (SELECT 1 FROM public.influencers WHERE tracking_link = new_code);
            attempt := attempt + 1;
            IF attempt >= 10 THEN
                new_code := replace(left(gen_random_uuid()::text, 14), '-', '');
                EXIT;
            END IF;
        END LOOP;
        NEW.tracking_link := new_code;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tracking_link
BEFORE UPDATE OF status ON public.influencers
FOR EACH ROW EXECUTE FUNCTION generate_tracking_link();

-- [트리거 D] 공장 신청 시 상품 자동 생성
CREATE OR REPLACE FUNCTION auto_create_product_on_factory_apply()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.products (
        factory_id, name, description,
        factory_cost, seller_price,
        image_urls, status, stock_quantity, category
    ) VALUES (
        NEW.id,
        NEW.company_name || ' 대표 상품',
        '상세 설명이 아직 등록되지 않았습니다.',
        NEW.supply_price,
        NEW.consumer_price,
        ARRAY[NEW.product_image_url],
        'active',
        100,
        NEW.main_category
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_product
AFTER INSERT ON public.factory_applications
FOR EACH ROW EXECUTE FUNCTION auto_create_product_on_factory_apply();


-- ██████████████████████████████████████████████████
-- STEP 4. 보안 정책 (RLS)
-- ██████████████████████████████████████████████████

-- RLS 활성화
ALTER TABLE public.influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.factory_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.factories ENABLE ROW LEVEL SECURITY;

-- 인플루언서: 본인 정보만 조회
CREATE POLICY "셀러는 자신의 정보만 조회" ON public.influencers
FOR SELECT USING (auth.uid() = id);

-- 주문: 본인 유치 주문만 조회
CREATE POLICY "셀러는 자신의 주문만 조회" ON public.orders
FOR SELECT USING (auth.uid() = influencer_id);

-- 정산: 본인 정산만 조회
CREATE POLICY "셀러는 자신의 정산만 조회" ON public.settlements
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = settlements.order_id AND o.influencer_id = auth.uid()
    )
);

-- 상품: 누구나 조회 가능 (상품 상세 페이지 비로그인 접근)
CREATE POLICY "누구나 상품 조회 가능" ON public.products
FOR SELECT USING (true);

-- 공장 신청: 누구나 신청 가능 (비로그인 폼 제출)
CREATE POLICY "누구나 공장 신청 가능" ON public.factory_applications
FOR INSERT WITH CHECK (true);

CREATE POLICY "공장 신청 조회는 어드민 전용" ON public.factory_applications
FOR SELECT USING (false);


-- ██████████████████████████████████████████████████
-- STEP 5. 완료 확인 쿼리 (실행 후 아래 결과 확인)
-- ██████████████████████████████████████████████████

-- 테이블이 제대로 생성됐는지 확인
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
