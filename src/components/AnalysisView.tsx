import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Download, FileSpreadsheet, Printer, Search } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { fmt, nilaiGred, norm } from '../lib/kira';
import { buildCsv, downloadTextFile, printDocument } from '../lib/excel';
import type { TeacherResult, WorkloadStatus } from '../types/tugasadil';
import { DivisionLegend, StatusBadge, WorkloadBar } from './Ui';

type SortColumn = 'nama' | 'gred' | 'jumlah' | 'tugas' | 'utama' | 'waktu' | `b:${string}`;

export const AnalysisView: React.FC = () => {
  const { session, analysis, openTeacherModal, navigate, notify } = useStore();
  const st = analysis.stat;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'semua' | WorkloadStatus>('semua');
  const [gradeFilter, setGradeFilter] = useState('');
  const [sortCol, setSortCol] = useState<SortColumn>('jumlah');
  const [sortDir, setSortDir] = useState<-1 | 1>(-1);
  const [showOther, setShowOther] = useState(true);

  const toggleSort = (col: SortColumn) => {
    if (sortCol === col) {
      setSortDir((d) => (d === 1 ? -1 : 1));
    } else {
      setSortCol(col);
      setSortDir(col === 'nama' ? 1 : -1);
    }
  };

  const sortList = (arr: TeacherResult[]) => {
    return [...arr].sort((a, b) => {
      let d = 0;
      if (sortCol === 'nama') d = a.guru.nama.localeCompare(b.guru.nama, 'ms');
      else if (sortCol === 'gred') d = nilaiGred(a.guru.gred) - nilaiGred(b.guru.gred);
      else if (sortCol === 'tugas') d = a.bilTugas - b.bilTugas;
      else if (sortCol === 'utama') d = a.bilUtama - b.bilUtama;
      else if (sortCol === 'waktu') d = (a.guru.waktu || 0) - (b.guru.waktu || 0);
      else if (sortCol.startsWith('b:')) {
        const bid = sortCol.slice(2);
        d = (a.ikutBahagian[bid] || 0) - (b.ikutBahagian[bid] || 0);
      } else {
        d = a.jumlah - b.jumlah;
      }
      return d * sortDir || a.guru.nama.localeCompare(b.guru.nama, 'ms');
    });
  };

  const filteredAnalyzed = useMemo(() => {
    const q = norm(search);
    const list = analysis.analisis.filter((r) => {
      if (statusFilter !== 'semua' && r.status !== statusFilter) return false;
      if (gradeFilter && (r.guru.gred || '').trim() !== gradeFilter) return false;
      if (q && !norm([r.guru.nama, r.guru.jawatan, r.guru.opsyen, r.guru.gred].join(' ')).includes(q)) {
        return false;
      }
      return true;
    });
    return sortList(list);
  }, [analysis.analisis, statusFilter, gradeFilter, search, sortCol, sortDir]);

  const filteredOther = useMemo(() => {
    const q = norm(search);
    const list = analysis.senarai
      .filter((r) => !r.analisis)
      .filter((r) => {
        if (gradeFilter && (r.guru.gred || '').trim() !== gradeFilter) return false;
        if (q && !norm([r.guru.nama, r.guru.jawatan, r.guru.opsyen, r.guru.gred].join(' ')).includes(q)) {
          return false;
        }
        return true;
      });
    return sortList(list);
  }, [analysis.senarai, gradeFilter, search, sortCol, sortDir]);

  const exportCsv = () => {
    const header = [
      'Nama',
      'Gred',
      'Jawatan',
      'Waktu',
      ...analysis.senaraiBahagian.map((b) => b.bahagian.singkatan || b.bahagian.nama),
      'Jumlah',
      'Sasaran',
      'Tugas',
      'Utama',
      'Peratus Sasaran',
      'Status',
    ];
    const rows = [...filteredAnalyzed, ...filteredOther].map((r) => [
      r.guru.nama,
      r.guru.gred,
      r.guru.jawatan,
      r.guru.waktu ?? '',
      ...analysis.senaraiBahagian.map((b) => r.ikutBahagian[b.id] || 0),
      r.jumlah,
      r.sasaran != null ? Math.round(r.sasaran * 100) / 100 : '',
      r.bilTugas,
      r.bilUtama,
      r.nisbah != null ? `${Math.round(r.nisbah * 100)}%` : '',
      r.status || 'Tidak dianalisis',
    ]);
    downloadTextFile(`Analisis-Beban-${session.tahun.label}.csv`, buildCsv([header, ...rows]));
    notify('Analisis beban dieksport sebagai CSV.');
  };

  const renderSortIcon = (col: SortColumn) => {
    if (sortCol !== col) return null;
    return sortDir > 0 ? <ArrowUp className="inline h-3 w-3 ml-1" /> : <ArrowDown className="inline h-3 w-3 ml-1" />;
  };

  const gradesList = analysis.gred.map((g) => g.gred);

  if (!analysis.senarai.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--line-2)] bg-[var(--surface)] p-10 text-center">
        <h2 className="text-base font-bold text-[var(--ink)]">Belum ada data untuk dianalisis</h2>
        <p className="mt-1 text-sm text-[var(--ink-3)]">
          Masukkan senarai guru dan isi jawatankuasa dahulu untuk melihat analisis beban.
        </p>
        <button
          type="button"
          onClick={() => navigate({ page: 'guru' })}
          className="mt-4 h-9 rounded-lg bg-[var(--brand)] px-4 text-xs font-semibold text-white"
        >
          Ke Guru &amp; Staf
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ink)]">Analisis Beban</h1>
          <p className="mt-1 text-sm text-[var(--ink-3)]">
            {st.gredKira
              ? `Sasaran beban mengambil kira peranan gred (${analysis.tetapan.ambang.kurang}% – ${analysis.tetapan.ambang.berat}% daripada sasaran gred).`
              : `Julat seimbang ialah ${analysis.tetapan.ambang.kurang}% – ${analysis.tetapan.ambang.berat}% daripada purata (${fmt(st.ambangKurang)} – ${fmt(st.ambangBerat)} mata).`}
          </p>
        </div>
        <div className="no-print flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate({ page: 'laporan' })}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[var(--line-2)] bg-[var(--surface)] px-3.5 text-xs font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--surface-2)] whitespace-nowrap shrink-0"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Laporan penuh</span>
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[var(--line-2)] bg-[var(--surface)] px-3.5 text-xs font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--surface-2)] whitespace-nowrap shrink-0"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Eksport CSV</span>
          </button>
          <button
            type="button"
            onClick={() => printDocument({ title: `Analisis Beban - Sesi ${session.tahun.label}` })}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--brand)] to-[var(--brand-2)] px-4 text-xs font-semibold text-white shadow-sm shadow-[var(--brand)]/25 transition-all hover:opacity-95 whitespace-nowrap shrink-0"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak Analisis</span>
          </button>
        </div>
      </div>

      {/* 6 Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3.5">
          <div className="text-xs text-[var(--ink-3)]">Purata beban</div>
          <div className="font-mono-num mt-1 text-xl font-bold text-[var(--ink)]">{fmt(st.purata)}</div>
          <div className="text-[11px] text-[var(--ink-3)]">Median {fmt(st.median)}</div>
        </div>
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3.5">
          <div className="text-xs text-[var(--ink-3)]">Tertinggi / Terendah</div>
          <div className="font-mono-num mt-1 text-xl font-bold text-[var(--ink)]">
            {fmt(st.max)} <span className="text-sm font-normal text-[var(--ink-3)]">/ {fmt(st.min)}</span>
          </div>
          <div className="text-[11px] text-[var(--ink-3)]">Sisihan piawai {fmt(st.sp)}</div>
        </div>
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3.5">
          <div className="text-xs text-[var(--berat-ink)]">Berat</div>
          <div className="font-mono-num mt-1 text-xl font-bold text-[var(--berat)]">{st.bil.berat}</div>
          <div className="text-[11px] text-[var(--ink-3)]">&gt;{analysis.tetapan.ambang.berat}% sasaran</div>
        </div>
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3.5">
          <div className="text-xs text-[var(--kurang-ink)]">Kurang</div>
          <div className="font-mono-num mt-1 text-xl font-bold text-[var(--kurang)]">{st.bil.kurang}</div>
          <div className="text-[11px] text-[var(--ink-3)]">&lt;{analysis.tetapan.ambang.kurang}% sasaran</div>
        </div>
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3.5">
          <div className="text-xs text-[var(--ink-3)]">Tiada tugas</div>
          <div className="font-mono-num mt-1 text-xl font-bold text-[var(--ink)]">{st.bil.tiada}</div>
          <div className="text-[11px] text-[var(--ink-3)]">Belum dilantik</div>
        </div>
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3.5">
          <div className="text-xs text-[var(--baik-ink)]">Seimbang</div>
          <div className="font-mono-num mt-1 text-xl font-bold text-[var(--baik)]">
            {st.n && !st.awal ? `${st.peratusSeimbang}%` : '–'}
          </div>
          <div className="text-[11px] text-[var(--ink-3)]">{st.bil.seimbang} / {st.n} guru</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1 sm:max-w-[300px]">
          <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-[var(--ink-3)]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, gred atau opsyen..."
            className="h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] pr-3 pl-9 text-sm text-[var(--ink)] focus:border-[var(--brand)] focus:outline-none"
          />
        </div>

        <div className="inline-flex flex-wrap rounded-xl bg-[var(--surface-3)] p-1 text-xs">
          {(st.awal
            ? ([
                ['semua', `Semua ${st.n}`],
                ['awal', `Ada tugas ${st.bil.awal}`],
                ['tiada', `Tiada tugas ${st.bil.tiada}`],
              ] as const)
            : ([
                ['semua', `Semua ${st.n}`],
                ['berat', `Berat ${st.bil.berat}`],
                ['seimbang', `Seimbang ${st.bil.seimbang}`],
                ['kurang', `Kurang ${st.bil.kurang}`],
                ['tiada', `Tiada tugas ${st.bil.tiada}`],
              ] as const)
          ).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setStatusFilter(val)}
              className={`rounded-lg px-2.5 py-1 font-semibold whitespace-nowrap ${
                statusFilter === val
                  ? 'bg-[var(--surface)] text-[var(--ink)] shadow-sm'
                  : 'text-[var(--ink-2)] hover:text-[var(--ink)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {gradesList.length > 1 && (
          <select
            aria-label="Tapis mengikut gred"
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="h-9 rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--ink)]"
          >
            <option value="">Semua gred</option>
            {gradesList.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        )}
      </div>

      <DivisionLegend analysis={analysis} showBand />

      {/* Main Analysis Table */}
      <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[var(--surface-2)] text-[11px] font-semibold tracking-wider text-[var(--ink-3)] uppercase">
                <th className="px-3 py-3 text-right">Bil</th>
                <th className="cursor-pointer px-3 py-3 hover:text-[var(--ink)]" onClick={() => toggleSort('nama')}>
                  Nama {renderSortIcon('nama')}
                </th>
                <th className="cursor-pointer px-3 py-3 hover:text-[var(--ink)]" onClick={() => toggleSort('gred')}>
                  Gred {renderSortIcon('gred')}
                </th>
                <th className="px-3 py-3">Status</th>
                <th className="min-w-[160px] px-3 py-3">Beban</th>
                <th
                  className="cursor-pointer px-3 py-3 text-right hover:text-[var(--ink)]"
                  onClick={() => toggleSort('jumlah')}
                >
                  Jumlah {renderSortIcon('jumlah')}
                </th>
                {st.gredKira && <th className="px-3 py-3 text-right">Sasaran</th>}
                <th
                  className="cursor-pointer px-3 py-3 text-right hover:text-[var(--ink)]"
                  onClick={() => toggleSort('tugas')}
                >
                  Tugas {renderSortIcon('tugas')}
                </th>
                <th
                  className="cursor-pointer px-3 py-3 text-right hover:text-[var(--ink)]"
                  onClick={() => toggleSort('utama')}
                >
                  Utama {renderSortIcon('utama')}
                </th>
                {analysis.senaraiBahagian.map((b) => (
                  <th
                    key={b.id}
                    className="cursor-pointer px-3 py-3 text-right hover:text-[var(--ink)] whitespace-nowrap"
                    onClick={() => toggleSort(`b:${b.id}`)}
                  >
                    {b.bahagian.singkatan || b.bahagian.nama} {renderSortIcon(`b:${b.id}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {filteredAnalyzed.map((r, i) => (
                <tr
                  key={r.id}
                  onClick={() => openTeacherModal(r.id)}
                  className="cursor-pointer transition-colors hover:bg-[var(--surface-2)]"
                >
                  <td className="font-mono-num px-3 py-2.5 text-right text-xs text-[var(--ink-3)]">{i + 1}</td>
                  <td className="px-3 py-2.5 font-semibold text-[var(--ink)]">
                    <div>{r.guru.nama}</div>
                    {r.guru.jawatan && r.guru.jawatan !== 'Guru' && (
                      <div className="text-[11px] font-normal text-[var(--ink-3)]">{r.guru.jawatan}</div>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="font-mono-num rounded border border-[var(--line-2)] px-1.5 py-0.5 text-[11px] font-semibold text-[var(--ink-2)]">
                      {r.guru.gred || '–'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-3 py-2.5">
                    <WorkloadBar teacher={r} analysis={analysis} />
                  </td>
                  <td className="font-mono-num px-3 py-2.5 text-right text-xs font-bold text-[var(--ink)]">
                    {fmt(r.jumlah)}
                  </td>
                  {st.gredKira && (
                    <td className="font-mono-num px-3 py-2.5 text-right text-xs text-[var(--ink-3)]">
                      {fmt(r.sasaran)}
                    </td>
                  )}
                  <td className="font-mono-num px-3 py-2.5 text-right text-xs">{r.bilTugas}</td>
                  <td className="font-mono-num px-3 py-2.5 text-right text-xs">
                    {r.bilUtama > analysis.tetapan.hadUtama ? (
                      <span className="rounded bg-[var(--amaran-soft)] px-1.5 py-0.5 font-bold text-[var(--amaran-ink)]">
                        {r.bilUtama}
                      </span>
                    ) : (
                      r.bilUtama
                    )}
                  </td>
                  {analysis.senaraiBahagian.map((b) => {
                    const pts = r.ikutBahagian[b.id];
                    return (
                      <td key={b.id} className="font-mono-num px-3 py-2.5 text-right text-xs text-[var(--ink-2)]">
                        {pts ? fmt(pts) : <span className="text-[var(--ink-3)]">·</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Non-analyzed staff toggle */}
      {filteredOther.length > 0 && statusFilter === 'semua' && (
        <div className="space-y-3 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-[var(--ink)]">Tidak dianalisis ({filteredOther.length})</h2>
              <p className="text-xs text-[var(--ink-3)]">
                Pentadbir dan staf sokongan. Beban dipaparkan tetapi tidak mempengaruhi purata guru.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowOther((s) => !s)}
              className="h-8 rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--ink)] hover:bg-[var(--surface-3)]"
            >
              {showOther ? 'Sorok' : 'Tunjuk'}
            </button>
          </div>
          {showOther && (
            <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--line)] bg-[var(--surface-2)] text-[11px] font-semibold text-[var(--ink-3)] uppercase">
                      <th className="px-3 py-2.5">Nama</th>
                      <th className="px-3 py-2.5">Gred</th>
                      <th className="px-3 py-2.5">Jawatan</th>
                      <th className="px-3 py-2.5 text-right">Tugas</th>
                      <th className="px-3 py-2.5 text-right">Mata</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {filteredOther.map((r) => (
                      <tr
                        key={r.id}
                        onClick={() => openTeacherModal(r.id)}
                        className="cursor-pointer hover:bg-[var(--surface-2)]"
                      >
                        <td className="px-3 py-2 font-semibold text-[var(--ink)]">{r.guru.nama}</td>
                        <td className="font-mono-num px-3 py-2">{r.guru.gred}</td>
                        <td className="px-3 py-2 text-[var(--ink-2)]">{r.guru.jawatan}</td>
                        <td className="font-mono-num px-3 py-2 text-right">{r.bilTugas}</td>
                        <td className="font-mono-num px-3 py-2 text-right font-bold">{fmt(r.jumlah)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
