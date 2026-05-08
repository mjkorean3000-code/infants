-- -----------------------------------------------------------------------------
-- ONFANS Supabase Database Webhooks (Make.com 자동화 연동 스크립트)
-- 필수 확장 프로그램: pg_net (Supabase 대시보드 Database > Extensions 에서 활성화 필요)
-- -----------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "pg_net";

-- 1. 주문 생성 시 (새로운 결제 완료) Make.com으로 웹훅 발송 (공장 자동 발주)
CREATE OR REPLACE FUNCTION trigger_make_webhook_on_order()
RETURNS TRIGGER AS $$
DECLARE
    make_webhook_url TEXT := 'https://hook.make.com/your-order-webhook-url'; -- TODO: 실제 주문 발주용 Make 웹훅 URL로 변경
    request_body JSON;
BEGIN
    -- 주문이 성공적으로 들어왔을 때만 실행 (status = 'paid')
    IF NEW.status = 'paid' THEN
        -- JSON Body 생성
        request_body := json_build_object(
            'event', 'new_order',
            'order_id', NEW.id,
            'product_id', NEW.product_id,
            'influencer_id', NEW.influencer_id,
            'customer_name', NEW.customer_name,
            'customer_contact', NEW.customer_contact,
            'shipping_address', NEW.shipping_address,
            'quantity', NEW.quantity,
            'total_amount', NEW.total_amount,
            'created_at', NEW.created_at
        );

        -- 비동기 POST 요청 전송 (pg_net 확장 사용)
        PERFORM net.http_post(
            url := make_webhook_url,
            body := request_body::jsonb
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 연결 (orders 테이블에 INSERT 발생 시)
DROP TRIGGER IF EXISTS trg_send_order_to_make ON public.orders;
CREATE TRIGGER trg_send_order_to_make
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION trigger_make_webhook_on_order();


-- 2. 인플루언서 입점 승인 시 Make.com으로 웹훅 발송 (카톡/이메일 자동 발송용)
CREATE OR REPLACE FUNCTION trigger_make_webhook_on_influencer_approval()
RETURNS TRIGGER AS $$
DECLARE
    make_webhook_url TEXT := 'https://hook.make.com/your-approval-webhook-url'; -- TODO: 실제 승인 알림용 Make 웹훅 URL로 변경
    request_body JSON;
BEGIN
    -- status가 pending에서 approved로 변경되었을 때만 실행
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status = 'pending') THEN
        
        request_body := json_build_object(
            'event', 'influencer_approved',
            'influencer_id', NEW.id,
            'instagram_id', NEW.instagram_id,
            'email', NEW.email,
            'tracking_link', NEW.tracking_link,
            'approved_at', NOW()
        );

        PERFORM net.http_post(
            url := make_webhook_url,
            body := request_body::jsonb
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 연결 (influencers 테이블에 UPDATE 발생 시)
DROP TRIGGER IF EXISTS trg_send_approval_to_make ON public.influencers;
CREATE TRIGGER trg_send_approval_to_make
AFTER UPDATE OF status ON public.influencers
FOR EACH ROW
EXECUTE FUNCTION trigger_make_webhook_on_influencer_approval();


-- 2-1. 인플루언서 신규 가입(신청) 시 Make.com으로 웹훅 발송 (구글 시트 저장용)
CREATE OR REPLACE FUNCTION trigger_make_webhook_on_influencer_apply()
RETURNS TRIGGER AS $$
DECLARE
    make_webhook_url TEXT := 'https://hook.us2.make.com/a42uxt30y8h8n06i8bexr12h8mwwts33'; -- TODO: 대표님의 Make 웹훅 URL
    request_body JSON;
BEGIN
    request_body := json_build_object(
        'event', 'new_influencer_application',
        'application_id', NEW.id,
        'instagram_id', NEW.instagram_id,
        'email', NEW.email,
        'category', NEW.category,
        'created_at', NEW.created_at
    );

    PERFORM net.http_post(
        url := make_webhook_url,
        body := request_body::jsonb
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_send_apply_to_make ON public.influencers;
CREATE TRIGGER trg_send_apply_to_make
AFTER INSERT ON public.influencers
FOR EACH ROW
EXECUTE FUNCTION trigger_make_webhook_on_influencer_apply();


-- 3. 공장 입점 신청 시 Make.com으로 웹훅 발송 (구글 시트 저장용)
CREATE OR REPLACE FUNCTION trigger_make_webhook_on_factory_apply()
RETURNS TRIGGER AS $$
DECLARE
    make_webhook_url TEXT := 'https://hook.us2.make.com/o69r1nn56lkjohtqq16beorupvelidug'; -- TODO: 공장 입점 신청 웹훅 URL
    request_body JSON;
BEGIN
    request_body := json_build_object(
        'event', 'new_factory_application',
        'application_id', NEW.id,
        'company_name', NEW.company_name,
        'manager_email', NEW.manager_email,
        'main_category', NEW.main_category,
        'product_image_url', NEW.product_image_url,
        'consumer_price', NEW.consumer_price,
        'supply_price', NEW.supply_price,
        'is_dropshipping', NEW.is_dropshipping,
        'created_at', NEW.created_at
    );

    PERFORM net.http_post(
        url := make_webhook_url,
        body := request_body::jsonb
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_send_factory_apply_to_make ON public.factory_applications;
CREATE TRIGGER trg_send_factory_apply_to_make
AFTER INSERT ON public.factory_applications
FOR EACH ROW
EXECUTE FUNCTION trigger_make_webhook_on_factory_apply();

-- ==============================================================================
-- 4. 상품 자동 생성 트리거 (공장 입점 신청 시 자동 등록)
-- ==============================================================================
CREATE OR REPLACE FUNCTION auto_create_product_on_factory_apply()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.products (
        factory_id,
        name,
        description,
        factory_cost,
        seller_price,
        image_urls,
        status,
        stock_quantity,
        category
    ) VALUES (
        NEW.id,
        NEW.company_name || ' 대표 상품',
        '아직 상세 설명이 등록되지 않았습니다.',
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

DROP TRIGGER IF EXISTS trigger_auto_create_product ON public.factory_applications;
CREATE TRIGGER trigger_auto_create_product
AFTER INSERT ON public.factory_applications
FOR EACH ROW
EXECUTE FUNCTION auto_create_product_on_factory_apply();
