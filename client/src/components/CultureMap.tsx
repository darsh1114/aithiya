import { useEffect, useMemo } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLngBoundsExpression } from "leaflet";
import type { CultureRecord } from "@shared/culture";
import { toLeafletPosition } from "@/lib/map";

const INDIA_CENTER: [number, number] = [22.5, 79];
const INDIA_BOUNDS: LatLngBoundsExpression = [[6, 67], [37, 98]];

type CultureMapProps = { records: CultureRecord[]; selectedSlug: string | null; onSelect: (slug: string) => void };

function MapViewport({ records, selectedSlug }: Pick<CultureMapProps, "records" | "selectedSlug">) {
  const map = useMap();
  const bounds = useMemo<LatLngBoundsExpression>(() => records.length ? records.map((record) => toLeafletPosition(record.location.coordinates)) : INDIA_BOUNDS, [records]);

  useEffect(() => {
    if (records.length) map.fitBounds(bounds, { padding: [32, 32], maxZoom: 6 });
    else map.setView(INDIA_CENTER, 5);
  }, [bounds, map, records.length]);

  useEffect(() => {
    const selected = records.find((record) => record.slug === selectedSlug);
    if (selected) map.flyTo(toLeafletPosition(selected.location.coordinates), Math.max(map.getZoom(), 6), { duration: 0.45 });
  }, [map, records, selectedSlug]);

  return null;
}

/** Live map powered by Leaflet and OpenStreetMap tiles with no paid map key. */
export function CultureMap({ records, selectedSlug, onSelect }: CultureMapProps) {
  return (
    <div className="relative min-h-[390px] overflow-hidden rounded-[1.5rem] border border-[#15342b]/15 bg-[#dfe9e1] shadow-[0_20px_60px_-36px_rgba(21,52,43,0.55)]">
      <MapContainer center={INDIA_CENTER} zoom={5} minZoom={4} maxZoom={11} scrollWheelZoom className="h-[390px] w-full sm:h-[520px]" aria-label="Interactive map of Indian cultural records">
        <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>' />
        <MapViewport records={records} selectedSlug={selectedSlug} />
        {records.map((record) => {
          const selected = record.slug === selectedSlug;
          return (
            <CircleMarker key={record.id} center={toLeafletPosition(record.location.coordinates)} radius={selected ? 10 : 8} pathOptions={{ color: "#ffffff", weight: 2, fillColor: selected ? "#b9602c" : "#15342b", fillOpacity: 0.95 }} eventHandlers={{ click: () => onSelect(record.slug) }}>
              <Popup>
                <div className="min-w-[180px]"><p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#b9602c]">{record.category}</p><h3 className="font-serif text-lg font-semibold text-[#15342b]">{record.title}</h3><p className="mt-1 text-sm text-stone-600">{record.location.state}, {record.location.region}</p><button type="button" onClick={() => onSelect(record.slug)} className="mt-3 rounded-full bg-[#15342b] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#234b3b]">Open record</button></div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
      <div className="pointer-events-none absolute left-4 top-4 z-[500] rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-xs font-medium text-stone-600 shadow-sm backdrop-blur">{records.length ? "Select a marker to focus a cultural record" : "Map ready for cultural records"}</div>
      <div className="pointer-events-none absolute bottom-4 left-4 z-[500] rounded-xl bg-[#15342b] px-3 py-2 text-xs font-medium text-white shadow-lg">{records.length} {records.length === 1 ? "marker" : "markers"} in view</div>
    </div>
  );
}
