import { Button } from "@/components/ui/button";
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
        <form className="min-w-[300px] max-w-[560px] flex-1 max-md:max-w-none">
          <div className="flex gap-2 max-md:flex-col">
            <input
              type="email"
              name="email"
              required
              placeholder="Your email address"
              aria-label="Email"
              className="min-w-0 flex-1 rounded-pill bg-card px-5 py-3 font-sans text-[15px] leading-[normal] text-foreground placeholder:text-muted-foreground focus:outline-3 focus:outline-primary-foreground/40"
            />
            <Button type="submit" variant="light" className="whitespace-nowrap">
              Claim 10% off
            </Button>
          </div>
        </form>
      </Container>
    </section>
  );
}
