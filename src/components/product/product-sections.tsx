import Image from "next/image";

import { Accordion } from "@/components/ui/accordion";
import type {
  BenefitsSection,
  ComparisonSection,
  FaqSection,
  IngredientsSection,
  ProductSection,
  PuritySection,
  StepsSection,
} from "@/types/product";

import { BenefitIcon } from "./benefit-icon";

/** A titled block separated by a hairline, used for every content section below the buy box. */
export function PdpSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string | null;
  children: React.ReactNode;
}) {
  return (
    <section className="max-w-full border-t border-border py-[26px] xl:py-[34px]">
      <h2 className="mb-1.5 font-heading text-[21px] xl:text-[24px]">{title}</h2>
      {subtitle && (
        <p className="mb-[18px] text-[13.5px] text-muted-foreground">{subtitle}</p>
      )}
      {children}
    </section>
  );
}

function Ingredients({ section }: { section: IngredientsSection }) {
  return (
    <PdpSection title={section.title} subtitle={section.subtitle}>
      <div className="grid min-w-0 grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {section.items.map((item) => (
          <div
            key={item.title}
            className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-primary-soft">
              <Image
                src={item.image}
                alt={item.alt}
                fill
                sizes="(min-width: 1080px) 288px, (min-width: 760px) 33vw, 50vw"
                className="object-cover object-top"
              />
            </div>
            <div className="px-[15px] py-[13px]">
              <b className="mb-1 block font-heading text-sm">{item.title}</b>
              <span className="text-xs leading-[1.45] text-muted-foreground">
                {item.text}
              </span>
            </div>
          </div>
        ))}
      </div>
      {section.summaryHtml && (
        <div
          className="mt-4 rounded-md bg-secondary px-4 py-[13px] text-[12.5px] text-muted-foreground [&_b]:font-heading [&_b]:text-foreground"
          dangerouslySetInnerHTML={{ __html: section.summaryHtml }}
        />
      )}
    </PdpSection>
  );
}

function Benefits({ section }: { section: BenefitsSection }) {
  return (
    <PdpSection title={section.title} subtitle={section.subtitle}>
      <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {section.items.map((item) => (
          <div
            key={item.text}
            className="flex min-w-0 items-stretch gap-3.5 overflow-hidden rounded-2xl border border-border bg-card"
          >
            <div className="grid w-[110px] flex-none place-items-center bg-primary-tint">
              <BenefitIcon name={item.icon} />
            </div>
            <div className="min-w-0 self-center py-3.5 pl-0.5 pr-4">
              <b className="mb-[3px] block font-heading text-[14.5px]">{item.text}</b>
            </div>
          </div>
        ))}
      </div>
    </PdpSection>
  );
}

function Steps({ section }: { section: StepsSection }) {
  return (
    <PdpSection title={section.title} subtitle={section.subtitle}>
      <div className="grid auto-cols-[48%] grid-flow-col gap-3 overflow-x-auto px-0.5 pb-4 pt-3.5 [scroll-snap-type:x_mandatory] md:auto-cols-[calc(37%-12px)] xl:auto-cols-[calc(25%-17px)]">
        {section.items.map((item, index) => (
          <div
            key={item.text}
            className="relative snap-start overflow-hidden rounded-2xl border border-border bg-card"
          >
            <span className="absolute left-2.5 top-2.5 z-[2] rounded-pill bg-primary px-3 py-1 font-heading text-[11.5px] font-bold text-primary-foreground">
              Step {index + 1}
            </span>
            <div className="relative grid aspect-[4/3] place-items-center overflow-hidden bg-secondary">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={`Step ${index + 1}`}
                  fill
                  sizes="(min-width: 1080px) 282px, (min-width: 760px) 37vw, 48vw"
                  className="object-cover object-top"
                />
              ) : (
                <span className="grid size-full place-items-center bg-primary-tint font-heading text-[44px] font-bold text-primary">
                  {item.number}
                </span>
              )}
            </div>
            <div className="px-4 pb-4 pt-3.5 text-[13px] leading-[1.5] text-copy">
              {item.text}
            </div>
          </div>
        ))}
      </div>
      {section.footnoteHtml && (
        <p
          className="mt-3.5 text-[14.5px] [&_b]:font-heading"
          dangerouslySetInnerHTML={{ __html: section.footnoteHtml }}
        />
      )}
    </PdpSection>
  );
}

function Purity({ section }: { section: PuritySection }) {
  return (
    <PdpSection title={section.title} subtitle={section.subtitle}>
      <div className="grid min-w-0 grid-cols-2 gap-[9px] md:grid-cols-3">
        {section.items.map((item) => (
          <div
            key={item}
            className="flex min-w-0 items-center gap-[9px] rounded-md border border-border bg-card px-[13px] py-[11px] text-[12.5px] font-semibold before:grid before:size-[22px] before:flex-none before:place-items-center before:rounded-full before:bg-primary-soft before:text-xs before:font-extrabold before:text-primary before:content-['✓']"
          >
            {item}
          </div>
        ))}
      </div>
    </PdpSection>
  );
}

function Comparison({ section }: { section: ComparisonSection }) {
  const cell = "border-b border-border p-3 text-left align-top";
  return (
    <PdpSection title={section.title} subtitle={section.subtitle}>
      <div className="max-w-full overflow-x-auto">
        <table className="w-full max-w-full border-separate border-spacing-0 overflow-hidden rounded-2xl border border-border bg-card text-[12.5px]">
          <thead>
            <tr>
              <th className={`${cell} w-[26%] bg-secondary font-heading text-[13px]`}>
                {section.columns.feature}
              </th>
              <th className={`${cell} bg-primary font-heading text-[13px] text-primary-foreground`}>
                {section.columns.ours}
              </th>
              <th className={`${cell} bg-secondary font-heading text-[13px]`}>
                {section.columns.theirs}
              </th>
            </tr>
          </thead>
          <tbody>
            {section.rows.map((row, index) => {
              const last = index === section.rows.length - 1;
              const rowCell = last ? "p-3 text-left align-top" : cell;
              return (
                <tr key={row.feature}>
                  <td className={rowCell}>
                    <b className="font-heading">{row.feature}</b>
                  </td>
                  <td className={`${rowCell} bg-primary-faint font-semibold`}>
                    ✓ {row.ours}
                  </td>
                  <td className={rowCell}>
                    <span className="text-destructive">✕</span> {row.theirs}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PdpSection>
  );
}

function Faq({ section }: { section: FaqSection }) {
  return (
    <PdpSection title={section.title} subtitle={section.subtitle}>
      {section.items.map((item) => (
        <Accordion key={item.question} title={item.question} defaultOpen={item.open}>
          <div dangerouslySetInnerHTML={{ __html: item.answerHtml }} />
        </Accordion>
      ))}
    </PdpSection>
  );
}

export function ProductSections({ sections }: { sections: ProductSection[] }) {
  return (
    <>
      {sections.map((section) => {
        switch (section.type) {
          case "ingredients":
            return <Ingredients key={section.type} section={section} />;
          case "benefits":
            return <Benefits key={section.type} section={section} />;
          case "steps":
            return <Steps key={section.type} section={section} />;
          case "purity":
            return <Purity key={section.type} section={section} />;
          case "comparison":
            return <Comparison key={section.type} section={section} />;
          case "faq":
            return <Faq key={section.type} section={section} />;
        }
      })}
    </>
  );
}
