#!/usr/bin/env python3
"""
Split the quest-daily master sticker sheet into individual 512×512 transparent PNGs.
Usage: python3 scripts/split_sticker_sheet.py <path-to-master-sheet.png>
"""

from PIL import Image
import numpy as np
from collections import deque
from scipy import ndimage
import os, sys

ROWS_1_TO_6 = [
    # Row 1
    "make-bed", "reading-picture-books", "brush-teeth", "bedtime-story",
    "bins-to-street", "pack-school-bag", "pack-lunchbox", "unpack-repack-dishwasher",
    "get-into-bed", "fold-laundry",
    # Row 2
    "homework", "feed-dog", "clean-windows", "pack-soccer-gear",
    "eat-dinner", "set-the-table", "tidy-room", "have-a-shower",
    "have-a-bath", "vacuum-house",
    # Row 3
    "play-with-dog", "charge-watch", "charge-ipad", "sunscreen-on",
    "hat-on", "uniform-in-washing-basket", "toys-away", "pick-up-dog-poo",
    "clean-mirrors", "empty-trash",
    # Row 4
    "walk-the-dog", "deodorant-on", "wash-hair", "put-clothes-away",
    "help-unpack-groceries", "help-cook-dinner", "exercise", "help-in-garden",
    "soccer-training", "soccer-game",
    # Row 5
    "cricket-training", "cricket-game", "birthday-party", "friend-over",
    "extra-screen-time", "movie-night", "special-dinner", "family-game",
    "craft-time", "1-1-parent-time",
    # Row 6
    "special-activity", "extra-tv-time", "stay-up-late", "canteen-lunch-order",
    "nintendo-time", "nintendo-game", "new-clothes", "new-shoes",
    "gift-voucher", "special-breakfast",
]

ROW_7 = [
    "bubble-tea", "sushi", "tacos", "chicken-schnitzel",
    "fish-and-chips", "kfc", "mcdonalds", "ice-block",
    "ice-cream", "slushie", "fruit", "vegetables",
]


def remove_bg(img, color_thresh=72):
    """Flood-fill from edges to remove the background gradient."""
    arr = np.array(img.convert("RGBA"), dtype=np.uint8)
    H, W = arr.shape[:2]

    # Sample background from corners AND mid-edges for a better estimate
    samples = [
        arr[0, 0, :3], arr[0, W-1, :3], arr[H-1, 0, :3], arr[H-1, W-1, :3],
        arr[0, W//2, :3], arr[H-1, W//2, :3],
        arr[H//2, 0, :3], arr[H//2, W-1, :3],
    ]
    bg = np.median(samples, axis=0).astype(float)

    visited = np.zeros((H, W), dtype=bool)
    queue = deque()

    # Seed from all four edges
    for x in range(W):
        for y in [0, H-1]:
            if not visited[y, x]:
                visited[y, x] = True
                queue.append((y, x))
    for y in range(H):
        for x in [0, W-1]:
            if not visited[y, x]:
                visited[y, x] = True
                queue.append((y, x))

    while queue:
        r, c = queue.popleft()
        pixel = arr[r, c, :3].astype(float)
        if np.sqrt(np.sum((pixel - bg) ** 2)) < color_thresh:
            arr[r, c, 3] = 0
            for nr, nc in ((r-1,c),(r+1,c),(r,c-1),(r,c+1)):
                if 0 <= nr < H and 0 <= nc < W and not visited[nr, nc]:
                    visited[nr, nc] = True
                    queue.append((nr, nc))

    return Image.fromarray(arr)


def keep_main_sticker(img):
    """Remove stray pixels from adjacent cells — keep only the largest connected blob."""
    arr = np.array(img.convert("RGBA"), dtype=np.uint8)
    alpha = arr[..., 3] > 20
    labeled, n = ndimage.label(alpha)
    if n <= 1:
        return img
    sizes = ndimage.sum(alpha, labeled, range(1, n + 1))
    largest = int(np.argmax(sizes)) + 1
    arr[labeled != largest, 3] = 0
    return Image.fromarray(arr)


def tight_crop(img, pad=4):
    arr = np.array(img.convert("RGBA"))
    alpha = arr[..., 3]
    rows = np.any(alpha > 20, axis=1)
    cols = np.any(alpha > 20, axis=0)
    if not rows.any():
        return img
    r0, r1 = np.where(rows)[0][[0, -1]]
    c0, c1 = np.where(cols)[0][[0, -1]]
    r0 = max(0, r0 - pad)
    r1 = min(arr.shape[0] - 1, r1 + pad)
    c0 = max(0, c0 - pad)
    c1 = min(arr.shape[1] - 1, c1 + pad)
    return img.crop((c0, r0, c1 + 1, r1 + 1))


def to_512(img):
    w, h = img.size
    size = max(w, h)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.paste(img, ((size - w) // 2, (size - h) // 2), img)
    return canvas.resize((512, 512), Image.LANCZOS)


def save_sticker(cell_img, name, out_dir, label_frac=0.20, margin=4, top_skip=6):
    # Skip a few px at top (avoids label bleed from the row above)
    # Strip bottom label text, add left/right margin to stop side bleed
    label_px = int(cell_img.height * label_frac)
    art = cell_img.crop((margin, top_skip, cell_img.width - margin, cell_img.height - label_px))
    sticker = remove_bg(art)
    sticker = keep_main_sticker(sticker)  # drop stray adjacent-cell bleed
    sticker = tight_crop(sticker)
    sticker = to_512(sticker)
    path = os.path.join(out_dir, f"{name}.png")
    sticker.save(path, "PNG")
    print(f"  ✓  {name}.png")


def process(sheet_path, out_dir):
    sheet = Image.open(sheet_path).convert("RGB")
    W, H = sheet.size
    print(f"Sheet: {W} × {H} px")
    os.makedirs(out_dir, exist_ok=True)

    # 6 main rows (10 cols each) + 1 food row (12 cols)
    # Each row is roughly equal height: H / 7
    cell_h = H // 7
    cell_w = W // 10

    print(f"Main cell size: {cell_w} × {cell_h}")

    for idx, name in enumerate(ROWS_1_TO_6):
        row = idx // 10
        col = idx % 10
        x1, y1 = col * cell_w, row * cell_h
        x2, y2 = x1 + cell_w, y1 + cell_h
        cell = sheet.crop((x1, y1, x2, y2))
        save_sticker(cell, name, out_dir)

    # Row 7 — 12 columns
    y1 = 6 * cell_h
    y2 = H
    cell_w7 = W // 12
    print(f"Row 7 cell size: {cell_w7} × {y2 - y1}")
    for col, name in enumerate(ROW_7):
        x1 = col * cell_w7
        x2 = x1 + cell_w7
        cell = sheet.crop((x1, y1, x2, y2))
        save_sticker(cell, name, out_dir)

    print(f"\nDone — {len(ROWS_1_TO_6) + len(ROW_7)} stickers → {out_dir}/")


if __name__ == "__main__":
    sheet = sys.argv[1] if len(sys.argv) > 1 else "master_stickers.png"
    out_dir = sys.argv[2] if len(sys.argv) > 2 else "src/assets"
    process(sheet, out_dir)
