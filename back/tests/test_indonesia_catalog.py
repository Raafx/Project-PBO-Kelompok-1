from pathlib import Path

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.indonesia_catalog import INDONESIAN_PRODUCTS
from app.models import Product


def test_indonesian_catalog_is_complete_and_seeded(session: Session) -> None:
    barcodes = {item.barcode for item in INDONESIAN_PRODUCTS}
    skus = {item.sku for item in INDONESIAN_PRODUCTS}

    assert len(INDONESIAN_PRODUCTS) == 48
    assert len(barcodes) == len(INDONESIAN_PRODUCTS)
    assert len(skus) == len(INDONESIAN_PRODUCTS)
    assert all(
        item.source_image_url.startswith("https://images.openfoodfacts.net/")
        for item in INDONESIAN_PRODUCTS
    )
    assert session.scalar(select(func.count(Product.id)).where(Product.is_active.is_(True))) == 48
    assert session.scalar(select(Product.name).where(Product.barcode == "0089686010947")) == (
        "Indomie Mi Goreng Original 85g"
    )


def test_all_catalog_images_are_packaged_locally() -> None:
    image_directory = (
        Path(__file__).resolve().parents[2] / "front" / "public" / "products" / "indonesia"
    )
    missing = [
        item.barcode
        for item in INDONESIAN_PRODUCTS
        if not (image_directory / f"{item.barcode}.jpg").is_file()
    ]
    assert missing == []
