import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Link2, Printer, Search } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { defaultLetterConfig } from '../lib/demoData';
import { printDocument } from '../lib/excel';
import type { LetterConfig, TeacherResult } from '../types/tugasadil';
import { Modal } from './Ui';

const BULAN_MS = [
  'Januari',
  'Februari',
  'Mac',
  'April',
  'Mei',
  'Jun',
  'Julai',
  'Ogos',
  'September',
  'Oktober',
  'November',
  'Disember',
];

function formatTarikhMs(iso: string): string {
  if (!iso) return '';
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  const y = parts[0];
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  if (m < 0 || m > 11 || !d) return iso;
  return `${d} ${BULAN_MS[m]} ${y}`;
}

function mergeLetterConfig(raw: Partial<LetterConfig> | undefined, schoolName: string, alamat: string): LetterConfig {
  const def = defaultLetterConfig(schoolName, alamat);
  const mergedKepala = { ...def.kepala, ...(raw?.kepala || {}) };
  if (/^SMK SERI CONTOH$/i.test(mergedKepala.namaSekolah.trim())) {
    mergedKepala.namaSekolah = schoolName.toUpperCase();
  }
  const mergedTandatangan = { ...def.tandatangan, ...(raw?.tandatangan || {}) };
  if (/^SMK SERI CONTOH$/i.test(mergedTandatangan.sekolah.trim())) {
    mergedTandatangan.sekolah = schoolName;
  }
  return {
    kepala: mergedKepala,
    rujukan: { ...def.rujukan, ...(raw?.rujukan || {}) },
    kuatkuasa: { ...def.kuatkuasa, ...(raw?.kuatkuasa || {}) },
    kandungan: { ...def.kandungan, ...(raw?.kandungan || {}) },
    tandatangan: mergedTandatangan,
    pilihan: { ...def.pilihan, ...(raw?.pilihan || {}) },
  };
}

export const LettersView: React.FC = () => {
  const { store, session, analysis, canManage, updateSettings } = useStore();

  const fullAddress = [
    store.sekolah.alamat,
    store.sekolah.poskod,
    store.sekolah.bandar,
    store.sekolah.negeri,
  ]
    .filter(Boolean)
    .join(', ');

  const cfg = useMemo(
    () => mergeLetterConfig(session.tetapan.surat, store.sekolah.nama, fullAddress),
    [session.tetapan.surat, store.sekolah.nama, fullAddress]
  );

  const [includeEmpty, setIncludeEmpty] = useState(false);

  const teachersWithTasks = useMemo(
    () =>
      [...analysis.senarai]
        .filter((r) => includeEmpty || r.tugas.length > 0)
        .sort((a, b) => (a.guru.urutan || 0) - (b.guru.urutan || 0)),
    [analysis.senarai, includeEmpty]
  );

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [printMode, setPrintMode] = useState<'single' | 'all'>('single');

  // Teacher Self-Check Link Preview Modal
  const [portalOpen, setPortalOpen] = useState(false);
  const [portalSearch, setPortalSearch] = useState('');

  const updateCfg = (updater: (prev: LetterConfig) => LetterConfig) => {
    updateSettings({ surat: updater(cfg) });
  };

  const activeIdx = Math.max(
    0,
    teachersWithTasks.findIndex((r) => r.id === selectedTeacherId)
  );
  const activeTeacher: TeacherResult | undefined = teachersWithTasks[activeIdx] || teachersWithTasks[0];

  const expandText = (tmpl: string) =>
    tmpl
      .replace(/\{tahun\}/g, session.tahun.label)
      .replace(/\{mula\}/g, formatTarikhMs(cfg.kuatkuasa.mula))
      .replace(/\{tamat\}/g, formatTarikhMs(cfg.kuatkuasa.tamat));

  const renderLetterSheet = (teacher: TeacherResult, index: number) => {
    const rujNo = `${cfg.rujukan.fail} (${cfg.rujukan.mula + index})`;
    const fontSizeClass = cfg.pilihan.saizFon === 12 ? 'text-[15px]' : 'text-[13.5px]';

    return (
      <div
        key={teacher.id}
        className={`mx-auto bg-white p-14 text-black shadow-xl print-page-break ${fontSizeClass}`}
        style={{
          width: '794px',
          minHeight: '1123px',
          fontFamily: 'Arial, Helvetica, sans-serif',
          lineHeight: 1.4,
        }}
      >
        {/* Letterhead */}
        <div
          className={`flex items-center gap-4 pb-3 ${
            cfg.kepala.garisBawah ? 'border-b-2 border-black' : ''
          }`}
        >
          {cfg.kepala.tunjukLambang && store.sekolah.logo && (
            <img
              src={store.sekolah.logo}
              alt="Lencana sekolah"
              className="h-16 w-16 shrink-0 object-contain"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="flex-1 text-center">
            {cfg.kepala.atas && (
              <div className="text-[11px] font-semibold tracking-wider uppercase">{cfg.kepala.atas}</div>
            )}
            <div className="text-lg font-bold tracking-tight">{cfg.kepala.namaSekolah}</div>
            <div className="text-xs text-gray-800">{cfg.kepala.alamat}</div>
            <div className="text-xs text-gray-700">
              {[cfg.kepala.telefon ? `Tel: ${cfg.kepala.telefon}` : '', cfg.kepala.emel ? `E-mel: ${cfg.kepala.emel}` : '']
                .filter(Boolean)
                .join('   |   ')}
            </div>
          </div>
          {cfg.kepala.tunjukLambang && store.sekolah.logo && <div className="w-16 shrink-0" />}
        </div>

        {/* Ref & Date */}
        <div className="mt-5 flex justify-end">
          <table className="text-xs">
            <tbody>
              <tr>
                <td className="pr-2 text-gray-700">Ruj. Kami</td>
                <td className="pr-2">:</td>
                <td className="font-semibold">{rujNo}</td>
              </tr>
              <tr>
                <td className="pr-2 text-gray-700">Tarikh</td>
                <td className="pr-2">:</td>
                <td>{formatTarikhMs(cfg.rujukan.tarikh)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Recipient */}
        <div className="mt-5">
          <div className="font-bold">{teacher.guru.nama}</div>
          {teacher.guru.gred && <div className="text-xs">Gred {teacher.guru.gred}</div>}
          {teacher.guru.jawatan && <div className="text-xs">{teacher.guru.jawatan}</div>}
          <div>{store.sekolah.nama}</div>
        </div>

        <div className="mt-5">Tuan / Puan,</div>

        {/* Title */}
        <div className={`mt-4 font-bold uppercase ${cfg.pilihan.bergarisTajuk ? 'underline' : ''}`}>
          {expandText(cfg.kandungan.tajuk)}
        </div>

        {/* Paragraph 1 */}
        <p className="mt-3 text-justify">
          <span className="inline-block w-8">2.</span>
          {expandText(cfg.kandungan.perenggan1)}
        </p>

        {/* Task Table */}
        <table className="mt-4 w-full border-collapse text-xs">
          <thead>
            <tr className="bg-gray-200 font-bold">
              <th className="w-9 border border-gray-800 px-2 py-1.5 text-center">Bil</th>
              <th className="w-40 border border-gray-800 px-2 py-1.5 text-left">Jawatan</th>
              <th className="border border-gray-800 px-2 py-1.5 text-left">Jawatankuasa / Unit</th>
              {cfg.pilihan.paparButiran && (
                <th className="w-28 border border-gray-800 px-2 py-1.5 text-left">Catatan</th>
              )}
            </tr>
          </thead>
          <tbody>
            {teacher.tugas.map((t, ti) => (
              <tr key={t.ahliId}>
                <td className="border border-gray-800 px-2 py-1 text-center font-mono-num">{ti + 1}</td>
                <td className="border border-gray-800 px-2 py-1 font-semibold">{t.jawatan}</td>
                <td className="border border-gray-800 px-2 py-1">{t.jkNama}</td>
                {cfg.pilihan.paparButiran && (
                  <td className="border border-gray-800 px-2 py-1">{t.butiran || '–'}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Paragraph 2 + Sign-off */}
        <div className="print-avoid-break">
          <p className="mt-4 text-justify">
            <span className="inline-block w-8">3.</span>
            {expandText(cfg.kandungan.perenggan2)}
          </p>

          <p className="mt-4">{cfg.kandungan.penutup}</p>

          <div className="mt-3 space-y-0.5 font-bold">
            {cfg.kandungan.slogan.filter(Boolean).map((s, i) => (
              <div key={i}>{s}</div>
            ))}
          </div>

          <p className="mt-4">{cfg.kandungan.akhiran}</p>

          <div className="mt-14 font-bold">{cfg.tandatangan.nama}</div>
          <div>{cfg.tandatangan.jawatan}</div>
          <div>{cfg.tandatangan.sekolah}</div>

          {cfg.kandungan.salinan.filter(Boolean).length > 0 && (
            <div className="mt-5 flex gap-3 text-xs">
              <span className="font-semibold">s.k.</span>
              <div>
                {cfg.kandungan.salinan.filter(Boolean).map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const triggerPrint = (mode: 'single' | 'all') => {
    setPrintMode(mode);
    requestAnimationFrame(() => {
      setTimeout(() => {
        printDocument({
          selector: '.print-only-root',
          title:
            mode === 'all'
              ? `Semua Surat Lantikan ${store.sekolah.nama} - Sesi ${session.tahun.label}`
              : `Surat Lantikan - ${activeTeacher?.guru.nama || store.sekolah.nama}`,
        });
      }, 120);
    });
  };

  const portalMatches = useMemo(() => {
    const q = portalSearch.trim().toLowerCase();
    return teachersWithTasks.filter((r) => !q || r.guru.nama.toLowerCase().includes(q));
  }, [teachersWithTasks, portalSearch]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="no-print flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ink)]">Surat Lantikan</h1>
          <p className="mt-1 text-sm text-[var(--ink-3)]">
            Surat pelantikan rasmi setiap guru dijana automatik daripada agihan tugas. Tetapkan kepala surat, rujukan dan penandatangan sekali sahaja.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPortalOpen(true)}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[var(--line-2)] bg-[var(--surface)] px-3.5 text-xs font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--surface-2)] whitespace-nowrap"
          >
            <Link2 className="h-3.5 w-3.5" />
            <span>Semakan guru</span>
          </button>
          <button
            type="button"
            disabled={!teachersWithTasks.length}
            onClick={() => triggerPrint('all')}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--brand)] to-[var(--brand-2)] px-4 text-xs font-semibold text-white shadow-sm shadow-[var(--brand)]/25 transition-all hover:opacity-95 disabled:opacity-40 whitespace-nowrap"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak / PDF semua ({teachersWithTasks.length})</span>
          </button>
        </div>
      </div>

      {/* Main Split */}
      <div className="grid items-start gap-5 lg:grid-cols-[330px_minmax(0,1fr)]">
        {/* Left Settings Panel */}
        <aside className="no-print custom-scroll max-h-[calc(100vh-140px)] overflow-y-auto rounded-2xl border border-[var(--line)] bg-[var(--surface)] lg:sticky lg:top-20">
          <details open className="border-b border-[var(--line)]">
            <summary className="cursor-pointer px-4 py-3 text-xs font-bold tracking-wider text-[var(--ink-3)] uppercase hover:text-[var(--ink)]">
              Kepala Surat
            </summary>
            <div className="space-y-2.5 px-4 pb-4 text-xs">
              <div>
                <label className="block font-semibold text-[var(--ink-2)]">Baris atas</label>
                <input
                  disabled={!canManage}
                  value={cfg.kepala.atas}
                  onChange={(e) => updateCfg((p) => ({ ...p, kepala: { ...p.kepala, atas: e.target.value } }))}
                  className="mt-1 h-8 w-full rounded-lg border border-[var(--line-2)] px-2.5 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-[var(--ink-2)]">Nama sekolah</label>
                <input
                  disabled={!canManage}
                  value={cfg.kepala.namaSekolah}
                  onChange={(e) =>
                    updateCfg((p) => ({ ...p, kepala: { ...p.kepala, namaSekolah: e.target.value } }))
                  }
                  className="mt-1 h-8 w-full rounded-lg border border-[var(--line-2)] px-2.5 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-[var(--ink-2)]">Alamat</label>
                <input
                  disabled={!canManage}
                  value={cfg.kepala.alamat}
                  onChange={(e) => updateCfg((p) => ({ ...p, kepala: { ...p.kepala, alamat: e.target.value } }))}
                  className="mt-1 h-8 w-full rounded-lg border border-[var(--line-2)] px-2.5 text-xs"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  disabled={!canManage}
                  checked={cfg.kepala.tunjukLambang}
                  onChange={(e) =>
                    updateCfg((p) => ({ ...p, kepala: { ...p.kepala, tunjukLambang: e.target.checked } }))
                  }
                  className="h-3.5 w-3.5 accent-[var(--brand)]"
                />
                <span>Papar lencana sekolah</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  disabled={!canManage}
                  checked={cfg.kepala.garisBawah}
                  onChange={(e) =>
                    updateCfg((p) => ({ ...p, kepala: { ...p.kepala, garisBawah: e.target.checked } }))
                  }
                  className="h-3.5 w-3.5 accent-[var(--brand)]"
                />
                <span>Garis pemisah kepala surat</span>
              </label>
            </div>
          </details>

          <details open className="border-b border-[var(--line)]">
            <summary className="cursor-pointer px-4 py-3 text-xs font-bold tracking-wider text-[var(--ink-3)] uppercase hover:text-[var(--ink)]">
              Rujukan &amp; Kuat Kuasa
            </summary>
            <div className="space-y-2.5 px-4 pb-4 text-xs">
              <div className="grid grid-cols-[1fr_70px] gap-2">
                <div>
                  <label className="block font-semibold text-[var(--ink-2)]">No. Fail</label>
                  <input
                    disabled={!canManage}
                    value={cfg.rujukan.fail}
                    onChange={(e) => updateCfg((p) => ({ ...p, rujukan: { ...p.rujukan, fail: e.target.value } }))}
                    className="mt-1 h-8 w-full rounded-lg border border-[var(--line-2)] px-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--ink-2)]">Bil. mula</label>
                  <input
                    type="number"
                    min={1}
                    disabled={!canManage}
                    value={cfg.rujukan.mula}
                    onChange={(e) =>
                      updateCfg((p) => ({
                        ...p,
                        rujukan: { ...p.rujukan, mula: Math.max(1, Number(e.target.value) || 1) },
                      }))
                    }
                    className="mt-1 h-8 w-full rounded-lg border border-[var(--line-2)] px-2 text-xs font-mono-num"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-[var(--ink-2)]">Tarikh surat</label>
                <input
                  type="date"
                  disabled={!canManage}
                  value={cfg.rujukan.tarikh}
                  onChange={(e) => updateCfg((p) => ({ ...p, rujukan: { ...p.rujukan, tarikh: e.target.value } }))}
                  className="mt-1 h-8 w-full rounded-lg border border-[var(--line-2)] px-2.5 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[var(--ink-2)]">Kuat kuasa mula</label>
                  <input
                    type="date"
                    disabled={!canManage}
                    value={cfg.kuatkuasa.mula}
                    onChange={(e) => updateCfg((p) => ({ ...p, kuatkuasa: { ...p.kuatkuasa, mula: e.target.value } }))}
                    className="mt-1 h-8 w-full rounded-lg border border-[var(--line-2)] px-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--ink-2)]">Hingga</label>
                  <input
                    type="date"
                    disabled={!canManage}
                    value={cfg.kuatkuasa.tamat}
                    onChange={(e) => updateCfg((p) => ({ ...p, kuatkuasa: { ...p.kuatkuasa, tamat: e.target.value } }))}
                    className="mt-1 h-8 w-full rounded-lg border border-[var(--line-2)] px-2 text-xs"
                  />
                </div>
              </div>
            </div>
          </details>

          <details className="border-b border-[var(--line)]">
            <summary className="cursor-pointer px-4 py-3 text-xs font-bold tracking-wider text-[var(--ink-3)] uppercase hover:text-[var(--ink)]">
              Teks &amp; Slogan
            </summary>
            <div className="space-y-2.5 px-4 pb-4 text-xs">
              <div>
                <label className="block font-semibold text-[var(--ink-2)]">Tajuk surat</label>
                <input
                  disabled={!canManage}
                  value={cfg.kandungan.tajuk}
                  onChange={(e) =>
                    updateCfg((p) => ({ ...p, kandungan: { ...p.kandungan, tajuk: e.target.value } }))
                  }
                  className="mt-1 h-8 w-full rounded-lg border border-[var(--line-2)] px-2.5 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-[var(--ink-2)]">Perenggan pembuka</label>
                <textarea
                  rows={4}
                  disabled={!canManage}
                  value={cfg.kandungan.perenggan1}
                  onChange={(e) =>
                    updateCfg((p) => ({ ...p, kandungan: { ...p.kandungan, perenggan1: e.target.value } }))
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--line-2)] p-2 text-xs leading-relaxed"
                />
              </div>
              <div>
                <label className="block font-semibold text-[var(--ink-2)]">Slogan (satu setiap baris)</label>
                <textarea
                  rows={2}
                  disabled={!canManage}
                  value={cfg.kandungan.slogan.join('\n')}
                  onChange={(e) =>
                    updateCfg((p) => ({
                      ...p,
                      kandungan: { ...p.kandungan, slogan: e.target.value.split('\n') },
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--line-2)] p-2 text-xs"
                />
              </div>
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-4 py-3 text-xs font-bold tracking-wider text-[var(--ink-3)] uppercase hover:text-[var(--ink)]">
              Penandatangan &amp; Fon
            </summary>
            <div className="space-y-2.5 px-4 pb-4 text-xs">
              <div>
                <label className="block font-semibold text-[var(--ink-2)]">Nama penandatangan</label>
                <input
                  disabled={!canManage}
                  value={cfg.tandatangan.nama}
                  onChange={(e) =>
                    updateCfg((p) => ({ ...p, tandatangan: { ...p.tandatangan, nama: e.target.value } }))
                  }
                  className="mt-1 h-8 w-full rounded-lg border border-[var(--line-2)] px-2.5 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-[var(--ink-2)]">Jawatan</label>
                <input
                  disabled={!canManage}
                  value={cfg.tandatangan.jawatan}
                  onChange={(e) =>
                    updateCfg((p) => ({ ...p, tandatangan: { ...p.tandatangan, jawatan: e.target.value } }))
                  }
                  className="mt-1 h-8 w-full rounded-lg border border-[var(--line-2)] px-2.5 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-[var(--ink-2)]">Saiz fon</label>
                <select
                  value={cfg.pilihan.saizFon}
                  onChange={(e) =>
                    updateCfg((p) => ({
                      ...p,
                      pilihan: { ...p.pilihan, saizFon: Number(e.target.value) as 11 | 12 },
                    }))
                  }
                  className="mt-1 h-8 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-2.5 text-xs"
                >
                  <option value={11}>11 pt (lebih mudah muat 1 halaman)</option>
                  <option value={12}>12 pt</option>
                </select>
              </div>
            </div>
          </details>
        </aside>

        {/* Right Preview Area */}
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          {/* Navigator Bar */}
          <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5">
            {teachersWithTasks.length === 0 ? (
              <span className="text-xs text-[var(--ink-3)]">Tiada guru yang memegang jawatan.</span>
            ) : (
              <>
                <div className="flex flex-wrap flex-1 items-center gap-2 min-w-0">
                  <div className="inline-flex rounded-lg bg-[var(--surface-3)] p-0.5 text-xs shrink-0">
                    <button
                      type="button"
                      onClick={() => setPrintMode('single')}
                      className={`rounded-md px-2.5 py-1 font-semibold ${
                        printMode === 'single'
                          ? 'bg-[var(--surface)] text-[var(--ink)] shadow-sm'
                          : 'text-[var(--ink-2)]'
                      }`}
                    >
                      Satu surat
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrintMode('all')}
                      className={`rounded-md px-2.5 py-1 font-semibold ${
                        printMode === 'all'
                          ? 'bg-[var(--surface)] text-[var(--ink)] shadow-sm'
                          : 'text-[var(--ink-2)]'
                      }`}
                    >
                      Semua ({teachersWithTasks.length})
                    </button>
                  </div>

                  {printMode === 'single' && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          const prev = (activeIdx - 1 + teachersWithTasks.length) % teachersWithTasks.length;
                          setSelectedTeacherId(teachersWithTasks[prev].id);
                        }}
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--line-2)] hover:bg-[var(--surface-3)]"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <select
                        aria-label="Pilih guru"
                        value={activeTeacher?.id || ''}
                        onChange={(e) => setSelectedTeacherId(e.target.value)}
                        className="h-8 min-w-0 flex-1 max-w-[280px] rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-2.5 text-xs font-semibold"
                      >
                        {teachersWithTasks.map((r, i) => (
                          <option key={r.id} value={r.id}>
                            {i + 1}. {r.guru.nama} ({r.bilTugas} tugas)
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          const next = (activeIdx + 1) % teachersWithTasks.length;
                          setSelectedTeacherId(teachersWithTasks[next].id);
                        }}
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--line-2)] hover:bg-[var(--surface-3)]"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                      <span className="font-mono-num text-xs text-[var(--ink-3)] whitespace-nowrap">
                        {activeIdx + 1} / {teachersWithTasks.length}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <label className="flex items-center gap-1.5 text-xs text-[var(--ink-2)]">
                    <input
                      type="checkbox"
                      checked={includeEmpty}
                      onChange={(e) => setIncludeEmpty(e.target.checked)}
                      className="h-3.5 w-3.5 accent-[var(--brand)]"
                    />
                    <span className="hidden sm:inline">Sertakan tanpa tugas</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => triggerPrint('single')}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--ink)] hover:bg-[var(--surface-3)] whitespace-nowrap"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Surat ini (PDF)</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Paper Canvas */}
          <div className="print-scroll-wrap custom-scroll overflow-auto rounded-2xl border border-[var(--line)] bg-[var(--surface-3)] p-4 sm:p-6">
            <div className="print-only-root" style={{ zoom: 0.85 }}>
              {printMode === 'all' ? (
                <div className="space-y-8">{teachersWithTasks.map((t, i) => renderLetterSheet(t, i))}</div>
              ) : activeTeacher ? (
                renderLetterSheet(activeTeacher, activeIdx)
              ) : (
                <div className="mx-auto max-w-md rounded-2xl bg-[var(--surface)] p-8 text-center text-sm text-[var(--ink-3)]">
                  Surat dijana untuk setiap guru yang memegang sekurang-kurangnya satu jawatan.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Teacher Self-Check Lookup Modal */}
      <Modal
        open={portalOpen}
        onClose={() => setPortalOpen(false)}
        title="Semakan Tugas Guru"
        subtitle="Guru boleh menyemak senarai tugas rasmi dan surat lantikan masing-masing di sini."
        size="md"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-[var(--ink-3)]" />
            <input
              autoFocus
              type="search"
              value={portalSearch}
              onChange={(e) => setPortalSearch(e.target.value)}
              placeholder="Taip nama anda..."
              className="h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] pr-3 pl-9 text-sm"
            />
          </div>
          <div className="custom-scroll max-h-[340px] divide-y divide-[var(--line)] overflow-y-auto rounded-xl border border-[var(--line)]">
            {portalMatches.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-[var(--ink)]">{r.guru.nama}</div>
                  <div className="truncate text-xs text-[var(--ink-3)]">
                    {r.bilTugas} tugas · {r.guru.gred}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTeacherId(r.id);
                    setPortalOpen(false);
                  }}
                  className="rounded-lg bg-[var(--brand)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--brand-2)] whitespace-nowrap"
                >
                  Lihat surat
                </button>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};
