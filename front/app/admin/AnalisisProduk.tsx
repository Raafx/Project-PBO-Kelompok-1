"use client";

// Halaman menu "Analisis Produk". Alur: pilih produk -> ambil angka -> tampilkan grafik.
import { Icon } from "@iconify/react";
import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Alert, Button, Card, Col, Form, Row, Spinner, Table } from "react-bootstrap";

import PilihanCari from "../PilihanCari";
import {
  ambilAnalisisProduk,
  ambilDaftarProduk,
  ambilTransaksiProduk,
  type HasilAnalisisProduk,
  type PilihanProduk,
} from "./apiAnalisisProduk";
import type { AdminSale } from "../api";
import PerbandinganBulananProduk from "./PerbandinganBulananProduk";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });
const formatAngka = new Intl.NumberFormat("id-ID");
const formatRupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function rupiah(nilai: number) {
  return formatRupiah.format(nilai).replace(/\s/g, "");
}

function tanggal(teks: string) {
  return new Date(`${teks}T00:00:00`).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function rentangBulan(bulanAwal: string, bulanAkhir: string) {
  const [tahun, nomorBulan] = bulanAkhir.split("-").map(Number);
  const hariTerakhir = new Date(tahun, nomorBulan, 0).getDate();
  return {
    awal: `${bulanAwal}-01`,
    akhir: `${bulanAkhir}-${String(hariTerakhir).padStart(2, "0")}`,
  };
}

function bulanSekarang() {
  const hariIni = new Date();
  return `${hariIni.getFullYear()}-${String(hariIni.getMonth() + 1).padStart(2, "0")}`;
}

function geserBulan(bulan: string, selisih: number) {
  const [tahun, nomorBulan] = bulan.split("-").map(Number);
  const hasil = new Date(tahun, nomorBulan - 1 + selisih, 1);
  return `${hasil.getFullYear()}-${String(hasil.getMonth() + 1).padStart(2, "0")}`;
}

function jumlahBulan(bulanAwal: string, bulanAkhir: string) {
  const [tahunAwal, nomorAwal] = bulanAwal.split("-").map(Number);
  const [tahunAkhir, nomorAkhir] = bulanAkhir.split("-").map(Number);
  return (tahunAkhir - tahunAwal) * 12 + nomorAkhir - nomorAwal + 1;
}

function GrafikProduk({ harian }: { harian: HasilAnalisisProduk["daily_sales"] }) {
  const pilihan: ApexOptions = {
    chart: { toolbar: { show: false }, zoom: { enabled: false }, fontFamily: "inherit" },
    colors: ["#3e60d5", "#f59f45", "#0f9f78"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3 },
    grid: { borderColor: "#e9ecef", strokeDashArray: 4 },
    legend: { position: "top" },
    xaxis: {
      categories: harian.map((hari) => tanggal(hari.date).slice(0, 6)),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { rotate: 0, hideOverlappingLabels: true },
    },
    yaxis: { labels: { formatter: (nilai) => `${formatAngka.format(Math.round(nilai / 1000))} rb` } },
    tooltip: { y: { formatter: rupiah } },
  };

  return (
    <ApexChart
      options={pilihan}
      series={[
        { name: "Omzet bersih", data: harian.map((hari) => hari.net_revenue) },
        { name: "HPP", data: harian.map((hari) => hari.cost_of_goods) },
        { name: "Laba / rugi", data: harian.map((hari) => hari.gross_profit) },
      ]}
      type="line"
      height={320}
    />
  );
}

function PesanKosong({ judul, isi }: { judul: string; isi: string }) {
  return (
    <div className="text-center text-muted py-5">
      <Icon icon="solar:chart-square-bold-duotone" width={38} className="mb-2" />
      <h5>{judul}</h5>
      <p className="mb-0">{isi}</p>
    </div>
  );
}

export default function AnalisisProduk() {
  const [daftarProduk, setDaftarProduk] = useState<PilihanProduk[]>([]);
  const [memuatDaftar, setMemuatDaftar] = useState(true);
  const [produkDipilih, setProdukDipilih] = useState("");
  const [bulanAkhir, setBulanAkhir] = useState(bulanSekarang);
  const [bulanAwal, setBulanAwal] = useState(() => geserBulan(bulanSekarang(), -2));
  const [analisis, setAnalisis] = useState<HasilAnalisisProduk | null>(null);
  const [memuatAnalisis, setMemuatAnalisis] = useState(false);
  const [pesanError, setPesanError] = useState("");
  const [halamanTransaksi, setHalamanTransaksi] = useState(1);
  const [transaksi, setTransaksi] = useState<AdminSale[]>([]);
  const [memuatTransaksi, setMemuatTransaksi] = useState(false);
  const [errorTransaksi, setErrorTransaksi] = useState("");
  const banyakBulan = jumlahBulan(bulanAwal, bulanAkhir);
  const pesanRentang =
    banyakBulan < 1
      ? "Bulan awal tidak boleh melewati bulan akhir."
      : banyakBulan > 12
        ? "Perbandingan maksimal 12 bulan dalam satu tampilan."
        : "";

  // 1. Saat halaman dibuka, ambil daftar semua produk untuk pilihan yang bisa dicari.
  useEffect(() => {
    let dibatalkan = false;
    void ambilDaftarProduk()
      .then((produk) => { if (!dibatalkan) setDaftarProduk(produk); })
      .catch((error) => {
        if (!dibatalkan) setPesanError(error instanceof Error ? error.message : "Daftar produk gagal dimuat");
      })
      .finally(() => { if (!dibatalkan) setMemuatDaftar(false); });
    return () => { dibatalkan = true; };
  }, []);

  // 2. Grafik dan ringkasan baru diminta setelah pengguna memilih produk.
  useEffect(() => {
    if (!produkDipilih || pesanRentang) return;
    let dibatalkan = false;
    const periode = rentangBulan(bulanAwal, bulanAkhir);
    const muat = async () => {
      setMemuatAnalisis(true);
      setPesanError("");
      setAnalisis(null);
      try {
        const hasil = await ambilAnalisisProduk(produkDipilih, periode.awal, periode.akhir);
        if (!dibatalkan) setAnalisis(hasil);
      } catch (error) {
        if (!dibatalkan) setPesanError(error instanceof Error ? error.message : "Analisis produk gagal dimuat");
      } finally {
        if (!dibatalkan) setMemuatAnalisis(false);
      }
    };
    void muat();
    return () => { dibatalkan = true; };
  }, [produkDipilih, bulanAwal, bulanAkhir, pesanRentang]);

  // 3. Riwayat transaksi dipisah karena jumlahnya bisa banyak dan perlu halaman.
  useEffect(() => {
    if (!produkDipilih || pesanRentang) return;
    let dibatalkan = false;
    const periode = rentangBulan(bulanAwal, bulanAkhir);
    const muat = async () => {
      setMemuatTransaksi(true);
      setErrorTransaksi("");
      setTransaksi([]);
      try {
        const hasil = await ambilTransaksiProduk(
          produkDipilih,
          periode.awal,
          periode.akhir,
          halamanTransaksi,
        );
        if (!dibatalkan) setTransaksi(hasil);
      } catch (error) {
        if (!dibatalkan) setErrorTransaksi(error instanceof Error ? error.message : "Transaksi gagal dimuat");
      } finally {
        if (!dibatalkan) setMemuatTransaksi(false);
      }
    };
    void muat();
    return () => { dibatalkan = true; };
  }, [produkDipilih, bulanAwal, bulanAkhir, halamanTransaksi, pesanRentang]);

  const periode = rentangBulan(bulanAwal, bulanAkhir);
  const ringkasan =
    analisis?.product.product_id === produkDipilih &&
    analisis.date_from === periode.awal &&
    analisis.date_to === periode.akhir
      ? analisis.product
      : null;
  const hariTerjual = analisis?.daily_sales.filter((hari) => hari.quantity > 0) || [];

  return (
    <>
      <Card className="mb-3">
        <Card.Header>
          <h4 className="mb-1">Analisis Produk</h4>
          <p className="text-muted mb-0">Cari produk, pilih satu atau beberapa bulan, lalu bandingkan grafik dan laba dari transaksi selesai.</p>
        </Card.Header>
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col lg={6}>
              <Form.Label htmlFor="pilih-produk-analisis">Produk</Form.Label>
              <PilihanCari
                id="pilih-produk-analisis"
                className="w-100"
                value={produkDipilih}
                disabled={memuatDaftar}
                onChange={(event) => { setProdukDipilih(event.target.value); setHalamanTransaksi(1); }}
                aria-label="Pilih atau cari produk untuk dianalisis"
              >
                <option value="">Pilih atau cari produk...</option>
                {daftarProduk.map((produk) => (
                  <option key={produk.id} value={produk.id}>
                    {produk.name} · {produk.barcode} · {produk.category}
                  </option>
                ))}
              </PilihanCari>
            </Col>
            <Col lg={3}>
              <Form.Label htmlFor="bulan-awal-analisis">Dari bulan</Form.Label>
              <Form.Control
                id="bulan-awal-analisis"
                type="month"
                value={bulanAwal}
                onChange={(event) => {
                  if (event.target.value) {
                    setBulanAwal(event.target.value);
                    if (event.target.value > bulanAkhir) setBulanAkhir(event.target.value);
                    setHalamanTransaksi(1);
                  }
                }}
              />
            </Col>
            <Col lg={3}>
              <Form.Label htmlFor="bulan-akhir-analisis">Sampai bulan</Form.Label>
              <Form.Control
                id="bulan-akhir-analisis"
                type="month"
                value={bulanAkhir}
                onChange={(event) => {
                  if (event.target.value) {
                    setBulanAkhir(event.target.value);
                    if (event.target.value < bulanAwal) setBulanAwal(event.target.value);
                    setHalamanTransaksi(1);
                  }
                }}
              />
            </Col>
          </Row>
          <div className="d-flex flex-wrap align-items-center gap-2 mt-3">
            <small className="text-muted me-1">Rentang cepat:</small>
            {[1, 3, 6, 12].map((jumlah) => (
              <Button
                key={jumlah}
                type="button"
                size="sm"
                variant={banyakBulan === jumlah ? "primary" : "outline-secondary"}
                onClick={() => {
                  setBulanAwal(geserBulan(bulanAkhir, -(jumlah - 1)));
                  setHalamanTransaksi(1);
                }}
              >
                {jumlah} bulan
              </Button>
            ))}
          </div>
          {memuatDaftar ? <small className="text-muted d-block mt-2">Memuat daftar produk...</small> : null}
        </Card.Body>
      </Card>

      {pesanRentang ? <Alert variant="warning">{pesanRentang}</Alert> : null}
      {pesanError ? <Alert variant="danger">{pesanError}</Alert> : null}
      {!produkDipilih && !pesanError ? (
        <Card><Card.Body><PesanKosong judul="Pilih produk untuk melihat analisis" isi="Ketik nama atau barcode pada pilihan produk di atas." /></Card.Body></Card>
      ) : null}
      {produkDipilih && memuatAnalisis ? (
        <Card><Card.Body className="py-5 text-center text-muted"><Spinner size="sm" className="me-2" />Memuat analisis produk...</Card.Body></Card>
      ) : null}

      {ringkasan && analisis ? (
        <>
          <Card className="mb-3">
            <Card.Header>
              <h4 className="mb-1">{ringkasan.name}</h4>
              <p className="text-muted mb-0">{ringkasan.barcode} · {ringkasan.category} · {tanggal(analisis.date_from)}–{tanggal(analisis.date_to)}</p>
            </Card.Header>
            <Card.Body>
              <Row className="g-3 row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xxl-6">
                {[
                  ["Transaksi", formatAngka.format(ringkasan.transaction_count)],
                  ["Unit terjual", formatAngka.format(ringkasan.quantity)],
                  ["Omzet bersih", rupiah(ringkasan.net_revenue)],
                  ["HPP", rupiah(ringkasan.cost_of_goods)],
                  ["Laba / rugi kotor", rupiah(ringkasan.gross_profit)],
                  ["Margin", `${formatAngka.format(ringkasan.margin_percentage)}%`],
                ].map(([judul, nilai]) => (
                  <Col key={judul}><small className="text-muted d-block">{judul}</small><strong className="fs-5">{nilai}</strong></Col>
                ))}
              </Row>
              <small className="text-muted d-block mt-3">Laba kotor = omzet bersih item − HPP saat transaksi. Biaya operasional ada di Laporan Bisnis.</small>
            </Card.Body>
          </Card>

          <PerbandinganBulananProduk bulanan={analisis.monthly_comparison} />

          <Card className="mb-3">
            <Card.Header><h5 className="mb-1">Grafik performa harian</h5><p className="text-muted mb-0">Omzet, HPP, dan laba/rugi sepanjang rentang bulan terpilih.</p></Card.Header>
            <Card.Body>
              {ringkasan.quantity > 0 ? <GrafikProduk harian={analisis.daily_sales} /> :
                <PesanKosong judul="Belum ada penjualan" isi="Produk ini belum terjual pada bulan yang dipilih." />}
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Header><h5 className="mb-0">Rincian harian</h5></Card.Header>
            <div className="table-responsive">
              <Table className="table-custom table-centered mb-0">
                <thead><tr><th>Tanggal</th><th className="text-end">Transaksi</th><th className="text-end">Unit</th><th className="text-end">Omzet</th><th className="text-end">HPP</th><th className="text-end">Laba / rugi</th></tr></thead>
                <tbody>{hariTerjual.map((hari) => (
                  <tr key={hari.date}>
                    <td>{tanggal(hari.date)}</td><td className="text-end">{hari.transaction_count}</td><td className="text-end">{hari.quantity}</td>
                    <td className="text-end">{rupiah(hari.net_revenue)}</td><td className="text-end">{rupiah(hari.cost_of_goods)}</td>
                    <td className={`text-end fw-semibold ${hari.gross_profit < 0 ? "text-danger" : "text-success"}`}>{rupiah(hari.gross_profit)}</td>
                  </tr>
                ))}</tbody>
              </Table>
            </div>
            {!hariTerjual.length ? <Card.Body className="text-muted">Belum ada penjualan pada bulan ini.</Card.Body> : null}
          </Card>

          <Card className="mb-3">
            <Card.Header><h5 className="mb-1">Transaksi produk ini</h5><p className="text-muted mb-0">Setiap baris menunjukkan kontribusi produk terpilih.</p></Card.Header>
            <Card.Body>
              {errorTransaksi ? <Alert variant="danger">{errorTransaksi}</Alert> : null}
              {memuatTransaksi ? <div className="text-muted"><Spinner size="sm" className="me-2" />Memuat transaksi...</div> : (
                <div className="table-responsive">
                  <Table className="table-custom table-centered mb-0">
                    <thead><tr><th>Transaksi</th><th>Waktu</th><th>Kasir</th><th className="text-end">Qty</th><th className="text-end">Omzet item</th><th className="text-end">HPP item</th><th className="text-end">Laba / rugi</th></tr></thead>
                    <tbody>{transaksi.flatMap((penjualan) =>
                      penjualan.items.filter((item) => item.product_id === produkDipilih).map((item) => (
                        <tr key={`${penjualan.id}-${item.product_id}`}>
                          <td>{penjualan.transaction_no}</td><td>{new Date(penjualan.created_at).toLocaleString("id-ID")}</td><td>{penjualan.cashier_name}</td>
                          <td className="text-end">{item.quantity}</td><td className="text-end">{rupiah(item.subtotal)}</td>
                          <td className="text-end">{rupiah(item.unit_cost * item.quantity)}</td>
                          <td className={`text-end fw-semibold ${item.gross_profit < 0 ? "text-danger" : "text-success"}`}>{rupiah(item.gross_profit)}</td>
                        </tr>
                      )),
                    )}</tbody>
                  </Table>
                </div>
              )}
              {!memuatTransaksi && !errorTransaksi && !transaksi.length ? <p className="text-muted mb-0">Belum ada transaksi.</p> : null}
              <div className="d-flex justify-content-end gap-2 mt-3">
                <Button size="sm" variant="outline-secondary" disabled={memuatTransaksi || halamanTransaksi === 1} onClick={() => setHalamanTransaksi(halamanTransaksi - 1)}>Sebelumnya</Button>
                <Button size="sm" variant="outline-secondary" disabled={memuatTransaksi || transaksi.length < 100} onClick={() => setHalamanTransaksi(halamanTransaksi + 1)}>Berikutnya</Button>
              </div>
            </Card.Body>
          </Card>
        </>
      ) : null}
    </>
  );
}
