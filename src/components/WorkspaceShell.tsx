import React, { useState } from 'react';
import {
  BarChart3,
  BookOpen,
  Check,
  ChevronDown,
  Cloud,
  CloudOff,
  FileSpreadsheet,
  FileText,
  Home,
  ListChecks,
  Lock,
  LogOut,
  Menu,
  Moon,
  Plus,
  RefreshCw,
  RotateCcw,
  Scale,
  Search,
  Settings,
  Sun,
  Unlock,
  Users,
  X,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { DivisionSquare } from './Ui';

const PAGE_TITLES: Record<string, string> = {
  pemuka: 'Dashboard',
  guru: 'Guru & Staf',
  analisis: 'Analisis Beban',
  rumusan: 'Rumusan',
  laporan: 'Laporan Penuh',
  buku: 'Buku Pengurusan',
  surat: 'Surat Lantikan',
  tetapan: 'Tetapan',
};

export const WorkspaceShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    store,
    session,
    analysis,
    currentUser,
    isAdmin,
    fullAccess,
    toggleFullAccess,
    unlockEverything,
    route,
    navigate,
    darkMode,
    toggleDarkMode,
    setSearchOpen,
    setQuickInsertOpen,
    switchSession,
    switchUser,
    toggleLockSession,
    resetDemoData,
    cloudUser,
    syncStatus,
    lastSyncedAt,
    loginCloud,
    logoutCloud,
    forcePushToCloud,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeDivision =
    route.page === 'bahagian'
      ? analysis.senaraiBahagian.find((b) => b.id === route.bahagianId)?.bahagian.nama || 'Bahagian'
      : PAGE_TITLES[route.page] || '';

  const sessionsList = Object.values(store.sesi).map((s) => s.tahun);

  const navLinkClass = (active: boolean) =>
    `group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13.5px] font-medium transition-all duration-150 whitespace-nowrap ${
      active
        ? 'bg-[var(--brand-soft)] font-semibold text-[var(--brand-text)] shadow-xs ring-1 ring-[var(--brand)]/15'
        : 'text-[var(--ink-2)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]'
    }`;

  const go = (next: typeof route) => {
    navigate(next);
    setMobileMenuOpen(false);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[var(--surface)] text-[var(--ink)]">
      {/* Brand */}
      <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3.5">
        <button
          type="button"
          onClick={() => go({ page: 'pemuka' })}
          className="inline-flex items-center gap-2.5 text-base font-extrabold tracking-tight text-[var(--ink)] whitespace-nowrap"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand)] to-[var(--brand-2)] text-white shadow-sm shadow-[var(--brand)]/25">
            <Scale className="h-4 w-4" />
          </span>
          <span>Takwim Persekolahan</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Tutup menu"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-3)] hover:bg-[var(--surface-3)] lg:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* School + Session Selector */}
      <div className="border-b border-[var(--line)] bg-[var(--surface-2)]/45 px-4 py-3">
        <div className="truncate text-xs font-bold text-[var(--ink)]">{store.sekolah.nama}</div>
        <div className="relative mt-2">
          <select
            aria-label="Pilih Sesi"
            value={session.tahun.id}
            onChange={(e) => switchSession(e.target.value)}
            className="h-8 w-full appearance-none rounded-lg border border-[var(--line-2)] bg-[var(--surface)] pr-7 pl-2.5 text-xs font-semibold text-[var(--ink)] shadow-2xs transition-colors focus:border-[var(--brand)] focus:outline-none"
          >
            {sessionsList.map((t) => (
              <option key={t.id} value={t.id}>
                Sesi {t.label}
                {t.kunci ? ' (Dikunci)' : ''}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute top-2 right-2 h-4 w-4 text-[var(--ink-3)]" />
        </div>
      </div>

      {/* Nav Links */}
      <nav aria-label="Menu utama" className="custom-scroll flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
        <button type="button" onClick={() => go({ page: 'pemuka' })} className={navLinkClass(route.page === 'pemuka')}>
          <Home className="h-4 w-4 shrink-0" />
          <span>Dashboard</span>
        </button>
        <button type="button" onClick={() => go({ page: 'guru' })} className={navLinkClass(route.page === 'guru')}>
          <Users className="h-4 w-4 shrink-0" />
          <span className="flex-1 truncate">Guru &amp; Staf</span>
          <span className="font-mono-num text-[11px] font-semibold text-[var(--ink-3)]">{session.guru.length}</span>
        </button>

        <div className="pt-4 pb-1 px-3 flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider text-[var(--ink-3)] uppercase">
            Agihan tugas
          </span>
          <button
            type="button"
            onClick={() => {
              setQuickInsertOpen(true);
              setMobileMenuOpen(false);
            }}
            title="Tambah bahagian / jawatankuasa"
            className="inline-flex h-5 w-5 items-center justify-center rounded-md text-[var(--ink-3)] transition-colors hover:bg-[var(--surface-3)] hover:text-[var(--ink)]"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        {analysis.senaraiBahagian.map((b, idx) => {
          const active = route.page === 'bahagian' && route.bahagianId === b.id;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => go({ page: 'bahagian', bahagianId: b.id })}
              className={navLinkClass(active)}
            >
              <DivisionSquare index={idx} />
              <span className="flex-1 truncate">{b.bahagian.nama}</span>
              {b.siap ? (
                <Check className="h-3.5 w-3.5 shrink-0 text-[var(--baik)]" aria-label="Siap" />
              ) : b.bilKosong > 0 ? (
                <span
                  title={`${b.bilKosong} jawatan belum diisi`}
                  className="font-mono-num text-[11px] font-semibold text-[var(--amaran)]"
                >
                  {b.bilKosong}
                </span>
              ) : null}
            </button>
          );
        })}

        <div className="pt-4 pb-1 px-3 text-[11px] font-bold tracking-wider text-[var(--ink-3)] uppercase">
          Semakan &amp; Cetakan
        </div>
        <button
          type="button"
          onClick={() => go({ page: 'analisis' })}
          className={navLinkClass(route.page === 'analisis')}
        >
          <BarChart3 className="h-4 w-4 shrink-0" />
          <span>Analisis Beban</span>
        </button>
        <button
          type="button"
          onClick={() => go({ page: 'rumusan' })}
          className={navLinkClass(route.page === 'rumusan')}
        >
          <ListChecks className="h-4 w-4 shrink-0" />
          <span>Rumusan</span>
        </button>
        <button
          type="button"
          onClick={() => go({ page: 'laporan' })}
          className={navLinkClass(route.page === 'laporan')}
        >
          <FileSpreadsheet className="h-4 w-4 shrink-0" />
          <span>Laporan Penuh</span>
        </button>
        <button type="button" onClick={() => go({ page: 'buku' })} className={navLinkClass(route.page === 'buku')}>
          <BookOpen className="h-4 w-4 shrink-0" />
          <span>Buku Pengurusan</span>
        </button>
        <button type="button" onClick={() => go({ page: 'surat' })} className={navLinkClass(route.page === 'surat')}>
          <FileText className="h-4 w-4 shrink-0" />
          <span>Surat Lantikan</span>
        </button>
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--line)] p-3 space-y-2">
        <button
          type="button"
          onClick={() => go({ page: 'tetapan' })}
          className={navLinkClass(route.page === 'tetapan')}
        >
          <Settings className="h-4 w-4 shrink-0" />
          <span>Tetapan</span>
        </button>

        {/* Active User / Role Switcher */}
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/70 p-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-xs font-bold text-[var(--ink)]">{currentUser.nama}</div>
              <div className="truncate text-[11px] text-[var(--ink-3)]">
                {currentUser.peranan === 'admin'
                  ? 'Pentadbir Sekolah'
                  : currentUser.peranan === 'pentadbir'
                  ? 'Pentadbir Bahagian'
                  : 'Pemerhati'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => go({ page: 'utama' })}
              title="Kembali ke halaman utama"
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--ink-3)] transition-colors hover:bg-[var(--surface-3)] hover:text-[var(--ink)]"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
          <select
            aria-label="Tukar peranan demo"
            value={currentUser.id}
            onChange={(e) => switchUser(e.target.value)}
            className="mt-2 h-7 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-2 text-[11px] font-medium text-[var(--ink-2)] focus:border-[var(--brand)] focus:outline-none"
          >
            {store.pengguna.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nama} ({u.peranan === 'admin' ? 'Admin' : u.peranan === 'pentadbir' ? 'PK' : 'Pemerhati'})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="print-shell min-h-screen bg-[var(--bg)] text-[var(--ink)] lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      {/* Desktop Sidebar */}
      <aside className="no-print hidden border-r border-[var(--line)] lg:sticky lg:top-0 lg:block lg:h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="no-print fixed inset-0 z-40 flex lg:hidden">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative z-10 h-full w-[275px] max-w-[85vw] border-r border-[var(--line)] bg-[var(--surface)] shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Content Column */}
      <div className="print-main flex min-w-0 flex-col">
        {/* Top Bar */}
        <header className="no-print sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-[var(--line)] bg-[var(--surface)]/85 px-4 backdrop-blur-md sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Buka menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--line-2)] text-[var(--ink)] lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="flex min-w-0 items-center gap-2 text-xs sm:text-sm">
              <span className="hidden truncate text-[var(--ink-3)] sm:inline">{store.sekolah.nama}</span>
              <span className="hidden text-[var(--ink-3)] sm:inline">/</span>
              <span className="hidden whitespace-nowrap text-[var(--ink-3)] sm:inline">
                Sesi {session.tahun.label}
              </span>
              <span className="hidden text-[var(--ink-3)] sm:inline">/</span>
              <span className="truncate font-semibold text-[var(--ink)]">{activeDivision}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {cloudUser ? (
              <button
                type="button"
                onClick={() => void forcePushToCloud()}
                title={`Disambung sebagai ${cloudUser.email || cloudUser.displayName || 'Pengguna'}${
                  lastSyncedAt ? ` · Dikemas kini ${lastSyncedAt}` : ''
                }. Klik untuk segerak sekarang.`}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[var(--baik)]/30 bg-[var(--baik-soft)] px-3 text-xs font-semibold text-[var(--baik-ink)] transition-opacity hover:opacity-90 whitespace-nowrap shrink-0"
              >
                {syncStatus === 'syncing' || syncStatus === 'connecting' ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Cloud className="h-3.5 w-3.5" />
                )}
                <span className="hidden xl:inline">
                  {syncStatus === 'syncing'
                    ? 'Menyimpan…'
                    : syncStatus === 'error'
                    ? 'Ralat Segerak'
                    : 'Segerak Aktif'}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void loginCloud()}
                title="Log masuk Google untuk segerakkan data merentas semua peranti"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[var(--line-2)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--surface-2)] whitespace-nowrap shrink-0"
              >
                <CloudOff className="h-3.5 w-3.5 text-[var(--ink-3)]" />
                <span className="hidden xl:inline">Segerak Peranti</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setQuickInsertOpen(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[var(--brand)] px-3.5 text-xs font-semibold text-white shadow-xs shadow-[var(--brand)]/20 transition-all hover:bg-[var(--brand-2)] whitespace-nowrap shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tambah data</span>
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-[var(--line-2)] bg-[var(--surface-2)]/70 px-3 text-xs font-medium text-[var(--ink-2)] transition-colors hover:border-[var(--ink-3)] hover:bg-[var(--surface)] hover:text-[var(--ink)] whitespace-nowrap shrink-0"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cari guru…</span>
              <kbd className="hidden rounded-md border border-[var(--line-2)] bg-[var(--surface)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--ink-3)] md:inline">
                ⌘K
              </kbd>
            </button>
            <button
              type="button"
              onClick={toggleFullAccess}
              title={fullAccess ? 'Akses penuh dibuka (klik untuk uji kawalan peranan)' : 'Klik untuk buka semua ciri'}
              className={`inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                fullAccess
                  ? 'border-[var(--baik)]/30 bg-[var(--baik-soft)] text-[var(--baik-ink)]'
                  : 'border-[var(--amaran)]/40 bg-[var(--amaran-soft)] text-[var(--amaran-ink)]'
              }`}
            >
              {fullAccess ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
              <span className="hidden md:inline">{fullAccess ? 'Akses Penuh' : 'Buka Semua'}</span>
            </button>
            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label="Tukar tema warna"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--line-2)] bg-[var(--surface)] text-[var(--ink-2)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* Cloud Sync / Demo / Lock Banner */}
        <div className="no-print">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] bg-[var(--brand-soft)]/50 px-4 py-2 text-xs text-[var(--ink-2)] sm:px-6">
            <span>
              {cloudUser ? (
                <>
                  <strong className="text-[var(--brand-text)]">Segerak Awan Semua Peranti Aktif ({cloudUser.email}):</strong> Sebarang perubahan disimpan secara langsung ke awan{lastSyncedAt ? ` (terakhir ${lastSyncedAt})` : ''}.
                </>
              ) : (
                <>
                  <strong className="text-[var(--ink)]">Segerak Semua Peranti:</strong> Log masuk dengan akaun Google untuk menyegerakkan data sekolah secara langsung di komputer, tablet, dan telefon.
                </>
              )}
            </span>
            <div className="flex flex-wrap items-center gap-3">
              {cloudUser ? (
                <>
                  <button
                    type="button"
                    onClick={() => void forcePushToCloud()}
                    className="inline-flex items-center gap-1 font-semibold text-[var(--brand-text)] underline underline-offset-2 hover:opacity-80 whitespace-nowrap"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Segerak sekarang
                  </button>
                  <button
                    type="button"
                    onClick={() => void logoutCloud()}
                    className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:opacity-80 whitespace-nowrap"
                  >
                    Log keluar awan
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => void loginCloud()}
                  className="inline-flex items-center gap-1 font-bold text-[var(--brand-text)] underline underline-offset-2 hover:opacity-80 whitespace-nowrap"
                >
                  <Cloud className="h-3.5 w-3.5" />
                  Log masuk &amp; Segerak Semua Peranti
                </button>
              )}
              <button
                type="button"
                onClick={() => setQuickInsertOpen(true)}
                className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:opacity-80 whitespace-nowrap"
              >
                <Plus className="h-3 w-3" />
                Masukkan data baharu
              </button>
              <button
                type="button"
                onClick={resetDemoData}
                className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:opacity-80 whitespace-nowrap"
              >
                <RotateCcw className="h-3 w-3" />
                Pulih data demo
              </button>
            </div>
          </div>

          {session.tahun.kunci && !fullAccess && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] bg-[var(--amaran-soft)] px-4 py-2 text-xs text-[var(--amaran-ink)] sm:px-6">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Lock className="h-3.5 w-3.5" />
                Sesi {session.tahun.label} telah dikunci. Paparan sahaja.
              </span>
              <button
                type="button"
                onClick={() => {
                  if (isAdmin) toggleLockSession(session.tahun.id, false);
                  else unlockEverything();
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-[var(--amaran)]/40 bg-[var(--surface)] px-2.5 py-1 text-xs font-semibold text-[var(--ink)] hover:bg-[var(--surface-2)] whitespace-nowrap"
              >
                <Unlock className="h-3 w-3" />
                Buka kunci sesi
              </button>
            </div>
          )}
        </div>

        {/* Page Body */}
        <main className="print-main mx-auto w-full max-w-[1260px] flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
};
