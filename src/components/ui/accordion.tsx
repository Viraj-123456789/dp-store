import { cn } from "@/lib/utils";

interface AccordionProps {
  title: string;
  defaultOpen?: boolean;
  className?: string;
  children: React.ReactNode;
}

/** Native <details> disclosure styled as a bordered card with a +/– marker. */
export function Accordion({
  title,
  defaultOpen = false,
  className,
  children,
}: AccordionProps) {
  return (
    <details
      open={defaultOpen}
      className={cn(
        "group mb-2.5 overflow-hidden rounded-lg border border-border bg-card",
        className,
      )}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between px-[18px] py-[15px] font-heading text-[14.5px] font-bold after:text-[22px] after:font-normal after:text-accent after:content-['+'] group-open:after:content-['–'] [&::-webkit-details-marker]:hidden">
        {title}
      </summary>
      <div className="px-[18px] pb-[18px] text-[13.5px] text-copy">{children}</div>
    </details>
  );
}
