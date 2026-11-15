import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  Cloud,
  Copy,
  FileText,
  Layers,
  ListChecks,
  Lock,
  Moon,
  Scale,
  Sun,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { TEMPLAT_JK } from '../lib/templat';

const DEMO_PREVIEW = [
  { name: 'Pn. Siti Aminah', pts: [3, 4.5, 3, 2.5], status: 'Berat', tone: 'berat' as const },
  { name: 'En. Mohd Faizal', pts: [2, 3, 3, 1.5], status: 'Berat', tone: 'berat' as const },
  { name: 'Pn. Chong Mei Ling', pts: [1, 3, 1.5, 1.5], status: 'Seimbang', tone: 'baik' as const },
  { name: 'En. Ravi a/l Chandran', pts: [1, 2, 2, 1.5], status: 'Seimbang', tone: 'baik' as const },
  { name: 'Cik Nurul Izzah', pts: [0, 2, 2.5, 1.5], status: 'Seimbang', tone: 'baik' as const },
  { name: 'En. Hafiz bin Othman', pts: [1, 1, 1, 2.5], status: 'Seimbang', tone: 'baik' as const },
  { name: 'Pn. Lina anak Entri', pts: [0, 1, 1, 1], status: 'Kurang', tone: 'kurang' as const },
  { name: 'En. Awang bin Damit', pts: [0, 1, 0, 1], status: 'Kurang', tone: 'kurang' as const },
];

const DIV_COLORS = ['var(--s1)', 'var(--s2)', 'var(--s3)', 'var(--s4)'];
const DIV_LABELS = ['Pentadbiran', 'Kurikulum', 'HEM', 'Kokurikulum'];

const STEPS = [
  {
    title: 'Masukkan senarai guru',
    desc: 'Muat naik fail Excel (.xlsx), CSV atau tampal terus senarai nama, gred, jawatan, opsyen dan waktu mengajar. Staf sokongan juga boleh dimasukkan.',
  },
  {
    title: 'Setiap pentadbir isi bahagiannya',
    desc: 'PK Pentadbiran, PK HEM, PK Kokurikulum, PK Tingkatan 6 dan Penyelaras PPKI menguruskan jawatankuasa bahagian masing-masing secara tersusun.',
  },
  {
    title: 'Semak keseimbangan, jana buku dan surat',
    desc: 'Lihat siapa yang terlalu berat dan siapa yang masih ringan, betulkan agihan secara langsung, kemudian cetak Buku Pengurusan dan Surat Lantikan PDF.',
  },
];

const FEATURES = [
  {
    icon: BarChart3,
    title: 'Beban dikira secara langsung',
    desc: 'Setiap jawatan mempunyai wajaran tersendiri. Jumlah mata setiap guru dikira serta-merta sebaik sahaja namanya dimasukkan ke dalam jawatankuasa.',
  },
  {
    icon: AlertTriangle,
    title: 'Tanda berat dan kurang',
    desc: 'Guru di luar julat seimbang ditanda dengan jelas. Semasa memilih ahli jawatankuasa, guru yang paling ringan disenaraikan dahulu.',
  },
  {
    icon: Layers,
    title: 'Bahagian ikut sekolah anda',
    desc: 'Pentadbiran, Kurikulum, HEM dan Kokurikulum sedia ada. Tambah Tingkatan 6, PPKI, Prasekolah, Asrama atau Sesi Petang jika berkaitan.',
  },
  {
    icon: ListChecks,
    title: 'Templat jawatankuasa lengkap',
    desc: `Lebih ${Math.floor(
      Object.values(TEMPLAT_JK).reduce((s, list) => s + list.length, 0) / 10
    ) * 10} jawatankuasa lazim sekolah rendah dan menengah sedia dipilih, dan semuanya boleh diubah suai.`,
  },
  {
    icon: BookOpen,
    title: 'Buku Pengurusan PDF',
    desc: 'Kulit hadapan dengan reka bentuk dan warna sekolah, isi kandungan, carta organisasi, senarai guru, jawatankuasa dan senarai tugas dijana automatik.',
  },
  {
    icon: Copy,
    title: 'Salin ke tahun hadapan',
    desc: 'Sesi baharu bermula dengan salinan sesi semasa. Tukar yang perlu sahaja tanpa perlu menaip semula berpuluh-puluh jawatankuasa.',
  },
  {
    icon: FileText,
    title: 'Surat lantikan automatik',
    desc: 'Surat pelantikan rasmi setiap guru dijana lengkap dengan kepala surat, rujukan fail, senarai tugas, slogan dan tandatangan.',
  },
  {
    icon: Lock,
    title: 'Kawalan peranan & sesi',
    desc: 'Setiap pentadbir bahagian menguruskan bahagian yang ditetapkan, pemerhati melihat analisis, dan sesi dimuktamadkan dengan kunci sesi.',
  },
];

const SCHOOL_TYPES = [
  'SK',
  'SJKC',
  'SJKT',
  'SMK',
  'SBP',
  'SMKA',
  'SABK',
  'SMJK',
  'Kolej Vokasional',
  'Kolej Tingkatan Enam',
  'Sekolah Pendidikan Khas',
  'PPKI',
  'Prasekolah',
];

export const LandingView: React.FC = () => {
  const { store, navigate, switchUser, darkMode, toggleDarkMode, cloudUser, loginCloud } = useStore();

  const enterAs = (userId: string) => {
    switchUser(userId);
    navigate({ page: 'pemuka' });
  };

  const maks = 14;
  const purata = 6.4;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      {/* Top Bar Contract: 3 zones */}
      <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--surface)]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1160px] items-center justify-between gap-8 px-5 py-3.5">
          <a
            href="#atas"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-[var(--ink)] whitespace-nowrap shrink-0"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand)] to-[var(--brand-2)] text-white shadow-sm shadow-[var(--brand)]/25">
              <Scale className="h-4 w-4" />
            </span>
            <span>Takwim Persekolahan</span>
          </a>

          <nav className="hidden items-center gap-7 text-sm font-medium text-[var(--ink-2)] md:flex">
            <a href="#langkah" className="transition-colors hover:text-[var(--ink)] hover:underline underline-offset-4 whitespace-nowrap shrink-0">
              Cara Kerja
            </a>
            <a href="#ciri" className="transition-colors hover:text-[var(--ink)] hover:underline underline-offset-4 whitespace-nowrap shrink-0">
              Ciri Utama
            </a>
            <a href="#sekolah" className="transition-colors hover:text-[var(--ink)] hover:underline underline-offset-4 whitespace-nowrap shrink-0">
              Jenis Sekolah
            </a>
            <a
              href="#pemuka"
              onClick={(e) => {
                e.preventDefault();
                navigate({ page: 'pemuka' });
              }}
              className="inline-flex h-9 items-center justify-center rounded-xl bg-[var(--brand)] px-4 text-sm font-semibold text-white shadow-xs shadow-[var(--brand)]/25 transition-all hover:bg-[var(--brand-2)] whitespace-nowrap shrink-0"
            >
              Log Masuk
            </a>
          </nav>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label="Tukar tema warna"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--line-2)] bg-[var(--surface)] text-[var(--ink-2)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => navigate({ page: 'pemuka' })}
              className="hidden h-9 items-center gap-1.5 rounded-xl bg-[var(--brand)] px-4 text-sm font-semibold text-white shadow-xs shadow-[var(--brand)]/25 transition-all hover:bg-[var(--brand-2)] whitespace-nowrap shrink-0"
            >
              <span>Buka Sistem</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[var(--line)] bg-grid-pattern">
        <div className="mx-auto max-w-[1160px] px-5 pt-14 pb-18 lg:pt-20 lg:pb-22">
          <div className="grid items-stretch gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--brand-text)]">
                <span>Sistem Pengurusan &amp; Agihan Tugas Guru</span>
                <span aria-hidden="true" className="text-[var(--ink-3)]">·</span>
                <span className="font-mono-num text-[var(--ink-3)]">Edisi Sesi 2027</span>
              </div>
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[var(--ink)] sm:text-5xl sm:leading-[1.12]">
                Agih tugas guru dengan <span className="bg-gradient-to-r from-[var(--brand)] to-[var(--accent)] bg-clip-text text-transparent">adil &amp; telus</span>. Buku pengurusan siap terus.
              </h1>
              <p className="mt-5 max-w-[54ch] text-base leading-relaxed text-[var(--ink-2)]">
                Setiap pentadbir mengisi jawatankuasa bahagiannya sendiri. Sistem mengira beban setiap guru secara langsung, menunjukkan siapa yang terlalu berat dan siapa yang masih ringan, kemudian menjana Buku Pengurusan dan Surat Lantikan dalam format PDF.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate({ page: 'buku' })}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-[var(--line-2)] bg-[var(--surface)] px-5 text-sm font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--surface-2)] whitespace-nowrap shrink-0"
                >
                  <BookOpen className="h-4 w-4 text-[var(--brand-text)]" />
                  <span>Lihat Buku Pengurusan</span>
                </button>
                <button
                  type="button"
                  onClick={() => (cloudUser ? navigate({ page: 'pemuka' }) : void loginCloud())}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-[var(--line-2)] bg-[var(--surface)] px-4 text-xs font-semibold text-[var(--ink-2)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--ink)] whitespace-nowrap shrink-0"
                >
                  <Cloud className="h-4 w-4 text-[var(--brand)]" />
                  <span>{cloudUser ? 'Segerak Awan Aktif' : 'Segerak Peranti'}</span>
                </button>
              </div>
              <p className="mt-4 text-xs text-[var(--ink-3)]">
                Data {store.sekolah.nama} · 46 guru · 6 bahagian · 34 jawatankuasa tersedia terus.
              </p>
            </div>

            {/* Live Workload Preview Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm">
              <div>
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-3.5">
                  <div>
                    <div className="text-sm font-bold text-[var(--ink)]">Analisis Beban · Sesi 2027</div>
                    <div className="mt-0.5 text-xs text-[var(--ink-3)]">{store.sekolah.nama} · Simulasi langsung</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate({ page: 'analisis' })}
                    className="text-xs font-semibold text-[var(--brand-text)] hover:underline whitespace-nowrap shrink-0"
                  >
                    Buka analisis penuh →
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {DEMO_PREVIEW.map((row) => {
                    const total = row.pts.reduce((a, b) => a + b, 0);
                    const bandLeft = ((purata * 0.75) / maks) * 100;
                    const bandWidth = ((purata * 0.5) / maks) * 100;
                    const avgLeft = (purata / maks) * 100;
                    const barWidth = Math.min(100, (total / maks) * 100);
                    const badgeClass =
                      row.tone === 'berat'
                        ? 'bg-[var(--berat-soft)] text-[var(--berat-ink)]'
                        : row.tone === 'kurang'
                        ? 'bg-[var(--kurang-soft)] text-[var(--kurang-ink)]'
                        : 'bg-[var(--baik-soft)] text-[var(--baik-ink)]';

                    return (
                      <div key={row.name} className="grid grid-cols-[135px_1fr_76px] items-center gap-3 text-xs">
                        <span className="truncate font-medium text-[var(--ink)]">{row.name}</span>
                        <div className="relative h-3 overflow-hidden rounded-full bg-[var(--surface-2)]">
                          <span
                            aria-hidden="true"
                            className="absolute inset-y-0 bg-[var(--baik)]/15"
                            style={{ left: `${bandLeft}%`, width: `${bandWidth}%` }}
                          />
                          <span
                            aria-hidden="true"
                            className="absolute inset-y-0 z-10 w-[1.5px] bg-[var(--ink-2)]/60"
                            style={{ left: `${avgLeft}%` }}
                          />
                          <div className="relative z-[1] flex h-full overflow-hidden rounded-full" style={{ width: `${barWidth}%` }}>
                            {row.pts.map((m, i) =>
                              m > 0 ? (
                                <span key={i} style={{ flex: `${m} 0 0`, backgroundColor: DIV_COLORS[i] }} />
                              ) : null
                            )}
                          </div>
                        </div>
                        <span className={`inline-flex justify-center rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${badgeClass}`}>
                          {row.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-[var(--line)] pt-3.5 text-[11px] text-[var(--ink-3)]">
                {DIV_LABELS.map((label, i) => (
                  <span key={label} className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: DIV_COLORS[i] }} />
                    {label}
                  </span>
                ))}
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-0.5 bg-[var(--ink-2)]/60" />
                  Purata
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-3 rounded-xs bg-[var(--baik)]/20" />
                  Julat seimbang
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Steps */}
      <section id="langkah" className="bg-[var(--surface)] py-16">
        <div className="mx-auto max-w-[1160px] px-5">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--ink)] sm:text-3xl">
              Tiga langkah dari senarai guru ke buku pengurusan
            </h2>
            <p className="mt-2 text-sm text-[var(--ink-2)]">
              Aliran kerja yang tersusun untuk memastikan setiap jawatankuasa terisi tanpa membebankan guru tertentu.
            </p>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, idx) => (
              <div key={s.title} className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-6 transition-colors hover:border-[var(--brand)]/40">
                <div className="font-mono-num text-xs font-bold text-[var(--brand-text)]">
                  0{idx + 1}. Langkah {idx + 1}
                </div>
                <h3 className="mt-2.5 text-base font-bold text-[var(--ink)]">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ink-2)]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="ciri" className="border-t border-[var(--line)] py-16">
        <div className="mx-auto max-w-[1160px] px-5">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--ink)] sm:text-3xl">
              Apa yang sistem ini buat untuk anda
            </h2>
            <p className="mt-2 text-sm text-[var(--ink-2)]">
              Direka khusus untuk keperluan pentadbiran sekolah rendah dan menengah di Malaysia.
            </p>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 transition-all hover:border-[var(--brand)]/40"
                >
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-text)] transition-transform group-hover:scale-105">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-[var(--ink)]">{f.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[var(--ink-2)]">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* School Types */}
      <section id="sekolah" className="border-t border-[var(--line)] bg-[var(--surface)] py-16">
        <div className="mx-auto max-w-[1160px] px-5">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--ink)]">
            Sesuai untuk semua jenis sekolah
          </h2>
          <p className="mt-2 max-w-[66ch] text-sm leading-relaxed text-[var(--ink-2)]">
            Sekolah rendah dan menengah, satu sesi atau dua sesi, dengan atau tanpa asrama. Bahagian dan templat jawatankuasa menyesuaikan diri mengikut jenis sekolah.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-[var(--ink-2)]">
            {SCHOOL_TYPES.map((type, idx) => (
              <React.Fragment key={type}>
                <span className="font-semibold text-[var(--ink)]">{type}</span>
                {idx < SCHOOL_TYPES.length - 1 && (
                  <span aria-hidden="true" className="text-[var(--ink-3)]">
                    ·
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Accounts Switcher */}
      <section id="akaun" className="border-t border-[var(--line)] py-16">
        <div className="mx-auto max-w-[1160px] px-5">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-[var(--ink)]">
                  Cuba mengikut peranan pentadbir sekolah
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ink-2)]">
                  Pilih mana-mana akaun contoh di sebelah kanan untuk melihat bagaimana kawalan akses berfungsi bagi Pentadbir Sekolah, Penolong Kanan bahagian tertentu, atau Pemerhati.
                </p>
                <ul className="mt-5 space-y-2.5 text-sm text-[var(--ink-2)]">
                  <li className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--baik)]" />
                    <span>Setiap perubahan disimpan secara automatik dalam pelayar ini.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--baik)]" />
                    <span>Jana Buku Pengurusan dan Surat Lantikan PDF pada bila-bila masa.</span>
                  </li>
                </ul>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {store.pengguna.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => enterAs(u.id)}
                    className="group flex flex-col justify-between rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/60 p-4 text-left transition-all hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]/50"
                  >
                    <div>
                      <div className="text-sm font-bold text-[var(--ink)]">{u.nama}</div>
                      <div className="mt-0.5 text-xs text-[var(--ink-3)]">{u.emel}</div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs font-semibold text-[var(--brand-text)]">
                      <span>
                        {u.peranan === 'admin'
                          ? 'Pentadbir Sekolah'
                          : u.peranan === 'pentadbir'
                          ? 'Pentadbir Bahagian'
                          : 'Pemerhati'}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--line)] bg-[var(--surface)] py-6">
        <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-between gap-4 px-5 text-xs text-[var(--ink-3)]">
          <span>© {new Date().getFullYear()} Takwim Persekolahan · Sistem Agihan Tugas Guru</span>
          <span>Agihan tugas guru yang adil, telus dan siap dicetak.</span>
        </div>
      </footer>
    </div>
  );
};
