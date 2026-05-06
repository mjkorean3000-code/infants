-- ==============================================================================
-- OnFans Database Security (RLS) Policies
-- 이 스크립트는 셀러(인플루언서)가 자신의 데이터만 볼 수 있도록 보호합니다.
-- ==============================================================================

-- 1. 모든 테이블에 대해 RLS(Row Level Security) 강제 활성화
ALTER TABLE public.influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

-- 2. Influencers 테이블 정책
-- 셀러 본인만 자신의 인플루언서 정보를 조회할 수 있음
CREATE POLICY "셀러는 자신의 정보만 조회 가능" 
ON public.influencers
FOR SELECT
USING ( auth.uid() = id );

-- 3. Orders 테이블 정책
-- 인플루언서는 자신의 influencer_id로 매핑된 주문 데이터만 조회 가능
CREATE POLICY "셀러는 자신이 유치한 주문만 조회 가능" 
ON public.orders
FOR SELECT
USING ( auth.uid() = influencer_id );

-- 4. Settlements 테이블 정책
-- 인플루언서는 자신의 influencer_id로 매핑된 정산 내역만 조회 가능 (조인 활용)
CREATE POLICY "셀러는 자신의 정산 내역만 조회 가능" 
ON public.settlements
FOR SELECT
USING ( 
    EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = settlements.order_id 
        AND o.influencer_id = auth.uid()
    )
);

-- 참고: 공장(Factories)의 경우 다른 Role을 부여하여 관리할 수 있도록 정책을 별도 설계해야 합니다.
-- 참고: 데이터 삽입(INSERT)이나 수정(UPDATE)은 서비스 역할(Service Role)이나 Make(백엔드)에서 수행한다고 가정합니다.

-- 5. Factory Applications 테이블 정책
-- 공장 입점 신청은 누구나 할 수 있어야 하므로, INSERT 허용 (익명 접근 가능)
ALTER TABLE public.factory_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "누구나 공장 입점 신청 가능" 
ON public.factory_applications
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "자신의 신청 내역은 조회 불가 (어드민 전용)" 
ON public.factory_applications
FOR SELECT
USING ( false ); -- 어드민(서비스 롤)만 조회하도록 차단
