import Image from "next/image";
import Link from "next/link";

/** Sign-in screens run on a bare white page, like the hosted account pages they mirror. */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-col bg-card font-system text-[14px] leading-[1.35] text-ck-text">
      <header className="flex h-[109px] flex-none justify-center pt-10">
        <Link href="/" aria-label="DPetals">
          <Image
            src="/brand/dpetals-logo-teal.svg"
            alt="DPetals"
            width={100}
            height={49}
            preload
            className="h-[49px] w-[100px]"
          />
        </Link>
      </header>
      <main className="grid flex-1 place-items-center">{children}</main>
      <footer className="flex h-[59px] flex-none items-center justify-center">
        <Link href="/policies/privacy-policy" className="text-ck-accent">
          Privacy policy
        </Link>
      </footer>
    </div>
  );
}
