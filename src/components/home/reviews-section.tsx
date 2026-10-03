import { ScrollRail } from "@/components/ui/scroll-rail";
import { Section, SectionHeading } from "@/components/ui/section";

interface Review {
  rating: number;
  text: string;
  author: string;
  product: string;
}

export function ReviewsSection({ reviews }: { reviews: Review[] }) {
  return (
    <Section>
      <SectionHeading title="Loved across India" description="From verified buyers." />
      <ScrollRail className="scrollbar-none grid auto-cols-[82%] grid-flow-col gap-3 overflow-x-auto pb-3.5 [scroll-snap-type:x_mandatory] md:auto-cols-auto md:grid-flow-row md:grid-cols-2 md:overflow-visible md:pb-0 xl:grid-cols-3">
        {reviews.map((review) => (
          <figure
            key={review.author}
            className="snap-start rounded-xl border border-border bg-card p-5"
          >
            <div>
              <span className="text-sm tracking-[2px] text-star">
                {"★".repeat(review.rating)}
              </span>{" "}
              <span className="text-[11.5px] font-bold text-accent">
                ✓ Verified buyer
              </span>
            </div>
            <blockquote className="mb-3 mt-2.5 text-[13.5px] leading-[1.6]">
              “{review.text}”
            </blockquote>
            <figcaption className="font-heading text-[13px] font-bold">
              {review.author}
              <small className="block font-sans text-[smaller] font-medium text-muted-foreground">
                {review.product}
              </small>
            </figcaption>
          </figure>
        ))}
      </ScrollRail>
    </Section>
  );
}
