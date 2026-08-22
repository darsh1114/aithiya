import type { CultureRecord } from "@shared/culture";
import { useEffect, useRef, useState } from "react";
import { MapView } from "./Map";

type CultureMapProps = {
  records: CultureRecord[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
};

const INDIA_CENTER = { lat: 22.9734, lng: 78.6569 };

function offsetPosition(record: CultureRecord, duplicateIndex: number) {
  const [longitude, latitude] = record.location.coordinates;
  if (duplicateIndex === 0) return { lat: latitude, lng: longitude };

  const ring = Math.ceil(duplicateIndex / 6);
  const angle = (duplicateIndex % 6) * (Math.PI / 3);
  const offset = 0.16 * ring;
  return {
    lat: latitude + Math.sin(angle) * offset,
    lng: longitude + Math.cos(angle) * offset,
  };
}

export function CultureMap({ records, selectedSlug, onSelect }: CultureMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  useEffect(() => {
    if (!map || !window.google?.maps?.marker) return;

    markersRef.current.forEach((marker) => {
      marker.map = null;
    });
    markersRef.current = [];

    const duplicateCounts = new Map<string, number>();
    const bounds = new google.maps.LatLngBounds();

    records.forEach((record) => {
      const [longitude, latitude] = record.location.coordinates;
      const coordinateKey = `${longitude},${latitude}`;
      const duplicateIndex = duplicateCounts.get(coordinateKey) ?? 0;
      duplicateCounts.set(coordinateKey, duplicateIndex + 1);

      const position = offsetPosition(record, duplicateIndex);
      bounds.extend(position);

      const markerButton = document.createElement("button");
      markerButton.className = `culture-marker ${record.slug === selectedSlug ? "is-selected" : ""}`;
      markerButton.type = "button";
      markerButton.setAttribute("aria-label", `Explore ${record.title}`);
      markerButton.innerHTML = `<span>${record.title.slice(0, 1)}</span>`;

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position,
        title: record.title,
        content: markerButton,
        zIndex: record.slug === selectedSlug ? 20 : 1,
      });

      markerButton.addEventListener("click", () => onSelect(record.slug));
      markersRef.current.push(marker);
    });

    if (!selectedSlug && records.length > 1) {
      map.fitBounds(bounds, 64);
    }

    return () => {
      markersRef.current.forEach((marker) => {
        marker.map = null;
      });
    };
  }, [map, onSelect, records, selectedSlug]);

  useEffect(() => {
    if (!map || !selectedSlug) return;
    const selectedRecord = records.find((record) => record.slug === selectedSlug);
    if (!selectedRecord) return;

    const [longitude, latitude] = selectedRecord.location.coordinates;
    map.panTo({ lat: latitude, lng: longitude });
    map.setZoom(6);
  }, [map, records, selectedSlug]);

  return (
    <div className="relative min-h-[390px] overflow-hidden rounded-[1.5rem] border border-stone-200 bg-stone-100 shadow-[0_20px_60px_-36px_rgba(21,52,43,0.55)]">
      <MapView
        className="h-[390px]"
        initialCenter={INDIA_CENTER}
        initialZoom={5}
        onMapReady={(nextMap) => {
          nextMap.setOptions({
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
          });
          setMap(nextMap);
        }}
      />
      <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/60 bg-white/90 px-3 py-1.5 text-xs font-medium text-stone-600 shadow-sm backdrop-blur">
        Select a marker to focus a cultural record
      </div>
      <div className="pointer-events-none absolute bottom-4 left-4 rounded-xl bg-[#15342b] px-3 py-2 text-xs font-medium text-white shadow-lg">
        {records.length} markers in view
      </div>
    </div>
  );
}
