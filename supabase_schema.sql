-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 기존 테이블이 있다면 깨끗하게 초기화 (의존성 제거)
DROP TABLE IF EXISTS public.settlements CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.influencers CASCADE;
DROP TABLE IF EXISTS public.factories CASCADE;
DROP TABLE IF EXISTS public.factory_applications CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS settlement_status CASCADE;

-- 1. Factories Table: 공장 정보, 정산 계좌, 드롭쉬핑 여부
CREATE TABLE public.factories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact_info VARCHAR(255),
    settlement_account VARCHAR(255) NOT NULL, -- 정산 계좌
    is_dropshipping BOOLEAN DEFAULT false, -- 드롭쉬핑 여부
    status VARCHAR(50) DEFAULT 'pending', -- 입점 승인 상태 (pending, approved, rejected)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Influencers Table: 셀러 정보, 고유 트래킹 링크, 정산율
CREATE TABLE public.influencers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255), -- 승인 시 지정될 수 있음
    instagram_id VARCHAR(255) NOT NULL, -- 인스타그램 ID (필수)
    email VARCHAR(255) NOT NULL, -- 이메일 (필수)
    category VARCHAR(100) NOT NULL, -- 주요 카테고리 (필수)
    tracking_link VARCHAR(255) UNIQUE, -- 승인 시 발급됨
    settlement_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    settlement_account VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 입점 승인 상태 (pending, approved)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Products Table: 공장 원가와 셀러 판매가 구분
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factory_id UUID NOT NULL REFERENCES public.factories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_urls TEXT[], -- 상품 이미지 배열
    options JSONB, -- 옵션 예: {"color": ["Black", "White"], "size": ["S", "M", "L"]}
    factory_cost DECIMAL(10,2) NOT NULL, -- 공장 원가
    seller_price DECIMAL(10,2) NOT NULL, -- 셀러 판매가 (소비자가)
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active', -- 상품 상태 (active, inactive, out_of_stock)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Orders Table: 실시간 주문 상태
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'preparing', 'shipping', 'delivered', 'cancelled', 'refunded');

CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    influencer_id UUID REFERENCES public.influencers(id) ON DELETE SET NULL, -- 트래킹 링크를 통해 유입된 경우 기록
    customer_name VARCHAR(255) NOT NULL,
    customer_contact VARCHAR(255) NOT NULL,
    shipping_address TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0, -- 주문 총액 (quantity * seller_price) - 트리거로 자동 계산됨
    status order_status DEFAULT 'pending', -- 실시간 주문 상태
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Settlements Table: 정산 정보 및 수수료 내역
CREATE TYPE settlement_status AS ENUM ('pending', 'processing', 'completed');

CREATE TABLE public.settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    factory_amount DECIMAL(10,2) NOT NULL, -- 공장 정산액 (원가 * 수량)
    influencer_amount DECIMAL(10,2) NOT NULL, -- 셀러 수수료
    platform_fee DECIMAL(10,2) NOT NULL, -- 플랫폼 수수료 (마진 - 셀러 수수료)
    status settlement_status DEFAULT 'pending',
    settled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-------------------------------------------------------------------------------
-- 수수료 계산 로직 및 자동화 (PostgreSQL Triggers & Functions)
-------------------------------------------------------------------------------

-- Trigger 1: 주문이 생성/수정될 때 제품의 'seller_price'를 바탕으로 'total_amount' 자동 계산
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

-- Trigger 2: 주문 상태가 'delivered'(배송 완료)로 변경될 때 자동으로 정산(Settlement) 데이터 생성
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
    -- 상태가 'delivered'로 처음 변경되었을 때만 실행
    IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
        
        -- 제품의 원가 조회
        SELECT factory_cost INTO v_factory_cost
        FROM public.products WHERE id = NEW.product_id;
        
        -- 1. 공장 정산액 계산 = 원가 * 수량
        v_factory_amount := v_factory_cost * NEW.quantity;
        
        -- 2. 전체 마진 계산 = 총 판매액 - 공장 원가
        v_margin := NEW.total_amount - v_factory_amount;
        
        -- 3. 인플루언서 수수료 계산 (인플루언서 코드가 있는 경우)
        IF NEW.influencer_id IS NOT NULL THEN
            SELECT settlement_rate INTO v_settlement_rate
            FROM public.influencers WHERE id = NEW.influencer_id;
            
            -- 셀러 수수료 = 마진 * (정산율 / 100)
            v_influencer_amount := v_margin * (v_settlement_rate / 100.0);
            -- 플랫폼 수익 = 마진 - 셀러 수수료
            v_platform_fee := v_margin - v_influencer_amount;
        ELSE
            -- 인플루언서 유입이 아닌 직접 판매의 경우
            v_influencer_amount := 0;
            v_platform_fee := v_margin;
        END IF;

        -- Settlements 테이블에 데이터 삽입
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

-- 6. Factory Applications Table: 공장 입점 신청 (웹사이트 설문조사 기반)
CREATE TABLE public.factory_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    is_dropshipping BOOLEAN NOT NULL DEFAULT true, -- 드랍쉬핑 가능 여부
    company_name VARCHAR(255) NOT NULL, -- 공급사 이름
    manager_email VARCHAR(255) NOT NULL, -- 담당자 이메일
    main_category VARCHAR(100) NOT NULL, -- 주력 제품군
    product_image_url TEXT, -- 제품 이미지 URL
    consumer_price DECIMAL(10,2) NOT NULL, -- 소비자가
    supply_price DECIMAL(10,2) NOT NULL, -- 공급가
    status VARCHAR(50) DEFAULT 'pending', -- 승인 상태
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
