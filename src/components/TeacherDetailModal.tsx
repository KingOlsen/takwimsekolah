import React from 'react';
import { ExternalLink, FileText } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { fmt, perananGred } from '../lib/kira';
import { DivisionSquare, Modal, StatusBadge, WorkloadBar } from './Ui';

export const TeacherDetailModal: React.FC = () => {
  const {
    focusedTeacherId,
    openTeacherModal,
    analysis,
    navigate,
    setFocusedCommitteeId,
  } = useStore();

  const teacher = focusedTeacherId ? analysis.guruMap[focusedTeacherId] : null;
  if (!teacher) return null;

  const g = teacher.guru;
  const roleDesc = perananGred(g.gred);

  const groupedByDivision = analysis.senaraiBahagian
    .map((b, idx) => ({
      div: b,
      idx,
      tasks: teacher.tugas.filter((t) => t.bahagianId === b.id),
      points: teacher.ikutBahagian[b.id] || 0,
    }))
    .filter((grp) => grp.tasks.length > 0);

  return (
    <Modal
      open={!!teacher}
      onClose={() => openTeacherModal(null)}
      title={g.nama}
      subtitle={[g.gred, roleDesc, g.jawatan, g.opsyen].filter(Boolean).join(' · ')}
      size="lg"
      footer={
        <>
          <button
            type="button"
            onClick={() => {
              openTeacherModal(null);
              navigate({ page: 'surat' });
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--surface-3)] whitespace-nowrap shrink-0"
          >
            <FileText className="h-4 w-4" />
            Lihat Surat Lantikan
          </button>
          <button
            type="button"
            onClick={() => openTeacherModal(null)}
            className="h-9 rounded-lg bg-[var(--brand)] px-4 text-sm font-semibold text-white hover:bg-[var(--brand-2)] whitespace-nowrap shrink-0"
          >
            Tutup
          </button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Metrics strip */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-3">
            <div className="text-xs text-[var(--ink-3)]">Jumlah beban</div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono-num text-xl font-bold text-[var(--ink)]">{fmt(teacher.jumlah)}</span>
              <span className="text-xs text-[var(--ink-3)]">mata</span>
            </div>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-3">
            <div className="text-xs text-[var(--ink-3)]">
              {analysis.stat.gredKira ? 'Sasaran gred' : 'Purata sekolah'}
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono-num text-xl font-bold text-[var(--ink)]">
                {teacher.analisis ? fmt(teacher.sasaran) : '–'}
              </span>
              <span className="text-xs text-[var(--ink-3)]">
                {teacher.nisbah != null ? `(${Math.round(teacher.nisbah * 100)}%)` : ''}
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-3">
            <div className="text-xs text-[var(--ink-3)]">Jawatan dipegang</div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono-num text-xl font-bold text-[var(--ink)]">{teacher.bilTugas}</span>
              <span className="text-xs text-[var(--ink-3)]">
                ({teacher.bilUtama} utama)
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-3">
            <div className="text-xs text-[var(--ink-3)]">Status beban</div>
            <div className="mt-1.5">
              {teacher.analisis ? (
                <StatusBadge status={teacher.status} />
              ) : (
                <span className="text-xs font-medium text-[var(--ink-3)]">Tidak dianalisis</span>
              )}
            </div>
          </div>
        </div>

        {/* Visual bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--ink-3)]">
            <span>Pecahan beban mengikut bahagian</span>
            {g.waktu != null && (
              <span className="tabular-nums">
                Waktu mengajar: {g.waktu} waktu/minggu
                {analysis.tetapan.waktu.kira ? ` (${fmt(teacher.mataWaktu)} mata)` : ''}
              </span>
            )}
          </div>
          <WorkloadBar teacher={teacher} analysis={analysis} />
        </div>

        {/* Task list grouped by division */}
        {groupedByDivision.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--line-2)] p-6 text-center text-sm text-[var(--ink-3)]">
            Guru ini belum memegang sebarang jawatan dalam sesi ini.
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-3)]">
              Senarai Tugas &amp; Jawatankuasa ({teacher.bilTugas})
            </h3>
            <div className="divide-y divide-[var(--line)] rounded-xl border border-[var(--line)]">
              {groupedByDivision.map(({ div, idx, tasks, points }) => (
                <div key={div.id} className="p-3.5">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
                      <DivisionSquare index={idx} />
                      <span>{div.bahagian.nama}</span>
                    </div>
                    <span className="font-mono-num text-xs font-semibold text-[var(--ink-2)]">
                      {fmt(points)} mata
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {tasks.map((t) => (
                      <div
                        key={t.ahliId}
                        className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-[var(--surface-2)]"
                      >
                        <div className="min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => {
                              setFocusedCommitteeId(t.jkId);
                              openTeacherModal(null);
                              navigate({ page: 'bahagian', bahagianId: t.bahagianId });
                            }}
                            className="inline-flex items-center gap-1.5 text-left font-medium text-[var(--brand-text)] hover:underline"
                          >
                            <span className="truncate">{t.jkNama}</span>
                            <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />
                          </button>
                          <div className="text-xs text-[var(--ink-3)]">
                            {t.jawatan}
                            {t.butiran ? ` · ${t.butiran}` : ''}
                            {t.tahap !== 'sederhana' ? ` · Tahap ${t.tahap}` : ''}
                          </div>
                        </div>
                        <span className="font-mono-num shrink-0 text-xs font-semibold text-[var(--ink-2)]">
                          {fmt(t.mata)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {g.catatan && (
          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-3 text-xs text-[var(--ink-2)]">
            <span className="font-semibold text-[var(--ink)]">Catatan: </span>
            {g.catatan}
          </div>
        )}
      </div>
    </Modal>
  );
};
