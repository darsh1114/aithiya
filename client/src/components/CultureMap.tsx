import type { CultureRecord } from "@shared/culture";

type CultureMapProps = {
  records: CultureRecord[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
};

const INDIA_BOUNDS = { west: 67, east: 98, south: 6, north: 37 };

function markerPosition([longitude, latitude]: CultureRecord["location"]["coordinates"]) {
  return {
    left: `${Math.min(95, Math.max(5, ((longitude - INDIA_BOUNDS.west) / (INDIA_BOUNDS.east - INDIA_BOUNDS.west)) * 100))}%`,
    top: `${Math.min(93, Math.max(7, ((INDIA_BOUNDS.north - latitude) / (INDIA_BOUNDS.north - INDIA_BOUNDS.south)) * 100))}%`,
  };
}

/**
 * A dependency-free cultural map. Marker positions come from each MongoDB
 * record's longitude/latitude, so the page keeps its map-first experience on
 * Vercel without a third-party browser key or an origin-restricted proxy.
 */
export function CultureMap({ records, selectedSlug, onSelect }: CultureMapProps) {
  return (
    <div className="relative min-h-[390px] overflow-hidden rounded-[1.5rem] border border-[#15342b]/15 bg-[#dfe9e1] shadow-[0_20px_60px_-36px_rgba(21,52,43,0.55)]">
      <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="atlas-land" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#5a8069" />
            <stop offset="1" stopColor="#234b3b" />
          </linearGradient>
          <pattern id="atlas-grid" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M 8 0 L 0 0 0 8" fill="none" stroke="#15342b" strokeOpacity=".10" strokeWidth=".35" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#atlas-grid)" />
        <path d="M47 8 L54 12 58 20 66 25 68 34 75 39 75 48 82 58 79 68 73 70 69 81 62 90 54 89 49 79 43 76 40 65 35 57 36 48 30 41 34 34 38 30 38 20 43 15 Z" fill="url(#atlas-land)" fillOpacity=".92" stroke="#f4c968" strokeOpacity=".75" strokeWidth=".7" />
        <path d="M38 22 C45 28 57 30 67 35 M36 42 C49 48 63 54 76 59 M42 63 C50 67 60 73 68 79" fill="none" stroke="#f4c968" strokeOpacity=".28" strokeWidth=".45" strokeDasharray="1.5 1.5" />
      </svg>

      <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/60 bg-white/90 px-3 py-1.5 text-xs font-medium text-stone-600 shadow-sm backdrop-blur">Select a marker to focus a cultural record</div>
      {records.map((record, index) => {
        const position = markerPosition(record.location.coordinates);
        const selected = record.slug === selectedSlug;
        const offset = ((index % 3) - 1) * 5;
        return (
          <button
            key={record.id}
            type="button"
            aria-label={`Explore ${record.title}`}
            onClick={() => onSelect(record.slug)}
            className={`absolute z-10 grid h-8 w-8 place-items-center rounded-full border-2 border-white text-xs font-bold shadow-lg transition duration-150 hover:scale-110 focus-visible:outline-3 focus-visible:outline-[#f4c968] ${selected ? "bg-[#b9602c] text-white scale-110" : "bg-[#15342b] text-[#f4c968]"}`}
            style={{ ...position, transform: `translate(calc(-50% + ${offset}px), -50%)` }}
          >
            {record.title.slice(0, 1)}
          </button>
        );
      })}
      <div className="pointer-events-none absolute bottom-4 left-4 rounded-xl bg-[#15342b] px-3 py-2 text-xs font-medium text-white shadow-lg">{records.length} markers in view</div>
      <div className="pointer-events-none absolute bottom-4 right-4 rounded-xl border border-white/50 bg-white/80 px-3 py-2 text-xs font-medium text-[#15342b] backdrop-blur">Cultural geography</div>
    </div>
  );
}
