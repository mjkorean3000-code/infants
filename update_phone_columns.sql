-- 1. 테이블에 phone 컬럼 추가
ALTER TABLE public.factory_applications ADD COLUMN IF NOT EXISTS phone VARCHAR(255);
ALTER TABLE public.influencers ADD COLUMN IF NOT EXISTS phone VARCHAR(255);

-- 2. 인플루언서 입점 신청 웹훅 트리거 함수 업데이트 (phone 추가)
CREATE OR REPLACE FUNCTION trigger_make_webhook_on_influencer_apply()
RETURNS TRIGGER AS $$
DECLARE
    make_webhook_url TEXT := 'https://hook.us2.make.com/9qgu6s4f8nke87ricmyxr54hssbkknht'; -- 대표님의 Make 웹훅 URL
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

    PERFORM net.http_post(
        url := make_webhook_url,
        body := request_body::jsonb
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. 공장 입점 신청 웹훅 트리거 함수 업데이트 (phone 추가)
CREATE OR REPLACE FUNCTION trigger_make_webhook_on_factory_apply()
RETURNS TRIGGER AS $$
DECLARE
    make_webhook_url TEXT := 'https://hook.us2.make.com/o69r1nn56lkjohtqq16beorupvelidug'; -- 공장 입점 신청 웹훅 URL
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

    PERFORM net.http_post(
        url := make_webhook_url,
        body := request_body::jsonb
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
