import { Button } from "@/components/ui/button";

/** Plain GET form for the search page; works without JavaScript. */
export function SearchForm({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <form action="/search" method="get" role="search" className="mt-3.5 max-w-[560px]">
      <div className="flex items-center gap-2.5 rounded-pill border-2 border-primary bg-card py-1 pl-[18px] pr-1.5">
        <input
          type="search"
          name="q"
          defaultValue={defaultValue}
          aria-label="Search"
          className="min-w-0 flex-1 bg-transparent py-[11px] font-sans text-[16px] leading-[normal] outline-none"
        />
        <Button type="submit" className="px-[22px] py-2.5">
          Go
        </Button>
      </div>
    </form>
  );
}
