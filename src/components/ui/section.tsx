import { cn } from "@/lib/utils";

import { Container } from "./container";
import { TextLink } from "./text-link";

/** Standard vertical rhythm for home sections: 30 / 40 / 50px. */
export function Section({
  className,
  children,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section className={cn("py-[30px] md:py-10 lg:py-[50px]", className)} {...props}>
      <Container>{children}</Container>
    </section>
  );
}

interface SectionHeadingProps {
  title: string;
  description?: string;
  action?: { label: string; href: string };
  centered?: boolean;
}

export function SectionHeading({
  title,
  description,
  action,
  centered = false,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-4 flex items-end justify-between gap-3.5",
        centered && "text-center",
      )}
    >
      <div>
        <h2 className="font-heading text-[clamp(23px,3.4vw,38px)] font-bold">
          {title}
        </h2>
        {description && (
          <p
            className={cn(
              "mt-1.5 max-w-[560px] text-sm text-muted-foreground",
            )}
          >
            {description}
          </p>
        )}
      </div>
      {action && <TextLink href={action.href}>{action.label}</TextLink>}
    </div>
  );
}
