export type GeoCoordinates = [longitude: number, latitude: number];
export type LeafletPosition = [latitude: number, longitude: number];

/** Convert MongoDB [longitude, latitude] into Leaflet [latitude, longitude]. */
export function toLeafletPosition([longitude, latitude]: GeoCoordinates): LeafletPosition {
  return [latitude, longitude];
}
