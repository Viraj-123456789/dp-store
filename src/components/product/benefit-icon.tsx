import type { BenefitIconName } from "@/types/product";

const icons: Record<BenefitIconName, React.ReactNode> = {
  bubbles: (
    <>
      <circle cx="9.5" cy="13" r="4" />
      <circle cx="16" cy="9" r="2.4" />
      <circle cx="16.5" cy="15.5" r="1.6" />
    </>
  ),
  waves: (
    <>
      <path d="M3 9c3-3 6 3 9 0s6-3 9 0" />
      <path d="M3 15c3-3 6 3 9 0s6-3 9 0" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19c0-8 6-12 14-12 0 8-6 12-14 12z" />
      <path d="M5 19c3-4.5 6.5-6.5 10.5-7.5" />
    </>
  ),
  drop: (
    <>
      <path d="M12 3.5c3.5 4.2 5.5 7.3 5.5 10a5.5 5.5 0 0 1-11 0c0-2.7 2-5.8 5.5-10z" />
      <path d="M9.3 13.8a2.8 2.8 0 0 0 2.4 2.9" />
    </>
  ),
  wind: (
    <>
      <path d="M3 9h11a2.6 2.6 0 1 0-2.6-2.6" />
      <path d="M3 14h15a2.6 2.6 0 1 1-2.6 2.6" />
    </>
  ),
  "check-circle": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.3 12.4l2.6 2.6 4.8-5.4" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3.5l1.7 4.8 4.8 1.7-4.8 1.7L12 16.5l-1.7-4.8L5.5 10l4.8-1.7z" />
      <path d="M18 15.5l.6 1.7 1.7.6-1.7.6-.6 1.7-.6-1.7-1.7-.6 1.7-.6z" />
    </>
  ),
  heart: (
    <path d="M12 20s-6.6-4.2-6.6-8.7A3.6 3.6 0 0 1 12 8a3.6 3.6 0 0 1 6.6 3.3C18.6 15.8 12 20 12 20z" />
  ),
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" />,
  "shield-check": (
    <>
      <path d="M12 3l7 3v5c0 4.4-3 8-7 10-4-2-7-5.6-7-10V6z" />
      <path d="M9 12l2 2 4-4.5" />
    </>
  ),
  scalp: (
    <>
      <path d="M6 20c0-6 2.5-9 6-9s6 3 6 9" />
      <path d="M12 11V4" />
      <path d="M9 6.5L12 3.5l3 3" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
};

export function BenefitIcon({ name }: { name: BenefitIconName }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="size-[34px] fill-none stroke-primary stroke-[1.7] [stroke-linecap:round] [stroke-linejoin:round]"
    >
      {icons[name]}
    </svg>
  );
}
