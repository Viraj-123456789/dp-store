import { siteInfo } from "@/lib/data/navigation";

export function AnnouncementBar() {
  const { before, code, after } = siteInfo.announcement;

  return (
    <div className="bg-foreground px-3 py-2 text-center text-[12.5px] font-semibold tracking-[0.02em] text-inverse-soft">
      <p>
        {before} <strong>{code}</strong>
        {after}
      </p>
    </div>
  );
}
