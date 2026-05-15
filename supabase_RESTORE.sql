-- ==============================================================================
-- ONFANS Supabase 전체 설정 (원본 복원본)
-- Supabase SQL Editor에 전체 복붙 후 Run 클릭
-- ==============================================================================


-- ① 기존 테이블 초기화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS public.settlements CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.influencers CASCADE;
DROP TABLE IF EXISTS public.factories CASCADE;
DROP TABLE IF EXISTS public.factory_applications CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS settlement_status CASCADE;


-- ② 테이블 생성

CREATE TABLE public.factories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact_info VARCHAR(255),
    settlement_account VARCHAR(255) NOT NULL,
    is_dropshipping BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.influencers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    instagram_id VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    tracking_link VARCHAR(255) UNIQUE,
    settlement_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    settlement_account VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    phone VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factory_id UUID REFERENCES public.factories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_urls TEXT[],
    options JSONB,
    factory_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    seller_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    category VARCHAR(100) DEFAULT 'fashion',
    assigned_influencer_ids UUID[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE order_status AS ENUM ('pending', 'paid', 'preparing', 'shipping', 'delivered', 'cancelled', 'refunded');

CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    influencer_id UUID REFERENCES public.influencers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_contact VARCHAR(255) NOT NULL,
    shipping_address TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    status order_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE settlement_status AS ENUM ('pending', 'processing', 'completed');

CREATE TABLE public.settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    factory_amount DECIMAL(10,2) NOT NULL,
    influencer_amount DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) NOT NULL,
    status settlement_status DEFAULT 'pending',
    settled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ③ 트리거 함수

-- 주문 금액 자동 계산
CREATE OR REPLACE FUNCTION set_order_total_amount()
RETURNS TRIGGER AS $$
BEGIN
    SELECT seller_price * NEW.quantity INTO NEW.total_amount
    FROM public.products WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_total_amount
BEFORE INSERT OR UPDATE OF quantity, product_id ON public.orders
FOR EACH ROW
EXECUTE FUNCTION set_order_total_amount();

-- 배송완료 시 정산 자동 생성
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
        SELECT factory_cost INTO v_factory_cost FROM public.products WHERE id = NEW.product_id;
        v_factory_amount := v_factory_cost * NEW.quantity;
        v_margin := NEW.total_amount - v_factory_amount;
        IF NEW.influencer_id IS NOT NULL THEN
            SELECT settlement_rate INTO v_settlement_rate FROM public.influencers WHERE id = NEW.influencer_id;
            v_influencer_amount := v_margin * (v_settlement_rate / 100.0);
            v_platform_fee := v_margin - v_influencer_amount;
        ELSE
            v_influencer_amount := 0;
            v_platform_fee := v_margin;
        END IF;
        INSERT INTO public.settlements (order_id, factory_amount, influencer_amount, platform_fee, status)
        VALUES (NEW.id, v_factory_amount, v_influencer_amount, v_platform_fee, 'pending');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_settlement
AFTER UPDATE OF status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION calculate_and_create_settlement();

-- 공장 신청 시 factories + products 자동 생성
CREATE OR REPLACE FUNCTION auto_create_product_on_factory_apply()
RETURNS TRIGGER AS $$
DECLARE
    v_factory_id UUID;
BEGIN
    INSERT INTO public.factories (name, contact_info, settlement_account, is_dropshipping, status)
    VALUES (NEW.company_name, NEW.manager_email, '', NEW.is_dropshipping, 'pending')
    RETURNING id INTO v_factory_id;

    INSERT INTO public.products (factory_id, name, description, factory_cost, seller_price, image_urls, status, stock_quantity, category)
    VALUES (
        v_factory_id,
        NEW.company_name || ' 대표 상품',
        '아직 상세 설명이 등록되지 않았습니다.',
        NEW.supply_price,
        NEW.consumer_price,
        CASE WHEN NEW.product_image_url IS NOT NULL THEN ARRAY[NEW.product_image_url] ELSE '{}'::TEXT[] END,
        'active',
        100,
        NEW.main_category
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_auto_create_product ON public.factory_applications;
CREATE TRIGGER trigger_auto_create_product
AFTER INSERT ON public.factory_applications
FOR EACH ROW
EXECUTE FUNCTION auto_create_product_on_factory_apply();


-- ④ RLS 보안 정책

ALTER TABLE public.influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.factory_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 인플루언서: 본인 조회 + 로그인 유저(어드민) 전체 조회
CREATE POLICY "셀러는 자신의 정보만 조회 가능" ON public.influencers
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "로그인 유저는 전체 인플루언서 조회 가능" ON public.influencers
FOR SELECT USING (auth.role() = 'authenticated');

-- 인플루언서 신청: 누구나 가능
CREATE POLICY "누구나 인플루언서 신청 가능" ON public.influencers
FOR INSERT WITH CHECK (true);

-- 주문: 본인 유치 주문만 조회
CREATE POLICY "셀러는 자신이 유치한 주문만 조회 가능" ON public.orders
FOR SELECT USING (auth.uid() = influencer_id);

-- 정산: 본인 정산만 조회
CREATE POLICY "셀러는 자신의 정산 내역만 조회 가능" ON public.settlements
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = settlements.order_id AND o.influencer_id = auth.uid()
    )
);

-- 상품: 누구나 조회 가능 (비로그인 상품 상세 페이지용)
CREATE POLICY "누구나 상품 조회 가능" ON public.products
FOR SELECT USING (true);

-- 공장 신청: 누구나 신청 가능
CREATE POLICY "누구나 공장 입점 신청 가능" ON public.factory_applications
FOR INSERT WITH CHECK (true);

CREATE POLICY "공장 신청 조회는 어드민 전용" ON public.factory_applications
FOR SELECT USING (false);


-- ⑤ Make.com 웹훅 (pg_net 확장 필요 - Database > Extensions에서 활성화)
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- 인플루언서 신청 시 구글시트 저장
CREATE OR REPLACE FUNCTION trigger_make_webhook_on_influencer_apply()
RETURNS TRIGGER AS $$
DECLARE
    make_webhook_url TEXT := 'https://hook.us2.make.com/9qgu6s4f8nke87ricmyxr54hssbkknht';
    request_body JSON;
BEGIN
    request_body := json_build_object(
        'event', 'new_influencer_application',
        'application_id', NEW.id,
        'instagram_id', NEW.instagram_id,
        'email', NEW.email,
        'phone', NEW.phone,
        'category', NEW.category,
        'created_at', NEW.created_at
    );
    PERFORM net.http_post(url := make_webhook_url, body := request_body::jsonb);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_send_apply_to_make ON public.influencers;
CREATE TRIGGER trg_send_apply_to_make
AFTER INSERT ON public.influencers
FOR EACH ROW EXECUTE FUNCTION trigger_make_webhook_on_influencer_apply();

-- 공장 신청 시 구글시트 저장
CREATE OR REPLACE FUNCTION trigger_make_webhook_on_factory_apply()
RETURNS TRIGGER AS $$
DECLARE
    make_webhook_url TEXT := 'https://hook.us2.make.com/o69r1nn56lkjohtqq16beorupvelidug';
    request_body JSON;
BEGIN
    request_body := json_build_object(
        'event', 'new_factory_application',
        'application_id', NEW.id,
        'company_name', NEW.company_name,
        'manager_email', NEW.manager_email,
        'phone', NEW.phone,
        'main_category', NEW.main_category,
        'product_image_url', NEW.product_image_url,
        'consumer_price', NEW.consumer_price,
        'supply_price', NEW.supply_price,
        'is_dropshipping', NEW.is_dropshipping,
        'created_at', NEW.created_at
    );
    PERFORM net.http_post(url := make_webhook_url, body := request_body::jsonb);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_send_factory_apply_to_make ON public.factory_applications;
CREATE TRIGGER trg_send_factory_apply_to_make
AFTER INSERT ON public.factory_applications
FOR EACH ROW EXECUTE FUNCTION trigger_make_webhook_on_factory_apply();
