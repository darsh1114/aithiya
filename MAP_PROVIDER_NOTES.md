# Live map provider decision

## Selected stack

Use Leaflet for the interactive map and OpenStreetMap standard raster tiles at `https://tile.openstreetmap.org/{z}/{x}/{y}.png`. This requires no user-supplied API key and is suitable for the project’s current small public discovery audience, subject to the tile policy.

## Implementation requirements

Leaflet’s official quick start shows a defined-height map container, a tile layer with the exact HTTPS tile URL, visible attribution, markers, popups, and touch interaction. OpenStreetMap’s official tile policy requires visible licence attribution, a valid browser Referer, normal caching behavior, and no bulk tile downloads or prefetching. The site must not present the standard tile server as an unlimited production API; if traffic grows materially, move to a hosted OSM-derived provider or self-hosted tiles.

## Sources

- Leaflet Quick Start: https://leafletjs.com/examples/quick-start/
- OpenStreetMap Tile Usage Policy: https://operations.osmfoundation.org/policies/tiles/
- OpenStreetMap attribution: https://www.openstreetmap.org/copyright
