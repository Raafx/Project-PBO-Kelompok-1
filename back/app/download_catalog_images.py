from __future__ import annotations

from pathlib import Path
from urllib.request import Request, urlopen

from app.indonesia_catalog import INDONESIAN_PRODUCTS

USER_AGENT = "MYMARKET-PBO/1.0 (https://github.com/Raafx/Project-PBO-Kelompok-1)"
OUTPUT_DIRECTORY = (
    Path(__file__).resolve().parents[2] / "front" / "public" / "products" / "indonesia"
)


def download_catalog_images(*, overwrite: bool = False) -> tuple[int, int]:
    OUTPUT_DIRECTORY.mkdir(parents=True, exist_ok=True)
    downloaded = 0
    skipped = 0
    for product in INDONESIAN_PRODUCTS:
        destination = OUTPUT_DIRECTORY / f"{product.barcode}.jpg"
        if destination.exists() and not overwrite:
            skipped += 1
            continue
        request = Request(product.source_image_url, headers={"User-Agent": USER_AGENT})
        with urlopen(request, timeout=30) as response:  # noqa: S310
            content_type = response.headers.get_content_type()
            content = response.read()
        if not content_type.startswith("image/") or len(content) < 1_024:
            raise RuntimeError(f"Foto {product.barcode} tidak valid ({content_type})")
        temporary = destination.with_suffix(".tmp")
        temporary.write_bytes(content)
        temporary.replace(destination)
        downloaded += 1
    return downloaded, skipped


def main() -> None:
    downloaded, skipped = download_catalog_images()
    print(f"Foto katalog siap: {downloaded} diunduh, {skipped} sudah tersedia.")


if __name__ == "__main__":
    main()
