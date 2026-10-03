import { ScrollRail } from "@/components/ui/scroll-rail";
import { Section, SectionHeading } from "@/components/ui/section";
import { siteInfo } from "@/lib/data/navigation";

import { ReelCard } from "./reel-card";

type Reel = React.ComponentProps<typeof ReelCard>;

export function ReelsSection({ reels }: { reels: Reel[] }) {
  return (
    <Section>
      <SectionHeading
        title="From our Instagram"
        description="Watch the ritual, then shop it."
        action={{ label: "Follow @dpetals", href: siteInfo.instagram }}
      />
      <ScrollRail className="rail-scrollbar max-md:scrollbar-none grid auto-cols-[min(72vw,258px)] grid-flow-col gap-4 overflow-x-auto px-0.5 pb-3.5 pt-1 [scroll-snap-type:x_mandatory]">
        {reels.map((reel) => (
          <ReelCard key={reel.video} {...reel} />
        ))}
      </ScrollRail>
    </Section>
  );
}
