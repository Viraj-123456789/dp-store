import type { Metadata } from "next";

import { CollectionCard } from "@/components/ui/collection-card";
import { Container } from "@/components/ui/container";
import { getCollectionIndex } from "@/lib/collections";

export const metadata: Metadata = {
  title: "Collections | DPetals",
};

export default async function CollectionsPage() {
  const entries = await getCollectionIndex();

  return (
    <Container>
      <header className="pb-2 pt-7">
        <h1 className="font-heading text-[clamp(26px,3.4vw,40px)]">Collections</h1>
      </header>

      <div className="scrollbar-none grid auto-cols-[40%] grid-flow-col gap-3 overflow-x-auto pb-[54px] [scroll-snap-type:x_mandatory] md:auto-cols-auto md:grid-flow-row md:grid-cols-2 md:overflow-visible">
        {entries.map((entry) => (
          <CollectionCard
            key={entry.handle}
            title={entry.title}
            href={`/collections/${entry.handle}`}
            image={entry.image}
            caption={`${entry.productCount} ${entry.productCount === 1 ? "product" : "products"} →`}
            sizes="(min-width: 1240px) 590px, (min-width: 760px) 50vw, 40vw"
          />
        ))}
      </div>
    </Container>
  );
}
