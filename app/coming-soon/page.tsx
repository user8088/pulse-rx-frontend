import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coming Soon | Pulse RX Digital Pharmacy",
  description:
    "We are preparing something special. Pulse RX digital pharmacy launches soon.",
};

export default function ComingSoonPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16 text-white">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#044644] via-[#023530] to-[#011a18]" />
      <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden>
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-[#01AC28] blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-[#5C9D40] blur-[100px]" />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.06)_0%,_transparent_55%)]" />

      <div className="relative z-10 mx-auto max-w-lg text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-[#7dd89a]">
          Pulse RX
        </p>
        <h1 className="mb-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          Coming soon
        </h1>
        <p className="text-lg leading-relaxed text-white/85">
          We are building a calmer, clearer digital pharmacy experience. This site
          will open to the public shortly.
        </p>

        <div
          className="mt-12 flex justify-center gap-2"
          role="status"
          aria-label="Loading indicator"
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#01AC28]" />
          <span
            className="h-2 w-2 animate-pulse rounded-full bg-[#5C9D40]"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="h-2 w-2 animate-pulse rounded-full bg-[#01AC28]"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </main>
  );
}
