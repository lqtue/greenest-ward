# Vietnam's Green Debt: How Four Regimes Built a Concrete City

## The Thesis

Every regime that governed Ho Chi Minh City built the city it needed and left the green debt for the next one. The French planted parks for a colonial capital. The war filled every gap with refugees. Reunification industrialized the fringe. The market built new suburbs but never fixed the core. The satellite can still see every one of those decisions — and the 327,000 people trapped in the green debt they left behind.

---

## Narrative Structure

### Act 1 — The Desert

**Open on the worst place.**

Phú Thọ Hòa. 140,000 people. 3.5% green cover. Walk 1km in any direction: still only 7.78 m² of green per person — below WHO's minimum. One of only 3 wards in the entire country where the concrete is so continuous there is no escape on foot.

Show the satellite image. Then pull back to reveal it's not alone — it sits in the center of a 36-ward concrete belt across HCMC: 3.5 million people, all below 20 m²/cap accessible green.

**Key data:**
- 3 true green deserts: Phú Thọ Hòa, Tân Phú, Tân Hòa
- 327,000 people with <9 m²/cap even within 1km reach
- 36-ward concrete belt: 3.5M people below 20 m²/cap accessible
- All in HCMC. No other city has this.

---

### Act 2 — The Layers of History

**Animate HCMC's boundary expanding over time.** Four concentric rings, each representing a regime's contribution to the city:

| Era | Boundary | Area | What it built | Green legacy |
|---|---|---|---|---|
| French colonial (pre-1954) | Nội thành 1972 | 71 km² | Parks, boulevards, Tao Đàn, Zoo | Real but insufficient for today's density |
| War-era (1954-1975) | Nội thành 1976 | 126 km² | Informal refugee settlement | Zero green planning. Every m² to shelter |
| Post-reunification (1975-2000) | Nội thành 2000 | 442 km² | Industrial expansion, worker housing | The two worst deserts were built here |
| Market era (2000-2025) | Nội thành 2004 | 493 km² | Master-planned suburbs (Phú Mỹ Hưng, Thủ Đức) | Green where there's money |

**The data by ring (current state):**

| Ring | Wards | Med green % | Med 1km access | Density | WHO fail rate |
|---|---|---|---|---|---|
| Pre-1972 Saigon core | 29 | 11.3% | 15.6 m²/cap | 46k/km² | 90% |
| 1972-1976 expansion | 19 | 8.7% | 22.1 m²/cap | 35k/km² | 89% |
| 1976-2000 expansion | 25 | 24.5% | 58.4 m²/cap | 13k/km² | 28% |
| 2000-2025 expansion | 5 | 19.1% | 27.6 m²/cap | 17k/km² | 40% |
| Outside nội thành | 35 | 40.9% | 417.2 m²/cap | 2k/km² | 0% |

**The surprise:** The French core isn't the greenest — it's the second most deprived (90% WHO failure). The colonial parks exist but 46,000 people/km² overwhelm them. And 2 of the 3 deserts sit in the post-reunification ring — the era with the least planning capacity.

---

### Act 3 — The Time Series (GEE temporal analysis)

**Show when each ring lost its green.** Using Landsat imagery from 1985 to 2025, track green cover % within each historical ring at ~5-year intervals.

Expected findings (to be confirmed by data):
- The pre-1972 core was already mostly concrete by 1985 — the green loss happened before satellites were watching
- The 1976-2000 ring should show the sharpest decline — farmland to concrete in one generation
- The post-2000 ring may show stability or even greening (Phú Mỹ Hưng)
- The outer ring will show recent decline as the city continues to expand

**Paired with LST (land surface temperature):** Each ring's green cover line paired with its temperature line. As green falls, temperature rises. The scissors chart — but for heat, not population.

**Visualization:** Line chart, 4 lines (one per ring), x-axis 1985-2025, dual y-axis: green cover % and mean surface temperature. This is the analytical centerpiece.

---

### Act 4 — The Access Question

**Reframe from ownership to access.**

Ward boundaries are administrative fiction. A person in Phú Nhuận (0.33 m²/cap own green) can walk 10 minutes and access 12.89 m²/cap. The green exists — it's just across the ward line.

**The data:**
- 79 wards fail WHO by own green (8M people)
- Only 3 fail with 1km buffer (327K people)
- 76 wards "rescued" by neighboring green (7.7M people)

This reframes the entire analysis. The ward is the wrong unit for measuring lived experience. The right unit is walkable access.

**But** — the satellite can't tell you if that neighboring green is a public park or a gated compound, a military base or a golf course. Access on the map ≠ access in reality. This is the honest caveat that builds credibility.

---

### Act 5 — The Heatmap

**500m grid over HCMC.** Each cell colored by:
1. Green cover % (NDVI from Sentinel-2, 2025)
2. Surface temperature (Landsat thermal)

Overlay the historical boundary rings. The concrete belt becomes visible as a contiguous hot, gray zone wrapping around the city center. The deserts glow.

**Before/after option:** Same grid, 1995 vs 2025. Show where green disappeared. The post-reunification ring should light up.

---

### Act 6 — The Counterfactual and the Comparison

**Phú Mỹ Hưng (District 7)** — master-planned in the 1990s with a Taiwanese developer. Designed with green corridors from day one. Result: 31.8% green cover, 69.5 m²/cap accessible, 0% WHO failure. Same city, same climate, same government. Different outcome.

**Proof that the desert is a choice, not an inevitability.**

**National comparison:**
- Hanoi: 19/51 wards fail, but only 2 below 15 m²/cap accessible. Different history (Soviet-influenced planning, lakes as green infrastructure)
- Da Nang: 1/23 wards fail. Nearly zero deserts. Strong recent urban planning.
- Can Tho: 1/31 wards fail.
- HCMC: 52/113 fail. 36-ward concrete belt. Unique in Vietnam.

---

### Act 7 — The Merger (closing)

**The 2025 ward restructuring is the latest chapter.**

Vietnam merged 687 new urban wards from a mix of phường (urban) and xã (rural). The national median green cover jumped to 47% — but 53% of those wards absorbed rural land in the merger.

**The pure-urban picture:**
- 317 pure phường wards: median 33.3% green, 25.6% fail WHO
- 368 mixed wards: median 60.7% green, 3.3% fail WHO

The merger made cities look greener on paper. On the ground, the concrete belt didn't gain a single tree.

**Closing question:** Will this be the regime that pays the green debt — or passes it on?

---

## Data & Methodology

### What We Have
- 687 ward-level green cover data (Sentinel-2, NDVI ≥ 0.4, 10m, 2025)
- Ward boundary shapefiles (new 2025 boundaries)
- Pre-merger composition (Sáp nhập từ — which old phường/xã merged into each new ward)
- HCMC historical city boundaries: 1972, 1976, 2000, 2004-2025 (both nội thành and toàn TP)
- Population per ward (administrative census data)
- 1km accessibility buffer analysis (computed)

### What We Need to Compute (GEE)

**Computation 1: Time series (fast, <1 min)**
- Unit: 5 historical boundary rings
- Sensor: Landsat 5/8/9 at 30m
- Time points: 1985, 1990, 1995, 2000, 2005, 2010, 2015, 2020, 2025
- Metrics: green cover %, mean LST
- NDVI threshold: 0.4 (consistent with main analysis)

**Computation 2: Current heatmap (~5 min)**
- Unit: 500m grid over HCMC (~8,000 cells)
- Sensor: Sentinel-2 at 10m (NDVI), Landsat at 100m (LST)
- Time: 2025 only
- Output: green_pct + mean_LST per cell

**Computation 3: Change heatmap (optional, ~5 min)**
- Unit: same 500m grid
- Sensor: Landsat at 30m
- Time: 1995 + 2025
- Output: green_pct change per cell

### Benchmarks
- WHO: 9 m² green space per capita
- Vietnam TCXDVN 362:2005: 7-9 m²/cap depending on city tier
- HCMC's own urban planning target (to be confirmed)

### Known Limitations
- Sentinel-2 10m resolution undercounts isolated street trees in dense urban cores (mixed pixel effect)
- Landsat 30m has more mixed pixels — absolute values not directly comparable to Sentinel, but trend is valid
- NDVI 0.4 threshold captures healthy canopy but misses sparse lawns and drought-stressed vegetation
- Monsoon cloud cover may create data gaps in some years
- Population data is static census — doesn't reflect daytime commuter populations
- 1km buffer measures geographic proximity, not actual public access (parks vs. private/restricted green)
- LST is surface temperature, not air temperature — concrete surfaces can read 10-20°C higher than air temp
- Historical boundary classification uses ward centroid — wards straddling boundary lines are classified by center point

---

## Visual Assets Needed

1. **Hero: satellite image of Phú Thọ Hòa** — tight crop showing the concrete texture
2. **Animated map: HCMC boundary expansion** — 1972 → 1976 → 2000 → 2004, rings appearing
3. **Time series line chart** — 4 rings × green cover % from 1985-2025, with LST overlay
4. **Strip plot / beeswarm** — all 673 wards by green per capita, WHO line, colored by pure/mixed
5. **HCMC heatmap** — 500m grid, green cover %, with historical ring overlays and desert highlights
6. **LST heatmap** — same grid, surface temperature
7. **Before/after** — 1995 vs 2025 green cover grid (or satellite comparison)
8. **Access diagram** — one example ward showing own green vs. 1km buffer
9. **Comparison small multiples** — HCMC vs Hanoi vs Da Nang (same metric, different cities)
10. **The Phú Mỹ Hưng card** — the counterfactual, side-by-side with a desert ward

---

## Open Questions

1. Can we get HCMC's own urban green space planning targets for a domestic benchmark?
2. Is there flood incident data to overlay on the concrete belt?
3. Population growth data per district over time (to pair with the green loss time series)?
4. Any existing land use classification for HCMC (to distinguish residential concrete from industrial)?
5. Can we identify which parks/green spaces within the 1km buffer are actually public?
