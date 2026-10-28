"use client";

// Form login akun, verifikasi Authenticator, dan pemulihan password.

import { Icon } from "@iconify/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useSyncExternalStore } from "react";
import { Alert, Button, Card, Form, Spinner } from "react-bootstrap";
import { QRCodeSVG } from "qrcode.react";

import {
  confirmTotpSetup,
  forgotPassword,
  loginAccount,
  resetPassword,
  verifyTotpLogin,
  type LoginResult,
} from "../api";
import { resolvePostLoginPath } from "../access";

type Mode = "login" | "totpSetup" | "totpVerify" | "forgot" | "reset";

function subscribeToLocationChange(callback: () => void) {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

function getLocationSearch() {
  return window.location.search;
}

function FormulirLogin() {
  const router = useRouter();
  const search = useSyncExternalStore(
    subscribeToLocationChange,
    getLocationSearch,
    () => "",
  );
  const params = new URLSearchParams(search);
  const queryToken = params.get("token") || "";
  const nextPath = params.get("next");
  const requestedPath =
    nextPath?.startsWith("/") && !nextPath.startsWith("//") ? nextPath : null;
  const [selectedMode, setMode] = useState<Mode | null>(null);
  const mode = selectedMode || (queryToken ? "reset" : "login");
  const [identity, setIdentity] = useState("admin@gmail.com");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [manualToken, setToken] = useState("");
  const token = manualToken || queryToken;
  const [challengeToken, setChallengeToken] = useState("");
  const [provisioningUri, setProvisioningUri] = useState("");
  const [totpSecret, setTotpSecret] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);

  // Simpan sesi, lalu arahkan pengguna sesuai permission (admin, gudang, kasir).
  function finishLogin(result: LoginResult) {
    if (!result.access_token) throw new Error("Token login tidak diterbitkan");
    window.localStorage.setItem("mymarket_token", result.access_token);
    window.localStorage.setItem(
      "mymarket_user",
      JSON.stringify({
        employee_code: result.employee_code,
        full_name: result.full_name,
        role_name: result.role_name,
        permissions: result.permissions,
        expires_at: result.expires_at,
      }),
    );
    router.replace(resolvePostLoginPath(result.permissions, requestedPath));
  }

  function beginTotp(result: LoginResult) {
    if (!result.challenge_token) throw new Error("Sesi Authenticator tidak tersedia");
    setChallengeToken(result.challenge_token);
    setProvisioningUri(result.provisioning_uri || "");
    setTotpSecret(result.totp_secret || "");
    setTotpCode("");
    setMode(
      result.status === "totp_setup_required" ? "totpSetup" : "totpVerify",
    );
  }

  // Formulir ini juga menangani langkah Authenticator bila diminta oleh API.
  async function submit(event: FormEvent) {
    event.preventDefault();
    setWorking(true);
    setError("");
    setMessage("");
    try {
      if (mode === "login") {
        const result = await loginAccount(identity, password);
        if (result.status === "authenticated") finishLogin(result);
        else beginTotp(result);
      } else if (mode === "totpSetup") {
        finishLogin(await confirmTotpSetup(challengeToken, totpCode));
      } else if (mode === "totpVerify") {
        finishLogin(await verifyTotpLogin(challengeToken, totpCode));
      } else if (mode === "forgot") {
        const result = await forgotPassword(email);
        setMessage(result.message);
        if (result.reset_token) {
          setToken(result.reset_token);
          setMode("reset");
        }
      } else {
        await resetPassword(token, password);
        setMessage("Password baru sudah aktif. Silakan masuk.");
        setMode("login");
        setPassword("");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Proses akun gagal");
    } finally {
      setWorking(false);
    }
  }

  const totpMode = mode === "totpSetup" || mode === "totpVerify";
  const title =
    mode === "totpSetup"
      ? "Hubungkan Authenticator"
      : mode === "totpVerify"
        ? "Verifikasi Authenticator"
        : "Selamat datang";
  const subtitle =
    mode === "totpSetup"
      ? "Pindai QR sebelum akun admin dapat digunakan."
      : mode === "totpVerify"
        ? "Masukkan kode 6 digit dari aplikasi Authenticator."
        : "Masuk ke akun MYMARKET untuk mulai kerja.";

  return (
    <div className="auth-bg d-flex min-vh-100 align-items-center justify-content-center p-3">
      <Card
        className="auth-box overflow-hidden mb-0"
        style={{ width: 460, maxWidth: "100%" }}
      >
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <Image
              src="/logo-app.png"
              width={172}
              height={120}
              alt="MYMARKET"
              className="auth-brand-logo"
              priority
            />
            <h3 className="mt-4 mb-1">{title}</h3>
            <p className="text-muted mb-0">{subtitle}</p>
          </div>

          {error ? <Alert variant="danger">{error}</Alert> : null}
          {message ? <Alert variant="success">{message}</Alert> : null}

          {mode === "totpSetup" && provisioningUri ? (
            <div className="text-center mb-4">
              <div
                className="d-inline-flex rounded-3 border bg-white p-3"
                aria-label="QR setup Authenticator"
              >
                <QRCodeSVG
                  value={provisioningUri}
                  size={220}
                  level="M"
                  title="QR setup Authenticator MYMARKET"
                />
              </div>
              <ol className="text-start text-muted small mt-3 mb-2">
                <li>Buka Google Authenticator atau Microsoft Authenticator.</li>
                <li>Pilih tambah akun, lalu pindai QR di atas.</li>
                <li>Masukkan kode 6 digit untuk mengaktifkan perangkat.</li>
              </ol>
              <details className="small text-muted">
                <summary>Gunakan kunci manual</summary>
                <code className="d-block text-break mt-2">{totpSecret}</code>
              </details>
            </div>
          ) : null}

          <Form onSubmit={submit} className="d-flex flex-column gap-3">
            {mode === "login" ? (
              <Form.Group controlId="login-identity">
                <Form.Label>Kode pegawai atau email</Form.Label>
                <Form.Control
                  autoFocus
                  value={identity}
                  onChange={(event) => setIdentity(event.target.value)}
                  placeholder="admin@gmail.com"
                  autoComplete="username"
                  required
                />
              </Form.Group>
            ) : null}

            {mode === "forgot" ? (
              <Form.Group controlId="forgot-email">
                <Form.Label>Email akun</Form.Label>
                <Form.Control
                  autoFocus
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="nama@mymarket.id"
                  required
                />
              </Form.Group>
            ) : null}

            {mode === "reset" ? (
              <Form.Group controlId="reset-token">
                <Form.Label>Token reset</Form.Label>
                <Form.Control
                  value={token}
                  onChange={(event) => setToken(event.target.value)}
                  required
                />
              </Form.Group>
            ) : null}

            {mode === "login" || mode === "reset" ? (
              <Form.Group controlId="account-password">
                <Form.Label>
                  {mode === "reset" ? "Password baru" : "Password"}
                </Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={mode === "reset" ? 8 : 6}
                  autoComplete={
                    mode === "reset" ? "new-password" : "current-password"
                  }
                  required
                />
              </Form.Group>
            ) : null}

            {totpMode ? (
              <Form.Group controlId="totp-code">
                <Form.Label>Kode Authenticator</Form.Label>
                <Form.Control
                  autoFocus={mode === "totpVerify"}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={totpCode}
                  onChange={(event) => {
                    setTotpCode(event.target.value.replace(/\D/g, "").slice(0, 6));
                    setError("");
                  }}
                  placeholder="000000"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  className="text-center fs-3 fw-semibold tracking-wide"
                  required
                />
              </Form.Group>
            ) : null}

            <Button size="lg" type="submit" disabled={working}>
              {working ? (
                <Spinner size="sm" className="me-2" />
              ) : (
                <Icon
                  icon={
                    totpMode
                      ? "solar:shield-check-linear"
                      : mode === "login"
                        ? "solar:login-3-linear"
                        : "solar:key-linear"
                  }
                  className="me-2"
                />
              )}
              {mode === "login"
                ? "Lanjutkan"
                : mode === "totpSetup"
                  ? "Aktifkan & masuk"
                  : mode === "totpVerify"
                    ? "Verifikasi & masuk"
                    : mode === "forgot"
                      ? "Buat link reset"
                      : "Ganti password"}
            </Button>

            {totpMode ? (
              <Button
                variant="link"
                type="button"
                className="text-muted"
                onClick={() => {
                  setMode("login");
                  setChallengeToken("");
                  setProvisioningUri("");
                  setTotpSecret("");
                  setTotpCode("");
                  setError("");
                }}
              >
                Kembali ke login
              </Button>
            ) : null}
          </Form>

        </Card.Body>
      </Card>
    </div>
  );
}

export default function HalamanLogin() {
  return <FormulirLogin />;
}
