"""Background plate for the promo: deep navy gradient, soft vignette, a faint
dot grid and fine grain (so gradients don't band after encoding)."""
import sys
import numpy as np
from PIL import Image

W, H = 1920, 1080
y, x = np.mgrid[0:H, 0:W].astype(np.float32)
top = np.array([7, 8, 15], np.float32)
bot = np.array([11, 11, 24], np.float32)
img = top + (bot - top) * (y / H)[..., None]
# vignette
d = np.sqrt(((x - W / 2) / (W * 0.62)) ** 2 + ((y - H / 2) / (H * 0.62)) ** 2)
img *= (1 - 0.45 * np.clip(d - 0.35, 0, 1) ** 1.5)[..., None]
# dot grid, fading towards the edges
step = 40
gx = (x % step) - step / 2
gy = (y % step) - step / 2
dot = np.clip(1.6 - np.sqrt(gx ** 2 + gy ** 2), 0, 1)
fadeg = np.clip(1.15 - d, 0, 1)
img += (dot * fadeg * 10)[..., None] * np.array([0.8, 0.8, 1.0], np.float32)
# grain
rng = np.random.default_rng(3)
img += rng.normal(0, 1.1, (H, W, 1)).astype(np.float32)
Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save(sys.argv[1])
print("wrote", sys.argv[1])
