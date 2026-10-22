import { NewsletterForm } from "@/components/home/newsletter-form";
import { Container } from "@/components/ui/container";

export function Newsletter() {
  return (
    <section className="bg-brand-gradient py-[22px] text-primary-foreground">
      <Container className="flex flex-wrap items-center justify-between gap-x-7 gap-y-4 max-md:flex-col max-md:items-stretch max-md:text-center">
        <div>
          <h2 className="font-heading text-[clamp(17px,2vw,24px)]">
            Get 10% off your first order
          </h2>
          <p className="mt-[3px] text-[13px] text-inverse-soft">
            Join the DPetals circle for skincare education, launches and member
            offers.
          </p>
        </div>
        <NewsletterForm />
      </Container>
    </section>
  );
}
