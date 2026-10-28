// Semua pemanggilan API untuk menu Analisis Produk ada di file ini.
import { apiRequest, loadAdminSales, type AdminSale, type SalesReport } from "../api";

export type PilihanProduk = {
  id: string;
  barcode: string;
  name: string;
  category: string;
};

export type HasilAnalisisProduk = {
  date_from: string;
  date_to: string;
  product: SalesReport["product_performance"][number];
  daily_sales: Array<{
    date: string;
    transaction_count: number;
    quantity: number;
    net_revenue: number;
    cost_of_goods: number;
    gross_profit: number;
  }>;
};

export function ambilDaftarProduk() {
  return apiRequest<PilihanProduk[]>("/admin/reports/product-options");
}

export function ambilAnalisisProduk(id: string, awal: string, akhir: string) {
  const tanggal = new URLSearchParams({ date_from: awal, date_to: akhir });
  return apiRequest<HasilAnalisisProduk>(
    `/admin/reports/products/${encodeURIComponent(id)}?${tanggal.toString()}`,
  );
}

export function ambilTransaksiProduk(
  id: string,
  awal: string,
  akhir: string,
  halaman: number,
): Promise<AdminSale[]> {
  return loadAdminSales({
    productId: id,
    dateFrom: awal,
    dateTo: akhir,
    status: "completed",
    limit: 100,
    offset: (halaman - 1) * 100,
  });
}
