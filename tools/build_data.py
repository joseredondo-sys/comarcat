"""Genera js/data.js a partir del GeoJSON oficial del ICGC (divisions administratives v2r2, 1:1.000.000).

Uso: python tools/build_data.py
"""
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "tools"
OUT = ROOT / "js" / "data.js"

WIDTH = 1000
TOLERANCE = 0.9  # px de simplificación (Douglas-Peucker)

PROVINCIA = {
    "Barcelona": ["Alt Penedès", "Anoia", "Bages", "Baix Llobregat", "Barcelonès", "Berguedà", "Garraf",
                  "Maresme", "Moianès", "Osona", "Vallès Occidental", "Vallès Oriental", "Lluçanès"],
    "Girona": ["Alt Empordà", "Baix Empordà", "Cerdanya", "Garrotxa", "Gironès", "Pla de l'Estany",
               "Ripollès", "Selva"],
    "Lleida": ["Alt Urgell", "Alta Ribagorça", "Garrigues", "Noguera", "Pallars Jussà", "Pallars Sobirà",
               "Pla d'Urgell", "Segarra", "Segrià", "Solsonès", "Urgell", "Val d'Aran"],
    "Tarragona": ["Alt Camp", "Baix Camp", "Baix Ebre", "Baix Penedès", "Conca de Barberà", "Montsià",
                  "Priorat", "Ribera d'Ebre", "Tarragonès", "Terra Alta"],
}
PROV_DE = {c: p for p, cs in PROVINCIA.items() for c in cs}


def load(name):
    return json.loads((SRC / name).read_text(encoding="utf-8"))


com = load("comarques.json")
prov = load("provincies.json")

# Proyección equirectangular corregida por la latitud media
lons, lats = [], []
for f in com["features"]:
    for poly in f["geometry"]["coordinates"]:
        for lon, lat in poly[0]:
            lons.append(lon)
            lats.append(lat)
k = math.cos(math.radians((min(lats) + max(lats)) / 2))
minx, maxx = min(lons) * k, max(lons) * k
miny, maxy = min(lats), max(lats)
scale = WIDTH / (maxx - minx)
HEIGHT = round((maxy - miny) * scale)


def proj(p):
    return ((p[0] * k - minx) * scale, (maxy - p[1]) * scale)


def dp(pts, tol):
    if len(pts) < 3:
        return pts
    keep = [False] * len(pts)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        a, b = stack.pop()
        ax, ay = pts[a]
        bx, by = pts[b]
        dx, dy = bx - ax, by - ay
        norm = math.hypot(dx, dy)
        best, idx = 0, None
        for i in range(a + 1, b):
            px, py = pts[i]
            if norm < 1e-9:
                d = math.hypot(px - ax, py - ay)
            else:
                d = abs(dy * px - dx * py + bx * ay - by * ax) / norm
            if d > best:
                best, idx = d, i
        if idx is not None and best > tol:
            keep[idx] = True
            stack += [(a, idx), (idx, b)]
    return [p for p, kk in zip(pts, keep) if kk]


def ring_area_centroid(pts):
    a = cx = cy = 0
    for (x1, y1), (x2, y2) in zip(pts, pts[1:] + pts[:1]):
        c = x1 * y2 - x2 * y1
        a += c
        cx += (x1 + x2) * c
        cy += (y1 + y2) * c
    a /= 2
    if abs(a) < 1e-9:
        return 0, pts[0]
    return abs(a), (cx / (6 * a), cy / (6 * a))


def inside(pt, ring):
    x, y = pt
    res = False
    for (x1, y1), (x2, y2) in zip(ring, ring[1:] + ring[:1]):
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
            res = not res
    return res


def label_point(ring):
    """Centroide si cae dentro; si no, el punto interior más alejado del borde en una rejilla."""
    _, c = ring_area_centroid(ring)
    xs = [p[0] for p in ring]
    ys = [p[1] for p in ring]
    best, bestd = c, -1
    n = 24
    for i in range(1, n):
        for j in range(1, n):
            p = (min(xs) + (max(xs) - min(xs)) * i / n, min(ys) + (max(ys) - min(ys)) * j / n)
            if not inside(p, ring):
                continue
            d = min(math.hypot(p[0] - q[0], p[1] - q[1]) for q in ring)
            # premiar cercanía al centroide para que la etiqueta quede centrada
            d -= 0.15 * math.hypot(p[0] - c[0], p[1] - c[1])
            if d > bestd:
                best, bestd = p, d
    return best


def to_path(geom):
    parts, rings = [], []
    for poly in geom["coordinates"]:
        for ring in poly:
            pts = dp([proj(p) for p in ring], TOLERANCE)
            if len(pts) < 4:
                continue
            rings.append(pts)
            parts.append("M" + "L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + "Z")
    return "".join(parts), rings


comarques = []
for f in com["features"]:
    p = f["properties"]
    name = p["NOMCOMAR"]
    d, rings = to_path(f["geometry"])
    biggest = max(rings, key=lambda r: ring_area_centroid(r)[0])
    lx, ly = label_point(biggest)
    comarques.append({
        "id": p["CODICOMAR"],
        "nom": name,
        "cap": p["CAPCOMAR"],
        "prov": PROV_DE[name],
        "area": round(p["AREAC5000"]),
        "d": d,
        "lx": round(lx, 1),
        "ly": round(ly, 1),
    })

provincies = []
for f in prov["features"]:
    p = f["properties"]
    d, _ = to_path(f["geometry"])
    provincies.append({"id": p["CODIPROV"], "nom": p["NOMPROV"], "cap": p["CAPPROV"],
                       "area": round(p["AREAP5000"]), "d": d})

assert len(comarques) == 43 and sum(len(v) for v in PROVINCIA.values()) == 43

OUT.write_text(
    "// Generat per tools/build_data.py a partir de l'ICGC (divisions administratives v2r2, 2026-01-20)\n"
    f"window.MAPA = {json.dumps({'w': WIDTH, 'h': HEIGHT, 'comarques': comarques, 'provincies': provincies}, ensure_ascii=False, separators=(',', ':'))};\n",
    encoding="utf-8",
)
print(f"OK {OUT} {OUT.stat().st_size // 1024} KB, viewBox 0 0 {WIDTH} {HEIGHT}")
