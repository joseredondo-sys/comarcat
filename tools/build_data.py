"""Genera js/data.js amb els dos jocs (Catalunya i Espanya).

Catalunya: ICGC, divisions administratives v2r2 (1:1.000.000, 2026-01-20).
Espanya: Eurostat GISCO, NUTS 2024 (1:3.000.000). NUTS 3 = províncies (Balears i Canàries
venen per illes i s'ajunten), NUTS 2 = comunitats autònomes. Canàries es desplacen a un requadre.

Uso: python tools/build_data.py
"""
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "tools"
OUT = ROOT / "js" / "data.js"

WIDTH = 1000
TOLERANCE = 0.9  # px de simplificació (Douglas-Peucker)


def load(name):
    return json.loads((SRC / name).read_text(encoding="utf-8"))


# ---------- Geometria ----------
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
    """Centroide si cau dins; si no, el punt interior més allunyat de la vora en una graella."""
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
            # premiar la proximitat al centroide perquè l'etiqueta quedi centrada
            d -= 0.15 * math.hypot(p[0] - c[0], p[1] - c[1])
            if d > bestd:
                best, bestd = p, d
    return best


def geo_area_km2(polys):
    """Superfície aproximada (km²) de llistes de polígons lon/lat."""
    total = 0
    for poly in polys:
        for k, ring in enumerate(poly):
            lat0 = sum(p[1] for p in ring) / len(ring)
            pts = [(p[0] * 111.32 * math.cos(math.radians(lat0)), p[1] * 110.57) for p in ring]
            a = ring_area_centroid(pts)[0]
            total += a if k == 0 else -a
    return total


class Projection:
    """Equirectangular corregida per la latitud mitjana, ajustada a WIDTH."""

    def __init__(self, polys):
        lons = [p[0] for poly in polys for p in poly[0]]
        lats = [p[1] for poly in polys for p in poly[0]]
        self.k = math.cos(math.radians((min(lats) + max(lats)) / 2))
        self.minx = min(lons) * self.k
        self.maxy = max(lats)
        self.scale = WIDTH / (max(lons) * self.k - self.minx)
        self.h = round((self.maxy - min(lats)) * self.scale)

    def __call__(self, p):
        return ((p[0] * self.k - self.minx) * self.scale, (self.maxy - p[1]) * self.scale)


def to_path(polys, proj):
    parts, rings = [], []
    for poly in polys:
        for ring in poly:
            pts = dp([proj(p) for p in ring], TOLERANCE)
            if len(pts) < 4:
                continue
            rings.append(pts)
            parts.append("M" + "L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + "Z")
    return "".join(parts), rings


def polys_of(geom):
    return geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]


def item(id_, nom, cap, grp, polys, proj, area, alias=()):
    d, rings = to_path(polys, proj)
    biggest = max(rings, key=lambda r: ring_area_centroid(r)[0])
    lx, ly = label_point(biggest)
    out = {"id": id_, "nom": nom, "cap": cap, "grp": grp, "area": area, "d": d,
           "lx": round(lx, 1), "ly": round(ly, 1)}
    if alias:
        out["alias"] = list(alias)
    return out


# ---------- Catalunya ----------
def build_catalunya():
    grups = {
        "Barcelona": ("#4c8bf5", ["Alt Penedès", "Anoia", "Bages", "Baix Llobregat", "Barcelonès", "Berguedà", "Garraf",
                                  "Maresme", "Moianès", "Osona", "Vallès Occidental", "Vallès Oriental", "Lluçanès"]),
        "Girona": ("#ef6461", ["Alt Empordà", "Baix Empordà", "Cerdanya", "Garrotxa", "Gironès", "Pla de l'Estany",
                               "Ripollès", "Selva"]),
        "Lleida": ("#3fb57a", ["Alt Urgell", "Alta Ribagorça", "Garrigues", "Noguera", "Pallars Jussà", "Pallars Sobirà",
                               "Pla d'Urgell", "Segarra", "Segrià", "Solsonès", "Urgell", "Val d'Aran"]),
        "Tarragona": ("#f2a93b", ["Alt Camp", "Baix Camp", "Baix Ebre", "Baix Penedès", "Conca de Barberà", "Montsià",
                                  "Priorat", "Ribera d'Ebre", "Tarragonès", "Terra Alta"]),
    }
    grp_de = {c: g for g, (_, cs) in grups.items() for c in cs}
    alias = {"Val d'Aran": ["Aran"]}
    com = load("comarques.json")
    prov = load("provincies.json")
    proj = Projection([poly for f in com["features"] for poly in polys_of(f["geometry"])])
    items = [item(p["CODICOMAR"], p["NOMCOMAR"], p["CAPCOMAR"], grp_de[p["NOMCOMAR"]], polys_of(f["geometry"]), proj,
                  round(p["AREAC5000"]), alias.get(p["NOMCOMAR"], ()))
             for f in com["features"] for p in [f["properties"]]]
    assert len(items) == 43 and sum(len(cs) for _, cs in grups.values()) == 43
    return {
        "w": WIDTH, "h": proj.h, "items": items,
        "groups": [{"id": g, "nom": g, "color": c} for g, (c, _) in grups.items()],
        "outlines": [to_path(polys_of(f["geometry"]), proj)[0] for f in prov["features"]],
        "frames": [],
    }


# ---------- Espanya ----------
# NUTS 2 -> (id, castellà, català, color)
COMUNITATS = {
    "ES61": ("AN", "Andalucía", "Andalusia", "#f2a93b"),
    "ES24": ("AR", "Aragón", "Aragó", "#ef6461"),
    "ES12": ("AS", "Asturias", "Astúries", "#4c8bf5"),
    "ES53": ("IB", "Islas Baleares", "Illes Balears", "#14b8a6"),
    "ES70": ("CN", "Canarias", "Canàries", "#a78bfa"),
    "ES13": ("CB", "Cantabria", "Cantàbria", "#f472b6"),
    "ES41": ("CL", "Castilla y León", "Castella i Lleó", "#3fb57a"),
    "ES42": ("CM", "Castilla-La Mancha", "Castella-la Manxa", "#e9c46a"),
    "ES51": ("CT", "Cataluña", "Catalunya", "#f97316"),
    "ES52": ("VC", "Comunidad Valenciana", "Comunitat Valenciana", "#38bdf8"),
    "ES43": ("EX", "Extremadura", "Extremadura", "#84cc16"),
    "ES11": ("GA", "Galicia", "Galícia", "#60a5fa"),
    "ES30": ("MD", "Comunidad de Madrid", "Comunitat de Madrid", "#e5484d"),
    "ES62": ("MC", "Región de Murcia", "Regió de Múrcia", "#c084fc"),
    "ES22": ("NC", "Navarra", "Navarra", "#fb7185"),
    "ES21": ("PV", "País Vasco", "País Basc", "#10b981"),
    "ES23": ("RI", "La Rioja", "la Rioja", "#d97706"),
    "ES63": ("CE", "Ceuta", "Ceuta", "#64748b"),
    "ES64": ("ML", "Melilla", "Melilla", "#94a3b8"),
}

# NUTS 3 -> (codi INE, nom es, nom ca, capital es, capital ca, àlies)
PROVINCIES = {
    "ES211": ("01", "Álava", "Àlaba", "Vitoria-Gasteiz", "Vitòria", ["Araba", "Araba/Álava", "Vitoria"]),
    "ES421": ("02", "Albacete", "Albacete", "Albacete", "Albacete", []),
    "ES521": ("03", "Alicante", "Alacant", "Alicante", "Alacant", []),
    "ES611": ("04", "Almería", "Almeria", "Almería", "Almeria", []),
    "ES411": ("05", "Ávila", "Àvila", "Ávila", "Àvila", []),
    "ES431": ("06", "Badajoz", "Badajoz", "Badajoz", "Badajoz", []),
    "ES53": ("07", "Islas Baleares", "Illes Balears", "Palma", "Palma", ["Baleares", "Balears", "Palma de Mallorca"]),
    "ES511": ("08", "Barcelona", "Barcelona", "Barcelona", "Barcelona", []),
    "ES412": ("09", "Burgos", "Burgos", "Burgos", "Burgos", []),
    "ES432": ("10", "Cáceres", "Càceres", "Cáceres", "Càceres", []),
    "ES612": ("11", "Cádiz", "Cadis", "Cádiz", "Cadis", []),
    "ES522": ("12", "Castellón", "Castelló", "Castellón de la Plana", "Castelló de la Plana", ["Castellon de la Plana"]),
    "ES422": ("13", "Ciudad Real", "Ciudad Real", "Ciudad Real", "Ciudad Real", ["Ciutat Reial"]),
    "ES613": ("14", "Córdoba", "Còrdova", "Córdoba", "Còrdova", []),
    "ES111": ("15", "A Coruña", "la Corunya", "A Coruña", "la Corunya", ["La Coruña", "Coruña", "Corunya"]),
    "ES423": ("16", "Cuenca", "Conca", "Cuenca", "Conca", []),
    "ES512": ("17", "Girona", "Girona", "Girona", "Girona", ["Gerona"]),
    "ES614": ("18", "Granada", "Granada", "Granada", "Granada", []),
    "ES424": ("19", "Guadalajara", "Guadalajara", "Guadalajara", "Guadalajara", []),
    "ES212": ("20", "Gipuzkoa", "Guipúscoa", "San Sebastián", "Sant Sebastià", ["Guipúzcoa", "Donostia"]),
    "ES615": ("21", "Huelva", "Huelva", "Huelva", "Huelva", []),
    "ES241": ("22", "Huesca", "Osca", "Huesca", "Osca", []),
    "ES616": ("23", "Jaén", "Jaén", "Jaén", "Jaén", []),
    "ES413": ("24", "León", "Lleó", "León", "Lleó", []),
    "ES513": ("25", "Lleida", "Lleida", "Lleida", "Lleida", ["Lérida"]),
    "ES230": ("26", "La Rioja", "la Rioja", "Logroño", "Logronyo", ["Rioja"]),
    "ES112": ("27", "Lugo", "Lugo", "Lugo", "Lugo", []),
    "ES300": ("28", "Madrid", "Madrid", "Madrid", "Madrid", []),
    "ES617": ("29", "Málaga", "Màlaga", "Málaga", "Màlaga", []),
    "ES620": ("30", "Murcia", "Múrcia", "Murcia", "Múrcia", []),
    "ES220": ("31", "Navarra", "Navarra", "Pamplona", "Pamplona", ["Iruña", "Iruñea"]),
    "ES113": ("32", "Ourense", "Ourense", "Ourense", "Ourense", ["Orense"]),
    "ES120": ("33", "Asturias", "Astúries", "Oviedo", "Oviedo", []),
    "ES414": ("34", "Palencia", "Palència", "Palencia", "Palència", []),
    "ES70a": ("35", "Las Palmas", "Las Palmas", "Las Palmas de Gran Canaria", "Las Palmas de Gran Canària", ["Palmas"]),
    "ES114": ("36", "Pontevedra", "Pontevedra", "Pontevedra", "Pontevedra", []),
    "ES415": ("37", "Salamanca", "Salamanca", "Salamanca", "Salamanca", []),
    "ES70b": ("38", "Santa Cruz de Tenerife", "Santa Cruz de Tenerife", "Santa Cruz de Tenerife", "Santa Cruz de Tenerife", ["Tenerife"]),
    "ES130": ("39", "Cantabria", "Cantàbria", "Santander", "Santander", []),
    "ES416": ("40", "Segovia", "Segòvia", "Segovia", "Segòvia", []),
    "ES618": ("41", "Sevilla", "Sevilla", "Sevilla", "Sevilla", []),
    "ES417": ("42", "Soria", "Sòria", "Soria", "Sòria", []),
    "ES514": ("43", "Tarragona", "Tarragona", "Tarragona", "Tarragona", []),
    "ES242": ("44", "Teruel", "Terol", "Teruel", "Terol", []),
    "ES425": ("45", "Toledo", "Toledo", "Toledo", "Toledo", []),
    "ES523": ("46", "Valencia", "València", "Valencia", "València", []),
    "ES418": ("47", "Valladolid", "Valladolid", "Valladolid", "Valladolid", []),
    "ES213": ("48", "Bizkaia", "Biscaia", "Bilbao", "Bilbao", ["Vizcaya"]),
    "ES419": ("49", "Zamora", "Zamora", "Zamora", "Zamora", []),
    "ES243": ("50", "Zaragoza", "Saragossa", "Zaragoza", "Saragossa", []),
    "ES630": ("51", "Ceuta", "Ceuta", "Ceuta", "Ceuta", []),
    "ES640": ("52", "Melilla", "Melilla", "Melilla", "Melilla", []),
}
# Illes que s'ajunten en una província
UNIO = {"ES531": "ES53", "ES532": "ES53", "ES533": "ES53",
        "ES704": "ES70a", "ES705": "ES70a", "ES708": "ES70a",
        "ES703": "ES70b", "ES706": "ES70b", "ES707": "ES70b", "ES709": "ES70b"}
CANARIES_SHIFT = (6.0, 7.6)  # graus (lon, lat) per acostar Canàries a la península


def shift_canaries(polys):
    dx, dy = CANARIES_SHIFT
    return [[[(p[0] + dx, p[1] + dy) for p in ring] for ring in poly] for poly in polys]


def build_espanya():
    n3 = load("espanya-provincies.json")["features"]
    n2 = load("espanya-comunitats.json")["features"]

    geo, real = {}, {}
    for f in n3:
        nid = f["properties"]["NUTS_ID"]
        key = UNIO.get(nid, nid)
        polys = polys_of(f["geometry"])
        real.setdefault(key, []).extend(polys)
        geo.setdefault(key, []).extend(shift_canaries(polys) if nid.startswith("ES70") else polys)
    assert set(geo) == set(PROVINCIES), set(geo) ^ set(PROVINCIES)

    grp_of = {}
    for key in PROVINCIES:
        n2id = key[:4]
        grp_of[key] = COMUNITATS[n2id][0]

    proj = Projection([poly for polys in geo.values() for poly in polys])
    items = []
    for key, (ine, es, ca, cap_es, cap_ca, alias) in PROVINCIES.items():
        it = item(ine, {"es": es, "ca": ca}, {"es": cap_es, "ca": cap_ca}, grp_of[key], geo[key], proj,
                  round(geo_area_km2(real[key]), -2) if geo_area_km2(real[key]) > 500 else round(geo_area_km2(real[key])),
                  alias)
        it["approx"] = 1
        items.append(it)
    items.sort(key=lambda x: x["id"])

    outlines = []
    for f in n2:
        nid = f["properties"]["NUTS_ID"]
        polys = polys_of(f["geometry"])
        outlines.append(to_path(shift_canaries(polys) if nid == "ES70" else polys, proj)[0])

    can = [proj(p) for key in ("ES70a", "ES70b") for poly in geo[key] for p in poly[0]]
    xs, ys = [p[0] for p in can], [p[1] for p in can]
    pad = 12
    x0, y0 = max(min(xs) - pad, 1), min(ys) - pad
    x1, y1 = max(xs) + pad, min(max(ys) + pad, proj.h - 1)
    frame = {"x": round(x0), "y": round(y0), "w": round(x1 - x0), "h": round(y1 - y0)}

    groups = [{"id": gid, "nom": {"es": es, "ca": ca}, "color": color}
              for gid, es, ca, color in COMUNITATS.values()]
    groups.sort(key=lambda g: g["nom"]["es"])
    assert len(items) == 52
    esp = {"w": WIDTH, "h": proj.h, "items": items, "groups": groups, "outlines": outlines, "frames": [frame]}

    # Nivell "només comunitats": mateixa projecció perquè el mapa encaixi igual
    ccaa = []
    for f in n2:
        nid = f["properties"]["NUTS_ID"]
        gid, es, ca, color = COMUNITATS[nid]
        ine, cap_es, cap_ca, alias = CCAA_INFO[gid]
        polys = polys_of(f["geometry"])
        area = geo_area_km2(polys)
        provs = [{"es": p[1], "ca": p[2]} for key, p in PROVINCIES.items() if key[:4] == nid and p[0] not in ("51", "52")]
        it = item(ine, {"es": es, "ca": ca}, {"es": cap_es, "ca": cap_ca}, gid,
                  shift_canaries(polys) if nid == "ES70" else polys, proj,
                  round(area, -2) if area > 500 else round(area), alias)
        it["approx"] = 1
        it["provs"] = sorted(provs, key=lambda p: p["es"])
        ccaa.append(it)
    ccaa.sort(key=lambda x: x["id"])
    assert len(ccaa) == 19
    ccaa_game = {"w": WIDTH, "h": proj.h, "items": ccaa, "groups": groups, "outlines": [], "frames": [frame]}
    return esp, ccaa_game


# Comunitats: codi INE, capital (es, ca) i àlies per escriure-les
CCAA_INFO = {
    "AN": ("01", "Sevilla", "Sevilla", []),
    "AR": ("02", "Zaragoza", "Saragossa", []),
    "AS": ("03", "Oviedo", "Oviedo", ["Principado de Asturias"]),
    "IB": ("04", "Palma", "Palma", ["Baleares", "Balears"]),
    "CN": ("05", "Las Palmas de Gran Canaria y Santa Cruz de Tenerife",
           "Las Palmas de Gran Canària i Santa Cruz de Tenerife", ["Canarias", "Islas Canarias"]),
    "CB": ("06", "Santander", "Santander", []),
    "CL": ("07", "Valladolid", "Valladolid", []),
    "CM": ("08", "Toledo", "Toledo", []),
    "CT": ("09", "Barcelona", "Barcelona", []),
    "VC": ("10", "Valencia", "València", ["País Valencià", "Comunidad Valenciana"]),
    "EX": ("11", "Mérida", "Mèrida", []),
    "GA": ("12", "Santiago de Compostela", "Santiago de Compostel·la", []),
    "MD": ("13", "Madrid", "Madrid", ["Madrid"]),
    "MC": ("14", "Murcia", "Múrcia", ["Murcia", "Múrcia"]),
    "NC": ("15", "Pamplona", "Pamplona", ["Comunidad Foral de Navarra"]),
    "PV": ("16", "Vitoria-Gasteiz", "Vitòria", ["Euskadi"]),
    "RI": ("17", "Logroño", "Logronyo", ["Rioja"]),
    "CE": ("18", "Ceuta", "Ceuta", []),
    "ML": ("19", "Melilla", "Melilla", []),
}

esp_game, ccaa_game = build_espanya()
games = {"cat": build_catalunya(), "esp": esp_game, "ccaa": ccaa_game}
OUT.write_text(
    "// Generat per tools/build_data.py (ICGC 2026-01-20 per a Catalunya; Eurostat GISCO NUTS 2024 per a Espanya)\n"
    f"window.GAMES = {json.dumps(games, ensure_ascii=False, separators=(',', ':'))};\n",
    encoding="utf-8",
)
for k, g in games.items():
    print(k, len(g["items"]), "items, viewBox 0 0", g["w"], g["h"])
print(f"OK {OUT} {OUT.stat().st_size // 1024} KB")
