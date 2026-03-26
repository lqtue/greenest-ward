"""
Generate study area map showing HCMC's five historical development rings
with ward boundaries overlaid, plus a Vietnam inset.
"""

import json
import geopandas as gpd
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.lines import Line2D
from shapely.ops import unary_union
import numpy as np

# ── Configuration ──────────────────────────────────────────────────────
BOUNDARY_DIR = "/Users/airm1/Work/VnExpress/HCMC 1975-now boundary"
WARD_ZIP = "/Users/airm1/Desktop/greenest_ward/VNWard.zip"
HIST_JSON = "/Users/airm1/Desktop/greenest_ward/hcm_historical.json"
OUTPUT = "/Users/airm1/Desktop/greenest_ward/study_area_rings.png"

# Ring colors — muted, academic palette
RING_COLORS = {
    "pre-1972 (Saigon core)": "#c62828",      # deep red
    "1972-1976 expansion":    "#e65100",       # burnt orange
    "1976-2000 expansion":    "#f9a825",       # amber
    "2000-2025 expansion":    "#558b2f",       # olive green
    "outside nội thành":      "#37474f",       # blue-grey
}

RING_ORDER = [
    "pre-1972 (Saigon core)",
    "1972-1976 expansion",
    "1976-2000 expansion",
    "2000-2025 expansion",
    "outside nội thành",
]

RING_LABELS = [
    "Pre-1972 (Saigon core)",
    "1972\u20131976 expansion",
    "1976\u20132000 expansion",
    "2000\u20132025 expansion",
    "Outside n\u1ed9i th\u00e0nh",
]

# ── Load data ──────────────────────────────────────────────────────────
print("Loading ward shapefile...")
wards = gpd.read_file(f"zip://{WARD_ZIP}", encoding="utf-8")

# Filter to HCMC wards
hcmc_wards = wards[wards["Tỉnh_th"].str.contains("Hồ Chí Minh", na=False)].copy()
print(f"  {len(hcmc_wards)} HCMC wards")

# Load era assignments
with open(HIST_JSON) as f:
    hist_data = json.load(f)

ward_era = {d["ward"]: d["era"] for d in hist_data}

# Join era to ward geodataframe
hcmc_wards["era"] = hcmc_wards["Phường_"].map(ward_era)
print(f"  Matched eras: {hcmc_wards['era'].notna().sum()}")

# Load historical boundaries for ring construction
print("Loading historical boundaries...")
noi_thanh_1972 = gpd.read_file(f"{BOUNDARY_DIR}/Nội thành 1972.geojson")
noi_thanh_1976 = gpd.read_file(f"{BOUNDARY_DIR}/Nội thành 1976.geojson")
noi_thanh_2000 = gpd.read_file(f"{BOUNDARY_DIR}/Nội thành 2000.geojson")
noi_thanh_2025 = gpd.read_file(f"{BOUNDARY_DIR}/Nội thành 2004 - 2025.geojson")
toan_tp = gpd.read_file(f"{BOUNDARY_DIR}/Toàn TP 1978 - 2025.geojson")

# Construct rings by spatial differencing
ring_geoms = {}
ring_geoms["pre-1972 (Saigon core)"] = noi_thanh_1972.geometry.union_all()
ring_geoms["1972-1976 expansion"] = noi_thanh_1976.geometry.union_all().difference(
    noi_thanh_1972.geometry.union_all()
)
ring_geoms["1976-2000 expansion"] = noi_thanh_2000.geometry.union_all().difference(
    noi_thanh_1976.geometry.union_all()
)
ring_geoms["2000-2025 expansion"] = noi_thanh_2025.geometry.union_all().difference(
    noi_thanh_2000.geometry.union_all()
)
ring_geoms["outside nội thành"] = toan_tp.geometry.union_all().difference(
    noi_thanh_2025.geometry.union_all()
)

# Build a GeoDataFrame for rings
rings_gdf = gpd.GeoDataFrame(
    {"era": RING_ORDER, "geometry": [ring_geoms[e] for e in RING_ORDER]},
    crs="EPSG:4326",
)

# ── Figure layout ──────────────────────────────────────────────────────
print("Rendering map...")
fig = plt.figure(figsize=(8, 10), dpi=300, facecolor="white")

# Main map axes
ax_main = fig.add_axes([0.05, 0.05, 0.88, 0.88])

# Plot rings
for era, label in zip(RING_ORDER, RING_LABELS):
    ring_row = rings_gdf[rings_gdf["era"] == era]
    ring_row.plot(
        ax=ax_main,
        color=RING_COLORS[era],
        alpha=0.45,
        edgecolor="none",
    )

# Plot ward boundaries
hcmc_wards.plot(
    ax=ax_main,
    facecolor="none",
    edgecolor="#888888",
    linewidth=0.25,
    zorder=3,
)

# Plot ring borders (thicker, for clarity)
for era in RING_ORDER:
    ring_row = rings_gdf[rings_gdf["era"] == era]
    ring_row.boundary.plot(
        ax=ax_main,
        color=RING_COLORS[era],
        linewidth=1.2,
        alpha=0.8,
        zorder=4,
    )

# Bounds — use Toàn TP extent with small padding
bounds = toan_tp.total_bounds  # minx, miny, maxx, maxy
pad_x = (bounds[2] - bounds[0]) * 0.05
pad_y = (bounds[3] - bounds[1]) * 0.05
ax_main.set_xlim(bounds[0] - pad_x, bounds[2] + pad_x)
ax_main.set_ylim(bounds[1] - pad_y, bounds[3] + pad_y)

# Styling
ax_main.set_xlabel("Longitude", fontsize=9)
ax_main.set_ylabel("Latitude", fontsize=9)
ax_main.tick_params(labelsize=7)
ax_main.set_aspect("equal")

# Grid
ax_main.grid(True, linestyle=":", linewidth=0.3, color="#aaaaaa", alpha=0.5)

# Legend
legend_handles = []
for era, label in zip(RING_ORDER, RING_LABELS):
    legend_handles.append(
        mpatches.Patch(
            facecolor=RING_COLORS[era],
            edgecolor=RING_COLORS[era],
            alpha=0.6,
            label=label,
        )
    )
legend_handles.append(
    Line2D([0], [0], color="#888888", linewidth=0.5, label="Ward boundaries")
)

ax_main.legend(
    handles=legend_handles,
    loc="lower left",
    fontsize=7.5,
    frameon=True,
    fancybox=False,
    edgecolor="#cccccc",
    framealpha=0.95,
    title="Historical development rings",
    title_fontsize=8,
)

# Title
ax_main.set_title(
    "Ho Chi Minh City: Historical urban expansion rings\nwith 2025 ward boundaries",
    fontsize=11,
    fontweight="bold",
    pad=12,
)

# ── Vietnam inset ──────────────────────────────────────────────────────
# Use the full ward shapefile to get Vietnam outline
print("Building Vietnam inset...")
ax_inset = fig.add_axes([0.68, 0.62, 0.25, 0.30])

# Dissolve all wards to get rough Vietnam boundary
vietnam_outline = wards.dissolve().boundary
vietnam_outline.plot(ax=ax_inset, color="#666666", linewidth=0.3)

# Mark HCMC location
hcmc_centroid = toan_tp.geometry.union_all().centroid
ax_inset.plot(
    hcmc_centroid.x,
    hcmc_centroid.y,
    marker="*",
    color="#c62828",
    markersize=12,
    zorder=5,
    markeredgecolor="white",
    markeredgewidth=0.3,
)
ax_inset.annotate(
    "HCMC",
    xy=(hcmc_centroid.x, hcmc_centroid.y),
    xytext=(hcmc_centroid.x + 1.5, hcmc_centroid.y + 0.5),
    fontsize=6.5,
    fontweight="bold",
    color="#c62828",
    arrowprops=dict(arrowstyle="-", color="#c62828", lw=0.5),
)

ax_inset.set_xlim(102, 110)
ax_inset.set_ylim(8, 23.5)
ax_inset.set_aspect("equal")
ax_inset.set_xticks([])
ax_inset.set_yticks([])
for spine in ax_inset.spines.values():
    spine.set_edgecolor("#999999")
    spine.set_linewidth(0.5)

ax_inset.set_title("Vietnam", fontsize=7, pad=2)

# ── Scale bar ──────────────────────────────────────────────────────────
# Approximate: at 10.7°N, 1° lon ≈ 109.3 km
# 10 km ≈ 0.0915° longitude
scale_x0 = bounds[2] - pad_x - 0.005
scale_y0 = bounds[1] + pad_y * 0.3
scale_len = 10 / 109.3  # 10 km in degrees

ax_main.plot(
    [scale_x0 - scale_len, scale_x0],
    [scale_y0, scale_y0],
    color="black",
    linewidth=1.5,
    zorder=10,
)
ax_main.plot(
    [scale_x0 - scale_len, scale_x0 - scale_len],
    [scale_y0 - 0.005, scale_y0 + 0.005],
    color="black",
    linewidth=1,
    zorder=10,
)
ax_main.plot(
    [scale_x0, scale_x0],
    [scale_y0 - 0.005, scale_y0 + 0.005],
    color="black",
    linewidth=1,
    zorder=10,
)
ax_main.text(
    scale_x0 - scale_len / 2,
    scale_y0 + 0.012,
    "10 km",
    ha="center",
    fontsize=6.5,
    zorder=10,
)

# ── North arrow ────────────────────────────────────────────────────────
# North arrow — place in lower-right, above scale bar
arrow_x = bounds[2] - pad_x * 0.5
arrow_y = bounds[1] + pad_y * 4
ax_main.annotate(
    "",
    xy=(arrow_x, arrow_y + 0.06),
    xytext=(arrow_x, arrow_y),
    arrowprops=dict(arrowstyle="-|>", color="black", lw=1.5, mutation_scale=12),
    zorder=10,
)
ax_main.text(
    arrow_x, arrow_y + 0.075, "N",
    fontsize=9, fontweight="bold", ha="center", va="bottom", zorder=10,
)

# ── Save ───────────────────────────────────────────────────────────────
print(f"Saving to {OUTPUT}...")
fig.savefig(OUTPUT, dpi=300, bbox_inches="tight", facecolor="white")
plt.close()
print("Done.")
