import type { SiteInfo } from "@/types/content";

export function AnnouncementBar({ announcement }: { announcement: SiteInfo["announcement"] }) {
  const { before, code, after } = announcement;

  return (
    <div className="bg-foreground px-3 py-2 text-center text-[12.5px] font-semibold tracking-[0.02em] text-inverse-soft">
      <p>
        {before} <strong>{code}</strong>
        {after}
      </p>
    </div>
  );
}
