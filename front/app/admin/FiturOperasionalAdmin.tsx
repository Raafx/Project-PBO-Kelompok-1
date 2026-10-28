"use client";

// Modul admin tambahan: shift, katalog, stok, pembelian, pelanggan, keuangan, pengaturan.

import { Icon } from "@iconify/react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";

import {
  backupUrl,
  changeAccountPin,
  createAdminMember,
  createAutomaticPurchaseOrder,
  createCatalogOption,
  createFinanceEntry,
  createProductBatch,
  createPromotion,
  createPurchaseOrder,
  createPurchaseReturn,
  createStaff,
  createStockCount,
  createStore,
  downloadAdminFile,
  importProducts,
  loadOperations,
  loadOperationsReport,
  loadAccountProfile,
  loadStockMovements,
  productBarcodeUrl,
  receivePurchaseOrder,
  saveBusinessSetting,
  saveStoreProfile,
  settleFinanceEntry,
  updateAdminMember,
  updateAccountProfile,
  type AccessRole,
  type FinanceEntry,
  type MasterProduct,
  type OperationsReport,
  type OperationsSnapshot,
  type PurchaseOrder,
  type Supplier,
  type StockMovement,
} from "../api";
import PilihanCari from "../PilihanCari";
import PerangkatAuthenticator from "./PerangkatAuthenticator";

export type TabOperasional =
  | "cashier"
  | "catalog"
  | "inventory"
  | "purchasing"
  | "customers"
  | "finance"
  | "reports"
  | "settings";

const money = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});
const dateTime = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatMoney(value: number) {
  return money.format(value).replace(/\s/g, "");
}

function FieldCard({
  title,
  copy,
  children,
}: {
  title: string;
  copy: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="h-100">
      <Card.Header>
        <h5 className="mb-1">{title}</h5>
        <p className="text-muted mb-0">{copy}</p>
      </Card.Header>
      <Card.Body>{children}</Card.Body>
    </Card>
  );
}

export default function FiturOperasionalAdmin({
  activeTab,
  products,
  suppliers,
  orders,
  roles,
  onChanged,
}: {
  activeTab: TabOperasional;
  products: MasterProduct[];
  suppliers: Supplier[];
  orders: PurchaseOrder[];
  roles: AccessRole[];
  onChanged: () => void | Promise<void>;
}) {
  const tab = activeTab;
  const [snapshot, setSnapshot] = useState<OperationsSnapshot | null>(null);
  const [report, setReport] = useState<OperationsReport | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [catalog, setCatalog] = useState({
    kind: "category",
    code: "",
    name: "",
    conversion_factor: 1,
  });
  const [promotion, setPromotion] = useState({
    code: "",
    name: "",
    promotion_type: "percent",
    product_id: "",
    value: 10,
    min_quantity: 1,
    buy_quantity: 1,
    free_quantity: 1,
    starts_at: "",
    ends_at: "",
  });
  const [count, setCount] = useState({
    product_id: "",
    stock_area: "sales",
    physical_quantity: 0,
    note: "",
  });
  const [batch, setBatch] = useState({
    product_id: "",
    batch_no: "",
    expiry_date: "",
    quantity: 0,
  });
  const [member, setMember] = useState({
    phone: "",
    full_name: "",
    tier: "REGULAR",
  });
  const [finance, setFinance] = useState({
    entry_type: "expense",
    counterparty: "",
    amount: 0,
    status: "open",
    due_date: "",
    note: "",
  });
  const [purchase, setPurchase] = useState({
    supplier_id: "",
    barcode: "",
    quantity: 1,
    unit_cost: 0,
    expected_date: "",
    notes: "",
  });
  const [purchaseReturn, setPurchaseReturn] = useState({
    product_id: "",
    supplier_id: "",
    quantity: 1,
    note: "",
  });
  const [setting, setSetting] = useState({
    key: "",
    group_name: "general",
    label: "",
    value: "",
  });
  const [store, setStore] = useState({
    name: "MYMARKET Samarinda Central",
    address: "Samarinda, Kalimantan Timur",
    logo_url: "/logo-app.png",
    tax_id: "",
    timezone: "Asia/Makassar",
  });
  const [branch, setBranch] = useState({
    code: "",
    name: "",
    address: "",
    timezone: "Asia/Makassar",
  });
  const [staff, setStaff] = useState({
    employee_code: "",
    full_name: "",
    email: "",
    password: "",
    pin: "",
    role_id: "",
  });
  const [account, setAccount] = useState({ full_name: "", email: "" });
  const [pinForm, setPinForm] = useState({ current: "", next: "" });

  const refresh = useCallback(async () => {
    try {
      const [nextSnapshot, nextReport, nextAccount, nextMovements] =
        await Promise.all([
          loadOperations(),
          loadOperationsReport().catch(() => null),
          loadAccountProfile(),
          loadStockMovements(),
        ]);
      setSnapshot(nextSnapshot);
      setReport(nextReport);
      setAccount({
        full_name: nextAccount.full_name,
        email: nextAccount.email || "",
      });
      setMovements(nextMovements);
      setError("");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Data operasional gagal dimuat",
      );
    }
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => void refresh());
    return () => window.cancelAnimationFrame(frame);
  }, [refresh]);
  useEffect(() => {
    if (!products.length) return;
    const frame = window.requestAnimationFrame(() => {
      const first = products[0];
      setCount((current) =>
        current.product_id
          ? current
          : {
              ...current,
              product_id: first.id,
              physical_quantity: first.stock,
            },
      );
      setBatch((current) =>
        current.product_id ? current : { ...current, product_id: first.id },
      );
      setPurchase((current) =>
        current.barcode
          ? current
          : { ...current, barcode: first.barcode, unit_cost: first.cost_price },
      );
      setPurchaseReturn((current) =>
        current.product_id ? current : { ...current, product_id: first.id },
      );
    });
    return () => window.cancelAnimationFrame(frame);
  }, [products]);
  useEffect(() => {
    if (!suppliers.length) return;
    const frame = window.requestAnimationFrame(() => {
      setPurchase((current) =>
        current.supplier_id
          ? current
          : { ...current, supplier_id: suppliers[0].id },
      );
      setPurchaseReturn((current) =>
        current.supplier_id
          ? current
          : { ...current, supplier_id: suppliers[0].id },
      );
    });
    return () => window.cancelAnimationFrame(frame);
  }, [suppliers]);
  useEffect(() => {
    if (!roles.length) return;
    const frame = window.requestAnimationFrame(() =>
      setStaff((current) =>
        current.role_id ? current : { ...current, role_id: roles[0].id },
      ),
    );
    return () => window.cancelAnimationFrame(frame);
  }, [roles]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function run(action: () => Promise<unknown>, message: string) {
    setWorking(true);
    setError("");
    try {
      await action();
      await Promise.all([refresh(), Promise.resolve(onChanged())]);
      setToast(message);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Aksi gagal disimpan",
      );
    } finally {
      setWorking(false);
    }
  }

  function submitCatalog(event: FormEvent) {
    event.preventDefault();
    void run(
      () =>
        createCatalogOption({
          ...catalog,
          kind: catalog.kind as "category" | "unit" | "brand",
        }),
      "Master produk ditambahkan",
    );
  }

  function submitPromotion(event: FormEvent) {
    event.preventDefault();
    void run(
      () =>
        createPromotion({
          ...promotion,
          promotion_type: promotion.promotion_type as
            | "percent"
            | "fixed"
            | "buy_x_get_y"
            | "wholesale",
          product_id: promotion.product_id || null,
          starts_at: new Date(promotion.starts_at).toISOString(),
          ends_at: new Date(promotion.ends_at).toISOString(),
          is_active: true,
        }),
      "Promo aktif dan langsung dipakai POS",
    );
  }

  function printLabel() {
    const product =
      products.find((item) => item.id === count.product_id) || products[0];
    if (!product) return;
    const popup = window.open("", "label", "width=520,height=420");
    if (!popup) return;
    popup.document.write(
      `<html><head><title>Label ${product.name}</title><style>body{font-family:Arial;padding:24px}.label{width:360px;border:2px solid #111;padding:18px;text-align:center}.name{font-size:20px;font-weight:700}.price{font-size:30px;font-weight:800;margin:12px}.barcode{width:100%;height:90px;object-fit:contain}</style></head><body><div class="label"><div class="name">${product.name}</div><div>${product.unit} · ${product.brand || "MYMARKET"}</div><div class="price">${formatMoney(product.price)}</div><img class="barcode" src="${productBarcodeUrl(product.id)}" /><div>${product.barcode}</div></div><script>window.onload=()=>window.print()</script></body></html>`,
    );
    popup.document.close();
  }

  const openOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.status === "ordered" || order.status === "partially_received",
      ),
    [orders],
  );
  return (
    <>
      {error ? (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      ) : null}
      {!snapshot ? (
        <Card>
          <Card.Body className="text-center py-5">
            <Spinner className="me-2" />
            Menyiapkan operasional...
          </Card.Body>
        </Card>
      ) : null}

      {snapshot && tab === "cashier" ? (
        <>
          <Row className="g-3 mb-3">
            {[
              [
                "Shift aktif",
                snapshot.shifts.filter((item) => item.status === "open").length,
                "solar:clock-circle-bold-duotone",
                "primary",
              ],
              [
                "Shift selesai",
                snapshot.shifts.filter((item) => item.status === "closed")
                  .length,
                "solar:check-circle-bold-duotone",
                "success",
              ],
              [
                "Retur / void",
                snapshot.returns.length,
                "solar:restart-bold-duotone",
                "danger",
              ],
              [
                "Kas selisih",
                snapshot.shifts.filter((item) => item.difference).length,
                "solar:danger-triangle-bold-duotone",
                "warning",
              ],
            ].map(([label, value, icon, color]) => (
              <Col md={3} key={String(label)}>
                <Card>
                  <Card.Body className="d-flex align-items-center gap-3">
                    <span
                      className={`avatar-md bg-${color}-subtle text-${color} rounded d-flex align-items-center justify-content-center`}
                    >
                      <Icon icon={String(icon)} width={24} />
                    </span>
                    <div>
                      <small className="text-muted">{label}</small>
                      <h3 className="mb-0">{value}</h3>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          <Card>
            <Card.Header>
              <h5 className="mb-1">Rekap shift kasir</h5>
              <p className="text-muted mb-0">
                Modal, penjualan tunai, kas masuk/keluar, dan selisih penutupan.
              </p>
            </Card.Header>
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead>
                  <tr>
                    <th>Kasir</th>
                    <th>Dibuka</th>
                    <th>Status</th>
                    <th className="text-end">Modal</th>
                    <th className="text-end">Penjualan</th>
                    <th className="text-end">Seharusnya</th>
                    <th className="text-end">Selisih</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.shifts.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.cashier_name}</strong>
                        <small className="d-block text-muted">
                          {item.cashier_code}
                        </small>
                      </td>
                      <td>{dateTime.format(new Date(item.opened_at))}</td>
                      <td>
                        <Badge
                          bg={item.status === "open" ? "success" : "secondary"}
                        >
                          {item.status === "open" ? "Aktif" : "Tutup"}
                        </Badge>
                      </td>
                      <td className="text-end">
                        {formatMoney(item.opening_cash)}
                      </td>
                      <td className="text-end">
                        {formatMoney(item.cash_sales)}
                      </td>
                      <td className="text-end">
                        {formatMoney(item.expected_cash)}
                      </td>
                      <td
                        className={`text-end fw-semibold ${(item.difference || 0) < 0 ? "text-danger" : "text-success"}`}
                      >
                        {item.difference === null
                          ? "—"
                          : formatMoney(item.difference)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card>
        </>
      ) : null}

      {snapshot && tab === "catalog" ? (
        <Row className="g-3">
          <Col xl={4}>
            <FieldCard
              title="Kategori, satuan & merek"
              copy="Master kecil ini dipakai ulang saat isi produk."
            >
              <Form
                onSubmit={submitCatalog}
                className="d-flex flex-column gap-3"
              >
                <PilihanCari
                  value={catalog.kind}
                  onChange={(event) =>
                    setCatalog({ ...catalog, kind: event.target.value })
                  }
                >
                  <option value="category">Kategori</option>
                  <option value="unit">Satuan / konversi</option>
                  <option value="brand">Merek</option>
                </PilihanCari>
                <Form.Control
                  placeholder="Kode"
                  value={catalog.code}
                  onChange={(event) =>
                    setCatalog({ ...catalog, code: event.target.value })
                  }
                  required
                />
                <Form.Control
                  placeholder="Nama tampilan"
                  value={catalog.name}
                  onChange={(event) =>
                    setCatalog({ ...catalog, name: event.target.value })
                  }
                  required
                />
                {catalog.kind === "unit" ? (
                  <Form.Control
                    type="number"
                    min="1"
                    value={catalog.conversion_factor}
                    onChange={(event) =>
                      setCatalog({
                        ...catalog,
                        conversion_factor: Number(event.target.value),
                      })
                    }
                  />
                ) : null}
                <Button type="submit" disabled={working}>
                  Simpan master
                </Button>
              </Form>
              <hr />
              {(["category", "unit", "brand"] as const).map((kind) => (
                <div key={kind} className="mb-2">
                  <small className="text-uppercase text-muted">{kind}</small>
                  <div className="d-flex flex-wrap gap-1 mt-1">
                    {snapshot.catalog_options
                      .filter((item) => item.kind === kind)
                      .map((item) => (
                        <Badge bg="light" text="dark" key={item.id}>
                          {item.name}
                        </Badge>
                      ))}
                  </div>
                </div>
              ))}
            </FieldCard>
          </Col>
          <Col xl={5}>
            <FieldCard
              title="Promo & diskon"
              copy="Diskon produk, grosir, atau beli X gratis Y otomatis dihitung di checkout."
            >
              <Form onSubmit={submitPromotion}>
                <Row className="g-2">
                  <Col md={6}>
                    <Form.Control
                      placeholder="Kode promo"
                      value={promotion.code}
                      onChange={(event) =>
                        setPromotion({ ...promotion, code: event.target.value })
                      }
                      required
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Control
                      placeholder="Nama promo"
                      value={promotion.name}
                      onChange={(event) =>
                        setPromotion({ ...promotion, name: event.target.value })
                      }
                      required
                    />
                  </Col>
                  <Col md={6}>
                    <PilihanCari
                      value={promotion.promotion_type}
                      onChange={(event) =>
                        setPromotion({
                          ...promotion,
                          promotion_type: event.target.value,
                        })
                      }
                    >
                      <option value="percent">Diskon persen</option>
                      <option value="fixed">Potongan nominal / item</option>
                      <option value="wholesale">Harga grosir</option>
                      <option value="buy_x_get_y">Beli X gratis Y</option>
                    </PilihanCari>
                  </Col>
                  <Col md={6}>
                    <PilihanCari
                      value={promotion.product_id}
                      onChange={(event) =>
                        setPromotion({
                          ...promotion,
                          product_id: event.target.value,
                        })
                      }
                    >
                      <option value="">Semua produk</option>
                      {products.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </PilihanCari>
                  </Col>
                  <Col md={4}>
                    <Form.Control
                      type="number"
                      min="0"
                      value={promotion.value}
                      onChange={(event) =>
                        setPromotion({
                          ...promotion,
                          value: Number(event.target.value),
                        })
                      }
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Control
                      type="number"
                      min="1"
                      value={promotion.min_quantity}
                      onChange={(event) =>
                        setPromotion({
                          ...promotion,
                          min_quantity: Number(event.target.value),
                        })
                      }
                      title="Minimal jumlah"
                    />
                  </Col>
                  <Col md={4}>
                    {promotion.promotion_type === "buy_x_get_y" ? (
                      <div className="d-flex gap-1">
                        <Form.Control
                          type="number"
                          min="1"
                          value={promotion.buy_quantity}
                          onChange={(event) =>
                            setPromotion({
                              ...promotion,
                              buy_quantity: Number(event.target.value),
                            })
                          }
                        />
                        <Form.Control
                          type="number"
                          min="1"
                          value={promotion.free_quantity}
                          onChange={(event) =>
                            setPromotion({
                              ...promotion,
                              free_quantity: Number(event.target.value),
                            })
                          }
                        />
                      </div>
                    ) : null}
                  </Col>
                  <Col md={6}>
                    <Form.Control
                      type="datetime-local"
                      required
                      value={promotion.starts_at}
                      onChange={(event) =>
                        setPromotion({
                          ...promotion,
                          starts_at: event.target.value,
                        })
                      }
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Control
                      type="datetime-local"
                      required
                      value={promotion.ends_at}
                      onChange={(event) =>
                        setPromotion({
                          ...promotion,
                          ends_at: event.target.value,
                        })
                      }
                    />
                  </Col>
                  <Col xs={12}>
                    <Button type="submit" disabled={working}>
                      Aktifkan promo
                    </Button>
                  </Col>
                </Row>
              </Form>
              <hr />
              <div className="d-flex flex-column gap-2">
                {snapshot.promotions.slice(0, 5).map((item) => (
                  <div
                    className="d-flex justify-content-between border rounded p-2"
                    key={item.id}
                  >
                    <div>
                      <strong>{item.name}</strong>
                      <small className="d-block text-muted">
                        {item.code} · {item.promotion_type}
                      </small>
                    </div>
                    <Badge bg={item.is_active ? "success" : "secondary"}>
                      {item.is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>
                ))}
              </div>
            </FieldCard>
          </Col>
          <Col xl={3}>
            <FieldCard
              title="Label & data produk"
              copy="Cetak harga/barcode atau pindahkan master lewat Excel."
            >
              <PilihanCari
                value={count.product_id}
                onChange={(event) =>
                  setCount({ ...count, product_id: event.target.value })
                }
                className="mb-2"
              >
                {products.map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.name}
                  </option>
                ))}
              </PilihanCari>
              <div className="d-grid gap-2">
                <Button onClick={printLabel}>
                  <Icon icon="solar:printer-2-linear" className="me-1" />
                  Cetak label harga
                </Button>
                <Button
                  variant="outline-primary"
                  onClick={() =>
                    void downloadAdminFile(
                      "/admin/products/export.xlsx",
                      "produk-mymarket.xlsx",
                    )
                  }
                >
                  <Icon icon="solar:download-linear" className="me-1" />
                  Export Excel
                </Button>
                <Form.Label className="btn btn-outline-secondary mb-0">
                  <Icon icon="solar:upload-linear" className="me-1" />
                  Import Excel
                  <Form.Control
                    hidden
                    type="file"
                    accept=".xlsx"
                    onChange={(event) => {
                      const file = (event.currentTarget as HTMLInputElement)
                        .files?.[0];
                      if (file)
                        void run(
                          () => importProducts(file),
                          "Import produk selesai",
                        );
                    }}
                  />
                </Form.Label>
              </div>
            </FieldCard>
          </Col>
        </Row>
      ) : null}

      {snapshot && tab === "inventory" ? (
        <Row className="g-3">
          <Col xl={4}>
            <FieldCard
              title="Stock opname"
              copy="Masukkan jumlah fisik, sistem langsung membuat penyesuaian dan kartu stok."
            >
              <Form
                onSubmit={(event) => {
                  event.preventDefault();
                  void run(
                    () =>
                      createStockCount({
                        ...count,
                        stock_area: count.stock_area as "warehouse" | "sales",
                      }),
                    "Stock opname tersimpan",
                  );
                }}
                className="d-flex flex-column gap-2"
              >
                <PilihanCari
                  value={count.product_id}
                  onChange={(event) => {
                    const selected = products.find(
                      (item) => item.id === event.target.value,
                    );
                    setCount({
                      ...count,
                      product_id: event.target.value,
                      physical_quantity:
                        count.stock_area === "warehouse"
                          ? selected?.warehouse_stock || 0
                          : selected?.stock || 0,
                    });
                  }}
                >
                  {products.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </PilihanCari>
                <PilihanCari
                  value={count.stock_area}
                  onChange={(event) =>
                    setCount({ ...count, stock_area: event.target.value })
                  }
                >
                  <option value="sales">Rak / kasir</option>
                  <option value="warehouse">Gudang</option>
                </PilihanCari>
                <Form.Control
                  type="number"
                  min="0"
                  value={count.physical_quantity}
                  onChange={(event) =>
                    setCount({
                      ...count,
                      physical_quantity: Number(event.target.value),
                    })
                  }
                />
                <Form.Control
                  placeholder="Catatan opname"
                  value={count.note}
                  onChange={(event) =>
                    setCount({ ...count, note: event.target.value })
                  }
                />
                <Button type="submit" disabled={working}>
                  Simpan hitung fisik
                </Button>
              </Form>
            </FieldCard>
          </Col>
          <Col xl={4}>
            <FieldCard
              title="Batch & kedaluwarsa"
              copy="Catat batch supaya produk mendekati ED bisa dipantau."
            >
              <Form
                onSubmit={(event) => {
                  event.preventDefault();
                  void run(
                    () => createProductBatch(batch),
                    "Batch produk ditambahkan",
                  );
                }}
                className="d-flex flex-column gap-2"
              >
                <PilihanCari
                  value={batch.product_id}
                  onChange={(event) =>
                    setBatch({ ...batch, product_id: event.target.value })
                  }
                >
                  {products.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </PilihanCari>
                <Form.Control
                  placeholder="Nomor batch"
                  value={batch.batch_no}
                  onChange={(event) =>
                    setBatch({ ...batch, batch_no: event.target.value })
                  }
                  required
                />
                <Form.Control
                  type="date"
                  value={batch.expiry_date}
                  onChange={(event) =>
                    setBatch({ ...batch, expiry_date: event.target.value })
                  }
                  required
                />
                <Form.Control
                  type="number"
                  min="0"
                  value={batch.quantity}
                  onChange={(event) =>
                    setBatch({ ...batch, quantity: Number(event.target.value) })
                  }
                />
                <Button type="submit" disabled={working}>
                  Simpan batch
                </Button>
              </Form>
            </FieldCard>
          </Col>
          <Col xl={4}>
            <FieldCard
              title="Monitor kedaluwarsa"
              copy="Prioritaskan batch merah dan kuning untuk ditarik atau dijual dulu."
            >
              {snapshot.batches.length ? (
                snapshot.batches.slice(0, 8).map((item) => (
                  <div
                    className="d-flex justify-content-between border-bottom py-2"
                    key={item.id}
                  >
                    <div>
                      <strong>{item.product_name}</strong>
                      <small className="d-block text-muted">
                        {item.batch_no} · {item.quantity} unit
                      </small>
                    </div>
                    <Badge
                      bg={
                        item.status === "safe"
                          ? "success"
                          : item.status === "warning"
                            ? "warning"
                            : "danger"
                      }
                    >
                      {item.days_until_expiry} hari
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted mb-0">Belum ada batch kedaluwarsa.</p>
              )}
            </FieldCard>
          </Col>
          <Col xs={12}>
            <Card>
              <Card.Header>
                <h5 className="mb-1">Riwayat stock opname</h5>
                <p className="text-muted mb-0">
                  Selisih fisik otomatis masuk ke kartu mutasi stok.
                </p>
              </Card.Header>
              <div className="table-responsive">
                <Table className="mb-0">
                  <thead>
                    <tr>
                      <th>Waktu</th>
                      <th>Area</th>
                      <th className="text-end">Sistem</th>
                      <th className="text-end">Fisik</th>
                      <th className="text-end">Selisih</th>
                      <th>Catatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snapshot.stock_counts.map((item) => (
                      <tr key={item.id}>
                        <td>{dateTime.format(new Date(item.created_at))}</td>
                        <td>{item.stock_area}</td>
                        <td className="text-end">{item.system_quantity}</td>
                        <td className="text-end">{item.physical_quantity}</td>
                        <td
                          className={`text-end fw-semibold ${item.difference < 0 ? "text-danger" : "text-success"}`}
                        >
                          {item.difference}
                        </td>
                        <td>{item.note || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card>
          </Col>
          <Col xs={12}>
            <Card>
              <Card.Header>
                <h5 className="mb-1">Kartu stok / mutasi terbaru</h5>
                <p className="text-muted mb-0">
                  Semua barang masuk, terjual, transfer, retur, dan penyesuaian
                  tercatat berurutan.
                </p>
              </Card.Header>
              <div className="table-responsive">
                <Table className="mb-0">
                  <thead>
                    <tr>
                      <th>Waktu</th>
                      <th>Produk</th>
                      <th>Jenis</th>
                      <th>Area</th>
                      <th className="text-end">Perubahan</th>
                      <th className="text-end">Saldo</th>
                      <th>Catatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movements.map((item) => {
                      const product = products.find(
                        (candidate) => candidate.id === item.product_id,
                      );
                      return (
                        <tr key={item.id}>
                          <td>{dateTime.format(new Date(item.created_at))}</td>
                          <td>
                            <strong>{product?.name || item.product_id}</strong>
                          </td>
                          <td>
                            <Badge
                              bg={
                                item.movement_type === "sale" ||
                                item.quantity_change < 0
                                  ? "danger"
                                  : "success"
                              }
                            >
                              {item.movement_type}
                            </Badge>
                          </td>
                          <td>{item.stock_area}</td>
                          <td
                            className={`text-end fw-semibold ${item.quantity_change < 0 ? "text-danger" : "text-success"}`}
                          >
                            {item.quantity_change > 0 ? "+" : ""}
                            {item.quantity_change}
                          </td>
                          <td className="text-end">{item.balance_after}</td>
                          <td>{item.note || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </Card>
          </Col>
        </Row>
      ) : null}

      {snapshot && tab === "purchasing" ? (
        <Row className="g-3">
          <Col xl={4}>
            <FieldCard
              title="Buat Purchase Order"
              copy="PO belum menambah stok sampai barang benar-benar diterima."
            >
              <Form
                onSubmit={(event) => {
                  event.preventDefault();
                  void run(
                    () =>
                      createPurchaseOrder({
                        supplier_id: purchase.supplier_id,
                        expected_date: purchase.expected_date || undefined,
                        notes: purchase.notes,
                        items: [
                          {
                            barcode: purchase.barcode,
                            quantity: purchase.quantity,
                            unit_cost: purchase.unit_cost,
                          },
                        ],
                      }),
                    "PO berhasil dibuat",
                  );
                }}
                className="d-flex flex-column gap-2"
              >
                <PilihanCari
                  value={purchase.supplier_id}
                  onChange={(event) =>
                    setPurchase({
                      ...purchase,
                      supplier_id: event.target.value,
                    })
                  }
                >
                  {suppliers.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </PilihanCari>
                <PilihanCari
                  value={purchase.barcode}
                  onChange={(event) => {
                    const selected = products.find(
                      (item) => item.barcode === event.target.value,
                    );
                    setPurchase({
                      ...purchase,
                      barcode: event.target.value,
                      unit_cost: selected?.cost_price || 0,
                    });
                  }}
                >
                  {products.map((item) => (
                    <option key={item.id} value={item.barcode}>
                      {item.name}
                    </option>
                  ))}
                </PilihanCari>
                <Row>
                  <Col>
                    <Form.Control
                      type="number"
                      min="1"
                      value={purchase.quantity}
                      onChange={(event) =>
                        setPurchase({
                          ...purchase,
                          quantity: Number(event.target.value),
                        })
                      }
                    />
                  </Col>
                  <Col>
                    <Form.Control
                      type="number"
                      min="0"
                      value={purchase.unit_cost}
                      onChange={(event) =>
                        setPurchase({
                          ...purchase,
                          unit_cost: Number(event.target.value),
                        })
                      }
                    />
                  </Col>
                </Row>
                <Form.Control
                  type="date"
                  value={purchase.expected_date}
                  onChange={(event) =>
                    setPurchase({
                      ...purchase,
                      expected_date: event.target.value,
                    })
                  }
                />
                <Form.Control
                  placeholder="Catatan PO"
                  value={purchase.notes}
                  onChange={(event) =>
                    setPurchase({ ...purchase, notes: event.target.value })
                  }
                />
                <Button type="submit" disabled={working}>
                  Buat PO
                </Button>
                <Button
                  type="button"
                  variant="outline-primary"
                  disabled={working || !purchase.supplier_id}
                  onClick={() =>
                    void run(
                      () => createAutomaticPurchaseOrder(purchase.supplier_id),
                      "PO stok minimum dibuat otomatis",
                    )
                  }
                >
                  Buat otomatis dari stok minimum
                </Button>
              </Form>
            </FieldCard>
          </Col>
          <Col xl={8}>
            <Card className="h-100">
              <Card.Header>
                <h5 className="mb-1">Penerimaan barang</h5>
                <p className="text-muted mb-0">
                  Cocokkan barang datang dengan PO, lalu stok gudang dan harga
                  modal ter-update.
                </p>
              </Card.Header>
              <div className="table-responsive">
                <Table className="mb-0">
                  <thead>
                    <tr>
                      <th>PO</th>
                      <th>Supplier</th>
                      <th>Item</th>
                      <th className="text-end">Total</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {openOrders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <strong>{order.po_number}</strong>
                          <small className="d-block text-muted">
                            {order.status}
                          </small>
                        </td>
                        <td>{order.supplier.name}</td>
                        <td>
                          {order.items.reduce(
                            (sum, item) =>
                              sum +
                              item.quantity_ordered -
                              item.quantity_received,
                            0,
                          )}{" "}
                          unit tersisa
                        </td>
                        <td className="text-end">
                          {formatMoney(order.subtotal)}
                        </td>
                        <td className="text-end">
                          <Button
                            size="sm"
                            disabled={working}
                            onClick={() =>
                              void run(
                                () => receivePurchaseOrder(order),
                                "Penerimaan barang selesai",
                              )
                            }
                          >
                            Terima semua
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              {!openOrders.length ? (
                <Card.Body className="text-center text-muted">
                  Tidak ada PO yang menunggu barang.
                </Card.Body>
              ) : null}
            </Card>
          </Col>
          <Col xl={4}>
            <FieldCard
              title="Retur pembelian"
              copy="Barang dikembalikan ke supplier dan stok gudang berkurang."
            >
              <Form
                onSubmit={(event) => {
                  event.preventDefault();
                  void run(
                    () => createPurchaseReturn(purchaseReturn),
                    "Retur pembelian tersimpan",
                  );
                }}
                className="d-flex flex-column gap-2"
              >
                <PilihanCari
                  value={purchaseReturn.product_id}
                  onChange={(event) =>
                    setPurchaseReturn({
                      ...purchaseReturn,
                      product_id: event.target.value,
                    })
                  }
                >
                  {products.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} · gudang {item.warehouse_stock}
                    </option>
                  ))}
                </PilihanCari>
                <PilihanCari
                  value={purchaseReturn.supplier_id}
                  onChange={(event) =>
                    setPurchaseReturn({
                      ...purchaseReturn,
                      supplier_id: event.target.value,
                    })
                  }
                >
                  {suppliers.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </PilihanCari>
                <Form.Control
                  type="number"
                  min="1"
                  value={purchaseReturn.quantity}
                  onChange={(event) =>
                    setPurchaseReturn({
                      ...purchaseReturn,
                      quantity: Number(event.target.value),
                    })
                  }
                />
                <Form.Control
                  placeholder="Alasan retur"
                  value={purchaseReturn.note}
                  onChange={(event) =>
                    setPurchaseReturn({
                      ...purchaseReturn,
                      note: event.target.value,
                    })
                  }
                  required
                />
                <Button
                  type="submit"
                  variant="outline-danger"
                  disabled={working}
                >
                  Proses retur
                </Button>
              </Form>
            </FieldCard>
          </Col>
          <Col xl={8}>
            <FieldCard
              title="Hutang supplier"
              copy="Catatan payable dari menu keuangan ditampilkan di sini."
            >
              {snapshot.finance_entries
                .filter((item) => item.entry_type === "payable")
                .map((item) => (
                  <div
                    className="d-flex justify-content-between border-bottom py-2"
                    key={item.id}
                  >
                    <div>
                      <strong>{item.counterparty || item.reference_no}</strong>
                      <small className="d-block text-muted">
                        Jatuh tempo {item.due_date || "belum diatur"}
                      </small>
                    </div>
                    <div className="text-end">
                      <strong>{formatMoney(item.amount)}</strong>
                      <Badge
                        bg={item.status === "open" ? "warning" : "success"}
                        className="d-block mt-1"
                      >
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))}
            </FieldCard>
          </Col>
        </Row>
      ) : null}

      {snapshot && tab === "customers" ? (
        <Row className="g-3">
          <Col xl={4}>
            <FieldCard
              title="Tambah pelanggan / member"
              copy="Nomor telepon bisa langsung dipakai saat checkout."
            >
              <Form
                onSubmit={(event) => {
                  event.preventDefault();
                  void run(
                    () => createAdminMember(member),
                    "Member baru ditambahkan",
                  );
                }}
                className="d-flex flex-column gap-2"
              >
                <Form.Control
                  placeholder="Nomor telepon"
                  value={member.phone}
                  onChange={(event) =>
                    setMember({ ...member, phone: event.target.value })
                  }
                  required
                />
                <Form.Control
                  placeholder="Nama pelanggan"
                  value={member.full_name}
                  onChange={(event) =>
                    setMember({ ...member, full_name: event.target.value })
                  }
                  required
                />
                <PilihanCari
                  value={member.tier}
                  onChange={(event) =>
                    setMember({ ...member, tier: event.target.value })
                  }
                >
                  <option>REGULAR</option>
                  <option>SILVER</option>
                  <option>GOLD</option>
                </PilihanCari>
                <Button type="submit" disabled={working}>
                  Tambah member
                </Button>
              </Form>
            </FieldCard>
          </Col>
          <Col xl={8}>
            <Card>
              <Card.Header>
                <h5 className="mb-1">Member & loyalty</h5>
                <p className="text-muted mb-0">
                  Poin otomatis bertambah satu setiap belanja Rp10.000.
                </p>
              </Card.Header>
              <div className="table-responsive">
                <Table className="mb-0">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Telepon</th>
                      <th>Tier</th>
                      <th className="text-end">Poin</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {snapshot.members.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.full_name}</strong>
                        </td>
                        <td>{item.phone}</td>
                        <td>
                          <Badge bg="info">{item.tier}</Badge>
                        </td>
                        <td className="text-end">{item.points}</td>
                        <td className="text-end">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() =>
                              void run(
                                () =>
                                  updateAdminMember(item.id, {
                                    points: item.points + 100,
                                  }),
                                "100 poin ditambahkan",
                              )
                            }
                          >
                            +100 poin
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card>
          </Col>
          <Col xs={12}>
            <Alert variant="info" className="mb-0">
              <strong>Kasbon / piutang:</strong> buat catatan bertipe Piutang di
              tab Keuangan, isi nama pelanggan dan tanggal jatuh temponya.
            </Alert>
          </Col>
        </Row>
      ) : null}

      {snapshot && tab === "finance" ? (
        <Row className="g-3">
          <Col xl={4}>
            <FieldCard
              title="Catat transaksi keuangan"
              copy="Pengeluaran, setoran, rekonsiliasi, piutang, dan hutang ada dalam satu alur."
            >
              <Form
                onSubmit={(event) => {
                  event.preventDefault();
                  void run(
                    () =>
                      createFinanceEntry({
                        ...finance,
                        entry_type:
                          finance.entry_type as FinanceEntry["entry_type"],
                        status: finance.status as FinanceEntry["status"],
                        due_date: finance.due_date || undefined,
                      }),
                    "Catatan keuangan disimpan",
                  );
                }}
                className="d-flex flex-column gap-2"
              >
                <PilihanCari
                  value={finance.entry_type}
                  onChange={(event) =>
                    setFinance({ ...finance, entry_type: event.target.value })
                  }
                >
                  <option value="expense">Pengeluaran operasional</option>
                  <option value="deposit">Setoran kas</option>
                  <option value="reconciliation">Rekonsiliasi non-tunai</option>
                  <option value="receivable">Piutang / kasbon</option>
                  <option value="payable">Hutang supplier</option>
                </PilihanCari>
                <Form.Control
                  placeholder="Pihak terkait"
                  value={finance.counterparty}
                  onChange={(event) =>
                    setFinance({ ...finance, counterparty: event.target.value })
                  }
                />
                <Form.Control
                  type="number"
                  min="0"
                  value={finance.amount}
                  onChange={(event) =>
                    setFinance({
                      ...finance,
                      amount: Number(event.target.value),
                    })
                  }
                />
                <Form.Control
                  type="date"
                  value={finance.due_date}
                  onChange={(event) =>
                    setFinance({ ...finance, due_date: event.target.value })
                  }
                />
                <Form.Control
                  as="textarea"
                  placeholder="Catatan"
                  value={finance.note}
                  onChange={(event) =>
                    setFinance({ ...finance, note: event.target.value })
                  }
                />
                <Button type="submit" disabled={working}>
                  Simpan transaksi
                </Button>
              </Form>
            </FieldCard>
          </Col>
          <Col xl={8}>
            <Card>
              <Card.Header>
                <h5 className="mb-1">Buku keuangan operasional</h5>
                <p className="text-muted mb-0">
                  Status open bisa diselesaikan saat pembayaran sudah terjadi.
                </p>
              </Card.Header>
              <div className="table-responsive">
                <Table className="mb-0">
                  <thead>
                    <tr>
                      <th>Referensi</th>
                      <th>Jenis</th>
                      <th>Pihak</th>
                      <th className="text-end">Nominal</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {snapshot.finance_entries.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.reference_no}</strong>
                          <small className="d-block text-muted">
                            {dateTime.format(new Date(item.created_at))}
                          </small>
                        </td>
                        <td>{item.entry_type}</td>
                        <td>{item.counterparty || "—"}</td>
                        <td className="text-end">{formatMoney(item.amount)}</td>
                        <td>
                          <Badge
                            bg={
                              item.status === "open"
                                ? "warning"
                                : item.status === "cancelled"
                                  ? "danger"
                                  : "success"
                            }
                          >
                            {item.status}
                          </Badge>
                        </td>
                        <td className="text-end">
                          {item.status === "open" ? (
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={() =>
                                void run(
                                  () => settleFinanceEntry(item.id, "settled"),
                                  "Transaksi diselesaikan",
                                )
                              }
                            >
                              Selesaikan
                            </Button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card>
          </Col>
        </Row>
      ) : null}

      {snapshot && report && tab === "reports" ? (
        <>
          <div className="mb-3">
            <h4 className="mb-1">Operasional bulan berjalan</h4>
            <p className="text-muted mb-0">Ringkasan tambahan untuk bulan ini; periode laporan di atas dapat dipilih secara terpisah.</p>
          </div>
          <Row className="g-3 mb-3">
            {[
              ["Omzet bulan ini", report.revenue, "primary"],
              ["Laba kotor", report.gross_profit, "success"],
              ["Pengeluaran", report.expenses, "danger"],
              [
                "Laba / rugi operasional",
                report.net_profit,
                report.net_profit >= 0 ? "success" : "danger",
              ],
              ["Nilai persediaan", report.inventory_value, "info"],
              ["Pajak estimasi", report.tax_estimate, "warning"],
              ["Pembelian bulan ini", report.purchase_spend, "info"],
            ].map(([label, value, color]) => (
              <Col xl={2} md={4} key={String(label)}>
                <Card className="h-100">
                  <Card.Body>
                    <small className="text-muted">{label}</small>
                    <h5 className={`mb-0 text-${color}`}>
                      {formatMoney(Number(value))}
                    </h5>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          <Row className="g-3">
            <Col xl={6}>
              <FieldCard
                title="Produk slow moving"
                copy="Produk dengan penjualan paling rendah di bulan berjalan."
              >
                {report.slow_moving.map((item) => (
                  <div
                    className="d-flex justify-content-between py-2 border-bottom"
                    key={item.name}
                  >
                    <div>
                      <strong>{item.name}</strong>
                      <small className="d-block text-muted">
                        Stok {item.stock} unit
                      </small>
                    </div>
                    <Badge bg={item.sold === 0 ? "danger" : "warning"}>
                      {item.sold} terjual
                    </Badge>
                  </div>
                ))}
              </FieldCard>
            </Col>
            <Col xl={6}>
              <FieldCard
                title="Ringkasan hutang & persediaan"
                copy="Angka ini ikut memperjelas kondisi modal kerja."
              >
                <div className="d-flex justify-content-between py-3 border-bottom">
                  <span>Hutang supplier aktif</span>
                  <strong>{formatMoney(report.open_payables)}</strong>
                </div>
                <div className="d-flex justify-content-between py-3 border-bottom">
                  <span>Piutang pelanggan aktif</span>
                  <strong>{formatMoney(report.open_receivables)}</strong>
                </div>
                <div className="d-flex justify-content-between py-3">
                  <span>Nilai stok × modal</span>
                  <strong>{formatMoney(report.inventory_value)}</strong>
                </div>
              </FieldCard>
            </Col>
            <Col xl={6}>
              <FieldCard
                title="Penjualan per kasir"
                copy="Omzet dan jumlah transaksi tiap petugas pada bulan berjalan."
              >
                {report.cashiers.length ? (
                  report.cashiers.map((item) => (
                    <div
                      className="d-flex justify-content-between py-2 border-bottom"
                      key={item.name}
                    >
                      <div>
                        <strong>{item.name}</strong>
                        <small className="d-block text-muted">
                          {item.transactions} transaksi
                        </small>
                      </div>
                      <strong>{formatMoney(item.revenue)}</strong>
                    </div>
                  ))
                ) : (
                  <p className="text-muted mb-0">
                    Belum ada penjualan bulan ini.
                  </p>
                )}
              </FieldCard>
            </Col>
          </Row>
        </>
      ) : null}

      {snapshot && tab === "settings" ? (
        <Row className="g-3">
          <Col xl={4}>
            <FieldCard
              title="Profil toko"
              copy="Identitas ini siap dipakai di header dan struk."
            >
              <Form
                onSubmit={(event) => {
                  event.preventDefault();
                  void run(
                    () => saveStoreProfile(store),
                    "Profil toko diperbarui",
                  );
                }}
                className="d-flex flex-column gap-2"
              >
                <Form.Control
                  placeholder="Nama toko"
                  value={store.name}
                  onChange={(event) =>
                    setStore({ ...store, name: event.target.value })
                  }
                />
                <Form.Control
                  as="textarea"
                  placeholder="Alamat"
                  value={store.address}
                  onChange={(event) =>
                    setStore({ ...store, address: event.target.value })
                  }
                />
                <Form.Control
                  placeholder="NPWP"
                  value={store.tax_id}
                  onChange={(event) =>
                    setStore({ ...store, tax_id: event.target.value })
                  }
                />
                <Form.Control
                  placeholder="URL logo"
                  value={store.logo_url}
                  onChange={(event) =>
                    setStore({ ...store, logo_url: event.target.value })
                  }
                />
                <Button type="submit" disabled={working}>
                  Simpan profil
                </Button>
              </Form>
            </FieldCard>
          </Col>
          <Col xl={4}>
            <FieldCard
              title="Pajak, pembayaran & struk"
              copy="Setelan fleksibel disimpan per key supaya gampang dikembangkan."
            >
              <Form
                onSubmit={(event) => {
                  event.preventDefault();
                  void run(
                    () => saveBusinessSetting(setting.key, setting),
                    "Pengaturan disimpan",
                  );
                }}
                className="d-flex flex-column gap-2"
              >
                <Form.Control
                  placeholder="Key, contoh tax.rate"
                  value={setting.key}
                  onChange={(event) =>
                    setSetting({ ...setting, key: event.target.value })
                  }
                  required
                />
                <PilihanCari
                  value={setting.group_name}
                  onChange={(event) =>
                    setSetting({ ...setting, group_name: event.target.value })
                  }
                >
                  <option value="payment">Pembayaran</option>
                  <option value="tax">Pajak</option>
                  <option value="receipt">Struk & printer</option>
                  <option value="branch">Cabang</option>
                  <option value="general">Umum</option>
                </PilihanCari>
                <Form.Control
                  placeholder="Label"
                  value={setting.label}
                  onChange={(event) =>
                    setSetting({ ...setting, label: event.target.value })
                  }
                  required
                />
                <Form.Control
                  as="textarea"
                  placeholder="Nilai"
                  value={setting.value}
                  onChange={(event) =>
                    setSetting({ ...setting, value: event.target.value })
                  }
                />
                <Button type="submit" disabled={working}>
                  Simpan setting
                </Button>
              </Form>
              <hr />
              {snapshot.settings.map((item) => (
                <button
                  type="button"
                  className="btn btn-light btn-sm me-1 mb-1"
                  key={item.key}
                  onClick={() => setSetting(item)}
                >
                  {item.label}
                </button>
              ))}
            </FieldCard>
          </Col>
          <Col xl={4}>
            <FieldCard
              title="Cabang / lokasi"
              copy="Tambah lokasi toko untuk struktur bisnis multi-cabang."
            >
              <Form
                onSubmit={(event) => {
                  event.preventDefault();
                  void run(
                    () => createStore(branch),
                    "Cabang baru ditambahkan",
                  );
                }}
                className="d-flex flex-column gap-2"
              >
                <Form.Control
                  placeholder="Kode cabang"
                  value={branch.code}
                  onChange={(event) =>
                    setBranch({
                      ...branch,
                      code: event.target.value.toUpperCase(),
                    })
                  }
                  required
                />
                <Form.Control
                  placeholder="Nama cabang"
                  value={branch.name}
                  onChange={(event) =>
                    setBranch({ ...branch, name: event.target.value })
                  }
                  required
                />
                <Form.Control
                  placeholder="Alamat"
                  value={branch.address}
                  onChange={(event) =>
                    setBranch({ ...branch, address: event.target.value })
                  }
                />
                <Button
                  type="submit"
                  variant="outline-primary"
                  disabled={working}
                >
                  Tambah cabang
                </Button>
              </Form>
              <hr />
              {snapshot.stores.map((item) => (
                <div
                  key={item.id}
                  className="d-flex justify-content-between py-2 border-bottom"
                >
                  <div>
                    <strong>{item.name}</strong>
                    <small className="d-block text-muted">
                      {item.code} · {item.address || "Alamat belum diisi"}
                    </small>
                  </div>
                  <Badge bg="success">Aktif</Badge>
                </div>
              ))}
            </FieldCard>
          </Col>
          <Col xl={4}>
            <FieldCard
              title="Tambah karyawan"
              copy="Akun baru langsung punya password, PIN kasir, dan role."
            >
              <Form
                onSubmit={(event) => {
                  event.preventDefault();
                  void run(() => createStaff(staff), "Akun karyawan dibuat");
                }}
                className="d-flex flex-column gap-2"
              >
                <Form.Control
                  placeholder="Kode pegawai"
                  value={staff.employee_code}
                  onChange={(event) =>
                    setStaff({ ...staff, employee_code: event.target.value })
                  }
                  required
                />
                <Form.Control
                  placeholder="Nama lengkap"
                  value={staff.full_name}
                  onChange={(event) =>
                    setStaff({ ...staff, full_name: event.target.value })
                  }
                  required
                />
                <Form.Control
                  type="email"
                  placeholder="Email"
                  value={staff.email}
                  onChange={(event) =>
                    setStaff({ ...staff, email: event.target.value })
                  }
                  required
                />
                <Form.Control
                  type="password"
                  placeholder="Password minimal 8 karakter"
                  value={staff.password}
                  onChange={(event) =>
                    setStaff({ ...staff, password: event.target.value })
                  }
                  required
                />
                <Form.Control
                  type="password"
                  inputMode="numeric"
                  placeholder="PIN kasir"
                  value={staff.pin}
                  onChange={(event) =>
                    setStaff({ ...staff, pin: event.target.value })
                  }
                  required
                />
                <PilihanCari
                  value={staff.role_id}
                  onChange={(event) =>
                    setStaff({ ...staff, role_id: event.target.value })
                  }
                >
                  {roles.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </PilihanCari>
                <Button type="submit" disabled={working}>
                  Buat akun
                </Button>
              </Form>
            </FieldCard>
          </Col>
          <Col xl={4}>
            <FieldCard
              title="Akun saya"
              copy="Ubah profil pengguna dan PIN persetujuan kasir."
            >
              <Form
                onSubmit={(event) => {
                  event.preventDefault();
                  void run(
                    () =>
                      updateAccountProfile(account.full_name, account.email),
                    "Profil akun diperbarui",
                  );
                }}
                className="d-flex flex-column gap-2"
              >
                <Form.Control
                  placeholder="Nama lengkap"
                  value={account.full_name}
                  onChange={(event) =>
                    setAccount({ ...account, full_name: event.target.value })
                  }
                  required
                />
                <Form.Control
                  type="email"
                  placeholder="Email"
                  value={account.email}
                  onChange={(event) =>
                    setAccount({ ...account, email: event.target.value })
                  }
                  required
                />
                <Button
                  type="submit"
                  variant="outline-primary"
                  disabled={working}
                >
                  Simpan profil akun
                </Button>
              </Form>
              <hr />
              <Form
                onSubmit={(event) => {
                  event.preventDefault();
                  void run(
                    () => changeAccountPin(pinForm.current, pinForm.next),
                    "PIN kasir berhasil diganti",
                  );
                }}
                className="d-flex flex-column gap-2"
              >
                <Form.Control
                  type="password"
                  inputMode="numeric"
                  placeholder="PIN saat ini"
                  value={pinForm.current}
                  onChange={(event) =>
                    setPinForm({ ...pinForm, current: event.target.value })
                  }
                  required
                />
                <Form.Control
                  type="password"
                  inputMode="numeric"
                  placeholder="PIN baru"
                  value={pinForm.next}
                  onChange={(event) =>
                    setPinForm({ ...pinForm, next: event.target.value })
                  }
                  required
                />
                <Button
                  type="submit"
                  variant="outline-secondary"
                  disabled={working}
                >
                  Ganti PIN
                </Button>
              </Form>
            </FieldCard>
          </Col>
          <Col xl={4}>
            <PerangkatAuthenticator />
          </Col>
          <Col xl={8}>
            <Card>
              <Card.Header>
                <h5 className="mb-1">Log aktivitas</h5>
                <p className="text-muted mb-0">
                  Perubahan sensitif seperti harga, stok, void, dan pengaturan
                  tercatat di sini.
                </p>
              </Card.Header>
              <div className="table-responsive">
                <Table className="mb-0">
                  <thead>
                    <tr>
                      <th>Waktu</th>
                      <th>Pengguna</th>
                      <th>Aksi</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snapshot.audit_logs.slice(0, 20).map((item) => (
                      <tr key={item.id}>
                        <td>{dateTime.format(new Date(item.created_at))}</td>
                        <td>{item.actor_name || "Sistem"}</td>
                        <td>
                          <code>{item.action}</code>
                        </td>
                        <td>{item.entity_type}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card>
          </Col>
          <Col xl={4}>
            <FieldCard
              title="Backup data"
              copy="Unduh snapshot JSON produk, member, penjualan, dan keuangan."
            >
              <p className="text-muted">
                Simpan file backup di lokasi aman secara berkala.
              </p>
              <Button
                className="w-100"
                onClick={() =>
                  void downloadAdminFile(
                    "/admin/backup",
                    `mymarket-backup-${new Date().toISOString().slice(0, 10)}.json`,
                  )
                }
              >
                <Icon icon="solar:cloud-download-linear" className="me-1" />
                Download backup
              </Button>
              <small className="d-none">{backupUrl()}</small>
            </FieldCard>
          </Col>
        </Row>
      ) : null}

      {working ? (
        <div className="position-fixed bottom-0 start-50 translate-middle-x mb-4 badge bg-dark p-3">
          <Spinner size="sm" className="me-2" />
          Menyimpan perubahan...
        </div>
      ) : null}
      {toast ? (
        <div className="toast-container position-fixed bottom-0 end-0 p-3">
          <div className="toast show text-bg-success">
            <div className="toast-body">
              <Icon icon="solar:check-circle-bold" className="me-2" />
              {toast}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
