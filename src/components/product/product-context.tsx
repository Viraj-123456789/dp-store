"use client";

import { createContext, useContext, useMemo, useState } from "react";

import type { ProductDetail, ProductVariant } from "@/types/product";

interface ProductContextValue {
  product: ProductDetail;
  variant: ProductVariant;
  selectedOptions: string[];
  quantity: number;
  mediaIndex: number;
  selectOption: (optionIndex: number, value: string) => void;
  changeQuantity: (delta: number) => void;
  selectMedia: (index: number) => void;
}

const ProductContext = createContext<ProductContextValue | null>(null);

function resolveVariant(product: ProductDetail, selected: string[]) {
  if (product.options.length === 0) return product.variants[0];
  return (
    product.variants.find((variant) =>
      variant.options.every((value, index) => value === selected[index]),
    ) ?? product.variants[0]
  );
}

function findMediaIndex(product: ProductDetail, imageFile: string | null) {
  if (!imageFile) return -1;
  return product.media.findIndex(
    (media) => media.type === "image" && media.src.endsWith(`/${imageFile}`),
  );
}

/** Shares the selected variant, quantity and gallery media between the gallery, buy box and sticky bar. */
export function ProductProvider({
  product,
  children,
}: {
  product: ProductDetail;
  children: React.ReactNode;
}) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    () => product.variants[0].options,
  );
  const [quantity, setQuantity] = useState(1);
  const [mediaIndex, setMediaIndex] = useState(0);

  const value = useMemo<ProductContextValue>(() => {
    const variant = resolveVariant(product, selectedOptions);

    return {
      product,
      variant,
      selectedOptions,
      quantity,
      mediaIndex,
      selectOption: (optionIndex, optionValue) => {
        const next = [...selectedOptions];
        next[optionIndex] = optionValue;
        setSelectedOptions(next);
        const index = findMediaIndex(
          product,
          resolveVariant(product, next).imageFile,
        );
        if (index >= 0) setMediaIndex(index);
      },
      changeQuantity: (delta) => setQuantity((current) => Math.max(1, current + delta)),
      selectMedia: setMediaIndex,
    };
  }, [product, selectedOptions, quantity, mediaIndex]);

  return <ProductContext value={value}>{children}</ProductContext>;
}

export function useProduct() {
  const context = useContext(ProductContext);
  if (!context) throw new Error("useProduct must be used inside ProductProvider");
  return context;
}
