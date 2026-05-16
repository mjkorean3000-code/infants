export function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-surface-950 px-6 py-8 mt-auto">
      <div className="mx-auto max-w-5xl flex flex-col gap-3 text-center sm:text-left">
        <p className="text-xs font-black text-surface-400 uppercase tracking-widest">ONFANS</p>
        <div className="flex flex-col gap-1.5 text-[11px] text-surface-600 font-medium leading-relaxed">
          <p>
            <span className="text-surface-500 font-bold">상호</span> 온팬즈&nbsp;&nbsp;
            <span className="text-surface-500 font-bold">대표자</span> 최세준&nbsp;&nbsp;
            <span className="text-surface-500 font-bold">사업자등록번호</span> 861-45-01216
          </p>
          <p>
            <span className="text-surface-500 font-bold">사업장 소재지</span> 서울특별시 서초구 강남대로, 61길 17 밀라텔쉐르빌
          </p>
          <p>
            <span className="text-surface-500 font-bold">고객센터</span> 010.3536.6888
          </p>
        </div>
        <p className="text-[10px] text-surface-700 mt-1">
          © {new Date().getFullYear()} ONFANS. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
