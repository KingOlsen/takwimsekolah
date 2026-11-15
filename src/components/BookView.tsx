import React, { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Plus,
  Printer,
  Trash2,
} from 'lucide-react';
import { uid, useStore } from '../context/StoreContext';
import { fmt } from '../lib/kira';
import { printDocument } from '../lib/excel';
import { defaultBookConfig } from '../lib/demoData';
import { TEMPLAT_HALAMAN } from '../lib/templat';
import type { BookConfig, ExtraPage } from '../types/tugasadil';
import { Modal } from './Ui';

const COVER_PRESETS = [
  { id: 'indigo', nama: 'Indigo & Sian Moden', warna: '#4f46e5', aksen: '#06b6d4' },
  { id: 'zamrud', nama: 'Zamrud & Emas', warna: '#065f46', aksen: '#10b981' },
  { id: 'nilam', nama: 'Nilam Gelap & Ungu', warna: '#0f172a', aksen: '#8b5cf6' },
  { id: 'biru', nama: 'Biru Diraja & Amber', warna: '#1e3a8a', aksen: '#f59e0b' },
  { id: 'burgundy', nama: 'Burgundy & Jingga', warna: '#7a1c2e', aksen: '#ea6a1f' },
  { id: 'arang', nama: 'Arang & Sian', warna: '#18181b', aksen: '#22d3ee' },
];

const COVER_STYLES: { id: BookConfig['kulit']['gaya']; nama: string }[] = [
  { id: 'klasik', nama: 'Klasik' },
  { id: 'moden', nama: 'Moden' },
  { id: 'jalur', nama: 'Jalur' },
  { id: 'minimal', nama: 'Minimal' },
  { id: 'rasmi', nama: 'Rasmi' },
];

function mergeBookConfig(raw: Partial<BookConfig> | undefined, schoolName: string, motto: string): BookConfig {
  const def = defaultBookConfig(schoolName, motto);
  const pages = (raw?.halamanTambahan || def.halamanTambahan).map((p) => ({
    ...p,
    isi: p.isi.replace(/SMK Seri Contoh/gi, schoolName),
  }));
  return {
    kulit: { ...def.kulit, ...(raw?.kulit || {}) },
    bahagian: { ...def.bahagian, ...(raw?.bahagian || {}) },
    pilihan: { ...def.pilihan, ...(raw?.pilihan || {}) },
    halamanTambahan: pages,
    pengesahan: { ...def.pengesahan, ...(raw?.pengesahan || {}) },
  };
}

export const BookView: React.FC = () => {
  const { store, session, analysis, canManage, updateSettings, notify } = useStore();

  const cfg = useMemo(
    () => mergeBookConfig(session.tetapan.buku, store.sekolah.nama, store.sekolah.moto),
    [session.tetapan.buku, store.sekolah.nama, store.sekolah.moto]
  );

  const [zoom, setZoom] = useState<number>(0.85);
  const [viewMode, setViewMode] = useState<'tatal' | 'selak'>('tatal');
  const [sectionIdx, setSectionIdx] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [printingAll, setPrintingAll] = useState(false);

  // Add/Edit extra page modal
  const [pageModalOpen, setPageModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<ExtraPage | null>(null);
  const [pageTajuk, setPageTajuk] = useState('');
  const [pageLetak, setPageLetak] = useState<'depan' | 'belakang'>('depan');
  const [pageIsi, setPageIsi] = useState('');

  const updateCfg = (updater: (prev: BookConfig) => BookConfig) => {
    updateSettings({ buku: updater(cfg) });
  };

  const openPageEditor = (page: ExtraPage | null) => {
    setEditingPage(page);
    setPageTajuk(page ? page.tajuk : '');
    setPageLetak(page ? page.letak : 'depan');
    setPageIsi(page ? page.isi : '');
    setPageModalOpen(true);
  };

  const saveExtraPage = (e: React.FormEvent) => {
    e.preventDefault();
    const newPage: ExtraPage = {
      id: editingPage ? editingPage.id : uid('hp'),
      tajuk: pageTajuk.trim() || 'Halaman Tambahan',
      letak: pageLetak,
      isi: pageIsi,
      aktif: true,
    };
    updateCfg((prev) => ({
      ...prev,
      halamanTambahan: editingPage
        ? prev.halamanTambahan.map((p) => (p.id === editingPage.id ? newPage : p))
        : [...prev.halamanTambahan, newPage],
    }));
    setPageModalOpen(false);
    notify('Halaman tambahan disimpan.');
  };

  const applyTemplatePage = (tplId: string) => {
    const tpl = TEMPLAT_HALAMAN.find((t) => t.id === tplId);
    if (!tpl) return;
    setPageTajuk(tpl.tajuk);
    setPageLetak(tpl.letak);
    setPageIsi(tpl.isi);
  };

  // Build ordered list of book sections
  const sections = useMemo(() => {
    const list: { id: string; label: string }[] = [];
    if (cfg.bahagian.kulit) list.push({ id: 'kulit', label: 'Kulit Hadapan' });
    if (cfg.bahagian.kandungan) list.push({ id: 'kandungan', label: 'Isi Kandungan' });
    if (cfg.bahagian.halamanAwal) {
      cfg.halamanTambahan
        .filter((p) => p.aktif && p.letak === 'depan')
        .forEach((p) => list.push({ id: `extra:${p.id}`, label: p.tajuk }));
    }
    if (cfg.bahagian.senaraiGuru) list.push({ id: 'senaraiGuru', label: 'Senarai Guru dan Staf' });
    if (cfg.bahagian.carta) list.push({ id: 'carta', label: 'Carta Organisasi' });
    if (cfg.bahagian.jawatankuasa) {
      analysis.senaraiBahagian.forEach((b) =>
        list.push({ id: `div:${b.id}`, label: `Jawatankuasa ${b.bahagian.nama}` })
      );
    }
    if (cfg.bahagian.tugasGuru) list.push({ id: 'tugasGuru', label: 'Senarai Tugas Mengikut Guru' });
    if (cfg.bahagian.rumusan) list.push({ id: 'rumusan', label: 'Rumusan Agihan Tugas' });
    if (cfg.bahagian.halamanAwal) {
      cfg.halamanTambahan
        .filter((p) => p.aktif && p.letak === 'belakang')
        .forEach((p) => list.push({ id: `extra:${p.id}`, label: p.tajuk }));
    }
    if (cfg.bahagian.pengesahan) list.push({ id: 'pengesahan', label: 'Halaman Pengesahan' });
    return list;
  }, [cfg, analysis.senaraiBahagian]);

  const safeIdx = Math.max(0, Math.min(sectionIdx, Math.max(0, sections.length - 1)));
  const shouldShow = (id: string) => printingAll || viewMode === 'tatal' || sections[safeIdx]?.id === id;

  const triggerPrintAllPages = () => {
    setPrintingAll(true);
    requestAnimationFrame(() => {
      setTimeout(() => {
        printDocument({
          selector: '.print-only-root',
          title: `Buku Pengurusan ${store.sekolah.nama} - Sesi ${session.tahun.label}`,
          onAfterPrint: () => setPrintingAll(false),
        });
      }, 120);
    });
  };

  const triggerPrintCurrentPage = () => {
    printDocument({
      selector: '.print-only-root',
      title: `Buku Pengurusan ${store.sekolah.nama} - ${sections[safeIdx]?.label || 'Halaman'}`,
    });
  };

  const sortedTeachers = useMemo(
    () => [...analysis.senarai].sort((a, b) => (a.guru.urutan || 0) - (b.guru.urutan || 0)),
    [analysis.senarai]
  );

  const sectionHeadingStyle = cfg.pilihan.hiasTajuk
    ? { borderBottom: `3px solid ${cfg.kulit.warna}`, color: cfg.kulit.warna }
    : { borderBottom: '1.5px solid #222', color: '#111' };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="no-print flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ink)]">Buku Pengurusan</h1>
          <p className="mt-1 text-sm text-[var(--ink-3)]">
            Susun kulit hadapan, kandungan dan halaman tambahan ({sections.length} bahagian aktif sedia dicetak sebagai PDF A4 penuh).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {viewMode === 'selak' && (
            <button
              type="button"
              onClick={triggerPrintCurrentPage}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--line-2)] bg-[var(--surface)] px-4 text-xs font-semibold text-[var(--ink)] shadow-2xs transition-all hover:bg-[var(--surface-2)] whitespace-nowrap shrink-0"
            >
              <Printer className="h-4 w-4 text-[var(--brand)]" />
              <span>Cetak halaman ini</span>
            </button>
          )}
          <button
            type="button"
            disabled={printingAll}
            onClick={triggerPrintAllPages}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--brand)] to-[var(--brand-2)] px-4 text-xs font-semibold text-white shadow-sm shadow-[var(--brand)]/25 transition-all hover:opacity-95 disabled:opacity-60 whitespace-nowrap shrink-0"
          >
            <Printer className="h-4 w-4" />
            <span>{printingAll ? 'Menyediakan PDF…' : `Cetak Semua Halaman / PDF (${sections.length})`}</span>
          </button>
        </div>
      </div>

      {/* Main Split */}
      <div
        className={
          fullscreen
            ? 'fixed inset-0 z-50 flex flex-col bg-[var(--bg)] p-4'
            : 'grid items-start gap-5 lg:grid-cols-[330px_minmax(0,1fr)]'
        }
      >
        {/* Left Config Panel */}
        {!fullscreen && (
          <aside className="no-print custom-scroll max-h-[calc(100vh-140px)] overflow-y-auto rounded-2xl border border-[var(--line)] bg-[var(--surface)] lg:sticky lg:top-20">
            {/* Kulit Hadapan */}
            <details open className="border-b border-[var(--line)]">
              <summary className="cursor-pointer px-4 py-3 text-xs font-bold tracking-wider text-[var(--ink-3)] uppercase hover:text-[var(--ink)]">
                Kulit Hadapan
              </summary>
              <div className="space-y-3 px-4 pb-4 text-xs">
                <div>
                  <label className="block font-semibold text-[var(--ink-2)]">Gaya reka bentuk</label>
                  <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                    {COVER_STYLES.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        disabled={!canManage}
                        onClick={() => updateCfg((p) => ({ ...p, kulit: { ...p.kulit, gaya: g.id } }))}
                        className={`rounded-lg border px-2 py-1.5 text-center font-semibold transition-colors ${
                          cfg.kulit.gaya === g.id
                            ? 'border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-text)]'
                            : 'border-[var(--line-2)] text-[var(--ink-2)] hover:bg-[var(--surface-2)]'
                        }`}
                      >
                        {g.nama}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--ink-2)]">Tema warna</label>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {COVER_PRESETS.map((pr) => (
                      <button
                        key={pr.id}
                        type="button"
                        disabled={!canManage}
                        title={pr.nama}
                        onClick={() =>
                          updateCfg((p) => ({
                            ...p,
                            kulit: { ...p.kulit, warna: pr.warna, aksen: pr.aksen },
                          }))
                        }
                        className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${
                          cfg.kulit.warna === pr.warna ? 'border-[var(--ink)] scale-110' : 'border-transparent'
                        }`}
                        style={{ background: `linear-gradient(135deg, ${pr.warna} 60%, ${pr.aksen} 60%)` }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--ink-2)]">Tajuk utama</label>
                  <input
                    disabled={!canManage}
                    value={cfg.kulit.tajuk}
                    onChange={(e) => updateCfg((p) => ({ ...p, kulit: { ...p.kulit, tajuk: e.target.value } }))}
                    className="mt-1 h-8 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--ink-2)]">Subtajuk</label>
                  <input
                    disabled={!canManage}
                    value={cfg.kulit.subtajuk}
                    onChange={(e) => updateCfg((p) => ({ ...p, kulit: { ...p.kulit, subtajuk: e.target.value } }))}
                    className="mt-1 h-8 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-2.5 text-xs"
                  />
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    disabled={!canManage}
                    checked={cfg.kulit.tunjukLogo}
                    onChange={(e) =>
                      updateCfg((p) => ({ ...p, kulit: { ...p.kulit, tunjukLogo: e.target.checked } }))
                    }
                    className="h-3.5 w-3.5 accent-[var(--brand)]"
                  />
                  <span>Papar lencana sekolah pada kulit</span>
                </label>
              </div>
            </details>

            {/* Kandungan */}
            <details open className="border-b border-[var(--line)]">
              <summary className="cursor-pointer px-4 py-3 text-xs font-bold tracking-wider text-[var(--ink-3)] uppercase hover:text-[var(--ink)]">
                Kandungan Buku
              </summary>
              <div className="space-y-2 px-4 pb-4 text-xs">
                {(
                  [
                    ['kulit', 'Kulit hadapan'],
                    ['kandungan', 'Isi kandungan'],
                    ['halamanAwal', 'Halaman tambahan'],
                    ['senaraiGuru', 'Senarai guru dan staf'],
                    ['carta', 'Carta organisasi bahagian'],
                    ['jawatankuasa', 'Jawatankuasa mengikut bahagian'],
                    ['tugasGuru', 'Senarai tugas mengikut guru'],
                    ['rumusan', 'Rumusan agihan tugas'],
                    ['pengesahan', 'Halaman pengesahan'],
                  ] as [keyof BookConfig['bahagian'], string][]
                ).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      disabled={!canManage}
                      checked={cfg.bahagian[key]}
                      onChange={(e) =>
                        updateCfg((p) => ({
                          ...p,
                          bahagian: { ...p.bahagian, [key]: e.target.checked },
                        }))
                      }
                      className="h-3.5 w-3.5 accent-[var(--brand)]"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </details>

            {/* Pilihan Paparan */}
            <details className="border-b border-[var(--line)]">
              <summary className="cursor-pointer px-4 py-3 text-xs font-bold tracking-wider text-[var(--ink-3)] uppercase hover:text-[var(--ink)]">
                Pilihan Paparan
              </summary>
              <div className="space-y-2 px-4 pb-4 text-xs">
                {(
                  [
                    ['paparJawatanHakiki', 'Papar jawatan hakiki'],
                    ['paparGred', 'Papar gred guru'],
                    ['paparBidang', 'Papar bidang tugas jawatankuasa'],
                    ['paparMata', 'Papar mata & status dalam rumusan'],
                    ['sorokKosong', 'Sorokkan jawatan belum diisi'],
                    ['hiasTajuk', 'Hias tajuk halaman ikut warna kulit'],
                  ] as [keyof BookConfig['pilihan'], string][]
                ).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      disabled={!canManage}
                      checked={cfg.pilihan[key]}
                      onChange={(e) =>
                        updateCfg((p) => ({
                          ...p,
                          pilihan: { ...p.pilihan, [key]: e.target.checked },
                        }))
                      }
                      className="h-3.5 w-3.5 accent-[var(--brand)]"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </details>

            {/* Halaman Tambahan */}
            <details className="border-b border-[var(--line)]">
              <summary className="cursor-pointer px-4 py-3 text-xs font-bold tracking-wider text-[var(--ink-3)] uppercase hover:text-[var(--ink)]">
                Halaman Tambahan ({cfg.halamanTambahan.length})
              </summary>
              <div className="space-y-2 px-4 pb-4 text-xs">
                {cfg.halamanTambahan.map((hp) => (
                  <div
                    key={hp.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-2.5 py-2"
                  >
                    <label className="flex min-w-0 flex-1 items-center gap-2">
                      <input
                        type="checkbox"
                        disabled={!canManage}
                        checked={hp.aktif}
                        onChange={(e) =>
                          updateCfg((p) => ({
                            ...p,
                            halamanTambahan: p.halamanTambahan.map((x) =>
                              x.id === hp.id ? { ...x, aktif: e.target.checked } : x
                            ),
                          }))
                        }
                        className="h-3.5 w-3.5 accent-[var(--brand)]"
                      />
                      <span className="truncate font-semibold">{hp.tajuk}</span>
                    </label>
                    {canManage && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => openPageEditor(hp)}
                          className="text-[11px] font-semibold text-[var(--brand-text)] hover:underline"
                        >
                          Sunting
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateCfg((p) => ({
                              ...p,
                              halamanTambahan: p.halamanTambahan.filter((x) => x.id !== hp.id),
                            }))
                          }
                          className="text-[var(--ink-3)] hover:text-[var(--berat)]"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {canManage && (
                  <button
                    type="button"
                    onClick={() => openPageEditor(null)}
                    className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-[var(--brand)] py-2 text-xs font-semibold text-[var(--brand-text)] hover:bg-[var(--brand-soft)]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Tambah halaman / templat KPM</span>
                  </button>
                )}
              </div>
            </details>

            {/* Pengesahan */}
            <details>
              <summary className="cursor-pointer px-4 py-3 text-xs font-bold tracking-wider text-[var(--ink-3)] uppercase hover:text-[var(--ink)]">
                Halaman Pengesahan
              </summary>
              <div className="space-y-2.5 px-4 pb-4 text-xs">
                <div>
                  <label className="block font-semibold text-[var(--ink-2)]">Disediakan oleh</label>
                  <input
                    disabled={!canManage}
                    value={cfg.pengesahan.penyediaNama}
                    onChange={(e) =>
                      updateCfg((p) => ({
                        ...p,
                        pengesahan: { ...p.pengesahan, penyediaNama: e.target.value },
                      }))
                    }
                    className="mt-1 h-8 w-full rounded-lg border border-[var(--line-2)] px-2.5 text-xs"
                  />
                  <input
                    disabled={!canManage}
                    value={cfg.pengesahan.penyediaJawatan}
                    onChange={(e) =>
                      updateCfg((p) => ({
                        ...p,
                        pengesahan: { ...p.pengesahan, penyediaJawatan: e.target.value },
                      }))
                    }
                    className="mt-1 h-8 w-full rounded-lg border border-[var(--line-2)] px-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--ink-2)]">Disahkan oleh</label>
                  <input
                    disabled={!canManage}
                    value={cfg.pengesahan.pengesahNama}
                    onChange={(e) =>
                      updateCfg((p) => ({
                        ...p,
                        pengesahan: { ...p.pengesahan, pengesahNama: e.target.value },
                      }))
                    }
                    className="mt-1 h-8 w-full rounded-lg border border-[var(--line-2)] px-2.5 text-xs"
                  />
                  <input
                    disabled={!canManage}
                    value={cfg.pengesahan.pengesahJawatan}
                    onChange={(e) =>
                      updateCfg((p) => ({
                        ...p,
                        pengesahan: { ...p.pengesahan, pengesahJawatan: e.target.value },
                      }))
                    }
                    className="mt-1 h-8 w-full rounded-lg border border-[var(--line-2)] px-2.5 text-xs"
                  />
                </div>
              </div>
            </details>
          </aside>
        )}

        {/* Right Live Preview */}
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          {/* Preview Toolbar */}
          <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5">
            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-lg bg-[var(--surface-3)] p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('tatal')}
                  className={`rounded-md px-2.5 py-1 font-semibold ${
                    viewMode === 'tatal' ? 'bg-[var(--surface)] text-[var(--ink)] shadow-sm' : 'text-[var(--ink-2)]'
                  }`}
                >
                  Tatal semua
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('selak')}
                  className={`rounded-md px-2.5 py-1 font-semibold ${
                    viewMode === 'selak' ? 'bg-[var(--surface)] text-[var(--ink)] shadow-sm' : 'text-[var(--ink-2)]'
                  }`}
                >
                  Selak bahagian
                </button>
              </div>

              {viewMode === 'selak' && sections.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setSectionIdx((i) => Math.max(0, i - 1))}
                    disabled={safeIdx === 0}
                    className="inline-flex h-7 w-7 items-center justify-center rounded border border-[var(--line-2)] disabled:opacity-40"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <select
                    value={safeIdx}
                    onChange={(e) => setSectionIdx(Number(e.target.value))}
                    className="h-7 max-w-[190px] rounded border border-[var(--line-2)] bg-[var(--surface)] px-2 text-xs font-medium"
                  >
                    {sections.map((s, idx) => (
                      <option key={s.id} value={idx}>
                        {idx + 1}. {s.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setSectionIdx((i) => Math.min(sections.length - 1, i + 1))}
                    disabled={safeIdx === sections.length - 1}
                    className="inline-flex h-7 w-7 items-center justify-center rounded border border-[var(--line-2)] disabled:opacity-40"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-lg bg-[var(--surface-3)] p-0.5 text-xs">
                {[0.65, 0.85, 1].map((z) => (
                  <button
                    key={z}
                    type="button"
                    onClick={() => setZoom(z)}
                    className={`rounded-md px-2 py-1 font-mono-num font-semibold ${
                      zoom === z ? 'bg-[var(--surface)] text-[var(--ink)] shadow-sm' : 'text-[var(--ink-2)]'
                    }`}
                  >
                    {Math.round(z * 100)}%
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setFullscreen((f) => !f)}
                title={fullscreen ? 'Keluar skrin penuh' : 'Skrin penuh'}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--line-2)] hover:bg-[var(--surface-3)]"
              >
                {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Paper Canvas */}
          <div className="print-scroll-wrap custom-scroll flex-1 overflow-auto rounded-2xl border border-[var(--line)] bg-[var(--surface-3)] p-4 sm:p-6">
            <div
              className="print-only-root mx-auto bg-white text-black shadow-xl"
              style={{
                width: '794px',
                minHeight: '1123px',
                zoom: zoom === 1 ? undefined : zoom,
              }}
            >
              {/* 1. KULIT HADAPAN */}
              {cfg.bahagian.kulit && shouldShow('kulit') && (
                <div
                  className="relative flex min-h-[1123px] flex-col justify-between overflow-hidden p-14"
                  style={{
                    backgroundColor: cfg.kulit.gaya === 'minimal' ? '#ffffff' : cfg.kulit.warna,
                    color: cfg.kulit.gaya === 'minimal' ? '#141916' : '#ffffff',
                  }}
                >
                  {/* Decorative style accents */}
                  {cfg.kulit.gaya === 'jalur' && (
                    <div
                      className="absolute inset-y-0 left-0 w-10"
                      style={{ backgroundColor: cfg.kulit.aksen }}
                    />
                  )}
                  {cfg.kulit.gaya === 'moden' && (
                    <div
                      className="absolute top-0 right-0 h-64 w-64 rounded-bl-full opacity-25"
                      style={{ backgroundColor: cfg.kulit.aksen }}
                    />
                  )}
                  {cfg.kulit.gaya === 'rasmi' && (
                    <div
                      className="pointer-events-none absolute inset-6 border-2"
                      style={{ borderColor: cfg.kulit.aksen }}
                    />
                  )}

                  <div className="relative z-10 flex items-center justify-between">
                    <div className="text-xs font-bold tracking-[0.2em] uppercase opacity-80">
                      KEMENTERIAN PENDIDIKAN MALAYSIA
                    </div>
                    <div
                      className="rounded px-3 py-1 font-mono-num text-sm font-extrabold"
                      style={{
                        backgroundColor: cfg.kulit.aksen,
                        color: '#1b1600',
                      }}
                    >
                      SESI {session.tahun.label}
                    </div>
                  </div>

                  <div className="relative z-10 my-auto py-12">
                    {cfg.kulit.tunjukLogo && store.sekolah.logo && (
                      <img
                        src={store.sekolah.logo}
                        alt="Lencana sekolah"
                        className="mb-8 h-28 w-28 object-contain"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div
                      className="mb-4 h-1.5 w-24"
                      style={{ backgroundColor: cfg.kulit.aksen }}
                    />
                    <h1
                      className="font-display text-5xl leading-[1.08] font-extrabold tracking-tight uppercase"
                      style={{ color: cfg.kulit.gaya === 'minimal' ? cfg.kulit.warna : '#ffffff' }}
                    >
                      {cfg.kulit.tajuk}
                    </h1>
                    <p className="mt-4 text-xl font-semibold tracking-wide opacity-90">
                      {cfg.kulit.subtajuk}
                    </p>
                  </div>

                  <div className="relative z-10 border-t border-current/20 pt-6">
                    <div className="text-2xl font-extrabold tracking-tight">{store.sekolah.nama}</div>
                    <div className="mt-1 text-sm opacity-80">
                      {[store.sekolah.alamat, store.sekolah.poskod, store.sekolah.bandar, store.sekolah.negeri]
                        .filter(Boolean)
                        .join(', ')}
                    </div>
                    {cfg.kulit.moto && (
                      <div className="mt-3 text-sm font-semibold italic opacity-90">
                        “{cfg.kulit.moto}”
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. ISI KANDUNGAN */}
              {cfg.bahagian.kandungan && shouldShow('kandungan') && (
                <div className="print-page-break p-14">
                  <h2 className="pb-2 text-2xl font-bold" style={sectionHeadingStyle}>
                    Isi Kandungan
                  </h2>
                  <div className="mt-6 divide-y divide-gray-200 text-sm">
                    {sections
                      .filter((s) => s.id !== 'kulit' && s.id !== 'kandungan')
                      .map((s, idx) => (
                        <div key={s.id} className="flex items-center justify-between py-2.5">
                          <span className="font-medium text-gray-900">
                            {idx + 1}. {s.label}
                          </span>
                          <span className="font-mono-num text-xs text-gray-500">Bahagian {idx + 1}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* 3. HALAMAN TAMBAHAN (DEPAN) */}
              {cfg.bahagian.halamanAwal &&
                cfg.halamanTambahan
                  .filter((p) => p.aktif && p.letak === 'depan')
                  .map(
                    (p) =>
                      shouldShow(`extra:${p.id}`) && (
                        <div key={p.id} className="print-page-break p-14">
                          <h2 className="pb-2 text-2xl font-bold" style={sectionHeadingStyle}>
                            {p.tajuk}
                          </h2>
                          <div className="mt-6 whitespace-pre-line text-sm leading-relaxed text-gray-800">
                            {p.isi}
                          </div>
                        </div>
                      )
                  )}

              {/* 4. SENARAI GURU DAN STAF */}
              {cfg.bahagian.senaraiGuru && shouldShow('senaraiGuru') && (
                <div className="print-page-break p-14">
                  <h2 className="pb-2 text-2xl font-bold" style={sectionHeadingStyle}>
                    Senarai Guru dan Staf ({sortedTeachers.length})
                  </h2>
                  <table className="mt-5 w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-100 text-left font-bold text-gray-800">
                        <th className="border border-gray-300 px-2.5 py-2 text-center w-10">Bil</th>
                        <th className="border border-gray-300 px-2.5 py-2">Nama</th>
                        {cfg.pilihan.paparGred && <th className="border border-gray-300 px-2.5 py-2">Gred</th>}
                        {cfg.pilihan.paparJawatanHakiki && (
                          <th className="border border-gray-300 px-2.5 py-2">Jawatan</th>
                        )}
                        <th className="border border-gray-300 px-2.5 py-2">Opsyen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedTeachers.map((r, i) => (
                        <tr key={r.id}>
                          <td className="border border-gray-300 px-2.5 py-1.5 text-center font-mono-num">
                            {i + 1}
                          </td>
                          <td className="border border-gray-300 px-2.5 py-1.5 font-medium">{r.guru.nama}</td>
                          {cfg.pilihan.paparGred && (
                            <td className="border border-gray-300 px-2.5 py-1.5 font-mono-num">
                              {r.guru.gred || '–'}
                            </td>
                          )}
                          {cfg.pilihan.paparJawatanHakiki && (
                            <td className="border border-gray-300 px-2.5 py-1.5">{r.guru.jawatan || '–'}</td>
                          )}
                          <td className="border border-gray-300 px-2.5 py-1.5">{r.guru.opsyen || '–'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 5. CARTA ORGANISASI */}
              {cfg.bahagian.carta && shouldShow('carta') && (
                <div className="print-page-break p-14">
                  <h2 className="pb-2 text-2xl font-bold" style={sectionHeadingStyle}>
                    Carta Organisasi Jawatankuasa
                  </h2>
                  <div className="mt-6 space-y-6">
                    {analysis.senaraiBahagian.map((b) => {
                      const jks = session.jk
                        .filter((j) => j.bahagianId === b.id)
                        .sort((a, c) => (a.urutan || 0) - (c.urutan || 0));
                      return (
                        <div key={b.id} className="print-avoid-break rounded-lg border border-gray-300 p-4">
                          <div
                            className="mb-3 text-center text-sm font-bold uppercase tracking-wide"
                            style={{ color: cfg.kulit.warna }}
                          >
                            Bahagian {b.bahagian.nama}
                          </div>
                          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                            {jks.map((j) => {
                              const lead = j.ahli.find((a) =>
                                /pengerusi|ketua|penyelaras|setiausaha/i.test(a.jawatan)
                              );
                              const leadName = lead?.guruId
                                ? analysis.guruMap[lead.guruId]?.guru.nama
                                : lead?.nama || 'Belum diisi';
                              return (
                                <div key={j.id} className="rounded border border-gray-300 bg-gray-50 p-2 text-center">
                                  <div className="text-[11px] font-bold text-gray-900">{j.nama}</div>
                                  <div className="mt-1 text-[10px] text-gray-600">{leadName}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 6. JAWATANKUASA MENGIKUT BAHAGIAN */}
              {cfg.bahagian.jawatankuasa &&
                analysis.senaraiBahagian.map((b) => {
                  if (!shouldShow(`div:${b.id}`)) return null;
                  const jks = session.jk
                    .filter((j) => j.bahagianId === b.id)
                    .sort((a, c) => (a.urutan || 0) - (c.urutan || 0));
                  return (
                    <div key={b.id} className="print-page-break p-14">
                      <h2 className="pb-2 text-2xl font-bold" style={sectionHeadingStyle}>
                        Bahagian {b.bahagian.nama}
                      </h2>
                      <div className="mt-5 space-y-5">
                        {jks.map((jk, idx) => {
                          const members = cfg.pilihan.sorokKosong
                            ? jk.ahli.filter((a) => a.guruId || a.nama.trim())
                            : jk.ahli;
                          return (
                            <div key={jk.id} className="print-avoid-break">
                              <h3 className="text-sm font-bold text-gray-900">
                                {idx + 1}. {jk.nama}
                                {jk.kumpulan ? ` (${jk.kumpulan})` : ''}
                              </h3>
                              <table className="mt-1.5 w-full border-collapse text-xs">
                                <tbody>
                                  {members.map((a) => {
                                    const g = a.guruId ? analysis.guruMap[a.guruId]?.guru : null;
                                    const nameStr = g
                                      ? `${g.nama}${
                                          cfg.pilihan.paparJawatanHakiki && g.jawatan && g.jawatan !== 'Guru'
                                            ? ` (${g.jawatan})`
                                            : ''
                                        }`
                                      : a.nama || '—';
                                    return (
                                      <tr key={a.id}>
                                        <td className="w-44 border border-gray-300 bg-gray-50 px-2.5 py-1.5 font-semibold text-gray-800">
                                          {a.jawatan}
                                        </td>
                                        <td className="border border-gray-300 px-2.5 py-1.5 text-gray-900">
                                          {nameStr}
                                          {a.butiran ? ` — ${a.butiran}` : ''}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                              {cfg.pilihan.paparBidang && jk.bidang && (
                                <div className="mt-2 rounded bg-gray-50 px-3 py-2 text-[11px] text-gray-700">
                                  <div className="font-bold text-gray-900">Bidang Tugas:</div>
                                  <ul className="mt-1 list-disc space-y-0.5 pl-4">
                                    {jk.bidang
                                      .split('\n')
                                      .filter(Boolean)
                                      .map((line, li) => (
                                        <li key={li}>{line}</li>
                                      ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

              {/* 7. SENARAI TUGAS MENGIKUT GURU */}
              {cfg.bahagian.tugasGuru && shouldShow('tugasGuru') && (
                <div className="print-page-break p-14">
                  <h2 className="pb-2 text-2xl font-bold" style={sectionHeadingStyle}>
                    Senarai Tugas Mengikut Guru
                  </h2>
                  <div className="mt-5 space-y-3">
                    {sortedTeachers
                      .filter((r) => r.tugas.length > 0)
                      .map((r, i) => (
                        <div key={r.id} className="print-avoid-break border-b border-gray-200 pb-2.5 text-xs">
                          <div className="font-bold text-gray-900">
                            {i + 1}. {r.guru.nama}{' '}
                            {cfg.pilihan.paparGred && r.guru.gred ? `(${r.guru.gred})` : ''}
                          </div>
                          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-gray-700">
                            {r.tugas.map((t) => (
                              <li key={t.ahliId}>
                                <span className="font-semibold">{t.jawatan}</span> — {t.jkNama}
                                {t.butiran ? ` (${t.butiran})` : ''}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* 8. RUMUSAN AGIHAN TUGAS */}
              {cfg.bahagian.rumusan && shouldShow('rumusan') && (
                <div className="print-page-break p-14">
                  <h2 className="pb-2 text-2xl font-bold" style={sectionHeadingStyle}>
                    Rumusan Agihan Tugas
                  </h2>
                  <table className="mt-5 w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-100 text-left font-bold">
                        <th className="border border-gray-300 px-2 py-1.5 text-center w-9">Bil</th>
                        <th className="border border-gray-300 px-2 py-1.5">Nama Guru</th>
                        <th className="border border-gray-300 px-2 py-1.5 text-right">Bil. Tugas</th>
                        {cfg.pilihan.paparMata && (
                          <>
                            <th className="border border-gray-300 px-2 py-1.5 text-right">Mata</th>
                            <th className="border border-gray-300 px-2 py-1.5">Status</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedTeachers
                        .filter((r) => r.analisis)
                        .map((r, i) => (
                          <tr key={r.id}>
                            <td className="border border-gray-300 px-2 py-1 text-center font-mono-num">
                              {i + 1}
                            </td>
                            <td className="border border-gray-300 px-2 py-1 font-medium">{r.guru.nama}</td>
                            <td className="border border-gray-300 px-2 py-1 text-right font-mono-num">
                              {r.bilTugas}
                            </td>
                            {cfg.pilihan.paparMata && (
                              <>
                                <td className="border border-gray-300 px-2 py-1 text-right font-mono-num">
                                  {fmt(r.jumlah)}
                                </td>
                                <td className="border border-gray-300 px-2 py-1">{r.status}</td>
                              </>
                            )}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* HALAMAN TAMBAHAN (BELAKANG) */}
              {cfg.bahagian.halamanAwal &&
                cfg.halamanTambahan
                  .filter((p) => p.aktif && p.letak === 'belakang')
                  .map(
                    (p) =>
                      shouldShow(`extra:${p.id}`) && (
                        <div key={p.id} className="print-page-break p-14">
                          <h2 className="pb-2 text-2xl font-bold" style={sectionHeadingStyle}>
                            {p.tajuk}
                          </h2>
                          <div className="mt-6 whitespace-pre-line text-sm leading-relaxed text-gray-800">
                            {p.isi}
                          </div>
                        </div>
                      )
                  )}

              {/* 9. HALAMAN PENGESAHAN */}
              {cfg.bahagian.pengesahan && shouldShow('pengesahan') && (
                <div className="print-page-break flex min-h-[1123px] flex-col justify-between p-14">
                  <div>
                    <h2 className="pb-2 text-2xl font-bold" style={sectionHeadingStyle}>
                      Pengesahan Buku Pengurusan Sekolah
                    </h2>
                    <p className="mt-6 text-sm leading-relaxed text-gray-800">
                      Buku Pengurusan {store.sekolah.nama} bagi Sesi Persekolahan {session.tahun.label} ini telah disemak dan disahkan sebagai panduan rasmi tugas guru dan staf sepanjang tahun.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-12 pt-20 text-sm">
                    <div>
                      <div className="text-xs font-semibold text-gray-600 uppercase">Disediakan oleh:</div>
                      <div className="mt-16 border-b border-gray-400" />
                      <div className="mt-2 font-bold text-gray-900">{cfg.pengesahan.penyediaNama}</div>
                      <div className="text-xs text-gray-700">{cfg.pengesahan.penyediaJawatan}</div>
                      <div className="text-xs text-gray-700">{store.sekolah.nama}</div>
                      <div className="mt-2 text-xs text-gray-500">Tarikh: ……………………………</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-600 uppercase">Disahkan oleh:</div>
                      <div className="mt-16 border-b border-gray-400" />
                      <div className="mt-2 font-bold text-gray-900">{cfg.pengesahan.pengesahNama}</div>
                      <div className="text-xs text-gray-700">{cfg.pengesahan.pengesahJawatan}</div>
                      <div className="text-xs text-gray-700">{store.sekolah.nama}</div>
                      <div className="mt-2 text-xs text-gray-500">Tarikh: ……………………………</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Extra Page Modal */}
      <Modal
        open={pageModalOpen}
        onClose={() => setPageModalOpen(false)}
        title={editingPage ? 'Sunting Halaman Tambahan' : 'Tambah Halaman Tambahan'}
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setPageModalOpen(false)}
              className="h-9 rounded-lg border border-[var(--line-2)] px-3.5 text-sm font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              form="extra-page-form"
              className="h-9 rounded-lg bg-[var(--brand)] px-4 text-sm font-semibold text-white hover:bg-[var(--brand-2)]"
            >
              Simpan
            </button>
          </>
        }
      >
        <form id="extra-page-form" onSubmit={saveExtraPage} className="space-y-4">
          {!editingPage && (
            <div>
              <label className="block text-xs font-semibold text-[var(--ink-2)]">
                Pilih daripada templat KPM (pilihan)
              </label>
              <select
                defaultValue=""
                onChange={(e) => applyTemplatePage(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-xs"
              >
                <option value="">-- Tulis sendiri atau pilih templat --</option>
                {TEMPLAT_HALAMAN.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nama}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--ink-2)]">Tajuk halaman *</label>
              <input
                required
                value={pageTajuk}
                onChange={(e) => setPageTajuk(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] px-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--ink-2)]">Kedudukan dalam buku</label>
              <select
                value={pageLetak}
                onChange={(e) => setPageLetak(e.target.value as 'depan' | 'belakang')}
                className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-sm"
              >
                <option value="depan">Di hadapan (sebelum senarai guru)</option>
                <option value="belakang">Di belakang (selepas rumusan)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--ink-2)]">Kandungan teks</label>
            <textarea
              rows={9}
              value={pageIsi}
              onChange={(e) => setPageIsi(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--line-2)] p-3 text-sm leading-relaxed"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
