from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import CatalogOption, Product


@dataclass(frozen=True)
class IndonesianProduct:
    barcode: str
    sku: str
    name: str
    category: str
    brand: str
    unit: str
    location: str
    source_image_url: str
    price: int
    cost_price: int
    stock: int = 48
    warehouse_stock: int = 96
    reorder_level: int = 12

    @property
    def image_url(self) -> str:
        return f"/products/indonesia/{self.barcode}.jpg"


# Product identity and front images are sourced from Open Food Facts. Retail prices are
# demo values in rupiah for the MYMARKET coursework and are not claimed as live market prices.
INDONESIAN_PRODUCTS = (
    IndonesianProduct(
        "0089686010947",
        "IDN-INDOMIE-GORENG-85",
        "Indomie Mi Goreng Original 85g",
        "Mie & Pasta",
        "Indomie",
        "bungkus",
        "Rak A-01",
        "https://images.openfoodfacts.net/images/products/008/968/601/0947/front_en.72.400.jpg",
        3_500,
        2_700,
        72,
        144,
        20,
    ),
    IndonesianProduct(
        "0089686170795",
        "IDN-INDOMIE-GORENG-5",
        "Indomie Mi Goreng 5 x 85g",
        "Mie & Pasta",
        "Indomie",
        "pak",
        "Rak A-01",
        "https://images.openfoodfacts.net/images/products/008/968/617/0795/front_en.70.400.jpg",
        17_000,
        13_500,
        42,
        84,
        12,
    ),
    IndonesianProduct(
        "8994963002824",
        "IDN-INDOMIE-AYAM-70",
        "Indomie Rasa Ayam Bawang 70g",
        "Mie & Pasta",
        "Indomie",
        "bungkus",
        "Rak A-01",
        "https://images.openfoodfacts.net/images/products/899/496/300/2824/front_en.39.400.jpg",
        3_500,
        2_700,
        68,
        136,
        20,
    ),
    IndonesianProduct(
        "8998866200301",
        "IDN-MIE-SEDAAP-GORENG-90",
        "Mie Sedaap Goreng 90g",
        "Mie & Pasta",
        "Mie Sedaap",
        "bungkus",
        "Rak A-02",
        "https://images.openfoodfacts.net/images/products/899/886/620/0301/front_en.87.400.jpg",
        3_500,
        2_650,
        64,
        128,
        18,
    ),
    IndonesianProduct(
        "8992718853868",
        "IDN-GEKIKARA-HOT-CARBO-81",
        "Nissin Gekikara Hot Carbonara 81g",
        "Mie & Pasta",
        "Nissin",
        "bungkus",
        "Rak A-02",
        "https://images.openfoodfacts.net/images/products/899/271/885/3868/front_id.3.400.jpg",
        9_500,
        7_300,
    ),
    IndonesianProduct(
        "8888900415009",
        "IDN-LAFONTE-SPAGHETTI-225",
        "La Fonte Spaghetti 225g",
        "Mie & Pasta",
        "La Fonte",
        "bungkus",
        "Rak A-03",
        "https://images.openfoodfacts.net/images/products/888/890/041/5009/front_en.3.400.jpg",
        13_900,
        10_500,
    ),
    IndonesianProduct(
        "8886008101053",
        "IDN-AQUA-600",
        "AQUA Air Mineral 600ml",
        "Air Mineral",
        "AQUA",
        "botol",
        "Chiller B-01",
        "https://images.openfoodfacts.net/images/products/888/600/810/1053/front_en.25.400.jpg",
        4_000,
        2_900,
        80,
        160,
        24,
    ),
    IndonesianProduct(
        "8996001600269",
        "IDN-LE-MINERALE-600",
        "Le Minerale Air Mineral 600ml",
        "Air Mineral",
        "Le Minerale",
        "botol",
        "Chiller B-01",
        "https://images.openfoodfacts.net/images/products/899/600/160/0269/front_en.8.400.jpg",
        4_000,
        2_850,
        76,
        152,
        24,
    ),
    IndonesianProduct(
        "8996001600399",
        "IDN-LE-MINERALE-1500",
        "Le Minerale Air Mineral 1.5L",
        "Air Mineral",
        "Le Minerale",
        "botol",
        "Chiller B-01",
        "https://images.openfoodfacts.net/images/products/899/600/160/0399/front_fr.24.400.jpg",
        7_000,
        5_200,
        56,
        112,
        16,
    ),
    IndonesianProduct(
        "8996001600146",
        "IDN-TEH-PUCUK-350",
        "Teh Pucuk Harum 350ml",
        "Minuman Teh",
        "Teh Pucuk Harum",
        "botol",
        "Chiller B-02",
        "https://images.openfoodfacts.net/images/products/899/600/160/0146/front_en.84.400.jpg",
        4_500,
        3_250,
        68,
        136,
        20,
    ),
    IndonesianProduct(
        "8996006858016",
        "IDN-TEHBOTOL-SOSRO-350",
        "Tehbotol Sosro Original 350ml",
        "Minuman Teh",
        "Tehbotol Sosro",
        "botol",
        "Chiller B-02",
        "https://images.openfoodfacts.net/images/products/899/600/685/8016/front_en.12.400.jpg",
        5_000,
        3_650,
        64,
        128,
        18,
    ),
    IndonesianProduct(
        "8997035563414",
        "IDN-POCARI-500",
        "Pocari Sweat 500ml",
        "Minuman Isotonik",
        "Pocari Sweat",
        "botol",
        "Chiller B-03",
        "https://images.openfoodfacts.net/images/products/899/703/556/3414/front_id.4.400.jpg",
        9_500,
        7_200,
    ),
    IndonesianProduct(
        "8992752112013",
        "IDN-MIZONE-LYCHEE-500",
        "Mizone Lychee Lemon 500ml",
        "Minuman Isotonik",
        "Mizone",
        "botol",
        "Chiller B-03",
        "https://images.openfoodfacts.net/images/products/899/275/211/2013/front_id.17.400.jpg",
        6_500,
        4_900,
    ),
    IndonesianProduct(
        "8998866500708",
        "IDN-FLORIDINA-ORANGE-350",
        "Floridina Orange 350ml",
        "Minuman Jus",
        "Floridina",
        "botol",
        "Chiller B-04",
        "https://images.openfoodfacts.net/images/products/899/886/650/0708/front_id.26.400.jpg",
        3_500,
        2_600,
    ),
    IndonesianProduct(
        "8998009010613",
        "IDN-ULTRA-FULLCREAM-1L",
        "Ultra Milk Full Cream 1L",
        "Susu & Olahan",
        "Ultra Milk",
        "kotak",
        "Rak C-01",
        "https://images.openfoodfacts.net/images/products/899/800/901/0613/front_en.30.400.jpg",
        22_500,
        17_500,
    ),
    IndonesianProduct(
        "8998009010231",
        "IDN-ULTRA-COKELAT-250",
        "Ultra Milk Cokelat 250ml",
        "Susu & Olahan",
        "Ultra Milk",
        "kotak",
        "Rak C-01",
        "https://images.openfoodfacts.net/images/products/899/800/901/0231/front_en.21.400.jpg",
        7_500,
        5_600,
    ),
    IndonesianProduct(
        "8993007000680",
        "IDN-INDOMILK-FULLCREAM-1L",
        "Indomilk UHT Full Cream 1L",
        "Susu & Olahan",
        "Indomilk",
        "kotak",
        "Rak C-01",
        "https://images.openfoodfacts.net/images/products/899/300/700/0680/front_en.15.400.jpg",
        20_000,
        15_500,
    ),
    IndonesianProduct(
        "8997240600041",
        "IDN-OATSIDE-BARISTA-1L",
        "OATSIDE Oat Milk Barista 1L",
        "Susu & Olahan",
        "OATSIDE",
        "kotak",
        "Rak C-02",
        "https://images.openfoodfacts.net/images/products/899/724/060/0041/front_en.74.400.jpg",
        43_500,
        34_000,
        4,
        5,
        10,
    ),
    IndonesianProduct(
        "8992760221028",
        "IDN-OREO-ORIGINAL-123",
        "OREO Original 123g",
        "Biskuit & Wafer",
        "OREO",
        "bungkus",
        "Rak D-01",
        "https://images.openfoodfacts.net/images/products/899/276/022/1028/front_en.49.400.jpg",
        10_500,
        7_800,
        58,
        116,
        16,
    ),
    IndonesianProduct(
        "8996001301142",
        "IDN-ROMA-KELAPA-300",
        "Roma Biskuit Kelapa 300g",
        "Biskuit & Wafer",
        "Roma",
        "bungkus",
        "Rak D-01",
        "https://images.openfoodfacts.net/images/products/899/600/130/1142/front_id.16.400.jpg",
        12_000,
        9_000,
    ),
    IndonesianProduct(
        "8993175537285",
        "IDN-NABATI-RICHEESE-110",
        "Nabati Wafer Richeese 110g",
        "Biskuit & Wafer",
        "Nabati",
        "bungkus",
        "Rak D-02",
        "https://images.openfoodfacts.net/images/products/899/317/553/7285/front_en.21.400.jpg",
        8_500,
        6_200,
    ),
    IndonesianProduct(
        "8990044000000",
        "IDN-POCKY-CHOCOLATE-47",
        "Pocky Chocolate 47g",
        "Biskuit & Wafer",
        "Glico",
        "kotak",
        "Rak D-02",
        "https://images.openfoodfacts.net/images/products/899/004/400/0000/front_en.15.400.jpg",
        10_000,
        7_500,
    ),
    IndonesianProduct(
        "8999999000189",
        "IDN-TARO-BBQ-32",
        "Taro Net Potato BBQ 32g",
        "Camilan",
        "Taro",
        "bungkus",
        "Rak D-03",
        "https://images.openfoodfacts.net/images/products/899/999/900/0189/front_id.4.400.jpg",
        3_000,
        2_100,
        70,
        140,
        20,
    ),
    IndonesianProduct(
        "8998866201469",
        "IDN-POTABEE-BEEF-68",
        "Potabee Beef BBQ 68g",
        "Camilan",
        "Potabee",
        "bungkus",
        "Rak D-03",
        "https://images.openfoodfacts.net/images/products/899/886/620/1469/front_id.6.400.jpg",
        11_000,
        8_200,
    ),
    IndonesianProduct(
        "8992775204054",
        "IDN-GARUDA-ATOM-33",
        "Garuda Kacang Atom 33g",
        "Camilan",
        "Garuda",
        "bungkus",
        "Rak D-04",
        "https://images.openfoodfacts.net/images/products/899/277/520/4054/front_en.3.400.jpg",
        3_000,
        2_100,
    ),
    IndonesianProduct(
        "8999999002503",
        "IDN-BANGO-MANIS-275",
        "Bango Kecap Manis 275ml",
        "Saus & Bumbu",
        "Bango",
        "botol",
        "Rak E-01",
        "https://images.openfoodfacts.net/images/products/899/999/900/2503/front_fr.3.400.jpg",
        20_500,
        15_500,
    ),
    IndonesianProduct(
        "8992770094117",
        "IDN-SAORI-TIRAM-23",
        "Saori Saus Tiram 23ml",
        "Saus & Bumbu",
        "Saori",
        "sachet",
        "Rak E-01",
        "https://images.openfoodfacts.net/images/products/899/277/009/4117/front_en.4.400.jpg",
        3_000,
        2_150,
    ),
    IndonesianProduct(
        "8991818030070",
        "IDN-ULEG-SAMBAL-190",
        "Uleg Sambal Pedas Serbaguna 190g",
        "Saus & Bumbu",
        "Uleg",
        "pouch",
        "Rak E-02",
        "https://images.openfoodfacts.net/images/products/899/181/803/0070/front_id.3.400.jpg",
        16_500,
        12_500,
    ),
    IndonesianProduct(
        "8992770111012",
        "IDN-MAYUMI-100",
        "Mayumi Mayones 100g",
        "Saus & Bumbu",
        "Mayumi",
        "pouch",
        "Rak E-02",
        "https://images.openfoodfacts.net/images/products/899/277/011/1012/front_en.15.400.jpg",
        8_500,
        6_400,
    ),
    IndonesianProduct(
        "8993296201119",
        "IDN-SEGITIGA-BIRU-1KG",
        "Tepung Terigu Segitiga Biru 1kg",
        "Bahan Pokok",
        "Bogasari",
        "bungkus",
        "Rak F-01",
        "https://images.openfoodfacts.net/images/products/899/329/620/1119/front_en.5.400.jpg",
        15_500,
        12_000,
    ),
    IndonesianProduct(
        "8996001440049",
        "IDN-ENERGEN-COKELAT-34",
        "Energen Cokelat 34g",
        "Sarapan & Sereal",
        "Energen",
        "sachet",
        "Rak F-02",
        "https://images.openfoodfacts.net/images/products/899/600/144/0049/front_en.66.400.jpg",
        3_000,
        2_200,
    ),
    IndonesianProduct(
        "8991002135376",
        "IDN-KAPAL-API-MIX-25",
        "Kapal Api Special Mix 25g",
        "Kopi & Minuman",
        "Kapal Api",
        "sachet",
        "Rak F-03",
        "https://images.openfoodfacts.net/images/products/899/100/213/5376/front_en.11.400.jpg",
        2_500,
        1_800,
        64,
        128,
        18,
    ),
    IndonesianProduct(
        "8991002133327",
        "IDN-GOODDAY-MOCA-22",
        "Good Day Moca Caramel 22g",
        "Kopi & Minuman",
        "Good Day",
        "sachet",
        "Rak F-03",
        "https://images.openfoodfacts.net/images/products/899/100/213/3327/front_en.3.400.jpg",
        2_500,
        1_850,
    ),
    IndonesianProduct(
        "8992696521797",
        "IDN-MILO-22",
        "MILO Activ-Go 22g",
        "Kopi & Minuman",
        "MILO",
        "sachet",
        "Rak F-04",
        "https://images.openfoodfacts.net/images/products/899/269/652/1797/front_id.21.400.jpg",
        3_500,
        2_600,
    ),
    IndonesianProduct(
        "8992786400292",
        "IDN-PONDAN-BROWNIES-220",
        "Pondan Brownies Kukus 220g",
        "Bahan Kue",
        "Pondan",
        "kotak",
        "Rak G-01",
        "https://images.openfoodfacts.net/images/products/899/278/640/0292/front_en.4.400.jpg",
        16_500,
        12_700,
    ),
    IndonesianProduct(
        "8998888110114",
        "IDN-MARJAN-460",
        "Marjan Sirup Cocopandan 460ml",
        "Sirup",
        "Marjan",
        "botol",
        "Rak G-02",
        "https://images.openfoodfacts.net/images/products/899/888/811/0114/front_en.11.400.jpg",
        28_000,
        21_500,
    ),
    IndonesianProduct(
        "8997014450025",
        "IDN-PROCHIZ-CHEDDAR-160",
        "Prochiz Cheddar Royale 160g",
        "Keju",
        "Prochiz",
        "pak",
        "Chiller C-03",
        "https://images.openfoodfacts.net/images/products/899/701/445/0025/front_id.7.400.jpg",
        22_500,
        17_200,
    ),
    IndonesianProduct(
        "8993351123110",
        "IDN-GREENFIELDS-MOZZA-200",
        "Greenfields Mozzarella 200g",
        "Keju",
        "Greenfields",
        "pak",
        "Chiller C-03",
        "https://images.openfoodfacts.net/images/products/899/335/112/3110/front_en.3.400.jpg",
        39_000,
        30_500,
        3,
        4,
        8,
    ),
    IndonesianProduct(
        "8993200666836",
        "IDN-CIMORY-ALMOND-250",
        "Cimory Almond Milk 250ml",
        "Susu & Olahan",
        "Cimory",
        "botol",
        "Chiller C-04",
        "https://images.openfoodfacts.net/images/products/899/320/066/6836/front_id.3.400.jpg",
        9_000,
        6_700,
    ),
    IndonesianProduct(
        "8998009020186",
        "IDN-BUAVITA-GUAVA-245",
        "Buavita Guava 245ml",
        "Minuman Jus",
        "Buavita",
        "kotak",
        "Chiller B-04",
        "https://images.openfoodfacts.net/images/products/899/800/902/0186/front_en.17.400.jpg",
        8_500,
        6_300,
    ),
    IndonesianProduct(
        "8992907952327",
        "IDN-SARIROTI-COKELAT-42",
        "Sari Roti Sandwich Cokelat 42g",
        "Roti",
        "Sari Roti",
        "bungkus",
        "Rak G-03",
        "https://images.openfoodfacts.net/images/products/899/290/795/2327/front_en.3.400.jpg",
        6_500,
        4_800,
        0,
        4,
        6,
    ),
    IndonesianProduct(
        "8992775913000",
        "IDN-CHOCOLATOS-3IN1-27",
        "Chocolatos Drink 3 in 1 27g",
        "Kopi & Minuman",
        "Chocolatos",
        "sachet",
        "Rak F-04",
        "https://images.openfoodfacts.net/images/products/899/277/591/3000/front_en.3.400.jpg",
        3_000,
        2_200,
    ),
    IndonesianProduct(
        "8997033003073",
        "IDN-YAVA-CACAO-45",
        "YAVA Krispi Puffs Cacao 45g",
        "Camilan",
        "YAVA",
        "bungkus",
        "Rak D-04",
        "https://images.openfoodfacts.net/images/products/899/703/300/3073/front_en.17.400.jpg",
        12_500,
        9_500,
    ),
    IndonesianProduct(
        "8994075240657",
        "IDN-MOMOGI-SEAWEED",
        "Momogi Stick Rumput Laut",
        "Camilan",
        "Momogi",
        "bungkus",
        "Rak D-05",
        "https://images.openfoodfacts.net/images/products/899/407/524/0657/front_id.4.400.jpg",
        2_000,
        1_400,
        2,
        5,
        8,
    ),
    IndonesianProduct(
        "8996001370032",
        "IDN-CHOKI-CHOKI-36",
        "Choki Choki Chococashew 36g",
        "Camilan",
        "Choki Choki",
        "bungkus",
        "Rak D-05",
        "https://images.openfoodfacts.net/images/products/899/600/137/0032/front_id.5.400.jpg",
        2_500,
        1_800,
    ),
    IndonesianProduct(
        "8992775305034",
        "IDN-GERY-SALUUT-CHEESE",
        "Gery Saluut Malkist Sweet Cheese",
        "Biskuit & Wafer",
        "Gery",
        "bungkus",
        "Rak D-02",
        "https://images.openfoodfacts.net/images/products/899/277/530/5034/front_en.5.400.jpg",
        9_000,
        6_800,
    ),
    IndonesianProduct(
        "8993175538572",
        "IDN-NABATI-BITES-KEJU-112",
        "Nabati Bites Rasa Keju 112g",
        "Camilan",
        "Nabati",
        "bungkus",
        "Rak D-03",
        "https://images.openfoodfacts.net/images/products/899/317/553/8572/front_id.30.400.jpg",
        9_000,
        6_700,
    ),
    IndonesianProduct(
        "8991002122017",
        "IDN-ABC-KOPI-SUSU",
        "ABC Kopi Susu",
        "Kopi & Minuman",
        "ABC",
        "sachet",
        "Rak F-03",
        "https://images.openfoodfacts.net/images/products/899/100/212/2017/front_en.8.400.jpg",
        2_500,
        1_800,
    ),
)


def _option_code(value: str) -> str:
    return "".join(character if character.isalnum() else "-" for character in value.upper())[:40]


def sync_indonesian_catalog(
    session: Session,
    *,
    archive_others: bool = True,
) -> dict[str, int]:
    barcodes = {item.barcode for item in INDONESIAN_PRODUCTS}
    archived = 0
    if archive_others:
        for product in session.scalars(
            select(Product).where(Product.is_active.is_(True), Product.barcode.not_in(barcodes))
        ):
            product.is_active = False
            archived += 1

    created = 0
    updated = 0
    for item in INDONESIAN_PRODUCTS:
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
        product.image_url = item.image_url
        product.price = item.price
        product.cost_price = item.cost_price
        product.reorder_level = item.reorder_level
        product.is_active = True

    option_values = {
        "category": {item.category for item in INDONESIAN_PRODUCTS},
        "brand": {item.brand for item in INDONESIAN_PRODUCTS},
        "unit": {item.unit for item in INDONESIAN_PRODUCTS},
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
        result = sync_indonesian_catalog(session)
        session.commit()
    print(
        "Katalog supermarket Indonesia siap: "
        f"{result['created']} baru, {result['updated']} diperbarui, "
        f"{result['archived']} produk lama diarsipkan."
    )


if __name__ == "__main__":
    main()
