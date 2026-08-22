# Discovery Interface Verification Notes

- The live discovery page loaded the Google Maps canvas and displayed imported cultural-record markers.
- Selecting the **Festivals** category updated both views to nine festival results and nine markers.
- The map exposed keyboard-accessible marker controls, while result cards exposed descriptive map-focus actions.
- Selecting Durga Puja focused the map on Kolkata and opened contextual details with best visiting time and a source link.
- Entering a text search triggered a debounced refresh of the map and results state, with loading feedback shown during the update.
- After reloading with the hardened loader, the map initialized to all 22 markers and the matching 22-record results list without leaving the interface in a loading state.
- The map fallback was exercised during an incompatible asynchronous-loading attempt; restoring the compatible loader returned the live map to 22 interactive marker controls while retaining the visible fallback for genuine failures.
- A rendering inspection found the Google Maps host at zero height; the map component now receives an explicit 390-pixel height so its base-map tiles can draw correctly.
- A fresh visual verification confirmed that the corrected map displays India base-map tiles and controls; the cultural markers populate after the record query resolves.
- The final live map verification showed the full base layer, 22 markers, and the matching cultural-record results side by side.
- Selecting the Pongal map marker re-centered the map and opened the matching Tamil Nadu record panel with cultural context, visiting guidance, and its documented source.
- The mobile layout was visually checked at 375px, and an automated shared-control test now covers combined trimmed search, category, and region filter inputs used by both desktop and mobile views.
- In an isolated live 375px viewport, the Festivals control returned nine festival records, selecting Durga Puja opened its panel, closing it dismissed the panel, and the South India region filter narrowed the festival results to Pongal.
- A separate isolated 375px search entered **Pongal** and returned two matching cultural records, including Pongal Sweet, confirming the debounced mobile search narrows results successfully.
