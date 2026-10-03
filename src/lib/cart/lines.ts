import type { CartLine } from "@/types/cart";
import type { ProductDetail, ProductVariant } from "@/types/product";

export type CartLineInput = Omit<CartLine, "quantity">;

/** Builds the cart line for a product variant (defaults to the first variant). */
export function buildCartLine(
  product: ProductDetail,
  variant: ProductVariant = product.variants[0],
): CartLineInput {
  const variantTitle = product.options.length > 0 ? variant.title : null;
  const variantImage = variant.imageFile
    ? product.media.find(
        (media) => media.type === "image" && media.src.endsWith(`/${variant.imageFile}`),
      )
    : undefined;
  const image =
    variantImage ?? product.media.find((media) => media.type === "image") ?? product.media[0];

  const measure = product.netQty?.match(/^(\d+(?:\.\d+)?)\s*(ml|g)$/i);

  return {
    variantId: variant.id,
    handle: product.handle,
    title: product.title,
    variantTitle,
    image: image.src,
    imageAlt: variantTitle ? `${product.title} - ${variantTitle}` : product.title,
    unitPrice: variant.price,
    compareAtPrice: variant.compareAtPrice,
    unitMeasure:
      measure && product.options.length === 0
        ? { amount: Number(measure[1]), unit: measure[2].toLowerCase() }
        : null,
  };
}
