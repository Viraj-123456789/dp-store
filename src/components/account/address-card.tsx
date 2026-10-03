import type { SavedAddress } from "@/types/account";

export function AddressSummary({ address }: { address: SavedAddress }) {
  const name = `${address.firstName} ${address.lastName}`.trim();
  const lines = [address.address1, address.address2, `${address.city}, ${address.state} ${address.pin}`, "India"].filter(
    Boolean,
  );

  return (
    <address className="text-sm not-italic leading-[1.6] text-copy">
      {name && <b className="block font-heading text-foreground">{name}</b>}
      {lines.map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      ))}
      {address.phone && <span className="mt-1 block text-muted-foreground">{address.phone}</span>}
    </address>
  );
}
