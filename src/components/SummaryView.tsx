import React from 'react';
import { BookOpen, Check, FileSpreadsheet, Lock, Printer } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { fmt } from '../lib/kira';
import { printDocument } from '../lib/excel';
import { DivisionSquare } from './Ui';

export const SummaryView: React.FC = () => {
  const {
    store,
    session,
    analysis,
    canManage,
    navigate,
    openTeacherModal,
    setFocusedCommitteeId,
    toggleLockSession,
  } = useStore();

  const st = analysis.stat;
  const bilB = analysis.senaraiBahagian.length;
  const bilSiap = analysis.senaraiBahagian.filter((b) => b.siap).length;
  const semuaSiap = bilB > 0 && bilSiap === bilB && st.bilJk > 0;

  const pentadbirByDiv: Record<string, string[]> = {};
  store.pengguna.forEach((p) => {
    if (p.peranan !== 'pentadbir') return;
    (p.bahagian || []).forEach((b) => {
      (pentadbirByDiv[b] = pentadbirByDiv[b] || []).push(p.nama);
    });
  });

  const maxGradeAvg = Math.max(
    ...analysis.gred.map((g) => Math.max(g.purata, g.sasaran * (analysis.tetapan.ambang.berat / 100))),
    1
  );

  const emptyByDiv: Record<string, typeof analysis.kosong> = {};
  analysis.kosong.forEach((k) => {
    (emptyByDiv[k.bahagianId] = emptyByDiv[k.bahagianId] || []).push(k);
  });

  const tiadaTugas = analysis.analisis.filter((r) => r.status === 'tiada');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ink)]">Rumusan</h1>
          <p className="mt-1 text-sm text-[var(--ink-3)]">
            {store.sekolah.nama} · Sesi {session.tahun.label} · {bilSiap} daripada {bilB} bahagian ditandakan siap
          </p>
        </div>
        <div className="no-print flex flex-wrap items-center gap-2">
          {semuaSiap && canManage && !session.tahun.kunci && (
            <button
              type="button"
              onClick={() => toggleLockSession(session.tahun.id, true)}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[var(--line-2)] bg-[var(--surface)] px-3.5 text-xs font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--surface-2)] whitespace-nowrap"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Kunci sesi</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate({ page: 'laporan' })}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[var(--line-2)] bg-[var(--surface)] px-3.5 text-xs font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--surface-2)] whitespace-nowrap"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Laporan Penuh</span>
          </button>
          <button
            type="button"
            onClick={() =>
              printDocument({ title: `Rumusan ${store.sekolah.nama} - Sesi ${session.tahun.label}` })
            }
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--line-2)] bg-[var(--surface)] px-4 text-xs font-semibold text-[var(--ink)] shadow-2xs transition-colors hover:bg-[var(--surface-2)] whitespace-nowrap"
          >
            <Printer className="h-4 w-4 text-[var(--brand)]" />
            <span>Cetak Rumusan</span>
          </button>
          <button
            type="button"
            onClick={() => navigate({ page: 'buku' })}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--brand)] to-[var(--brand-2)] px-4 text-xs font-semibold text-white shadow-sm shadow-[var(--brand)]/25 transition-all hover:opacity-95 whitespace-nowrap"
          >
            <BookOpen className="h-4 w-4" />
            <span>Buku Pengurusan</span>
          </button>
        </div>
      </div>

      {/* Division Progress Table */}
      <section className="space-y-2.5">
        <h2 className="text-base font-bold text-[var(--ink)]">Kemajuan mengikut bahagian</h2>
        <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--surface-2)] text-[11px] font-semibold tracking-wider text-[var(--ink-3)] uppercase">
                  <th className="px-4 py-3">Bahagian</th>
                  <th className="px-4 py-3">Diurus oleh</th>
                  <th className="px-4 py-3 text-right">J/kuasa</th>
                  <th className="px-4 py-3 text-right">Jawatan</th>
                  <th className="px-4 py-3 text-right">Diisi</th>
                  <th className="px-4 py-3 text-right">Kosong</th>
                  <th className="px-4 py-3 text-right">Guru terlibat</th>
                  <th className="px-4 py-3 text-right">Jumlah mata</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {analysis.senaraiBahagian.map((b, idx) => (
                  <tr
                    key={b.id}
                    onClick={() => navigate({ page: 'bahagian', bahagianId: b.id })}
                    className="cursor-pointer hover:bg-[var(--surface-2)]"
                  >
                    <td className="px-4 py-2.5 font-semibold text-[var(--ink)]">
                      <span className="inline-flex items-center gap-2">
                        <DivisionSquare index={idx} />
                        <span>{b.bahagian.nama}</span>
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-[var(--ink-2)]">
                      {pentadbirByDiv[b.id]?.join(', ') || 'Pentadbir sekolah'}
                    </td>
                    <td className="font-mono-num px-4 py-2.5 text-right text-xs">{b.bilJk}</td>
                    <td className="font-mono-num px-4 py-2.5 text-right text-xs">{b.bilJawatan}</td>
                    <td className="font-mono-num px-4 py-2.5 text-right text-xs font-semibold">{b.bilDiisi}</td>
                    <td className="font-mono-num px-4 py-2.5 text-right text-xs text-[var(--amaran-ink)]">
                      {b.bilKosong}
                    </td>
                    <td className="font-mono-num px-4 py-2.5 text-right text-xs">{b.guruIds.length}</td>
                    <td className="font-mono-num px-4 py-2.5 text-right text-xs font-bold">{fmt(b.mata)}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold ${
                          b.siap
                            ? 'bg-[var(--baik-soft)] text-[var(--baik-ink)]'
                            : 'border border-[var(--line-2)] text-[var(--ink-3)]'
                        }`}
                      >
                        {b.siap && <Check className="h-3 w-3" />}
                        {b.siap ? 'Siap' : 'Draf'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-[var(--line)] bg-[var(--surface-2)] text-xs font-bold text-[var(--ink)]">
                  <td className="px-4 py-2.5">Jumlah</td>
                  <td className="px-4 py-2.5" />
                  <td className="font-mono-num px-4 py-2.5 text-right">{st.bilJk}</td>
                  <td className="font-mono-num px-4 py-2.5 text-right">{st.bilJawatan}</td>
                  <td className="font-mono-num px-4 py-2.5 text-right">{st.bilJawatan - st.bilKosong}</td>
                  <td className="font-mono-num px-4 py-2.5 text-right">{st.bilKosong}</td>
                  <td className="px-4 py-2.5" />
                  <td className="px-4 py-2.5" />
                  <td className="px-4 py-2.5">{bilSiap} / {bilB} siap</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>

      {/* Grade-by-Grade Analysis */}
      {analysis.gred.length > 0 && (
        <section className="space-y-2.5">
          <div>
            <h2 className="text-base font-bold text-[var(--ink)]">Purata beban mengikut gred</h2>
            <p className="text-xs text-[var(--ink-3)]">
              Guru yang dianalisis sahaja. Garis menegak ialah sasaran gred berdasarkan Deskripsi Tugas PPP (KPM).
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--line)] bg-[var(--surface-2)] text-[11px] font-semibold tracking-wider text-[var(--ink-3)] uppercase">
                    <th className="px-4 py-3">Gred</th>
                    {st.gredKira && <th className="px-4 py-3">Peranan gred</th>}
                    <th className="px-4 py-3 text-right">Bil. guru</th>
                    <th className="min-w-[160px] px-4 py-3">Purata beban</th>
                    <th className="px-4 py-3 text-right">Purata</th>
                    {st.gredKira && <th className="px-4 py-3 text-right">Sasaran</th>}
                    <th className="px-4 py-3 text-right">Terendah</th>
                    <th className="px-4 py-3 text-right">Tertinggi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {analysis.gred.map((g) => {
                    const barPct = Math.min(100, (g.purata / maxGradeAvg) * 100);
                    const targetPct = Math.min(100, (g.sasaran / maxGradeAvg) * 100);
                    return (
                      <tr key={g.gred} className="hover:bg-[var(--surface-2)]">
                        <td className="px-4 py-2.5">
                          <span className="font-mono-num rounded border border-[var(--line-2)] px-1.5 py-0.5 font-bold">
                            {g.gred}
                          </span>
                        </td>
                        {st.gredKira && <td className="px-4 py-2.5 text-[var(--ink-2)]">{g.peranan || '—'}</td>}
                        <td className="font-mono-num px-4 py-2.5 text-right">{g.n}</td>
                        <td className="px-4 py-2.5">
                          <div className="relative h-3 w-full overflow-hidden rounded bg-[var(--surface-3)]">
                            {st.gredKira && st.asas > 0 && (
                              <span
                                aria-hidden="true"
                                className="absolute inset-y-0 z-10 w-[1.5px] bg-[var(--ink-2)]/70"
                                style={{ left: `${targetPct}%` }}
                              />
                            )}
                            <div
                              className="h-full rounded bg-[var(--brand)]"
                              style={{ width: `${barPct}%` }}
                            />
                          </div>
                        </td>
                        <td className="font-mono-num px-4 py-2.5 text-right font-bold">{fmt(g.purata)}</td>
                        {st.gredKira && (
                          <td className="font-mono-num px-4 py-2.5 text-right text-[var(--ink-3)]">
                            {fmt(g.sasaran)}
                          </td>
                        )}
                        <td className="font-mono-num px-4 py-2.5 text-right">{fmt(g.min)}</td>
                        <td className="font-mono-num px-4 py-2.5 text-right">{fmt(g.max)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Things to Check */}
      {(analysis.kosong.length > 0 ||
        tiadaTugas.length > 0 ||
        analysis.lebihUtama.length > 0 ||
        analysis.pendua.length > 0) && (
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[var(--ink)]">Perkara untuk disemak</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {analysis.kosong.length > 0 && (
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[var(--ink)]">Jawatan belum diisi</h3>
                  <span className="font-mono-num rounded bg-[var(--amaran-soft)] px-2 py-0.5 text-xs font-bold text-[var(--amaran-ink)]">
                    {analysis.kosong.length}
                  </span>
                </div>
                <div className="mt-3 space-y-2.5 text-xs">
                  {analysis.senaraiBahagian
                    .filter((b) => emptyByDiv[b.id]?.length)
                    .map((b) => {
                      const list = emptyByDiv[b.id];
                      return (
                        <div key={b.id}>
                          <button
                            type="button"
                            onClick={() => navigate({ page: 'bahagian', bahagianId: b.id })}
                            className="font-bold text-[var(--brand-text)] hover:underline"
                          >
                            {b.bahagian.nama} ({list.length})
                          </button>
                          <div className="mt-0.5 text-[var(--ink-3)]">
                            {list.map((k) => `${k.jawatan || 'Ahli'}, ${k.jkNama}`).join(' · ')}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {analysis.lebihUtama.length > 0 && (
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[var(--ink)]">
                    Melebihi {analysis.tetapan.hadUtama} jawatan utama
                  </h3>
                  <span className="font-mono-num rounded bg-[var(--amaran-soft)] px-2 py-0.5 text-xs font-bold text-[var(--amaran-ink)]">
                    {analysis.lebihUtama.length}
                  </span>
                </div>
                <div className="mt-3 space-y-1.5 text-xs">
                  {analysis.lebihUtama.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => openTeacherModal(r.id)}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left hover:bg-[var(--surface-2)]"
                    >
                      <span className="font-semibold text-[var(--ink)]">{r.guru.nama}</span>
                      <span className="font-mono-num text-[var(--amaran-ink)]">
                        {r.bilUtama} jawatan utama
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tiadaTugas.length > 0 && (
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[var(--ink)]">Guru tanpa sebarang tugas</h3>
                  <span className="font-mono-num rounded border border-[var(--line-2)] px-2 py-0.5 text-xs font-bold text-[var(--ink-2)]">
                    {tiadaTugas.length}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tiadaTugas.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => openTeacherModal(r.id)}
                      className="rounded-lg border border-[var(--line-2)] px-2.5 py-1 text-xs font-medium text-[var(--ink)] hover:bg-[var(--surface-3)]"
                    >
                      {r.guru.nama}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {analysis.pendua.length > 0 && (
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[var(--ink)]">
                    Nama berulang dalam jawatankuasa sama
                  </h3>
                  <span className="font-mono-num rounded bg-[var(--amaran-soft)] px-2 py-0.5 text-xs font-bold text-[var(--amaran-ink)]">
                    {analysis.pendua.length}
                  </span>
                </div>
                <div className="mt-3 space-y-1.5 text-xs">
                  {analysis.pendua.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setFocusedCommitteeId(p.jkId);
                        navigate({ page: 'bahagian', bahagianId: p.bahagianId });
                      }}
                      className="block text-left font-medium text-[var(--brand-text)] hover:underline"
                    >
                      {analysis.guruMap[p.guruId]?.guru.nama} · {p.jkNama}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
