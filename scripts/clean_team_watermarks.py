from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

BACKUP = Path(r"c:\futuremediamainwebsite\futuremediaweb\site\public\assets\Team_backup_watermark")
OUT = Path(r"c:\futuremediamainwebsite\futuremediaweb\site\public\assets\Team")

def clean(src: Path, dest: Path) -> None:
    im = Image.open(src).convert("RGBA")
    arr = np.array(im).astype(np.float32)
    h, w = arr.shape[:2]
    corners = np.vstack([
        arr[4:28, 4:28, :3].reshape(-1, 3),
        arr[4:28, w - 28 : w - 4, :3].reshape(-1, 3),
        arr[h - 36 : h - 8, 4:28, :3].reshape(-1, 3),
        arr[h - 36 : h - 8, w - 28 : w - 4, :3].reshape(-1, 3),
    ])
    bg = np.median(corners, axis=0)
    rgb = arr[:, :, :3]
    diff = np.linalg.norm(rgb - bg, axis=2)
    # Broad navy / watermark cleanup away from the subject
    yy, xx = np.ogrid[:h, :w]
    cx, cy = w * 0.5, h * 0.58
    ell = ((xx - cx) / (w * 0.36)) ** 2 + ((yy - cy) / (h * 0.48)) ** 2
    outside = ell > 0.92
    # Any pixel that still looks like blue field / faint white logo
    blueish = (rgb[:, :, 2] >= rgb[:, :, 0] - 5) & (rgb[:, :, 2] >= rgb[:, :, 1] - 8)
    soft = (diff < 110) & blueish & outside
    hard = (diff < 58) & outside
    mask = soft | hard
    out = arr.copy()
    out[mask, 0] = bg[0]
    out[mask, 1] = bg[1]
    out[mask, 2] = bg[2]
    # Second pass: kill residual faint text near top half outside torso
    top = yy < h * 0.48
    residual = top & outside & (diff < 130) & blueish
    out[residual, 0] = bg[0]
    out[residual, 1] = bg[1]
    out[residual, 2] = bg[2]
    img = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))
    # Soft edge blend around subject
    img = img.filter(ImageFilter.SMOOTH_MORE)
    # Restore sharper subject from original using ellipse mask
    orig = Image.open(src).convert("RGBA")
    keep = Image.new("L", (w, h), 0)
    keep_arr = np.array(keep)
    keep_arr[ell <= 0.88] = 255
    keep_arr[(ell > 0.88) & (ell <= 1.05)] = ((1.05 - ell[(ell > 0.88) & (ell <= 1.05)]) / 0.17 * 255).astype(np.uint8)
    keep = Image.fromarray(keep_arr, mode="L")
    final = Image.composite(orig, img, keep)
    # Final navy fill for pure outside
    farr = np.array(final).astype(np.float32)
    fdiff = np.linalg.norm(farr[:, :, :3] - bg, axis=2)
    fill = (ell > 1.08) & (fdiff < 140) & (farr[:, :, 2] >= farr[:, :, 0] - 8)
    farr[fill, 0] = bg[0]
    farr[fill, 1] = bg[1]
    farr[fill, 2] = bg[2]
    Image.fromarray(np.clip(farr, 0, 255).astype(np.uint8)).save(dest)
    print(f"cleaned {src.name}")

def main() -> None:
    src_dir = BACKUP if BACKUP.exists() else OUT
    for path in sorted(src_dir.glob("FM_Team_*.png")):
        clean(path, OUT / path.name)

if __name__ == "__main__":
    main()
