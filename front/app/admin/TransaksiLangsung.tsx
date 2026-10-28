"use client";

// Tampilan menu Transaksi Live: status terminal kasir dan transaksi terbaru.
import { Icon } from "@iconify/react";
import Image from "next/image";
import { Badge, Card, Col, ProgressBar, Row, Table } from "react-bootstrap";
import type { LiveTransaction, LiveWorkflowSnapshot } from "../api";

const angka = new Intl.NumberFormat("id-ID");
const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});
const waktu = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});
const namaPembayaran: Record<string, string> = {
  cash: "Tunai",
  qris: "QRIS",
  edc: "EDC",
  debit: "Debit",
  credit: "Kredit",
  wallet: "E-Wallet",
  voucher: "Voucher",
};
function formatRupiah(value: number) {
  return rupiah.format(value).replace(/\s/g, "");
}
function PesanKosong({
  icon,
  title,
  copy,
}: {
  icon: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="text-center py-4">
      <span className="avatar-lg rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center mb-2">
        <Icon icon={icon} width={28} />
      </span>
      <h5>{title}</h5>
      <p className="text-muted mb-0">{copy}</p>
    </div>
  );
}

const namaStatus: Record<LiveTransaction["status"], string> = {
  ready: "Siap melayani",
  shopping: "Pilih produk",
  payment: "Pembayaran",
  processing: "Memproses",
  completed: "Selesai",
  held: "Hold",
  cancelled: "Dibatalkan",
};

function warnaStatus(session: LiveTransaction) {
  if (
    !session.online &&
    !["completed", "held", "cancelled"].includes(session.status)
  )
    return "secondary";
  if (session.status === "ready" || session.status === "completed")
    return "success";
  if (session.status === "shopping") return "primary";
  if (session.status === "payment" || session.status === "processing")
    return "warning";
  if (session.status === "held") return "info";
  return "danger";
}

function waktuSinyal(session: LiveTransaction, generatedAt: string) {
  const reference = generatedAt ? new Date(generatedAt).getTime() : Date.now();
  const seconds = Math.max(
    0,
    Math.floor((reference - new Date(session.last_seen_at).getTime()) / 1000),
  );
  if (seconds < 2) return "baru saja";
  if (seconds < 60) return `${seconds} detik lalu`;
  return `${Math.floor(seconds / 60)} menit lalu`;
}

export default function TransaksiLangsung({
  snapshot,
  connected,
}: {
  snapshot: LiveWorkflowSnapshot;
  connected: boolean;
}) {
  const terminalStatuses = new Set<LiveTransaction["status"]>([
    "completed",
    "held",
    "cancelled",
  ]);
  const activeSessions = snapshot.sessions.filter(
    (session) => !terminalStatuses.has(session.status),
  );
  const workstations = activeSessions.filter(
    (session, index, sessions) =>
      sessions.findIndex(
        (item) => item.cashier_code === session.cashier_code,
      ) === index,
  );
  const recentSessions = snapshot.sessions.filter((session) =>
    terminalStatuses.has(session.status),
  );
  const onlineCount = workstations.filter((session) => session.online).length;
  const readyCount = workstations.filter(
    (session) => session.service_ready,
  ).length;
  const running = workstations.filter(
    (session) => session.online && !session.service_ready,
  ).length;
  const liveValue = workstations.reduce(
    (total, session) => total + (session.online ? session.total : 0),
    0,
  );

  return (
    <>
      <Card className="mb-3">
        <Card.Body className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <span className="avatar-lg rounded bg-primary-subtle text-primary d-flex align-items-center justify-content-center">
              <Icon icon="solar:monitor-camera-bold-duotone" width={30} />
            </span>
            <div>
              <h4 className="mb-1">Workflow Transaksi Live</h4>
              <p className="text-muted mb-0">
                Pantau kesiapan kasir, isi keranjang, pembayaran, dan transaksi
                yang sedang diproses.
              </p>
            </div>
          </div>
          <Badge bg={connected ? "success" : "secondary"} className="px-3 py-2">
            <span
              className={`d-inline-block rounded-circle me-2 bg-${connected ? "white" : "light"}`}
              style={{ width: 8, height: 8 }}
            />
            {connected ? "Live terhubung" : "Menghubungkan live data"}
          </Badge>
        </Card.Body>
      </Card>

      <Row className="row-cols-xxl-4 row-cols-md-2 row-cols-1">
        <Col>
          <KartuRingkasanLive
            icon="solar:monitor-smartphone-bold-duotone"
            color="primary"
            label="Kasir online"
            value={onlineCount}
            note={`${workstations.length} terminal terpantau`}
          />
        </Col>
        <Col>
          <KartuRingkasanLive
            icon="solar:check-circle-bold-duotone"
            color="success"
            label="Siap melayani"
            value={readyCount}
            note="Menunggu pelanggan"
          />
        </Col>
        <Col>
          <KartuRingkasanLive
            icon="solar:cart-check-bold-duotone"
            color="warning"
            label="Sedang transaksi"
            value={running}
            note="Keranjang atau pembayaran"
          />
        </Col>
        <Col>
          <KartuRingkasanLive
            icon="solar:wallet-money-bold-duotone"
            color="info"
            label="Nilai keranjang live"
            value={formatRupiah(liveValue)}
            note="Belum masuk omzet"
          />
        </Col>
      </Row>

      <div className="d-flex align-items-center justify-content-between mb-2">
        <div>
          <h4 className="mb-1">Aktivitas kasir</h4>
          <p className="text-muted mb-0">
            Perubahan dari POS masuk otomatis setiap beberapa detik.
          </p>
        </div>
        {snapshot.generated_at ? (
          <small className="text-muted">
            Update {waktu.format(new Date(snapshot.generated_at))}
          </small>
        ) : null}
      </div>
      <Row className="g-3 mb-3">
        {workstations.map((session) => (
          <Col xxl={4} lg={6} key={session.id}>
            <KartuKasirLive
              session={session}
              generatedAt={snapshot.generated_at}
            />
          </Col>
        ))}
      </Row>
      {!workstations.length ? (
        <Card className="mb-3">
          <Card.Body>
            <PesanKosong
              icon="solar:monitor-camera-bold-duotone"
              title="Belum ada kasir yang terhubung"
              copy="Buka halaman POS. Terminal akan muncul otomatis setelah heartbeat pertama diterima."
            />
          </Card.Body>
        </Card>
      ) : null}

      <Card>
        <Card.Header className="d-flex align-items-center justify-content-between">
          <div>
            <h4 className="mb-1">Aktivitas terbaru</h4>
            <p className="text-muted mb-0">
              Transaksi selesai, ditahan, atau dibatalkan dalam 15 menit
              terakhir.
            </p>
          </div>
          <Badge bg="light" text="dark">
            {recentSessions.length} aktivitas
          </Badge>
        </Card.Header>
        {recentSessions.length ? (
          <div className="table-responsive">
            <Table className="table-custom table-centered table-nowrap table-hover mb-0">
              <thead>
                <tr>
                  <th>Kasir</th>
                  <th>Transaksi</th>
                  <th>Status</th>
                  <th>Item</th>
                  <th>Metode</th>
                  <th className="text-end">Nilai</th>
                  <th>Waktu</th>
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((session) => (
                  <tr key={session.id}>
                    <td>
                      <strong className="d-block">
                        {session.cashier_name}
                      </strong>
                      <small className="text-muted">
                        {session.cashier_code}
                      </small>
                    </td>
                    <td>
                      <strong>
                        {session.transaction_no || "Belum tersimpan"}
                      </strong>
                    </td>
                    <td>
                      <Badge bg={warnaStatus(session)}>
                        {namaStatus[session.status]}
                      </Badge>
                    </td>
                    <td>{angka.format(session.item_count)} item</td>
                    <td>
                      {session.payment_method
                        ? namaPembayaran[session.payment_method]
                        : "—"}
                    </td>
                    <td className="text-end">
                      <strong>{formatRupiah(session.total)}</strong>
                    </td>
                    <td>{waktuSinyal(session, snapshot.generated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <Card.Body>
            <PesanKosong
              icon="solar:history-bold-duotone"
              title="Belum ada aktivitas terbaru"
              copy="Transaksi yang selesai, di-hold, atau dibatalkan akan tampil di sini."
            />
          </Card.Body>
        )}
      </Card>
    </>
  );
}

function KartuRingkasanLive({
  icon,
  color,
  label,
  value,
  note,
}: {
  icon: string;
  color: string;
  label: string;
  value: string | number;
  note: string;
}) {
  return (
    <Card>
      <Card.Body className="d-flex align-items-center gap-3">
        <span
          className={`avatar-lg rounded bg-${color}-subtle text-${color} d-flex align-items-center justify-content-center`}
        >
          <Icon icon={icon} width={28} />
        </span>
        <div>
          <p className="text-muted mb-1">{label}</p>
          <h3 className="mb-1">{value}</h3>
          <small className="text-muted">{note}</small>
        </div>
      </Card.Body>
    </Card>
  );
}

function KartuKasirLive({
  session,
  generatedAt,
}: {
  session: LiveTransaction;
  generatedAt: string;
}) {
  const visibleStatus = session.online
    ? namaStatus[session.status]
    : "Offline";
  const progress = session.online ? session.progress : 0;
  const progressVariant = warnaStatus(session);
  return (
    <Card className="h-100">
      <Card.Header className="d-flex align-items-center justify-content-between gap-2">
        <div className="d-flex align-items-center gap-2">
          <span className="avatar-md rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold">
            {session.cashier_name.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <h5 className="mb-0">{session.cashier_name}</h5>
            <small className="text-muted">
              {session.cashier_code} · {session.store_name}
            </small>
          </div>
        </div>
        <Badge bg={progressVariant}>{visibleStatus}</Badge>
      </Card.Header>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-semibold">Progress transaksi</span>
          <strong>{progress}%</strong>
        </div>
        <ProgressBar
          now={progress}
          variant={progressVariant}
          className="progress-soft mb-3"
          animated={session.online && session.status === "processing"}
        />
        <div className="alert alert-light border d-flex align-items-center gap-2 py-2 mb-3">
          <Icon
            icon={
              session.service_ready
                ? "solar:check-circle-bold-duotone"
                : "solar:bolt-circle-bold-duotone"
            }
            width={20}
            className={session.service_ready ? "text-success" : "text-primary"}
          />
          <div>
            <small className="text-muted d-block">Aktivitas sekarang</small>
            <strong>
              {session.online
                ? session.current_action
                : "Terminal tidak mengirim heartbeat"}
            </strong>
          </div>
        </div>
        <Row className="g-2 text-center mb-3">
          <Col>
            <div className="border rounded p-2">
              <small className="text-muted d-block">Item</small>
              <strong>{session.item_count}</strong>
            </div>
          </Col>
          <Col>
            <div className="border rounded p-2">
              <small className="text-muted d-block">Produk</small>
              <strong>{session.unique_products}</strong>
            </div>
          </Col>
          <Col>
            <div className="border rounded p-2">
              <small className="text-muted d-block">Total</small>
              <strong>{formatRupiah(session.total)}</strong>
            </div>
          </Col>
        </Row>
        {session.items.length ? (
          <div className="d-flex flex-column gap-2">
            {session.items.slice(0, 3).map((item) => (
              <div
                className="d-flex align-items-center gap-2"
                key={item.barcode}
              >
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    width={36}
                    height={36}
                    alt={item.name}
                    className="rounded object-fit-contain bg-light"
                  />
                ) : (
                  <span className="avatar-sm rounded bg-light text-muted d-flex align-items-center justify-content-center">
                    <Icon icon="solar:box-minimalistic-linear" width={18} />
                  </span>
                )}
                <div className="flex-grow-1 overflow-hidden">
                  <strong className="d-block text-truncate fs-13">
                    {item.name}
                  </strong>
                  <small className="text-muted">
                    {item.quantity} × {formatRupiah(item.unit_price)}
                  </small>
                </div>
                <strong className="fs-13">{formatRupiah(item.subtotal)}</strong>
              </div>
            ))}
            {session.items.length > 3 ? (
              <small className="text-muted">
                +{session.items.length - 3} produk lainnya
              </small>
            ) : null}
          </div>
        ) : (
          <div className="text-center text-muted py-2">
            Keranjang kosong, kasir siap menerima pelanggan.
          </div>
        )}
      </Card.Body>
      <Card.Footer className="d-flex justify-content-between">
        <span>
          <Icon icon="solar:user-heart-linear" width={16} className="me-1" />
          {session.member_name || "Pelanggan umum"}
        </span>
        <span className="text-muted">
          <Icon
            icon="solar:refresh-circle-linear"
            width={16}
            className="me-1"
          />
          {waktuSinyal(session, generatedAt)}
        </span>
      </Card.Footer>
    </Card>
  );
}
