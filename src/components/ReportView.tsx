import React, { useMemo, useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  Plus,
  Printer,
  Search,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { fmt, norm, TAHAP } from '../lib/kira';
import { buildCsv, downloadTextFile, printDocument } from '../lib/excel';
import { DivisionSquare, StatusBadge, WorkloadBar } from './Ui';

type ReportTab = 'semua' | 'guru' | 'jawatankuasa' | 'gred' | 'audit';

export const ReportView: React.FC = () => {
  const {
    store,
    session,
    analysis,
    navigate,
    openTeacherModal,
    setFocusedCommitteeId,
    setQuickInsertOpen,
    notify,
  } = useStore();

  const [tab, setTab] = useState<ReportTab>('semua');
  const [search, setSearch] = useState('');
  const [printingAll, setPrintingAll] = useState(false);

  const st = analysis.stat;
  const q = norm(search);

  const allTeachersSorted = useMemo(() => {
    const list = [...analysis.senarai].sort((a, b) => (a.guru.urutan || 0) - (b.guru.urutan || 0));
    if (!q) return list;
    return list.filter((r) =>
      norm([r.guru.nama, r.guru.gred, r.guru.jawatan, r.guru.opsyen, ...r.tugas.map((t) => t.jkNama)].join(' ')).includes(
        q
      )
    );
  }, [analysis.senarai, q]);

  const committeesByDivision = useMemo(() => {
    return analysis.senaraiBahagian.map((b, idx) => {
      const jks = session.jk
        .filter((j) => j.bahagianId === b.id)
        .sort((a, c) => (a.urutan || 0) - (c.urutan || 0))
        .filter((j) => {
          if (!q) return true;
          const memberNames = j.ahli
            .map((a) => (a.guruId ? analysis.guruMap[a.guruId]?.guru.nama || '' : a.nama))
            .join(' ');
          return norm([j.nama, j.kumpulan, j.bidang, memberNames].join(' ')).includes(q);
        });
      return { div: b, idx, jks };
    });
  }, [analysis.senaraiBahagian, analysis.guruMap, session.jk, q]);

  const emptyByDiv = useMemo(() => {
    const map: Record<string, typeof analysis.kosong> = {};
    analysis.kosong.forEach((k) => {
      (map[k.bahagianId] = map[k.bahagianId] || []).push(k);
    });
    return map;
  }, [analysis.kosong]);

  const tiadaTugas = useMemo(() => analysis.analisis.filter((r) => r.status === 'tiada'), [analysis.analisis]);

  const showSection = (id: Exclude<ReportTab, 'semua'>) => printingAll || tab === 'semua' || tab === id;

  const handlePrintAllPages = () => {
    setPrintingAll(true);
    requestAnimationFrame(() => {
      setTimeout(() => {
        printDocument({
          title: `Laporan Penuh ${store.sekolah.nama} - Sesi ${session.tahun.label}`,
          onAfterPrint: () => setPrintingAll(false),
        });
      }, 120);
    });
  };

  const handleExportCompleteCsv = () => {
    const header = [
      'Bil',
      'Nama',
      'Kategori',
      'Gred',
      'Jawatan Hakiki',
      'Opsyen',
      'Waktu Mengajar',
      'Dianalisis',
      ...analysis.senaraiBahagian.map((b) => b.bahagian.singkatan || b.bahagian.nama),
      'Jumlah Mata',
      'Sasaran Gred',
      'Status',
      'Bil. Tugas',
      'Bil. Jawatan Utama',
      'Senarai Tugas Lengkap',
    ];
    const rows = allTeachersSorted.map((r, i) => [
      i + 1,
      r.guru.nama,
      r.guru.kategori,
      r.guru.gred,
      r.guru.jawatan,
      r.guru.opsyen,
      r.guru.waktu ?? '',
      r.analisis ? 'Ya' : 'Tidak',
      ...analysis.senaraiBahagian.map((b) => r.ikutBahagian[b.id] || 0),
      r.jumlah,
      r.sasaran != null ? Math.round(r.sasaran * 100) / 100 : '',
      r.status || (r.guru.kategori === 'pentadbir' ? 'Pentadbir' : r.guru.kategori === 'staf' ? 'Staf' : 'Dikecualikan'),
      r.bilTugas,
      r.bilUtama,
      r.tugas.map((t) => `${t.jawatan} - ${t.jkNama}`).join(' | '),
    ]);
    downloadTextFile(`Laporan-Penuh-${session.tahun.label}.csv`, buildCsv([header, ...rows]));
    notify('Laporan data penuh dieksport sebagai CSV.');
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan-TakwimSekolah-${session.tahun.label}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify('Data JSON penuh dimuat turun.');
  };

  const bilB = analysis.senaraiBahagian.length;
  const bilSiap = analysis.senaraiBahagian.filter((b) => b.siap).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="no-print flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ink)]">Laporan Data Penuh</h1>
          <p className="mt-1 text-sm text-[var(--ink-3)]">
            Paparan lengkap semua {analysis.senarai.length} warga sekolah, {st.bilJk} jawatankuasa, analisis gred, dan semakan audit tanpa had pemotongan.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setQuickInsertOpen(true)}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[var(--line-2)] bg-[var(--surface)] px-3.5 text-xs font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--surface-2)] whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah data</span>
          </button>
          <button
            type="button"
            onClick={handleExportCompleteCsv}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[var(--line-2)] bg-[var(--surface)] px-3.5 text-xs font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--surface-2)] whitespace-nowrap"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Eksport CSV Penuh</span>
          </button>
          <button
            type="button"
            onClick={handleExportJson}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[var(--line-2)] bg-[var(--surface)] px-3.5 text-xs font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--surface-2)] whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" />
            <span>JSON</span>
          </button>
          <button
            type="button"
            disabled={printingAll}
            onClick={handlePrintAllPages}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--brand)] to-[var(--brand-2)] px-4 text-xs font-semibold text-white shadow-sm shadow-[var(--brand)]/25 transition-all hover:opacity-95 disabled:opacity-60 whitespace-nowrap"
          >
            <Printer className="h-4 w-4" />
            <span>{printingAll ? 'Menyediakan PDF…' : 'Cetak Semua Halaman (PDF)'}</span>
          </button>
        </div>
      </div>

      {/* Filter & Section Bar */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex flex-wrap rounded-xl bg-[var(--surface-3)] p-1 text-xs">
          {(
            [
              ['semua', 'Semua Laporan'],
              ['guru', `Semua Guru & Tugas (${allTeachersSorted.length})`],
              ['jawatankuasa', `Semua Jawatankuasa (${st.bilJk})`],
              ['gred', 'Gred & Bahagian'],
              ['audit', `Audit & Isu (${analysis.kosong.length + tiadaTugas.length + analysis.lebihUtama.length + analysis.pendua.length})`],
            ] as [ReportTab, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-lg px-3 py-1.5 font-semibold whitespace-nowrap transition-colors ${
                tab === id
                  ? 'bg-[var(--surface)] text-[var(--ink)] shadow-sm'
                  : 'text-[var(--ink-2)] hover:text-[var(--ink)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px] flex-1 sm:max-w-[300px]">
          <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-[var(--ink-3)]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tapis guru, jawatankuasa atau gred..."
            className="h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] pr-3 pl-9 text-sm text-[var(--ink)] focus:border-[var(--brand)] focus:outline-none"
          />
        </div>
      </div>

      {/* Printable Report Root */}
      <div className="print-only-root space-y-6">
        {/* Official Report Banner (always top of print & semua view) */}
        <section className="print-page-break rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
            <div className="flex items-center gap-3">
              {store.sekolah.logo && (
                <img
                  src={store.sekolah.logo}
                  alt="Lencana sekolah"
                  className="h-12 w-12 shrink-0 object-contain"
                  referrerPolicy="no-referrer"
                />
              )}
              <div>
                <div className="text-[11px] font-bold tracking-wider text-[var(--ink-3)] uppercase">
                  Laporan Rasmi Agihan Tugas Sekolah · Sesi {session.tahun.label}
                </div>
                <h2 className="text-lg font-extrabold text-[var(--ink)]">
                  {store.sekolah.nama} {store.sekolah.kod ? `(${store.sekolah.kod})` : ''}
                </h2>
                <div className="text-xs text-[var(--ink-3)]">
                  {[store.sekolah.alamat, store.sekolah.poskod, store.sekolah.bandar, store.sekolah.negeri]
                    .filter(Boolean)
                    .join(', ')}
                </div>
              </div>
            </div>
            <div className="text-right text-xs text-[var(--ink-3)]">
              <div>Tarikh janaan: {new Date().toLocaleDateString('ms-MY')}</div>
              <div className="font-mono-num font-semibold text-[var(--ink)]">
                {bilSiap}/{bilB} bahagian siap
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-xl bg-[var(--surface-2)] p-3">
              <div className="text-[11px] text-[var(--ink-3)]">Jumlah Warga</div>
              <div className="font-mono-num mt-0.5 text-lg font-bold text-[var(--ink)]">{analysis.senarai.length}</div>
              <div className="text-[10px] text-[var(--ink-3)]">{st.n} dianalisis</div>
            </div>
            <div className="rounded-xl bg-[var(--surface-2)] p-3">
              <div className="text-[11px] text-[var(--ink-3)]">Purata / Median</div>
              <div className="font-mono-num mt-0.5 text-lg font-bold text-[var(--ink)]">
                {fmt(st.purata)} <span className="text-xs font-normal">/ {fmt(st.median)}</span>
              </div>
              <div className="text-[10px] text-[var(--ink-3)]">Sisihan {fmt(st.sp)}</div>
            </div>
            <div className="rounded-xl bg-[var(--surface-2)] p-3">
              <div className="text-[11px] text-[var(--ink-3)]">Jawatankuasa</div>
              <div className="font-mono-num mt-0.5 text-lg font-bold text-[var(--ink)]">{st.bilJk}</div>
              <div className="text-[10px] text-[var(--ink-3)]">Dalam {bilB} bahagian</div>
            </div>
            <div className="rounded-xl bg-[var(--surface-2)] p-3">
              <div className="text-[11px] text-[var(--ink-3)]">Jawatan Diisi</div>
              <div className="font-mono-num mt-0.5 text-lg font-bold text-[var(--ink)]">
                {st.bilJawatan - st.bilKosong} / {st.bilJawatan}
              </div>
              <div className="text-[10px] text-[var(--amaran-ink)]">{st.bilKosong} masih kosong</div>
            </div>
            <div className="rounded-xl bg-[var(--baik-soft)] p-3">
              <div className="text-[11px] text-[var(--baik-ink)]">Seimbang</div>
              <div className="font-mono-num mt-0.5 text-lg font-bold text-[var(--baik)]">
                {st.awal ? 'Awal' : `${st.peratusSeimbang}%`}
              </div>
              <div className="text-[10px] text-[var(--baik-ink)]">
                {st.bil.seimbang} guru seimbang
              </div>
            </div>
            <div className="rounded-xl bg-[var(--surface-2)] p-3">
              <div className="text-[11px] text-[var(--ink-3)]">Berat / Kurang / Tiada</div>
              <div className="font-mono-num mt-0.5 text-lg font-bold text-[var(--ink)]">
                {st.bil.berat} / {st.bil.kurang} / {st.bil.tiada}
              </div>
              <div className="text-[10px] text-[var(--ink-3)]">Julat {analysis.tetapan.ambang.kurang}–{analysis.tetapan.ambang.berat}%</div>
            </div>
          </div>
        </section>

        {/* SECTION 1: ALL TEACHERS & STAFF WITH COMPLETE TASK BREAKDOWN */}
        {showSection('guru') && (
          <section className="print-page-break space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-[var(--ink)]">
                  1. Senarai Lengkap Semua Guru, Pentadbir &amp; Staf ({allTeachersSorted.length})
                </h2>
                <p className="text-xs text-[var(--ink-3)]">
                  Merangkumi gred, waktu mengajar, markah mengikut bahagian, sasaran, status dan setiap tugas yang disandang.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--line)] bg-[var(--surface-2)] text-[10.5px] font-bold tracking-wider text-[var(--ink-3)] uppercase">
                    <th className="px-2.5 py-2.5 text-right">Bil</th>
                    <th className="px-2.5 py-2.5">Nama &amp; Jawatan</th>
                    <th className="px-2.5 py-2.5">Gred</th>
                    <th className="px-2.5 py-2.5 text-right">Waktu</th>
                    <th className="px-2.5 py-2.5">Status</th>
                    <th className="min-w-[110px] px-2.5 py-2.5">Agihan Beban</th>
                    <th className="px-2.5 py-2.5 text-right">Mata</th>
                    {st.gredKira && <th className="px-2.5 py-2.5 text-right">Sasaran</th>}
                    <th className="px-2.5 py-2.5">Perincian Jawatankuasa &amp; Jawatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {allTeachersSorted.map((r, i) => (
                    <tr
                      key={r.id}
                      onClick={() => openTeacherModal(r.id)}
                      className="cursor-pointer align-top hover:bg-[var(--surface-2)]"
                    >
                      <td className="font-mono-num px-2.5 py-2 text-right text-[var(--ink-3)]">{i + 1}</td>
                      <td className="px-2.5 py-2">
                        <div className="font-semibold text-[var(--ink)]">{r.guru.nama}</div>
                        <div className="text-[11px] text-[var(--ink-3)]">
                          {r.guru.jawatan || 'Guru'}
                          {r.guru.opsyen ? ` · ${r.guru.opsyen}` : ''}
                        </div>
                      </td>
                      <td className="px-2.5 py-2">
                        <span className="font-mono-num rounded border border-[var(--line-2)] px-1.5 py-0.5 text-[10.5px] font-semibold">
                          {r.guru.gred || '–'}
                        </span>
                      </td>
                      <td className="font-mono-num px-2.5 py-2 text-right">{r.guru.waktu ?? '–'}</td>
                      <td className="px-2.5 py-2">
                        {r.analisis ? (
                          <StatusBadge status={r.status} />
                        ) : (
                          <span className="rounded border border-[var(--line-2)] px-1.5 py-0.5 text-[10.5px] font-medium text-[var(--ink-3)]">
                            {r.guru.kategori === 'pentadbir' ? 'Pentadbir' : r.guru.kategori === 'staf' ? 'Staf' : 'Dikecualikan'}
                          </span>
                        )}
                      </td>
                      <td className="px-2.5 py-2">
                        <WorkloadBar teacher={r} analysis={analysis} />
                      </td>
                      <td className="font-mono-num px-2.5 py-2 text-right font-bold text-[var(--ink)]">
                        {fmt(r.jumlah)}
                      </td>
                      {st.gredKira && (
                        <td className="font-mono-num px-2.5 py-2 text-right text-[var(--ink-3)]">
                          {r.sasaran != null ? fmt(r.sasaran) : '–'}
                        </td>
                      )}
                      <td className="px-2.5 py-2 text-[11px] text-[var(--ink-2)]">
                        {r.tugas.length === 0 ? (
                          <span className="text-[var(--ink-3)]">Tiada jawatankuasa</span>
                        ) : (
                          <div className="space-y-0.5">
                            {r.tugas.map((t) => (
                              <div key={t.ahliId}>
                                <span className="font-semibold text-[var(--ink)]">{t.jawatan}</span> — {t.jkNama}
                                {t.butiran ? ` (${t.butiran})` : ''}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* SECTION 2: ALL COMMITTEES & MEMBERS BY DIVISION */}
        {showSection('jawatankuasa') && (
          <section className="print-page-break space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
            <div>
              <h2 className="text-base font-bold text-[var(--ink)]">
                2. Laporan Lengkap Semua Jawatankuasa Mengikut Bahagian ({st.bilJk})
              </h2>
              <p className="text-xs text-[var(--ink-3)]">
                Setiap jawatankuasa, tahap beban, senarai jawatan diisi dan kekosongan.
              </p>
            </div>

            <div className="space-y-5">
              {committeesByDivision.map(({ div, idx, jks }) => (
                <div key={div.id} className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[var(--line)] pb-1.5">
                    <div className="flex items-center gap-2">
                      <DivisionSquare index={idx} />
                      <h3 className="text-sm font-bold text-[var(--ink)]">
                        Bahagian {div.bahagian.nama} ({jks.length} jawatankuasa)
                      </h3>
                    </div>
                    <span className="font-mono-num text-xs text-[var(--ink-3)]">
                      {div.bilDiisi}/{div.bilJawatan} jawatan diisi
                    </span>
                  </div>

                  {jks.length === 0 ? (
                    <p className="text-xs text-[var(--ink-3)]">Tiada jawatankuasa dalam tapisan ini.</p>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                      {jks.map((jk, ji) => {
                        const tahapLabel =
                          TAHAP.find((t) => t.id === (jk.tahap || 'sederhana'))?.nama || 'Sederhana';
                        return (
                          <div
                            key={jk.id}
                            className="print-avoid-break rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-3.5 text-xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setFocusedCommitteeId(jk.id);
                                  navigate({ page: 'bahagian', bahagianId: div.id });
                                }}
                                className="text-left font-bold text-[var(--ink)] hover:text-[var(--brand-text)] hover:underline"
                              >
                                {ji + 1}. {jk.nama}
                              </button>
                              <span className="shrink-0 rounded border border-[var(--line-2)] bg-[var(--surface)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--ink-2)]">
                                {tahapLabel}
                              </span>
                            </div>
                            {jk.kumpulan && (
                              <div className="mt-0.5 text-[10.5px] text-[var(--ink-3)]">{jk.kumpulan}</div>
                            )}
                            <table className="mt-2 w-full border-collapse text-[11px]">
                              <tbody>
                                {jk.ahli.map((a) => {
                                  const g = a.guruId ? analysis.guruMap[a.guruId]?.guru : null;
                                  const holder = g ? g.nama : a.nama.trim();
                                  return (
                                    <tr key={a.id} className="border-t border-[var(--line)]/60">
                                      <td className="w-36 py-1 pr-2 font-semibold text-[var(--ink-2)]">
                                        {a.jawatan || 'Ahli'}
                                      </td>
                                      <td className="py-1">
                                        {holder ? (
                                          <span className="text-[var(--ink)]">
                                            {holder}
                                            {a.butiran ? ` — ${a.butiran}` : ''}
                                          </span>
                                        ) : (
                                          <span className="font-semibold text-[var(--amaran-ink)]">Belum diisi</span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 3: DIVISION MATRIX & GRADE ANALYSIS */}
        {showSection('gred') && (
          <section className="print-page-break space-y-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
            <div>
              <h2 className="text-base font-bold text-[var(--ink)]">3. Ringkasan Bahagian &amp; Analisis Mengikut Gred</h2>
              <p className="text-xs text-[var(--ink-3)]">
                Perbandingan agihan mata mengikut bahagian serta purata beban setiap gred PPP KPM.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--line)] bg-[var(--surface-2)] text-[10.5px] font-bold text-[var(--ink-3)] uppercase">
                    <th className="px-3 py-2.5">Bahagian</th>
                    <th className="px-3 py-2.5 text-right">Jawatankuasa</th>
                    <th className="px-3 py-2.5 text-right">Jawatan</th>
                    <th className="px-3 py-2.5 text-right">Diisi</th>
                    <th className="px-3 py-2.5 text-right">Kosong</th>
                    <th className="px-3 py-2.5 text-right">Guru Terlibat</th>
                    <th className="px-3 py-2.5 text-right">Jumlah Mata</th>
                    <th className="px-3 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {analysis.senaraiBahagian.map((b, idx) => (
                    <tr key={b.id}>
                      <td className="px-3 py-2 font-semibold text-[var(--ink)]">
                        <span className="inline-flex items-center gap-2">
                          <DivisionSquare index={idx} />
                          <span>{b.bahagian.nama}</span>
                        </span>
                      </td>
                      <td className="font-mono-num px-3 py-2 text-right">{b.bilJk}</td>
                      <td className="font-mono-num px-3 py-2 text-right">{b.bilJawatan}</td>
                      <td className="font-mono-num px-3 py-2 text-right font-semibold">{b.bilDiisi}</td>
                      <td className="font-mono-num px-3 py-2 text-right text-[var(--amaran-ink)]">{b.bilKosong}</td>
                      <td className="font-mono-num px-3 py-2 text-right">{b.guruIds.length}</td>
                      <td className="font-mono-num px-3 py-2 text-right font-bold">{fmt(b.mata)}</td>
                      <td className="px-3 py-2">{b.siap ? 'Siap' : 'Draf'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {analysis.gred.length > 0 && (
              <div className="overflow-x-auto pt-2">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--line)] bg-[var(--surface-2)] text-[10.5px] font-bold text-[var(--ink-3)] uppercase">
                      <th className="px-3 py-2.5">Gred</th>
                      {st.gredKira && <th className="px-3 py-2.5">Peranan Gred KPM</th>}
                      <th className="px-3 py-2.5 text-right">Bil. Guru</th>
                      <th className="px-3 py-2.5 text-right">Purata</th>
                      {st.gredKira && <th className="px-3 py-2.5 text-right">Sasaran</th>}
                      <th className="px-3 py-2.5 text-right">Min</th>
                      <th className="px-3 py-2.5 text-right">Maks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {analysis.gred.map((g) => (
                      <tr key={g.gred}>
                        <td className="font-mono-num px-3 py-2 font-bold">{g.gred}</td>
                        {st.gredKira && <td className="px-3 py-2 text-[var(--ink-2)]">{g.peranan || '—'}</td>}
                        <td className="font-mono-num px-3 py-2 text-right">{g.n}</td>
                        <td className="font-mono-num px-3 py-2 text-right font-bold">{fmt(g.purata)}</td>
                        {st.gredKira && <td className="font-mono-num px-3 py-2 text-right">{fmt(g.sasaran)}</td>}
                        <td className="font-mono-num px-3 py-2 text-right">{fmt(g.min)}</td>
                        <td className="font-mono-num px-3 py-2 text-right">{fmt(g.max)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* SECTION 4: FULL AUDIT & CHECKLIST (NO TRUNCATION) */}
        {showSection('audit') && (
          <section className="print-page-break space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
            <div>
              <h2 className="text-base font-bold text-[var(--ink)]">4. Laporan Audit Penuh &amp; Tindakan</h2>
              <p className="text-xs text-[var(--ink-3)]">
                Semua jawatan kosong, guru tanpa tugas, lebihan jawatan utama dan pertindihan ahli (paparan penuh).
              </p>
            </div>

            {analysis.kosong.length === 0 &&
            tiadaTugas.length === 0 &&
            analysis.lebihUtama.length === 0 &&
            analysis.pendua.length === 0 ? (
              <div className="rounded-xl bg-[var(--baik-soft)] p-4 text-xs font-semibold text-[var(--baik-ink)]">
                Tiada isu ditemui. Semua jawatan telah diisi dan tiada pertindihan dikesan.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[var(--ink)] uppercase">
                      Semua Jawatan Belum Diisi ({analysis.kosong.length})
                    </h3>
                  </div>
                  {analysis.kosong.length === 0 ? (
                    <p className="mt-2 text-xs text-[var(--ink-3)]">Semua jawatan telah diisi.</p>
                  ) : (
                    <div className="mt-3 space-y-2 text-xs">
                      {analysis.senaraiBahagian
                        .filter((b) => emptyByDiv[b.id]?.length)
                        .map((b) => (
                          <div key={b.id}>
                            <div className="font-bold text-[var(--brand-text)]">
                              {b.bahagian.nama} ({emptyByDiv[b.id].length})
                            </div>
                            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[var(--ink-2)]">
                              {emptyByDiv[b.id].map((k, ki) => (
                                <li key={`${k.jkId}-${ki}`}>
                                  <span className="font-semibold">{k.jawatan || 'Ahli'}</span> — {k.jkNama}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-4">
                    <h3 className="text-xs font-bold text-[var(--ink)] uppercase">
                      Melebihi {analysis.tetapan.hadUtama} Jawatan Utama ({analysis.lebihUtama.length})
                    </h3>
                    {analysis.lebihUtama.length === 0 ? (
                      <p className="mt-2 text-xs text-[var(--ink-3)]">Tiada guru melebihi had jawatan utama.</p>
                    ) : (
                      <ul className="mt-2 space-y-1 text-xs">
                        {analysis.lebihUtama.map((r) => (
                          <li key={r.id} className="flex items-center justify-between">
                            <span className="font-semibold">{r.guru.nama}</span>
                            <span className="font-mono-num text-[var(--amaran-ink)]">{r.bilUtama} jawatan utama</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-4">
                    <h3 className="text-xs font-bold text-[var(--ink)] uppercase">
                      Guru Tanpa Tugas ({tiadaTugas.length})
                    </h3>
                    {tiadaTugas.length === 0 ? (
                      <p className="mt-2 text-xs text-[var(--ink-3)]">Semua guru yang dianalisis telah diberi tugas.</p>
                    ) : (
                      <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                        {tiadaTugas.map((r) => (
                          <span
                            key={r.id}
                            className="rounded border border-[var(--line-2)] bg-[var(--surface)] px-2 py-0.5 font-medium"
                          >
                            {r.guru.nama}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-4">
                    <h3 className="text-xs font-bold text-[var(--ink)] uppercase">
                      Nama Berulang Dalam Jawatankuasa Sama ({analysis.pendua.length})
                    </h3>
                    {analysis.pendua.length === 0 ? (
                      <p className="mt-2 text-xs text-[var(--ink-3)]">Tiada nama berulang ditemui.</p>
                    ) : (
                      <ul className="mt-2 space-y-1 text-xs">
                        {analysis.pendua.map((p, i) => (
                          <li key={i}>
                            {analysis.guruMap[p.guruId]?.guru.nama} · {p.jkNama}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};
