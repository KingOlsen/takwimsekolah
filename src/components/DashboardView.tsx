import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  BookOpen,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  FileSpreadsheet,
  FileText,
  Plus,
  Printer,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { fmt, STATUS } from '../lib/kira';
import { printDocument } from '../lib/excel';
import { DivisionSquare } from './Ui';

export const DashboardView: React.FC = () => {
  const {
    store,
    session,
    analysis,
    currentUser,
    isAdmin,
    canManage,
    navigate,
    hideNames,
    toggleHideNames,
    openTeacherModal,
    setQuickInsertOpen,
  } = useStore();

  const [hoveredBarId, setHoveredBarId] = useState<string | null>(null);
  const [hideSteps, setHideSteps] = useState(false);

  const st = analysis.stat;
  const A = useMemo(() => [...analysis.analisis].sort((a, b) => b.jumlah - a.jumlah), [analysis.analisis]);

  const labelMap = useMemo(() => {
    const map: Record<string, string> = {};
    A.forEach((r, idx) => {
      map[r.id] = hideNames ? `Guru ${idx + 1}` : r.guru.nama;
    });
    return map;
  }, [A, hideNames]);

  const pentadbirByDiv = useMemo(() => {
    const map: Record<string, string[]> = {};
    store.pengguna.forEach((p) => {
      if (p.peranan !== 'pentadbir') return;
      (p.bahagian || []).forEach((b) => {
        (map[b] = map[b] || []).push(p.nama);
      });
    });
    return map;
  }, [store.pengguna]);

  const bilB = analysis.senaraiBahagian.length;
  const bilSiap = analysis.senaraiBahagian.filter((b) => b.siap).length;
  const semuaSiap = bilB > 0 && bilSiap === bilB && st.bilJk > 0;
  const diisi = st.bilJawatan - st.bilKosong;
  const nisbahIsi = st.bilJawatan ? diisi / st.bilJawatan : 0;
  const assessed = !st.awal && st.n > 0;

  const maks = useMemo(() => Math.max(...A.map((r) => r.jumlah), 1), [A]);
  const adaBeban = A.some((r) => r.jumlah > 0);
  const top5 = A.filter((r) => r.jumlah > 0).slice(0, 5);
  const bottom5 = A.slice(-5).reverse();

  // Action items
  const actions: { badge: string; tone: string; text: string; onClick: () => void }[] = [];
  if (st.awal && st.bilJk > 0) {
    actions.push({
      badge: 'i',
      tone: 'text-[var(--kurang)]',
      text: `Agihan di peringkat awal: ${st.bil.awal} daripada ${st.n} guru sudah ada tugas`,
      onClick: () => navigate({ page: 'analisis' }),
    });
  }
  if (assessed && st.bil.berat > 0) {
    actions.push({
      badge: '▲',
      tone: 'text-[var(--berat)]',
      text: `${st.bil.berat} guru terlebih beban`,
      onClick: () => navigate({ page: 'analisis' }),
    });
  }
  if (assessed && st.bil.kurang > 0) {
    actions.push({
      badge: '▼',
      tone: 'text-[var(--kurang)]',
      text: `${st.bil.kurang} guru terkurang beban`,
      onClick: () => navigate({ page: 'analisis' }),
    });
  }
  if (st.bil.tiada > 0 && !st.awal) {
    actions.push({
      badge: '○',
      tone: 'text-[var(--ink-3)]',
      text: `${st.bil.tiada} guru belum diberi sebarang tugas`,
      onClick: () => navigate({ page: 'analisis' }),
    });
  }
  if (st.bilKosong > 0) {
    const firstEmptyDiv = analysis.kosong[0]?.bahagianId || analysis.senaraiBahagian[0]?.id;
    actions.push({
      badge: '!',
      tone: 'text-[var(--amaran)]',
      text: `${st.bilKosong} jawatan belum diisi`,
      onClick: () => firstEmptyDiv && navigate({ page: 'bahagian', bahagianId: firstEmptyDiv }),
    });
  }
  if (analysis.lebihUtama.length > 0) {
    actions.push({
      badge: '!',
      tone: 'text-[var(--amaran)]',
      text: `${analysis.lebihUtama.length} guru memegang lebih ${analysis.tetapan.hadUtama} jawatan utama`,
      onClick: () => navigate({ page: 'rumusan' }),
    });
  }
  if (analysis.pendua.length > 0) {
    actions.push({
      badge: '!',
      tone: 'text-[var(--amaran)]',
      text: `${analysis.pendua.length} nama berulang dalam jawatankuasa yang sama`,
      onClick: () => navigate({ page: 'rumusan' }),
    });
  }
  if (st.bilJk > 0 && bilSiap < bilB) {
    const firstDraft = analysis.senaraiBahagian.find((b) => !b.siap);
    actions.push({
      badge: '!',
      tone: 'text-[var(--amaran)]',
      text: `${bilB - bilSiap} bahagian belum ditandakan siap`,
      onClick: () => firstDraft && navigate({ page: 'bahagian', bahagianId: firstDraft.id }),
    });
  }

  // Ring geometry
  const ringSize = 132;
  const ringStroke = 16;
  const ringR = ringSize / 2 - ringStroke / 2;
  const ringC = 2 * Math.PI * ringR;
  const pct = st.peratusSeimbang / 100;

  // Getting started check
  const hasAnyMember = session.jk.some((j) => j.ahli.some((a) => a.guruId || a.nama));
  const steps = [
    {
      title: 'Masukkan senarai guru',
      desc: 'Muat naik fail Excel, atau tampal senarai nama.',
      done: session.guru.length > 0,
      cta: 'Masukkan guru',
      onClick: () => navigate({ page: 'guru' }),
    },
    {
      title: 'Pilih jawatankuasa dan isi nama',
      desc: 'Buka satu bahagian, pilih jawatankuasa daripada templat, kemudian pilih guru.',
      done: hasAnyMember,
      cta: `Buka ${analysis.senaraiBahagian[0]?.bahagian.nama || 'bahagian'}`,
      onClick: () =>
        analysis.senaraiBahagian[0] &&
        navigate({ page: 'bahagian', bahagianId: analysis.senaraiBahagian[0].id }),
    },
    {
      title: 'Lihat Buku Pengurusan',
      desc: 'Buku dan surat lantikan terbina sendiri daripada apa yang anda isi.',
      done: semuaSiap,
      cta: 'Lihat buku',
      onClick: () => navigate({ page: 'buku' }),
    },
  ];
  const showGettingStarted = isAdmin && canManage && !hideSteps && (session.guru.length === 0 || !semuaSiap);

  // SVG chart dimensions
  const chartW = 1120;
  const chartH = 200;
  const padLeft = 36;
  const padBottom = 24;
  const padTop = 12;
  const barSlotW = A.length ? (chartW - padLeft - 8) / A.length : 10;
  const scaleMax = Math.max(maks * 1.08, 1);
  const yPos = (v: number) => chartH - padBottom - (v / scaleMax) * (chartH - padBottom - padTop);
  const yStep = scaleMax > 24 ? 10 : scaleMax > 10 ? 5 : scaleMax > 4 ? 2 : 1;
  const yTicks: number[] = [];
  for (let t = 0; t <= scaleMax; t += yStep) yTicks.push(t);

  const hoveredTeacher = hoveredBarId ? A.find((r) => r.id === hoveredBarId) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ink)] sm:text-3xl">{store.sekolah.nama}</h1>
          <p className="mt-1 text-sm text-[var(--ink-3)]">
            Sesi {session.tahun.label} · Kedudukan agihan tugas terkini
          </p>
        </div>
        <div className="no-print flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setQuickInsertOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[var(--brand)] px-3.5 text-xs font-semibold text-white shadow-xs shadow-[var(--brand)]/20 transition-all hover:bg-[var(--brand-2)] whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah data</span>
          </button>
          <button
            type="button"
            onClick={() => navigate({ page: 'laporan' })}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[var(--line-2)] bg-[var(--surface)] px-3.5 text-xs font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--surface-2)] whitespace-nowrap shrink-0"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Laporan penuh</span>
          </button>
          <button
            type="button"
            onClick={toggleHideNames}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[var(--line-2)] bg-[var(--surface)] px-3.5 text-xs font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--surface-2)] whitespace-nowrap shrink-0"
          >
            {hideNames ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span>{hideNames ? 'Tunjuk nama guru' : 'Sorok nama (bentang)'}</span>
          </button>
          <button
            type="button"
            onClick={() =>
              printDocument({ title: `Ringkasan ${store.sekolah.nama} - Sesi ${session.tahun.label}` })
            }
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[var(--line-2)] bg-[var(--surface)] px-3.5 text-xs font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--surface-2)] whitespace-nowrap shrink-0"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Cetak ringkasan</span>
          </button>
        </div>
      </div>

      {/* Role notice for PK / Observer */}
      {currentUser.peranan === 'pentadbir' && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-xs text-[var(--ink-2)]">
          <span>
            Anda mengurus bahagian:{' '}
            <strong className="text-[var(--ink)]">
              {analysis.senaraiBahagian
                .filter((b) => currentUser.bahagian.includes(b.id))
                .map((b) => b.bahagian.nama)
                .join(', ') || 'Tiada bahagian ditetapkan'}
            </strong>
            . Bahagian lain boleh dilihat sahaja.
          </span>
          <div className="flex flex-wrap gap-2">
            {analysis.senaraiBahagian
              .filter((b) => currentUser.bahagian.includes(b.id))
              .map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => navigate({ page: 'bahagian', bahagianId: b.id })}
                  className="rounded-xl bg-[var(--brand)] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--brand-2)] whitespace-nowrap"
                >
                  Buka {b.bahagian.singkatan}
                </button>
              ))}
          </div>
        </div>
      )}

      {currentUser.peranan === 'pemerhati' && (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-xs text-[var(--ink-2)]">
          Anda log masuk sebagai pemerhati: semua maklumat boleh dilihat tetapi tidak boleh diubah.
        </div>
      )}

      {/* Getting started card */}
      {showGettingStarted && session.guru.length === 0 && (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[var(--ink)]">Mula di sini: tiga langkah</h2>
            <button
              type="button"
              onClick={() => setHideSteps(true)}
              className="text-xs font-medium text-[var(--ink-3)] hover:text-[var(--ink)]"
            >
              Sorok
            </button>
          </div>
          <div className="mt-3 divide-y divide-[var(--line)]">
            {steps.map((s, idx) => (
              <div key={s.title} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      s.done
                        ? 'bg-[var(--baik-soft)] text-[var(--baik)]'
                        : 'bg-[var(--brand)] text-white'
                    }`}
                  >
                    {s.done ? <Check className="h-4 w-4" /> : idx + 1}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-[var(--ink)]">{s.title}</div>
                    <div className="text-xs text-[var(--ink-3)]">{s.desc}</div>
                  </div>
                </div>
                {!s.done && (
                  <button
                    type="button"
                    onClick={s.onClick}
                    className="rounded-xl bg-[var(--brand)] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[var(--brand-2)] whitespace-nowrap"
                  >
                    {s.cta}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {semuaSiap && (
        <div className="rounded-2xl border border-[var(--baik)]/30 bg-[var(--baik-soft)] px-4 py-3 text-xs font-medium text-[var(--baik-ink)]">
          Semua bahagian telah ditandakan siap. Semak Rumusan, kemudian muat turun Buku Pengurusan.
        </div>
      )}

      {/* 5 KPI Strip */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
          <div className="text-xs font-medium text-[var(--ink-3)]">Guru dianalisis</div>
          <div className="font-mono-num mt-1.5 text-2xl font-extrabold text-[var(--ink)]">{st.n}</div>
          <div className="mt-1 text-[11px] text-[var(--ink-3)]">
            Daripada {session.guru.length} warga sekolah
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
          <div className="text-xs font-medium text-[var(--ink-3)]">Purata beban</div>
          <div className="font-mono-num mt-1.5 text-2xl font-extrabold text-[var(--ink)]">{fmt(st.purata)}</div>
          <div className="mt-1 text-[11px] text-[var(--ink-3)]">
            Median {fmt(st.median)} · Min {fmt(st.min)} – Maks {fmt(st.max)}
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
          <div className="text-xs font-medium text-[var(--ink-3)]">Jawatankuasa</div>
          <div className="font-mono-num mt-1.5 text-2xl font-extrabold text-[var(--ink)]">{st.bilJk}</div>
          <div className="mt-1 text-[11px] text-[var(--ink-3)]">Dalam {bilB} bahagian aktif</div>
        </div>
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
          <div className="text-xs font-medium text-[var(--ink-3)]">Jawatan diisi</div>
          <div className="font-mono-num mt-1.5 text-2xl font-extrabold text-[var(--ink)]">
            {diisi} <span className="text-base font-medium text-[var(--ink-3)]">/ {st.bilJawatan}</span>
          </div>
          <div className="mt-1 text-[11px] text-[var(--ink-3)]">
            {st.bilKosong ? `${st.bilKosong} jawatan masih kosong` : 'Semua jawatan telah diisi'}
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
          <div className="text-xs font-medium text-[var(--ink-3)]">Bahagian siap</div>
          <div className="font-mono-num mt-1.5 text-2xl font-extrabold text-[var(--ink)]">
            {bilSiap} <span className="text-base font-medium text-[var(--ink-3)]">/ {bilB}</span>
          </div>
          <div className="mt-1 text-[11px] text-[var(--ink-3)]">
            {semuaSiap ? 'Sedia untuk cetakan buku' : 'Masih dalam penyediaan'}
          </div>
        </div>
      </div>

      {/* Balance Ring + Book Readiness */}
      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
          <h3 className="text-xs font-bold tracking-wider text-[var(--ink-3)] uppercase">
            Keseimbangan Agihan Tugas
          </h3>
          <div className="mt-4 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            {assessed ? (
              <svg
                width={ringSize}
                height={ringSize}
                viewBox={`0 0 ${ringSize} ${ringSize}`}
                className="shrink-0"
                role="img"
                aria-label={`${st.peratusSeimbang} peratus guru seimbang`}
              >
                <circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={ringR}
                  fill="none"
                  stroke="var(--surface-2)"
                  strokeWidth={ringStroke}
                />
                <circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={ringR}
                  fill="none"
                  stroke="var(--baik)"
                  strokeWidth={ringStroke}
                  strokeLinecap="round"
                  strokeDasharray={`${ringC * pct} ${ringC}`}
                  transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
                />
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dy=".35em"
                  className="fill-[var(--ink)] text-2xl font-extrabold"
                >
                  {st.peratusSeimbang}%
                </text>
              </svg>
            ) : (
              <div className="flex h-[132px] w-[132px] shrink-0 items-center justify-center rounded-full border-[16px] border-[var(--surface-2)] text-2xl font-extrabold text-[var(--ink-3)]">
                –
              </div>
            )}

            <div className="min-w-0 flex-1 space-y-3">
              <div>
                <div className="text-lg font-bold text-[var(--ink)]">
                  {assessed
                    ? `${st.bil.seimbang} daripada ${st.n} guru dalam julat seimbang`
                    : 'Penilaian keseimbangan bermula selepas separuh guru diberi tugas'}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[var(--ink-3)]">
                  {st.gredKira
                    ? `Sasaran beban mengambil kira peranan gred guru (julat ${analysis.tetapan.ambang.kurang}% – ${analysis.tetapan.ambang.berat}% daripada sasaran gred).`
                    : `Julat seimbang ialah ${analysis.tetapan.ambang.kurang}% – ${analysis.tetapan.ambang.berat}% daripada purata sekolah.`}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                <div className="rounded-xl bg-[var(--berat-soft)] px-3 py-2 text-[var(--berat-ink)]">
                  <span className="font-mono-num font-bold">{st.bil.berat}</span> Berat
                </div>
                <div className="rounded-xl bg-[var(--baik-soft)] px-3 py-2 text-[var(--baik-ink)]">
                  <span className="font-mono-num font-bold">{st.bil.seimbang}</span> Seimbang
                </div>
                <div className="rounded-xl bg-[var(--kurang-soft)] px-3 py-2 text-[var(--kurang-ink)]">
                  <span className="font-mono-num font-bold">{st.bil.kurang}</span> Kurang
                </div>
                <div className="rounded-xl bg-[var(--surface-2)] px-3 py-2 text-[var(--ink-2)]">
                  <span className="font-mono-num font-bold">{st.bil.tiada}</span> Tiada tugas
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col justify-between rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
          <div>
            <h3 className="text-xs font-bold tracking-wider text-[var(--ink-3)] uppercase">
              Buku Pengurusan &amp; Surat Lantikan
            </h3>
            <div className="font-mono-num mt-3 text-2xl font-extrabold text-[var(--ink)]">
              {Math.round(nisbahIsi * 100)}% jawatan diisi
            </div>
            <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--brand)] to-[var(--accent)] transition-all"
                style={{ width: `${Math.round(nisbahIsi * 100)}%` }}
              />
            </div>
            <p className="mt-2.5 text-xs text-[var(--ink-3)]">
              {st.bilJawatan
                ? `${diisi} daripada ${st.bilJawatan} jawatan diisi${
                    st.bilKosong ? ` · ${st.bilKosong} belum diisi` : ''
                  }`
                : 'Buku terbina sendiri sebaik jawatankuasa diisi.'}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate({ page: 'buku' })}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[var(--brand)] px-4 text-xs font-semibold text-white shadow-xs shadow-[var(--brand)]/20 transition-all hover:bg-[var(--brand-2)] whitespace-nowrap"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Lihat buku</span>
            </button>
            <button
              type="button"
              onClick={() => navigate({ page: 'surat' })}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[var(--line-2)] bg-[var(--surface)] px-4 text-xs font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--surface-2)] whitespace-nowrap"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Lihat surat</span>
            </button>
          </div>
        </section>
      </div>

      {/* Top 5 Heaviest & Bottom 5 Lightest */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between">
            <h3 className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-[var(--berat-ink)] uppercase">
              <ArrowUp className="h-3.5 w-3.5" />
              <span>5 Guru Paling Berat</span>
            </h3>
            <button
              type="button"
              onClick={() => navigate({ page: 'laporan' })}
              className="text-xs font-semibold text-[var(--brand-text)] hover:underline"
            >
              Lihat semua ({A.length}) →
            </button>
          </div>
          <div className="mt-3 space-y-1">
            {adaBeban ? (
              top5.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => openTeacherModal(r.id)}
                  className="grid w-full grid-cols-[minmax(0,1fr)_110px_48px] items-center gap-3 rounded-lg px-2 py-2 text-left text-sm hover:bg-[var(--surface-3)]"
                >
                  <span className="truncate font-medium text-[var(--ink)] underline decoration-[var(--line-2)] underline-offset-2">
                    {labelMap[r.id]}
                  </span>
                  <span className="block h-2 overflow-hidden rounded-full bg-[var(--surface-3)]">
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${Math.max(4, (r.jumlah / maks) * 100)}%`,
                        backgroundColor:
                          r.status === 'berat'
                            ? 'var(--berat)'
                            : r.status === 'kurang' || r.status === 'tiada'
                            ? 'var(--kurang)'
                            : 'var(--baik)',
                      }}
                    />
                  </span>
                  <span className="font-mono-num text-right text-xs font-bold text-[var(--ink)]">
                    {fmt(r.jumlah)}
                  </span>
                </button>
              ))
            ) : (
              <p className="py-4 text-xs text-[var(--ink-3)]">Akan dipaparkan selepas jawatankuasa diisi.</p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between">
            <h3 className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-[var(--kurang-ink)] uppercase">
              <ArrowDown className="h-3.5 w-3.5" />
              <span>5 Guru Paling Ringan</span>
            </h3>
            <button
              type="button"
              onClick={() => navigate({ page: 'laporan' })}
              className="text-xs font-semibold text-[var(--brand-text)] hover:underline"
            >
              Lihat semua →
            </button>
          </div>
          <div className="mt-3 space-y-1">
            {bottom5.length > 0 ? (
              bottom5.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => openTeacherModal(r.id)}
                  className="grid w-full grid-cols-[minmax(0,1fr)_110px_48px] items-center gap-3 rounded-lg px-2 py-2 text-left text-sm hover:bg-[var(--surface-3)]"
                >
                  <span className="truncate font-medium text-[var(--ink)] underline decoration-[var(--line-2)] underline-offset-2">
                    {labelMap[r.id]}
                  </span>
                  <span className="block h-2 overflow-hidden rounded-full bg-[var(--surface-3)]">
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${Math.max(4, (r.jumlah / maks) * 100)}%`,
                        backgroundColor:
                          r.status === 'berat'
                            ? 'var(--berat)'
                            : r.status === 'kurang' || r.status === 'tiada'
                            ? 'var(--kurang)'
                            : 'var(--baik)',
                      }}
                    />
                  </span>
                  <span className="font-mono-num text-right text-xs font-bold text-[var(--ink)]">
                    {fmt(r.jumlah)}
                  </span>
                </button>
              ))
            ) : (
              <p className="py-4 text-xs text-[var(--ink-3)]">Belum ada guru untuk dianalisis.</p>
            )}
          </div>
        </section>
      </div>

      {/* Division Status + Action Needed */}
      <div className="grid gap-4 lg:grid-cols-[1.45fr_1fr]">
        <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-bold tracking-wider text-[var(--ink-3)] uppercase">
              Status Pengisian Mengikut Bahagian
            </h3>
            <span className="text-xs text-[var(--ink-3)]">
              {bilSiap} / {bilB} siap
            </span>
          </div>
          <div className="mt-3 divide-y divide-[var(--line)]">
            {analysis.senaraiBahagian.map((b, idx) => {
              const ratio = b.bilJawatan ? b.bilDiisi / b.bilJawatan : 0;
              const pks = pentadbirByDiv[b.id]?.join(', ') || 'Pentadbir sekolah';
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => navigate({ page: 'bahagian', bahagianId: b.id })}
                  className="grid w-full grid-cols-[minmax(140px,1.1fr)_1fr_auto_auto_16px] items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-[var(--surface-3)]"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <DivisionSquare index={idx} />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-[var(--ink)]">{b.bahagian.nama}</div>
                      <div className="truncate text-[11px] text-[var(--ink-3)]">{pks}</div>
                    </div>
                  </div>
                  <div className="hidden h-2 overflow-hidden rounded-full bg-[var(--surface-3)] sm:block">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.round(ratio * 100)}%`,
                        backgroundColor:
                          b.bilJawatan && b.bilDiisi === b.bilJawatan ? 'var(--baik)' : 'var(--brand)',
                      }}
                    />
                  </div>
                  <span className="font-mono-num hidden text-xs text-[var(--ink-3)] md:inline whitespace-nowrap">
                    {b.bilDiisi}/{b.bilJawatan} · {b.bilJk} JK
                  </span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${
                      b.siap
                        ? 'bg-[var(--baik-soft)] text-[var(--baik-ink)]'
                        : 'border border-[var(--line-2)] text-[var(--ink-3)]'
                    }`}
                  >
                    {b.siap ? 'Siap' : 'Draf'}
                  </span>
                  <ChevronRight className="h-4 w-4 text-[var(--ink-3)]" />
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
          <h3 className="text-xs font-bold tracking-wider text-[var(--ink-3)] uppercase">Perlu Tindakan</h3>
          <div className="mt-3 divide-y divide-[var(--line)]">
            {actions.length === 0 ? (
              <p className="py-4 text-xs text-[var(--ink-3)]">
                {st.bilJk ? 'Tiada perkara mendesak. Agihan kelihatan teratur.' : 'Akan dipaparkan selepas jawatankuasa diisi.'}
              </p>
            ) : (
              actions.map((act, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={act.onClick}
                  className="grid w-full grid-cols-[18px_minmax(0,1fr)_16px] items-center gap-2.5 rounded-lg px-2 py-2.5 text-left text-sm hover:bg-[var(--surface-3)]"
                >
                  <span className={`text-center font-bold ${act.tone}`}>{act.badge}</span>
                  <span className="text-xs font-medium text-[var(--ink)]">{act.text}</span>
                  <ChevronRight className="h-4 w-4 text-[var(--ink-3)]" />
                </button>
              ))
            )}
          </div>
        </section>
      </div>

      {/* All Teachers Bar Chart */}
      {adaBeban && (
        <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold tracking-wider text-[var(--ink-3)] uppercase">
                Beban Semua Guru
              </h3>
              <p className="mt-0.5 text-xs text-[var(--ink-3)]">
                Setiap bar ialah seorang guru (disusun paling berat ke paling ringan). Tekan bar untuk perincian.
              </p>
            </div>
            {hoveredTeacher && (
              <div className="rounded-lg border border-[var(--line-2)] bg-[var(--surface-2)] px-3 py-1 text-xs font-semibold text-[var(--ink)]">
                {labelMap[hoveredTeacher.id]} · {fmt(hoveredTeacher.jumlah)} mata ·{' '}
                {hoveredTeacher.status ? STATUS[hoveredTeacher.status].nama : ''}
              </div>
            )}
          </div>

          <div className="mt-4 overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              className="w-full min-w-[640px]"
              role="group"
              aria-label="Carta beban semua guru"
            >
              {assessed && !st.gredKira && st.ambangBerat > st.ambangKurang && (
                <rect
                  x={padLeft}
                  y={yPos(st.ambangBerat)}
                  width={chartW - padLeft - 6}
                  height={yPos(st.ambangKurang) - yPos(st.ambangBerat)}
                  fill="var(--baik)"
                  opacity={0.12}
                />
              )}
              {yTicks.map((tick) => (
                <g key={tick}>
                  <line
                    x1={padLeft}
                    x2={chartW - 6}
                    y1={yPos(tick)}
                    y2={yPos(tick)}
                    stroke="var(--line)"
                    strokeWidth={1}
                  />
                  <text
                    x={padLeft - 6}
                    y={yPos(tick) + 4}
                    textAnchor="end"
                    className="fill-[var(--ink-3)] text-[11px]"
                  >
                    {tick}
                  </text>
                </g>
              ))}
              {A.map((r, i) => {
                const v = Math.max(r.jumlah, scaleMax * 0.01);
                const fill =
                  r.status === 'berat'
                    ? 'var(--berat)'
                    : r.status === 'kurang'
                    ? 'var(--kurang)'
                    : r.status === 'tiada'
                    ? 'var(--ink-3)'
                    : 'var(--baik)';
                return (
                  <rect
                    key={r.id}
                    x={padLeft + 2 + i * barSlotW}
                    y={yPos(v)}
                    width={Math.max(2, barSlotW - 3)}
                    height={yPos(0) - yPos(v)}
                    rx={2.5}
                    fill={fill}
                    opacity={hoveredBarId && hoveredBarId !== r.id ? 0.55 : 1}
                    className="cursor-pointer transition-opacity"
                    tabIndex={0}
                    role="button"
                    aria-label={`${labelMap[r.id]}: ${fmt(r.jumlah)} mata`}
                    onMouseEnter={() => setHoveredBarId(r.id)}
                    onMouseLeave={() => setHoveredBarId(null)}
                    onFocus={() => setHoveredBarId(r.id)}
                    onBlur={() => setHoveredBarId(null)}
                    onClick={() => openTeacherModal(r.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openTeacherModal(r.id);
                      }
                    }}
                  />
                );
              })}
              <text x={padLeft + 2} y={chartH - 5} className="fill-[var(--ink-3)] text-[11px]">
                Paling berat
              </text>
              <text x={chartW - 8} y={chartH - 5} textAnchor="end" className="fill-[var(--ink-3)] text-[11px]">
                Paling ringan
              </text>
            </svg>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-[var(--ink-3)]">
            <span className="inline-flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-[var(--berat)]" /> Terlebih beban
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-[var(--baik)]" /> Seimbang
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ArrowDown className="h-3.5 w-3.5 text-[var(--kurang)]" /> Terkurang beban
            </span>
          </div>
        </section>
      )}
    </div>
  );
};
