import React, { useEffect } from 'react';
import { AlertTriangle, ArrowDown, ArrowUp, Check, Circle, Minus, X } from 'lucide-react';
import type { AnalysisResult, TeacherResult, WorkloadStatus } from '../types/tugasadil';
import { fmt, STATUS } from '../lib/kira';

export const DIVISION_COLORS = [
  'var(--s1)',
  'var(--s2)',
  'var(--s3)',
  'var(--s4)',
  'var(--s5)',
  'var(--s6)',
  'var(--s7)',
  'var(--s8)',
];

export function divisionColor(index: number): string {
  return DIVISION_COLORS[index % DIVISION_COLORS.length] || 'var(--s0)';
}

export const DivisionSquare: React.FC<{ index: number; className?: string }> = ({ index, className = '' }) => (
  <span
    aria-hidden="true"
    className={`inline-block h-2.5 w-2.5 shrink-0 rounded-[3px] ${className}`}
    style={{ backgroundColor: divisionColor(index) }}
  />
);

export const StatusBadge: React.FC<{ status: WorkloadStatus | null }> = ({ status }) => {
  if (!status) return <span className="text-xs text-[var(--ink-3)]">–</span>;
  const info = STATUS[status];
  if (status === 'berat') {
    return (
      <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-md bg-[var(--berat-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--berat-ink)]">
        <ArrowUp className="h-3 w-3" />
        {info.nama}
      </span>
    );
  }
  if (status === 'kurang') {
    return (
      <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-md bg-[var(--kurang-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--kurang-ink)]">
        <ArrowDown className="h-3 w-3" />
        {info.nama}
      </span>
    );
  }
  if (status === 'seimbang') {
    return (
      <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-md bg-[var(--baik-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--baik-ink)]">
        <Check className="h-3 w-3" />
        {info.nama}
      </span>
    );
  }
  if (status === 'awal') {
    return (
      <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-[var(--line-2)] px-2 py-0.5 text-xs font-medium text-[var(--ink-2)]">
        <Circle className="h-2.5 w-2.5" />
        {info.nama}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-[var(--line-2)] px-2 py-0.5 text-xs font-medium text-[var(--ink-3)]">
      <Minus className="h-3 w-3" />
      {info.nama}
    </span>
  );
};

export const WorkloadBar: React.FC<{
  teacher: TeacherResult;
  analysis: AnalysisResult;
  maxOverride?: number;
}> = ({ teacher, analysis, maxOverride }) => {
  const st = analysis.stat;
  const amb = analysis.tetapan.ambang;
  const maxVal = Math.max(maxOverride || st.maxSemua || 1, st.maksAmbang || 1, 1);
  const totalPct = Math.min(100, Math.max(0, (teacher.jumlah / maxVal) * 100));

  const target = teacher.analisis ? teacher.sasaran : null;
  const bandLeft = target != null ? Math.min(100, ((target * amb.kurang) / 100 / maxVal) * 100) : null;
  const bandRight = target != null ? Math.min(100, ((target * amb.berat) / 100 / maxVal) * 100) : null;
  const targetLine = target != null ? Math.min(100, (target / maxVal) * 100) : null;

  return (
    <div className="relative h-3.5 w-full min-w-[130px] overflow-hidden rounded-full bg-[var(--surface-2)]">
      {bandLeft != null && bandRight != null && bandRight > bandLeft && (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 bg-[var(--baik)]/15"
          style={{ left: `${bandLeft}%`, width: `${bandRight - bandLeft}%` }}
        />
      )}
      {targetLine != null && (
        <span
          aria-hidden="true"
          title={`Sasaran: ${fmt(target)} mata`}
          className="absolute inset-y-0 z-10 w-[1.5px] bg-[var(--ink-2)]/65"
          style={{ left: `${targetLine}%` }}
        />
      )}
      <div className="relative z-[1] flex h-full overflow-hidden rounded-full" style={{ width: `${totalPct}%` }}>
        {analysis.senaraiBahagian.map((b, idx) => {
          const pts = teacher.ikutBahagian[b.id] || 0;
          if (!pts) return null;
          return (
            <span
              key={b.id}
              title={`${b.bahagian.nama}: ${fmt(pts)} mata`}
              style={{ flex: `${pts} 0 0`, backgroundColor: divisionColor(idx) }}
            />
          );
        })}
        {teacher.mataWaktu > 0 && (
          <span
            title={`Waktu mengajar: ${fmt(teacher.mataWaktu)} mata`}
            style={{ flex: `${teacher.mataWaktu} 0 0`, backgroundColor: 'var(--s0)' }}
          />
        )}
      </div>
    </div>
  );
};

export const DivisionLegend: React.FC<{ analysis: AnalysisResult; showBand?: boolean }> = ({
  analysis,
  showBand = false,
}) => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[var(--ink-3)]">
    {analysis.senaraiBahagian.map((b, idx) => (
      <span key={b.id} className="inline-flex items-center gap-1.5">
        <DivisionSquare index={idx} />
        <span>{b.bahagian.singkatan || b.bahagian.nama}</span>
      </span>
    ))}
    {analysis.tetapan.waktu.kira && (
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rounded-[3px] bg-[var(--s0)]" />
        <span>Waktu mengajar</span>
      </span>
    )}
    {showBand && (
      <>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-0.5 bg-[var(--ink-2)]/70" />
          <span>{analysis.stat.gredKira ? 'Sasaran gred' : 'Purata'}</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-4 rounded-xs bg-[var(--baik)]/20" />
          <span>Julat seimbang</span>
        </span>
      </>
    )}
  </div>
);

export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  footer?: React.ReactNode;
}> = ({ open, onClose, title, subtitle, size = 'md', children, footer }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const widthClass =
    size === 'sm'
      ? 'max-w-[440px]'
      : size === 'lg'
      ? 'max-w-[760px]'
      : size === 'xl'
      ? 'max-w-[1000px]'
      : 'max-w-[560px]';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-xs"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] shadow-2xl ${widthClass}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-base font-bold tracking-tight text-[var(--ink)]">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-[var(--ink-3)]">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[var(--ink-3)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="custom-scroll min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[var(--line)] bg-[var(--surface-2)]/60 px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export const ConfirmModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}> = ({ open, onClose, onConfirm, title, message, confirmLabel = 'Sahkan', danger = false }) => (
  <Modal
    open={open}
    onClose={onClose}
    title={title}
    size="sm"
    footer={
      <>
        <button
          type="button"
          onClick={onClose}
          className="h-9 rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--surface-3)] whitespace-nowrap shrink-0"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`h-9 rounded-lg px-3.5 text-sm font-semibold text-white whitespace-nowrap shrink-0 ${
            danger
              ? 'bg-[var(--berat)] hover:opacity-90'
              : 'bg-[var(--brand)] hover:bg-[var(--brand-2)]'
          }`}
        >
          {confirmLabel}
        </button>
      </>
    }
  >
    <div className="flex items-start gap-3 text-sm leading-relaxed text-[var(--ink-2)]">
      {danger && <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--berat)]" />}
      <p>{message}</p>
    </div>
  </Modal>
);
