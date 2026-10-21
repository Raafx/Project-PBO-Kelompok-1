from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import CatalogOption, Product


@dataclass(frozen=True)
class EkomartProduct:
    barcode: str
    sku: str
    name: str
    category: str
    brand: str
    unit: str
    location: str
    image: str
    price: int
    cost_price: int
    stock: int
    warehouse_stock: int
    reorder_level: int


# Seluruh foto produk grocery dari paket eKomart. Nama produk disesuaikan dengan
# kemasan pada foto karena sebagian judul contoh pada HTML asli adalah placeholder.
EKOMART_PRODUCTS = (
    EkomartProduct(
        "8997000400001", "EKO-CERELAC-MIXED-400", "Nestle Cerelac Mixed Fruits & Wheat 400g",
        "Makanan Bayi", "Nestle", "kaleng", "Rak B-01", "01.jpg",
        72_900, 55_000, 32, 48, 10,
    ),
    EkomartProduct(
        "8997000400002", "EKO-PUMPKIN-MIX-425", "Great Value Pumpkin Spice Bread & Muffin Mix 425g",
        "Bahan Kue", "Great Value", "kotak", "Rak K-01", "02.jpg",
        48_900, 36_500, 18, 30, 6,
    ),
    EkomartProduct(
        "8997000400003", "EKO-APTAMIL-GOLD-1-900", "Aptamil Gold+ Stage 1 Infant Formula 900g",
        "Susu Formula", "Aptamil", "kaleng", "Rak B-02", "03.jpg",
        329_000, 272_000, 6, 32, 8,
    ),
    EkomartProduct(
        "8997000400004", "EKO-APPLE-JUICE-1890", "Market Pantry 100% Apple Juice 1.89L",
        "Minuman", "Market Pantry", "botol", "Chiller C-01", "04.jpg",
        69_900, 52_000, 36, 48, 10,
    ),
    EkomartProduct(
        "8997000400005", "EKO-MANDARIN-FRESH-1KG", "Jeruk Mandarin Segar 1kg",
        "Buah & Sayur", "Fresh Harvest", "kg", "Fresh F-01", "05.jpg",
        32_900, 23_500, 42, 28, 12,
    ),
    EkomartProduct(
        "8997000400006", "EKO-SAUCE-VARIETY-350", "Assorted Cooking Sauce Pouch 350ml",
        "Saus & Bumbu", "Assorted", "pouch", "Rak S-01", "06.jpg",
        35_900, 26_500, 24, 36, 8,
    ),
    EkomartProduct(
        "8997000400007", "EKO-CHOCOS-375", "Kellogg's Multigrain Chocos 375g",
        "Sarapan & Sereal", "Kellogg's", "pouch", "Rak C-01", "07.jpg",
        59_900, 44_500, 28, 40, 10,
    ),
    EkomartProduct(
        "8997000400008", "EKO-HUNTER-MIX-652", "Gourmet Hunter Mix Nuts 652g",
        "Kacang & Camilan", "Gourmet Nut", "jar", "Rak N-01", "08.jpg",
        119_000, 91_000, 20, 30, 8,
    ),
    EkomartProduct(
        "8997000400009", "EKO-CANTALOUPE-1KG", "Melon Cantaloupe Segar 1kg",
        "Buah & Sayur", "Fresh Harvest", "kg", "Fresh F-02", "09.jpg",
        45_000, 32_000, 16, 24, 6,
    ),
    EkomartProduct(
        "8997000400010", "EKO-CAULIFLOWER-1KG", "Kembang Kol Segar 1kg",
        "Buah & Sayur", "Fresh Harvest", "kg", "Fresh F-03", "10.jpg",
        29_900, 21_000, 18, 26, 7,
    ),
    EkomartProduct(
        "8997000400011", "EKO-EVOLVE-CHOC-4", "Evolve Plant-Based Protein Shake Chocolate 4 Pack",
        "Minuman Protein", "Evolve", "pak", "Chiller C-02", "11.jpg",
        84_900, 65_000, 22, 30, 8,
    ),
    EkomartProduct(
        "8997000400012", "EKO-LEMONADE-RASPBERRY", "True Lemon Raspberry Lemonade 10 Sachets",
        "Minuman", "True Lemon", "kotak", "Rak M-01", "12.jpg",
        54_900, 41_000, 30, 42, 10,
    ),
    EkomartProduct(
        "8997000400013", "EKO-CHOCOS-FAMILY-700", "Kellogg's Multigrain Chocos Family Pack 700g",
        "Sarapan & Sereal", "Kellogg's", "pouch", "Rak C-01", "13.jpg",
        109_000, 82_000, 26, 36, 9,
    ),
    EkomartProduct(
        "8997000400014", "EKO-PEYSAN-MOZZARELLA", "Peysan Mozzarella Cheese 500g",
        "Susu & Olahan", "Peysan", "pak", "Chiller C-03", "14.jpg",
        74_900, 56_000, 18, 28, 7,
    ),
    EkomartProduct(
        "8997000400015", "EKO-PUMPKIN-MIX-850", "Great Value Pumpkin Spice Bread & Muffin Mix 850g",
        "Bahan Kue", "Great Value", "kotak", "Rak K-01", "15.jpg",
        89_900, 67_500, 14, 24, 6,
    ),
    EkomartProduct(
        "8997000400016", "EKO-TOWNHOUSE-391", "Town House Original Oven Baked Crackers 391g",
        "Biskuit & Kerupuk", "Town House", "kotak", "Rak S-02", "16.jpg",
        52_900, 39_500, 30, 42, 10,
    ),
    EkomartProduct(
        "8997000400017", "EKO-FOSTER-NUGGETS-950", "Foster Farms Chicken Breast Nuggets 950g",
        "Makanan Beku", "Foster Farms", "pouch", "Freezer Z-01", "17.jpg",
        139_000, 106_000, 0, 0, 5,
    ),
    EkomartProduct(
        "8997000400018", "EKO-CANTALOUPE-2KG", "Melon Cantaloupe Segar Premium 2kg",
        "Buah & Sayur", "Fresh Harvest", "kg", "Fresh F-02", "18.jpg",
        65_000, 47_000, 15, 22, 6,
    ),
    EkomartProduct(
        "8997000400019", "EKO-DANONKI-STRAWBERRY", "Danone Danonki Strawberry Yogurt Multipack",
        "Susu & Olahan", "Danone", "pak", "Chiller C-04", "19.jpg",
        62_900, 47_500, 28, 40, 10,
    ),
    EkomartProduct(
        "8997000400020", "EKO-PEPPERIDGE-COLLECTION", "Pepperidge Farm Chocolate Collection 369g",
        "Biskuit & Kerupuk", "Pepperidge Farm", "kotak", "Rak S-03", "20.jpg",
        129_000, 98_000, 20, 30, 8,
    ),
    EkomartProduct(
        "8997000400021", "EKO-RUBIO-PAPRIKA", "Rubio Spicy Paprika Flavour Crisps",
        "Keripik", "Rubio", "pouch", "Rak S-04", "21.jpg",
        39_900, 29_500, 26, 38, 9,
    ),
    EkomartProduct(
        "8997000400022", "EKO-PASTA-RICE-VARIETY", "Pasta & Risotto Variety Pack",
        "Pasta & Beras", "Private Label", "pak", "Rak P-01", "22.jpg",
        44_900, 33_000, 18, 30, 7,
    ),
    EkomartProduct(
        "8997000400023", "EKO-CHICKEN-ALFREDO", "Healthy Choice Chicken & Broccoli Alfredo",
        "Makanan Beku", "Healthy Choice", "kotak", "Freezer Z-02", "23.jpg",
        109_000, 83_000, 4, 18, 5,
    ),
    EkomartProduct(
        "8997000400024", "EKO-QUAKER-OATS-1KG", "Quaker Rolled Oats 1kg",
        "Sarapan & Sereal", "Quaker", "pouch", "Rak C-02", "24.jpg",
        57_900, 43_500, 24, 36, 8,
    ),
    EkomartProduct(
        "8997000400025", "EKO-SOFT-DRINK-LARGE", "Soft Drink Cup Large",
        "Minuman", "Fountain Drinks", "cup", "Counter D-01", "25.jpg",
        18_000, 8_500, 40, 50, 12,
    ),
    EkomartProduct(
        "8997000400026", "EKO-CHEEZIT-CHEDDAR-595", "Cheez-It White Cheddar Family Size 595g",
        "Biskuit & Kerupuk", "Cheez-It", "kotak", "Rak S-02", "26.jpg",
        76_900, 58_000, 28, 40, 10,
    ),
    EkomartProduct(
        "8997000400027", "EKO-DOG-CHOW-VARIETY", "Purina Dog Chow Variety Pack",
        "Perawatan Hewan", "Purina", "pak", "Rak P-02", "27.jpg",
        189_000, 148_000, 16, 30, 6,
    ),
    EkomartProduct(
        "8997000400028", "EKO-HILLSHIRE-TURKEY", "Hillshire Farm Oven Roasted Turkey Breast 255g",
        "Daging Olahan", "Hillshire Farm", "pak", "Chiller C-05", "28.jpg",
        99_000, 75_000, 5, 22, 5,
    ),
)


def _option_code(value: str) -> str:
    return "".join(character if character.isalnum() else "-" for character in value.upper())[:40]


def sync_ekomart_catalog(session: Session, *, archive_others: bool = True) -> dict[str, int]:
    barcodes = {item.barcode for item in EKOMART_PRODUCTS}
    archived = 0
    if archive_others:
        for product in session.scalars(
            select(Product).where(Product.is_active.is_(True), Product.barcode.not_in(barcodes))
        ):
            product.is_active = False
            archived += 1

    created = 0
    updated = 0
    for item in EKOMART_PRODUCTS:
        product = session.scalar(select(Product).where(Product.barcode == item.barcode))
        if product is None:
            product = Product(
                barcode=item.barcode,
                stock=item.stock,
                warehouse_stock=item.warehouse_stock,
            )
            session.add(product)
            created += 1
        else:
            updated += 1
        product.sku = item.sku
        product.name = item.name
        product.category = item.category
        product.brand = item.brand
        product.unit = item.unit
        product.unit_conversion = 1
        product.location = item.location
        product.image_url = f"/ekomart/products/{item.image}"
        product.price = item.price
        product.cost_price = item.cost_price
        product.reorder_level = item.reorder_level
        product.is_active = True

    option_values = {
        "category": {item.category for item in EKOMART_PRODUCTS},
        "brand": {item.brand for item in EKOMART_PRODUCTS},
        "unit": {item.unit for item in EKOMART_PRODUCTS},
    }
    for kind, values in option_values.items():
        for option in session.scalars(select(CatalogOption).where(CatalogOption.kind == kind)):
            option.is_active = option.name in values
        for value in values:
            code = _option_code(value)
            option = session.scalar(
                select(CatalogOption).where(
                    CatalogOption.kind == kind,
                    CatalogOption.code == code,
                )
            )
            if option is None:
                session.add(CatalogOption(kind=kind, code=code, name=value))
            else:
                option.name = value
                option.is_active = True

    return {"created": created, "updated": updated, "archived": archived}


def main() -> None:
    from app.database import SessionLocal

    with SessionLocal() as session:
        result = sync_ekomart_catalog(session)
        session.commit()
    print(
        "Katalog eKomart siap: "
        f"{result['created']} baru, {result['updated']} diperbarui, "
        f"{result['archived']} produk lama diarsipkan."
    )


if __name__ == "__main__":
    main()
