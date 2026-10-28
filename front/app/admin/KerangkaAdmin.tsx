"use client";

// Kerangka yang sama untuk semua menu admin: sidebar, header, dan area konten.
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Card, Col, Dropdown, Modal, Row } from "react-bootstrap";
import SimpleBar from "simplebar-react";
import { logoutAccount } from "../api";

type MenuSamping = {
  id: string;
  label: string;
  icon: string;
};

type PropertiKerangkaAdmin = {
  children: ReactNode;
  title: string;
  navigation: MenuSamping[];
  activeView: string;
  fullName?: string;
  roleName?: string;
  employeeCode?: string;
  lowStockCount?: number;
  showCeoCopilot?: boolean;
  showPos?: boolean;
  onView: (view: string) => void;
};

function KotakLogo() {
  return (
    <Link href="/admin" className="logo">
      <span className="logo-light">
        <span className="logo-lg">
          <Image
            width={97}
            height={68}
            src="/logo-app.png"
            alt="MYMARKET"
            className="app-brand-logo"
            priority
          />
        </span>
        <span className="logo-sm">
          <Image
            width={54}
            height={38}
            src="/logo-app.png"
            alt="MYMARKET"
            className="app-brand-logo"
            priority
          />
        </span>
      </span>
      <span className="logo-dark">
        <span className="logo-lg">
          <Image
            width={97}
            height={68}
            src="/logo-app.png"
            alt="MYMARKET"
            className="app-brand-logo"
            priority
          />
        </span>
        <span className="logo-sm">
          <Image
            width={54}
            height={38}
            src="/logo-app.png"
            alt="MYMARKET"
            className="app-brand-logo"
            priority
          />
        </span>
      </span>
    </Link>
  );
}

export default function KerangkaAdmin({
  children,
  title,
  navigation,
  activeView,
  fullName = "Admin MYMARKET",
  roleName = "Operasional toko",
  employeeCode = "Admin",
  lowStockCount = 0,
  showCeoCopilot = false,
  showPos = false,
  onView,
}: PropertiKerangkaAdmin) {
  const topbarRef = useRef<HTMLElement | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const handleScroll = () =>
      topbarRef.current?.classList.toggle(
        "topbar-active",
        window.scrollY > 100,
      );
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const searchResults = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("id-ID");
    return query
      ? navigation.filter((item) =>
          item.label.toLocaleLowerCase("id-ID").includes(query),
        )
      : navigation;
  }, [navigation, search]);

  function toggleSidebar() {
    const root = document.documentElement;
    if (window.innerWidth < 768) {
      root.classList.toggle("sidebar-enable");
      return;
    }
    root.dataset.sidenavSize =
      root.dataset.sidenavSize === "condensed" ? "default" : "condensed";
  }

  function toggleSidebarHover() {
    const root = document.documentElement;
    root.dataset.sidenavSize =
      root.dataset.sidenavSize === "sm-hover" ? "sm-hover-active" : "sm-hover";
  }

  function toggleTheme() {
    const nextDarkMode = !darkMode;
    setDarkMode(nextDarkMode);
    document.documentElement.dataset.bsTheme = nextDarkMode ? "dark" : "light";
  }

  function toggleMenuColor() {
    const root = document.documentElement;
    root.dataset.menuColor =
      root.dataset.menuColor === "dark" ? "light" : "dark";
  }

  function selectView(view: string) {
    onView(view);
    setSearchOpen(false);
    setSearch("");
  }

  function clearAccount() {
    void logoutAccount().catch(() => undefined);
    window.localStorage.removeItem("mymarket_token");
    window.localStorage.removeItem("mymarket_user");
  }

  return (
    <div className="wrapper">
      <header ref={topbarRef} className="app-topbar" id="header">
        <div className="page-container topbar-menu">
          <div className="d-flex align-items-center gap-2">
            <KotakLogo />
            <button
              onClick={toggleSidebar}
              className="sidenav-toggle-button px-2"
              type="button"
              aria-label="Buka atau ringkas menu"
            >
              <Icon icon="ri:menu-5-line" className="fs-24" />
            </button>
            <div className="topbar-item d-none d-md-flex px-2">
              <h4 className="page-title fs-20 fw-semibold mb-0">{title}</h4>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <div className="topbar-item d-flex d-xl-none">
              <button
                className="topbar-link"
                onClick={() => setSearchOpen(true)}
                type="button"
                aria-label="Cari menu"
              >
                <Icon icon="ri:search-line" className="fs-22" />
              </button>
            </div>

            <div
              onClick={() => setSearchOpen(true)}
              className="topbar-search text-muted d-none d-xl-flex gap-2 me-2 align-items-center"
              role="button"
              tabIndex={0}
            >
              <Icon icon="ri:search-line" className="fs-18" />
              <span className="me-2">Cari menu...</span>
            </div>

            <div className="topbar-item">
              <Dropdown align="end">
                <Dropdown.Toggle
                  as="button"
                  className="topbar-link drop-arrow-none"
                  type="button"
                  aria-label="Notifikasi"
                >
                  <Icon
                    icon="ri:notification-snooze-line"
                    className="animate-ring fs-22"
                  />
                  {lowStockCount > 0 ? (
                    <span className="noti-icon-badge" />
                  ) : null}
                </Dropdown.Toggle>
                <Dropdown.Menu className="p-0 dropdown-menu-start dropdown-menu-lg">
                  <div className="p-3 border-bottom border-dashed">
                    <Row className="align-items-center">
                      <Col>
                        <h6 className="m-0 fs-16 fw-semibold">Notifikasi</h6>
                      </Col>
                    </Row>
                  </div>
                  <button
                    className="notification-item dropdown-item py-3 text-wrap"
                    type="button"
                    onClick={() => selectView("stock")}
                  >
                    <span className="d-flex align-items-center">
                      <span className="avatar-md flex-shrink-0 me-3">
                        <span className="avatar-title bg-warning-subtle text-warning rounded-circle fs-22">
                          <Icon icon="solar:box-bold-duotone" />
                        </span>
                      </span>
                      <span className="flex-grow-1 text-muted">
                        <span className="fw-medium text-body">
                          {lowStockCount} produk
                        </span>{" "}
                        perlu dicek stoknya.
                        <br />
                        <span className="fs-12">Data persediaan terbaru</span>
                      </span>
                    </span>
                  </button>
                </Dropdown.Menu>
              </Dropdown>
            </div>

            <div className="topbar-item d-none d-sm-flex">
              <Dropdown align="end">
                <Dropdown.Toggle
                  as="button"
                  className="topbar-link drop-arrow-none"
                  type="button"
                  aria-label="Aplikasi"
                >
                  <Icon icon="ri:apps-2-add-line" className="fs-22" />
                </Dropdown.Toggle>
                <Dropdown.Menu className="dropdown-menu-end dropdown-menu-lg p-0">
                  <div className="p-2">
                    <Row className="g-0">
                      {navigation.slice(0, 6).map((item) => (
                        <Col xs={4} key={item.id}>
                          <button
                            className="dropdown-icon-item border-0 bg-transparent w-100"
                            type="button"
                            onClick={() => selectView(item.id)}
                          >
                            <Icon icon={item.icon} width={24} height={24} />
                            <span>{item.label}</span>
                          </button>
                        </Col>
                      ))}
                    </Row>
                  </div>
                </Dropdown.Menu>
              </Dropdown>
            </div>

            <div className="topbar-item d-none d-sm-flex">
              <button
                onClick={toggleMenuColor}
                className="topbar-link"
                type="button"
                aria-label="Ubah warna sidebar"
              >
                <Icon icon="ri:settings-4-line" className="fs-22" />
              </button>
            </div>

            <div className="topbar-item d-none d-sm-flex">
              <button
                className="topbar-link"
                onClick={toggleTheme}
                id="light-dark-mode"
                type="button"
                aria-label="Ubah tema"
              >
                <Icon
                  icon={darkMode ? "ri:sun-line" : "ri:moon-line"}
                  width={22}
                  height={22}
                  className="fs-22"
                />
              </button>
            </div>

            <div className="topbar-item nav-user">
              <Dropdown align="end">
                <Dropdown.Toggle
                  className="topbar-link drop-arrow-none px-2"
                  type="button"
                >
                  <Image
                    src="/adminto/users/avatar-1.jpg"
                    width={32}
                    height={32}
                    className="rounded-circle me-lg-2 d-flex"
                    alt={fullName}
                  />
                  <span className="d-lg-flex flex-column gap-1 d-none">
                    <span className="nav-user-name">{fullName}</span>
                  </span>
                  <Icon
                    icon="ri:arrow-down-s-line"
                    className="d-none d-lg-block align-middle ms-1"
                  />
                </Dropdown.Toggle>
                <Dropdown.Menu className="dropdown-menu-end">
                  <Dropdown.Header className="noti-title">
                    <h6 className="text-overflow m-0">Selamat datang!</h6>
                  </Dropdown.Header>
                  <Dropdown.ItemText>
                    <Icon
                      icon="ri:account-circle-line"
                      className="me-1 fs-16 align-middle"
                    />{" "}
                    {fullName}
                  </Dropdown.ItemText>
                  <Dropdown.ItemText>
                    <Icon
                      icon="ri:shield-user-line"
                      className="me-1 fs-16 align-middle"
                    />{" "}
                    {roleName}
                  </Dropdown.ItemText>
                  <Dropdown.ItemText>
                    <Icon
                      icon="ri:id-card-line"
                      className="me-1 fs-16 align-middle"
                    />{" "}
                    {employeeCode}
                  </Dropdown.ItemText>
                  <div className="dropdown-divider" />
                  {showPos ? (
                    <Dropdown.Item as={Link} href="/pos">
                      <Icon
                        icon="ri:shopping-bag-3-line"
                        className="me-1 fs-16 align-middle"
                      />{" "}
                      Layar penjualan
                    </Dropdown.Item>
                  ) : null}
                  <Dropdown.Item as={Link} href="/login" onClick={clearAccount}>
                    <Icon
                      icon="ri:logout-box-r-line"
                      className="me-1 fs-16 align-middle"
                    />{" "}
                    Keluar akun
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </div>
      </header>

      <div className="sidenav-menu">
        <KotakLogo />
        <button
          onClick={toggleSidebarHover}
          className="button-sm-hover"
          type="button"
          aria-label="Mode sidebar hover"
        >
          <Icon
            icon="ri:record-circle-line"
            width={20}
            height={20}
            className="align-middle sm-hover-active"
          />
        </button>
        <button
          onClick={toggleSidebar}
          className="sidenav-toggle-button"
          type="button"
          aria-label="Buka atau ringkas menu"
        >
          <Icon icon="ri:menu-5-line" className="fs-20" />
        </button>

        <SimpleBar data-simplebar id="leftside-menu-container">
          <ul className="side-nav">
            <li className="side-nav-title">Menu operasional</li>
            {navigation.map((item) => (
              <li
                key={item.id}
                className={`side-nav-item ${activeView === item.id ? "active" : ""}`}
              >
                <button
                  className={`side-nav-link w-100 text-start border-0 bg-transparent ${activeView === item.id ? "active" : ""}`}
                  type="button"
                  onClick={() => selectView(item.id)}
                >
                  <span className="menu-icon">
                    <Icon icon={item.icon} />
                  </span>
                  <span className="menu-text">{item.label}</span>
                  {item.id === "stock" && lowStockCount > 0 ? (
                    <span className="badge rounded-pill text-end bg-danger">
                      {lowStockCount}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
            {showCeoCopilot ? (
              <>
                <li className="side-nav-title mt-2">AI Assistant</li>
                <li className="side-nav-item">
                  <Link className="side-nav-link" href="/ceo-chat">
                    <span className="menu-icon">
                      <Icon icon="solar:magic-stick-3-bold-duotone" />
                    </span>
                    <span className="menu-text">CEO Copilot</span>
                    <span className="badge rounded-pill text-end bg-primary">
                      Baru
                    </span>
                  </Link>
                </li>
              </>
            ) : null}
          </ul>

          <div className="clearfix" />
        </SimpleBar>
      </div>

      <div className="page-content">
        <div className="page-container">{children}</div>
        <footer className="footer">
          <div className="page-container">
            <Row>
              <Col md={6} className="text-center text-md-start">
                © {new Date().getFullYear()} MYMARKET - Powered by{" "}
                <span className="fw-bold text-decoration-underline text-uppercase text-reset fs-12">
                  Adminto
                </span>
              </Col>
              <Col md={6}>
                <div className="text-md-end footer-links d-none d-md-block">
                  <a
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      selectView("overview");
                    }}
                  >
                    Ringkasan
                  </a>
                  <a
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      selectView("reports");
                    }}
                  >
                    Laporan
                  </a>
                  <Link href="/">POS</Link>
                </div>
              </Col>
            </Row>
          </div>
        </footer>
      </div>

      <Modal
        show={searchOpen}
        onHide={() => setSearchOpen(false)}
        id="searchModal"
        centered
        size="lg"
      >
        <Modal.Body className="p-0">
          <Card className="mb-0">
            <div
              className="px-3 py-2 d-flex flex-row align-items-center"
              id="top-search"
            >
              <Icon icon="ri:search-line" className="fs-22" />
              <input
                autoFocus
                type="search"
                className="form-control border-0"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari menu admin..."
              />
              <button
                onClick={() => setSearchOpen(false)}
                type="button"
                className="btn p-0"
                aria-label="Tutup"
              >
                [esc]
              </button>
            </div>
            <div className="border-top p-2">
              {searchResults.map((item) => (
                <button
                  key={item.id}
                  className="dropdown-item rounded py-2"
                  type="button"
                  onClick={() => selectView(item.id)}
                >
                  <Icon icon={item.icon} className="me-2" />
                  {item.label}
                </button>
              ))}
            </div>
          </Card>
        </Modal.Body>
      </Modal>
    </div>
  );
}
