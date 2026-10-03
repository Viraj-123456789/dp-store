import Image from "next/image";
import Link from "next/link";

import { cdn } from "@/lib/cdn";
import type { CdnImage } from "@/types/home";

interface CollectionCardProps {
  title: string;
  href: string;
  image: CdnImage;
  /** Small line under the title, e.g. "Shop now →" or "9 products →". */
  caption: string;
  sizes: string;
}

/** 4:5 image tile with a title overlay, used for category and collection links. */
export function CollectionCard({ title, href, image, caption, sizes }: CollectionCardProps) {
  return (
    <Link
      href={href}
      className="group relative block aspect-[4/5] snap-start overflow-hidden rounded-2xl bg-foreground"
    >
      <Image
        src={cdn(image.src)}
        alt={image.alt}
        fill
        sizes={sizes}
        className="object-cover opacity-85 transition duration-[350ms] group-hover:scale-[1.06] group-hover:opacity-70"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-b from-transparent to-foreground/85 p-3.5 text-primary-foreground">
        <h3 className="text-[16px] font-bold">{title}</h3>
        <span className="text-xs opacity-85">{caption}</span>
      </div>
    </Link>
  );
}
