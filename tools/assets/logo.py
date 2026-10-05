"""Vector reconstruction of the SkitStudio app icon (isometric cube with UI tiles,
a layout wireframe and a </> glyph), traced from the icon in the app's own
screens. Writes an SVG; rasterize.mjs turns it into transparent PNGs."""
import math, sys

S = 1024
cx, cy = 512, 552          # front-top vertex of the cube
L = 360                    # edge length
a, b = L * math.cos(math.radians(30)), L * math.sin(math.radians(30))

F = (cx, cy)
R = (cx + a, cy - b)
B = (cx, cy - 2 * b)
Lv = (cx - a, cy - b)
FB = (cx, cy + L)
RB = (cx + a, cy - b + L)
LB = (cx - a, cy - b + L)

def pts(*ps):
    return " ".join(f"{x:.1f},{y:.1f}" for x, y in ps)

def top(u, v):
    # u toward R, v toward Lv, origin F
    return (F[0] + u * (R[0] - F[0]) + v * (Lv[0] - F[0]), F[1] + u * (R[1] - F[1]) + v * (Lv[1] - F[1]))

def tile(u0, u1, v0, v1, lift=0.0):
    ps = [top(u0, v0), top(u1, v0), top(u1, v1), top(u0, v1)]
    return [(x, y - lift) for x, y in ps]

def left(s, t):
    # s from Lv (0) to F (1); t down
    return (Lv[0] + s * (F[0] - Lv[0]), Lv[1] + s * (F[1] - Lv[1]) + t * L)

def lrect(s0, s1, t0, t1):
    return [left(s0, t0), left(s1, t0), left(s1, t1), left(s0, t1)]

g = 0.075
tiles = []
for (u0, u1, v0, v1) in [(g, .5 - g / 2, g, .5 - g / 2), (.5 + g / 2, 1 - g, g, .5 - g / 2), (g, .5 - g / 2, .5 + g / 2, 1 - g)]:
    tiles.append(f'<polygon points="{pts(*tile(u0, u1, v0, v1))}" fill="url(#tileG)" stroke="#a68cff" stroke-width="7" stroke-linejoin="round"/>')

# raised mini-cube on the back tile
u0, u1, v0, v1 = .5 + g, 1 - g * 1.6, .5 + g, 1 - g * 1.6
h = 58
base = tile(u0, u1, v0, v1)
topq = tile(u0, u1, v0, v1, lift=h)
mini = (
    f'<polygon points="{pts(base[0], base[1], topq[1], topq[0])}" fill="#9a80ff" fill-opacity=".85" stroke="#efe6ff" stroke-opacity=".7" stroke-width="3" stroke-linejoin="round"/>'
    f'<polygon points="{pts(base[0], base[3], topq[3], topq[0])}" fill="#7d5ff5" fill-opacity=".9" stroke="#efe6ff" stroke-opacity=".7" stroke-width="3" stroke-linejoin="round"/>'
    f'<polygon points="{pts(*topq)}" fill="url(#miniG)" stroke="#ffffff" stroke-opacity=".9" stroke-width="3" stroke-linejoin="round"/>'
)

blocks = "".join(
    f'<polygon points="{pts(*lrect(*r))}" fill="#6a48f2" fill-opacity=".55" stroke="#a88bff" stroke-opacity=".75" stroke-width="3" stroke-linejoin="round"/>'
    for r in [(.1, .9, .1, .36), (.1, .44, .44, .9), (.52, .9, .44, .64), (.52, .9, .71, .9)]
)

# right face local frame: origin F, x toward R (per 100 units), y down
mr = f"matrix({a / 100:.4f},{-b / 100:.4f},0,{L / 100:.4f},{F[0]:.1f},{F[1]:.1f})"
glyph = (
    f'<g transform="{mr}" fill="none" stroke="#5fe0ff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" filter="url(#glowS)">'
    '<polyline points="30,34 14,50 30,66"/><line x1="58" y1="27" x2="44" y2="73"/><polyline points="72,34 88,50 72,66"/></g>'
)

edges = [(F, R), (F, Lv), (F, FB), (R, B), (Lv, B), (R, RB), (Lv, LB), (FB, RB), (FB, LB)]
edge_svg = "".join(f'<line x1="{p[0]:.1f}" y1="{p[1]:.1f}" x2="{q[0]:.1f}" y2="{q[1]:.1f}"/>' for p, q in edges)

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{S}" height="{S}" viewBox="0 0 {S} {S}">
<defs>
  <radialGradient id="bg" cx="50%" cy="52%" r="62%">
    <stop offset="0" stop-color="#4f2cff"/><stop offset=".5" stop-color="#2814b4"/><stop offset="1" stop-color="#0e0848"/>
  </radialGradient>
  <linearGradient id="topG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a3ae0"/><stop offset="1" stop-color="#4128c2"/></linearGradient>
  <linearGradient id="tileG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b59bff"/><stop offset="1" stop-color="#8462ff"/></linearGradient>
  <linearGradient id="miniG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e3d8ff"/><stop offset="1" stop-color="#a98cff"/></linearGradient>
  <linearGradient id="leftG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b25c4"/><stop offset="1" stop-color="#25168f"/></linearGradient>
  <linearGradient id="rightG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a1fa8"/><stop offset="1" stop-color="#18127a"/></linearGradient>
  <filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="10" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="glowS" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="halo" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40"/></filter>
  <clipPath id="card"><rect x="40" y="40" width="944" height="944" rx="210"/></clipPath>
</defs>
<g clip-path="url(#card)">
  <rect x="40" y="40" width="944" height="944" fill="url(#bg)"/>
  <ellipse cx="512" cy="560" rx="330" ry="330" fill="#5d4bff" opacity=".35" filter="url(#halo)"/>
</g>
<rect x="40" y="40" width="944" height="944" rx="210" fill="none" stroke="#a291ff" stroke-width="8"/>
<polygon points="{pts(F, R, B, Lv)}" fill="url(#topG)"/>
<polygon points="{pts(F, Lv, LB, FB)}" fill="url(#leftG)"/>
<polygon points="{pts(F, R, RB, FB)}" fill="url(#rightG)"/>
{blocks}
{''.join(tiles)}
{mini}
{glyph}
<g stroke="#4cc9ff" stroke-width="9" stroke-linecap="round" filter="url(#glow)">{edge_svg}</g>
<g stroke="#e9fbff" stroke-width="2.5" stroke-linecap="round" opacity=".9">{edge_svg}</g>
</svg>'''

mode = sys.argv[2] if len(sys.argv) > 2 else "full"
if mode in ("cube", "card"):
    head, rest = svg.split('<g clip-path="url(#card)">', 1)
    card_part, cube_part = rest.split('<polygon points=', 1)
    if mode == "cube":
        svg = head + '<polygon points=' + cube_part
    else:
        svg = head + '<g clip-path="url(#card)">' + card_part + '</svg>'
open(sys.argv[1], "w").write(svg)
print("wrote", sys.argv[1])
