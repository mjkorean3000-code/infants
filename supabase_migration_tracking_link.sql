-- ============================================================
-- 마이그레이션: 트래킹 링크 자동 생성 + 누락 컬럼 추가
-- Supabase SQL Editor에 붙여넣고 실행하세요.
-- ============================================================

-- ① products 테이블에 누락된 컬럼 추가
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS category VARCHAR(100) NOT NULL DEFAULT 'fashion',
  ADD COLUMN IF NOT EXISTS assigned_influencer_ids UUID[] DEFAULT '{}';

-- ② 트래킹 링크 자동 생성 함수
-- 인플루언서 status가 'approved'로 바뀌는 순간 고유 코드를 자동 발급합니다.
-- 형식: 랜덤 12자리 영숫자 (대소문자 혼합)  예) aB3kZ9xQm2Lp
-- 인스타그램 ID 등 개인정보가 링크에 노출되지 않습니다.
CREATE OR REPLACE FUNCTION generate_tracking_link()
RETURNS TRIGGER AS $$
DECLARE
  new_code  TEXT;
  chars     TEXT := 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i         INT;
  attempt   INT := 0;
BEGIN
  -- status가 'approved'로 변경되고 tracking_link가 아직 없을 때만 실행
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') AND NEW.tracking_link IS NULL THEN

    -- 충돌 방지를 위해 최대 10번 시도
    LOOP
      -- 혼동하기 쉬운 문자(0, O, l, 1, I) 제외한 58자 풀에서 12자리 랜덤 코드 생성
      new_code := '';
      FOR i IN 1..12 LOOP
        new_code := new_code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
      END LOOP;

      -- 중복 확인
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM public.influencers WHERE tracking_link = new_code
      );

      attempt := attempt + 1;
      IF attempt >= 10 THEN
        -- 10번 실패 시 UUID 앞 12자리로 폴백
        new_code := replace(left(gen_random_uuid()::text, 14), '-', '');
        EXIT;
      END IF;
    END LOOP;

    NEW.tracking_link := new_code;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ③ 트리거 등록 (기존에 있으면 교체)
DROP TRIGGER IF EXISTS trigger_generate_tracking_link ON public.influencers;

CREATE TRIGGER trigger_generate_tracking_link
BEFORE UPDATE OF status ON public.influencers
FOR EACH ROW
EXECUTE FUNCTION generate_tracking_link();

-- ④ 이미 approved 상태인데 tracking_link가 없는 기존 데이터 일괄 업데이트
-- (위 함수와 동일한 로직으로 랜덤 12자리 코드 생성)
UPDATE public.influencers
SET tracking_link = (
  SELECT string_agg(
    substr('abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789',
           floor(random() * 58 + 1)::int, 1),
    ''
  )
  FROM generate_series(1, 12)
)
WHERE status = 'approved' AND tracking_link IS NULL;

-- 완료 확인용 쿼리 (실행 후 결과를 확인해보세요)
SELECT id, instagram_id, status, tracking_link
FROM public.influencers
ORDER BY created_at DESC;
