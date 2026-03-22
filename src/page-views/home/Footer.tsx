"use client";

const Footer = () => {
  return (
    <div className="relative h-[237px] bg-[var(--color-muted4)] flex -mx-6">
      <div className="absolute w-full flex flex-col justify-center items-center top-[54px]">
        <div className="text-xs font-semibold leading-[16.8px] text-[var(--color-text-base)] mb-[14px]">
          TEAM 모잉
        </div>
        <div className="text-xs font-normal leading-[16.8px] text-[var(--color-text-muted2)] flex justify-between">
          <a href={"/pdf/service_terms(241115).pdf"} target="_blank">
            서비스이용약관
          </a>
          <div className="h-[14px] w-[1px] mx-[14px] bg-[var(--color-muted3)]" />
          <a href={"/pdf/privacy_policy(241006).pdf"} target="_blank">
            개인정보처리방침
          </a>
        </div>
      </div>
    </div>
  );
};
export default Footer;
