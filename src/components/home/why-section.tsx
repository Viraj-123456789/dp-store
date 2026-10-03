import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import type { LinkItem } from "@/types/home";

interface WhySectionProps {
  title: string;
  text: string;
  cta: LinkItem;
  points: { icon: string; title: string; text: string }[];
}

export function WhySection({ title, text, cta, points }: WhySectionProps) {
  return (
    <Section id="why">
      <div className="overflow-hidden rounded-4xl bg-foreground text-inverse">
        <div className="grid items-center gap-[26px] px-[22px] py-8 md:px-[34px] md:py-11 xl:grid-cols-[1.1fr_0.9fr] xl:gap-14 xl:p-16">
          <div>
            <h2 className="font-heading text-[clamp(23px,3vw,38px)] text-primary-foreground">
              {title}
            </h2>
            <p className="my-3.5 text-[14.5px] text-inverse-muted">{text}</p>
            <Link href={cta.href} className={buttonVariants({ variant: "light" })}>
              {cta.label}
            </Link>
          </div>
          <div className="grid gap-[11px] md:grid-cols-2">
            {points.map((point) => (
              <div
                key={point.title}
                className="rounded-lg border border-primary-foreground/12 bg-primary-foreground/6 p-4"
              >
                <b className="mb-[5px] flex gap-[9px] font-heading text-[14.5px] text-primary-foreground">
                  {point.icon} {point.title}
                </b>
                <span className="text-[12.5px] leading-[1.5] text-inverse-muted">
                  {point.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
