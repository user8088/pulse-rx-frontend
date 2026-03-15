import { Sparkles, Tag } from "lucide-react";
import { tryBucketUrl } from "@/lib/bucketUrl";
import type { Offer } from "@/types/offer";

function formatDate(s: string): string {
  const d = (s || "").slice(0, 10);
  if (!d) return "—";
  try {
    const [y, m, day] = d.split("-");
    const dayNum = Number(day);
    const monthNum = Number(m);
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const suffix =
      dayNum >= 11 && dayNum <= 13
        ? "th"
        : dayNum % 10 === 1
        ? "st"
        : dayNum % 10 === 2
        ? "nd"
        : dayNum % 10 === 3
        ? "rd"
        : "th";
    const monthName = monthNames[monthNum - 1] ?? m;
    return `${dayNum}${suffix} ${monthName} ${y}`;
  } catch {
    return d;
  }
}

interface OfferBannerDetailProps {
  offer: Offer;
  /** Optional: show compact variant (e.g. inside a grid) */
  compact?: boolean;
}

export default function OfferBannerDetail({ offer, compact }: OfferBannerDetailProps) {
  const bannerUrl = offer.banner_url
    ? (offer.banner_url.startsWith("http") ? offer.banner_url : tryBucketUrl(offer.banner_url))
    : null;

  if (compact) {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-[#01AC28] via-[#00C853] to-[#00E676] overflow-hidden shadow-md text-white">
        {bannerUrl && (
          <div className="relative w-full aspect-[3/1] min-h-[120px] bg-black/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={bannerUrl} alt="" className="w-full h-full object-cover opacity-70 mix-blend-multiply" />
          </div>
        )}
        <div className="p-4 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_60%)] pointer-events-none" />
          <div className="relative flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest">
              <Tag className="w-3.5 h-3.5" />
              {offer.discount_percentage}% OFF
            </span>
            <Sparkles className="w-4 h-4 text-white/80" />
          </div>
          <h2 className="text-lg font-bold text-white">{offer.name}</h2>
          {offer.description && (
            <p className="text-sm text-white/90 mt-1 line-clamp-2">{offer.description}</p>
          )}
          <p className="text-xs text-white/80 mt-2">
            Valid: {formatDate(offer.start_date)} to {formatDate(offer.end_date)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg bg-gradient-to-r from-[#01AC28] via-[#00C853] to-[#00E676] text-white relative">
      <div className="absolute inset-0 opacity-25 mix-blend-soft-light bg-[radial-gradient(circle_at_top,_white,_transparent_55%)]" />
      <div className="absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.5),_transparent_60%)] pointer-events-none" />

      <div className="relative flex flex-col md:flex-row">
        {bannerUrl && (
          <div className="relative w-full md:max-w-md aspect-[2/1] md:aspect-auto md:min-h-[240px] bg-black/20 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bannerUrl}
              alt=""
              className="w-full h-full object-cover opacity-70 mix-blend-multiply scale-105"
            />
          </div>
        )}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-center relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <Tag className="w-6 h-6 text-white" />
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-white text-[#01AC28] px-4 py-1.5 text-sm font-bold">
              {offer.discount_percentage}% OFF
            </span>
            <Sparkles className="w-5 h-5 text-white/90" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">{offer.name}</h2>
          {offer.description && (
            <p className="text-white/90 text-sm md:text-base mb-4 max-w-xl">
              {offer.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
            <span className="font-medium">
              Valid: {formatDate(offer.start_date)} to {formatDate(offer.end_date)}
            </span>
            {/* We intentionally hide explicit \"Applies to\" text and rely on description to convey scope. */}
          </div>
        </div>
      </div>
    </div>
  );
}
