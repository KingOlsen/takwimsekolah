import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { norm, fmt } from '../lib/kira';
import { StatusBadge } from './Ui';

export const SearchModal: React.FC = () => {
  const { searchOpen, setSearchOpen, analysis, openTeacherModal } = useStore();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (searchOpen) {
      setQuery('');
      setActiveIndex(0);
    }
  }, [searchOpen]);

  const matches = useMemo(() => {
    const q = norm(query);
    return analysis.senarai
      .filter((r) => {
        if (!q) return true;
        const g = r.guru;
        return norm([g.nama, g.jawatan, g.opsyen, g.gred].join(' ')).includes(q);
      })
      .slice(0, 30);
  }, [analysis.senarai, query]);

  useEffect(() => {
    if (activeIndex >= matches.length) {
      setActiveIndex(Math.max(0, matches.length - 1));
    }
  }, [matches.length, activeIndex]);

  if (!searchOpen) return null;

  const selectTeacher = (id: string) => {
    setSearchOpen(false);
    openTeacherModal(id);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-16 backdrop-blur-[1px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setSearchOpen(false);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Cari guru"
        className="w-full max-w-[540px] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-[var(--line)] px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-[var(--ink-3)]" />
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setSearchOpen(false);
              else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex((i) => Math.min(matches.length - 1, i + 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex((i) => Math.max(0, i - 1));
              } else if (e.key === 'Enter' && matches[activeIndex]) {
                e.preventDefault();
                selectTeacher(matches[activeIndex].id);
              }
            }}
            placeholder="Cari nama guru, gred, jawatan atau opsyen..."
            className="w-full bg-transparent text-sm text-[var(--ink)] placeholder:text-[var(--ink-3)] focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            className="rounded border border-[var(--line-2)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--ink-3)] hover:text-[var(--ink)]"
          >
            Esc
          </button>
        </div>
        <div className="custom-scroll max-h-[380px] overflow-y-auto p-1.5">
          {matches.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-[var(--ink-3)]">
              Tiada guru sepadan dengan carian tersebut.
            </p>
          ) : (
            matches.map((r, idx) => (
              <button
                key={r.id}
                type="button"
                onClick={() => selectTeacher(r.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                  idx === activeIndex ? 'bg-[var(--surface-3)]' : 'hover:bg-[var(--surface-2)]'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-[var(--ink)]">{r.guru.nama}</div>
                  <div className="truncate text-xs text-[var(--ink-3)]">
                    {[r.guru.gred, r.guru.jawatan, r.guru.opsyen].filter(Boolean).join(' · ')}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2.5">
                  <span className="font-mono-num text-xs font-medium text-[var(--ink-2)]">
                    {r.bilTugas} tugas · {fmt(r.jumlah)} mata
                  </span>
                  {r.analisis && <StatusBadge status={r.status} />}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
