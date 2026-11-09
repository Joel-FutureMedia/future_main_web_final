from pathlib import Path
from PIL import Image
from rembg import remove, new_session

BACKUP = Path(r"c:\futuremediamainwebsite\futuremediaweb\site\public\assets\Team_backup_watermark")
OUT = Path(r"c:\futuremediamainwebsite\futuremediaweb\site\public\assets\Team")
BG = (12, 33, 88, 255)

def main() -> None:
    session = new_session("u2net_human_seg")
    files = sorted(BACKUP.glob("FM_Team_*.png"))
    for path in files:
        print(f"processing {path.name}...", flush=True)
        cut = remove(Image.open(path).convert("RGBA"), session=session)
        canvas = Image.new("RGBA", cut.size, BG)
        canvas.alpha_composite(cut)
        canvas.save(OUT / path.name)
        print(f"saved {path.name}", flush=True)

if __name__ == "__main__":
    main()
