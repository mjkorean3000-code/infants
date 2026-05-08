-- ============================================================
-- 버그 수정 2가지
-- Supabase SQL Editor에 붙여넣고 실행하세요
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- FIX 1. 공장 신청 시 foreign key 오류 수정
--
-- 문제: 상품 자동생성 트리거가 factory_applications.id를
--       factory_id로 쓰는데, products.factory_id는
--       factories 테이블을 참조 → 없으니 FK 오류 발생
--
-- 해결: 트리거에서 factories 테이블에 먼저 행을 만들고
--       그 id를 products.factory_id에 넣도록 변경
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION auto_create_product_on_factory_apply()
RETURNS TRIGGER AS $$
DECLARE
    v_factory_id UUID;
BEGIN
    -- 1) factories 테이블에 공장 행 먼저 삽입
    INSERT INTO public.factories (name, contact_info, settlement_account, is_dropshipping, status)
    VALUES (
        NEW.company_name,
        NEW.manager_email,
        '',           -- 정산계좌는 어드민이 나중에 입력
        NEW.is_dropshipping,
        'pending'
    )
    RETURNING id INTO v_factory_id;

    -- 2) 해당 factory_id로 상품 자동 생성
    INSERT INTO public.products (
        factory_id, name, description,
        factory_cost, seller_price,
        image_urls, status, stock_quantity, category
    ) VALUES (
        v_factory_id,
        NEW.company_name || ' 대표 상품',
        '상세 설명이 아직 등록되지 않았습니다.',
        NEW.supply_price,
        NEW.consumer_price,
        CASE WHEN NEW.product_image_url IS NOT NULL
             THEN ARRAY[NEW.product_image_url]
             ELSE '{}'::TEXT[] END,
        'active',
        100,
        NEW.main_category
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ────────────────────────────────────────────────────────────
-- FIX 2. 어드민 페이지에서 인플루언서 목록이 안 보이는 문제
--
-- 문제: influencers 테이블 RLS가 "본인 것만 조회" 정책이라
--       어드민이 전체 목록을 못 가져옴
--
-- 해결: 로그인한 사용자(어드민)는 전체 목록 조회 허용
--       (MVP 단계 - 나중에 어드민 role 체크로 강화 가능)
-- ────────────────────────────────────────────────────────────

-- 기존 정책 제거 후 재생성
DROP POLICY IF EXISTS "셀러는 자신의 정보만 조회" ON public.influencers;

-- 셀러: 본인 것만 조회 (기존 유지)
CREATE POLICY "셀러는 자신의 정보만 조회" ON public.influencers
FOR SELECT USING (auth.uid() = id);

-- 어드민: 로그인 상태이면 전체 조회 허용
CREATE POLICY "인증된 사용자는 전체 인플루언서 조회 가능" ON public.influencers
FOR SELECT USING (auth.role() = 'authenticated');


-- ────────────────────────────────────────────────────────────
-- 확인 쿼리 (실행 후 결과 확인)
-- ────────────────────────────────────────────────────────────
SELECT 'influencers' as tbl, count(*) FROM public.influencers
UNION ALL
SELECT 'factory_applications', count(*) FROM public.factory_applications
UNION ALL
SELECT 'factories', count(*) FROM public.factories
UNION ALL
SELECT 'products', count(*) FROM public.products;
