"use client";

// Pengelolaan semua perangkat Authenticator milik admin yang sedang login.

import { Icon } from "@iconify/react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Alert, Badge, Button, Card, Form, Spinner } from "react-bootstrap";

import {
  confirmAuthenticatorDevice,
  createAuthenticatorDevice,
  deleteAuthenticatorDevice,
  loadAuthenticatorDevices,
  type AuthenticatorDevice,
  type AuthenticatorSetup,
} from "../api";

const dateTime = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default function PerangkatAuthenticator() {
  const [devices, setDevices] = useState<AuthenticatorDevice[]>([]);
  const [setup, setSetup] = useState<AuthenticatorSetup | null>(null);
  const [deviceName, setDeviceName] = useState("");
  const [currentCode, setCurrentCode] = useState("");
  const [newCode, setNewCode] = useState("");
  const [working, setWorking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const activeCount = useMemo(
    () => devices.filter((device) => device.is_active).length,
    [devices],
  );

  const refresh = useCallback(async () => {
    try {
      setDevices(await loadAuthenticatorDevices());
      setError("");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Perangkat Authenticator gagal dimuat",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => void refresh());
    return () => window.cancelAnimationFrame(frame);
  }, [refresh]);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(""), 3000);
    return () => window.clearTimeout(timer);
  }, [message]);

  async function startSetup(event: FormEvent) {
    event.preventDefault();
    setWorking(true);
    setError("");
    try {
      const result = await createAuthenticatorDevice(
        deviceName.trim(),
        currentCode,
      );
      setSetup(result);
      setCurrentCode("");
      setNewCode("");
      await refresh();
      setMessage("QR Authenticator baru dibuat");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Perangkat Authenticator gagal dibuat",
      );
    } finally {
      setWorking(false);
    }
  }

  async function activateSetup(event: FormEvent) {
    event.preventDefault();
    if (!setup) return;
    setWorking(true);
    setError("");
    try {
      await confirmAuthenticatorDevice(setup.id, newCode);
      setSetup(null);
      setDeviceName("");
      setNewCode("");
      await refresh();
      setMessage("Perangkat Authenticator berhasil diaktifkan");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Kode Authenticator gagal diverifikasi",
      );
    } finally {
      setWorking(false);
    }
  }

  async function removeDevice(device: AuthenticatorDevice) {
    if (
      device.is_active &&
      !window.confirm(`Cabut perangkat Authenticator “${device.name}”?`)
    ) {
      return;
    }
    setWorking(true);
    setError("");
    try {
      await deleteAuthenticatorDevice(device.id);
      if (setup?.id === device.id) {
        setSetup(null);
        setNewCode("");
      }
      await refresh();
      setMessage(
        device.is_active
          ? "Perangkat Authenticator dicabut"
          : "Setup Authenticator dibatalkan",
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Perangkat Authenticator gagal dihapus",
      );
    } finally {
      setWorking(false);
    }
  }

  return (
    <Card className="h-100">
      <Card.Header>
        <h5 className="mb-1">Perangkat Authenticator</h5>
        <p className="text-muted mb-0">
          Tambahkan Google atau Microsoft Authenticator tanpa batas perangkat.
        </p>
      </Card.Header>
      <Card.Body>
        {error ? <Alert variant="danger">{error}</Alert> : null}
        {message ? <Alert variant="success">{message}</Alert> : null}

        {setup ? (
          <div className="d-flex flex-column gap-3">
            <Alert variant="info" className="mb-0">
              Pindai QR untuk <strong>{setup.name}</strong>, lalu masukkan kode
              6 digit yang muncul.
            </Alert>
            <div className="text-center">
              <div className="d-inline-block bg-white border rounded p-3">
                <QRCodeSVG
                  value={setup.provisioning_uri}
                  size={180}
                  level="M"
                  aria-label="QR perangkat Authenticator baru"
                />
              </div>
            </div>
            <details>
              <summary className="text-primary">Gunakan kunci manual</summary>
              <code className="d-block text-break mt-2">
                {setup.totp_secret}
              </code>
            </details>
            <Form onSubmit={activateSetup} className="d-flex flex-column gap-2">
              <Form.Control
                inputMode="numeric"
                autoComplete="one-time-code"
                aria-label="Kode perangkat Authenticator baru"
                placeholder="Kode 6 digit"
                value={newCode}
                onChange={(event) =>
                  setNewCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                pattern="\d{6}"
                required
              />
              <Button type="submit" disabled={working || newCode.length !== 6}>
                <Icon icon="solar:shield-check-linear" className="me-1" />
                Aktifkan perangkat
              </Button>
              <Button
                type="button"
                variant="outline-secondary"
                disabled={working}
                onClick={() => void removeDevice(setup)}
              >
                Batalkan
              </Button>
            </Form>
          </div>
        ) : (
          <Form onSubmit={startSetup} className="d-flex flex-column gap-2">
            <Form.Control
              placeholder="Nama perangkat, contoh HP kantor"
              value={deviceName}
              maxLength={80}
              minLength={2}
              onChange={(event) => setDeviceName(event.target.value)}
              required
            />
            {activeCount ? (
              <Form.Control
                inputMode="numeric"
                autoComplete="one-time-code"
                aria-label="Kode Authenticator aktif"
                placeholder="Kode 6 digit dari perangkat aktif"
                value={currentCode}
                onChange={(event) =>
                  setCurrentCode(
                    event.target.value.replace(/\D/g, "").slice(0, 6),
                  )
                }
                pattern="\d{6}"
                required
              />
            ) : null}
            <Button
              type="submit"
              disabled={working || Boolean(activeCount && currentCode.length !== 6)}
            >
              <Icon icon="solar:add-circle-linear" className="me-1" />
              Tambah perangkat
            </Button>
          </Form>
        )}

        <hr />
        {loading ? (
          <div className="text-center py-3">
            <Spinner size="sm" />
          </div>
        ) : devices.length ? (
          <div className="d-flex flex-column gap-2">
            {devices.map((device) => {
              const lastActive = device.is_active && activeCount <= 1;
              return (
                <div
                  key={device.id}
                  className="border rounded p-2 d-flex align-items-center justify-content-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="d-flex align-items-center gap-2">
                      <Icon icon="solar:smartphone-2-linear" />
                      <strong className="text-truncate">{device.name}</strong>
                      <Badge bg={device.is_active ? "success" : "warning"}>
                        {device.is_active ? "Aktif" : "Belum aktif"}
                      </Badge>
                    </div>
                    <small className="text-muted d-block mt-1">
                      {device.last_used_at
                        ? `Terakhir dipakai ${dateTime.format(new Date(device.last_used_at))}`
                        : device.enrolled_at
                          ? `Aktif sejak ${dateTime.format(new Date(device.enrolled_at))}`
                          : "QR belum dikonfirmasi"}
                    </small>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline-danger"
                    disabled={working || lastActive}
                    title={
                      lastActive
                        ? "Tambahkan perangkat aktif lain sebelum mencabut perangkat terakhir"
                        : "Cabut perangkat"
                    }
                    onClick={() => void removeDevice(device)}
                  >
                    <Icon icon="solar:trash-bin-trash-linear" />
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted mb-0">
            Belum ada perangkat Authenticator pada akun ini.
          </p>
        )}
      </Card.Body>
    </Card>
  );
}
