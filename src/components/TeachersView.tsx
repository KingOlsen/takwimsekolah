import React, { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ClipboardPaste,
  Download,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { fmt, nilaiGred, norm } from '../lib/kira';
import {
  buildCsv,
  downloadTextFile,
  guessColumns,
  ImportField,
  parseCsvText,
  readSpreadsheetFile,
} from '../lib/excel';
import type { Teacher, TeacherCategory } from '../types/tugasadil';
import { ConfirmModal, Modal, StatusBadge } from './Ui';

type SortKey = 'asal' | 'nama' | 'gred' | 'beban';

export const TeachersView: React.FC = () => {
  const {
    session,
    analysis,
    canManage,
    openTeacherModal,
    saveTeacher,
    addTeachersBulk,
    deleteTeachers,
    moveTeacher,
    notify,
  } = useStore();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'semua' | TeacherCategory>('semua');
  const [sortBy, setSortBy] = useState<SortKey>('asal');
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

  // Add/Edit teacher modal
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null | 'new'>(null);
  const [formNama, setFormNama] = useState('');
  const [formGred, setFormGred] = useState('DG10');
  const [formJawatan, setFormJawatan] = useState('Guru');
  const [formOpsyen, setFormOpsyen] = useState('');
  const [formWaktu, setFormWaktu] = useState('24');
  const [formKategori, setFormKategori] = useState<TeacherCategory>('guru');
  const [formAnalisis, setFormAnalisis] = useState(true);
  const [formCatatan, setFormCatatan] = useState('');

  // Paste modal
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');

  // Excel/CSV Upload modal
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadRows, setUploadRows] = useState<string[][]>([]);
  const [uploadColumns, setUploadColumns] = useState<ImportField[]>([]);
  const [uploadHeaderRow, setUploadHeaderRow] = useState<number>(-1);
  const [uploadError, setUploadError] = useState('');

  // Confirm delete modal
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const counts = useMemo(() => {
    const c = { semua: analysis.senarai.length, guru: 0, pentadbir: 0, staf: 0 };
    analysis.senarai.forEach((r) => {
      c[r.guru.kategori || 'guru']++;
    });
    return c;
  }, [analysis.senarai]);

  const filtered = useMemo(() => {
    const q = norm(search);
    const list = analysis.senarai.filter((r) => {
      if (category !== 'semua' && (r.guru.kategori || 'guru') !== category) return false;
      if (q && !norm([r.guru.nama, r.guru.gred, r.guru.jawatan, r.guru.opsyen].join(' ')).includes(q)) {
        return false;
      }
      return true;
    });
    const copy = [...list];
    if (sortBy === 'nama') copy.sort((a, b) => a.guru.nama.localeCompare(b.guru.nama, 'ms'));
    else if (sortBy === 'gred')
      copy.sort(
        (a, b) =>
          nilaiGred(b.guru.gred) - nilaiGred(a.guru.gred) ||
          (a.guru.urutan || 0) - (b.guru.urutan || 0)
      );
    else if (sortBy === 'beban') copy.sort((a, b) => b.jumlah - a.jumlah);
    else copy.sort((a, b) => (a.guru.urutan || 0) - (b.guru.urutan || 0));
    return copy;
  }, [analysis.senarai, category, search, sortBy]);

  const canReorder = canManage && sortBy === 'asal' && !search.trim() && category === 'semua';
  const selectedKeys = Object.keys(selectedIds).filter((id) => selectedIds[id]);
  const allVisibleSelected = filtered.length > 0 && filtered.every((r) => selectedIds[r.id]);

  const openEditor = (t: Teacher | null) => {
    if (t) {
      setEditingTeacher(t);
      setFormNama(t.nama);
      setFormGred(t.gred);
      setFormJawatan(t.jawatan);
      setFormOpsyen(t.opsyen);
      setFormWaktu(t.waktu == null ? '' : String(t.waktu));
      setFormKategori(t.kategori);
      setFormAnalisis(t.analisis);
      setFormCatatan(t.catatan);
    } else {
      setEditingTeacher('new');
      setFormNama('');
      setFormGred('DG10');
      setFormJawatan('Guru');
      setFormOpsyen('');
      setFormWaktu('24');
      setFormKategori('guru');
      setFormAnalisis(true);
      setFormCatatan('');
    }
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim()) return;
    saveTeacher({
      id: editingTeacher && editingTeacher !== 'new' ? editingTeacher.id : undefined,
      nama: formNama.trim(),
      gred: formGred.trim(),
      jawatan: formJawatan.trim(),
      opsyen: formOpsyen.trim(),
      waktu: formWaktu.trim() ? Number(formWaktu) : null,
      kategori: formKategori,
      analisis: formAnalisis,
      catatan: formCatatan.trim(),
    });
    notify(editingTeacher === 'new' ? 'Guru ditambah.' : 'Maklumat guru dikemaskini.');
    setEditingTeacher(null);
  };

  const handleExportCsv = () => {
    const header = ['Bil', 'Nama', 'Gred', 'Jawatan', 'Opsyen', 'Waktu', 'Kategori', 'Tugas', 'Mata', 'Status'];
    const rows = filtered.map((r, i) => [
      i + 1,
      r.guru.nama,
      r.guru.gred,
      r.guru.jawatan,
      r.guru.opsyen,
      r.guru.waktu ?? '',
      r.guru.kategori,
      r.bilTugas,
      r.jumlah,
      r.status || 'Dikecualikan',
    ]);
    downloadTextFile(`Senarai-Guru-${session.tahun.label}.csv`, buildCsv([header, ...rows]));
    notify('Senarai guru dieksport sebagai CSV.');
  };

  const handleImportPaste = () => {
    const sheets = parseCsvText(pasteText);
    const rows = sheets[0]?.baris || [];
    if (!rows.length) return;
    const guessed = guessColumns(rows);
    const dataRows = guessed.tajuk >= 0 ? rows.slice(guessed.tajuk + 1) : rows;
    const nameIdx = guessed.lajur.indexOf('nama');
    const gredIdx = guessed.lajur.indexOf('gred');
    const jawIdx = guessed.lajur.indexOf('jawatan');
    const opsIdx = guessed.lajur.indexOf('opsyen');
    const wktIdx = guessed.lajur.indexOf('waktu');

    const toAdd: Omit<Teacher, 'id' | 'urutan'>[] = dataRows
      .map((r) => {
        const nama = (nameIdx >= 0 ? r[nameIdx] : r[0])?.trim();
        if (!nama) return null;
        const jaw = (jawIdx >= 0 ? r[jawIdx] : '') || 'Guru';
        const grd = gredIdx >= 0 ? r[gredIdx] || '' : '';
        const kat: TeacherCategory = /pengetua|guru besar|penolong kanan/i.test(jaw)
          ? 'pentadbir'
          : /pembantu|kerani|juruteknik/i.test(jaw)
          ? 'staf'
          : 'guru';
        return {
          nama,
          gred: grd,
          jawatan: jaw,
          opsyen: opsIdx >= 0 ? r[opsIdx] || '' : '',
          waktu: wktIdx >= 0 && r[wktIdx] && !Number.isNaN(Number(r[wktIdx])) ? Number(r[wktIdx]) : null,
          kategori: kat,
          analisis: kat === 'guru',
          catatan: '',
        };
      })
      .filter(Boolean) as Omit<Teacher, 'id' | 'urutan'>[];

    if (!toAdd.length) return;
    addTeachersBulk(toAdd);
    notify(`${toAdd.length} guru berjaya ditambah.`);
    setPasteText('');
    setPasteOpen(false);
  };

  const handleFilePick = async (file: File | null) => {
    if (!file) return;
    setUploadError('');
    try {
      const sheets = await readSpreadsheetFile(file);
      const rows = sheets[0]?.baris || [];
      const guessed = guessColumns(rows);
      setUploadRows(rows);
      setUploadColumns(guessed.lajur);
      setUploadHeaderRow(guessed.tajuk);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Fail tidak dapat dibaca.');
    }
  };

  const handleConfirmUpload = () => {
    const nameIdx = uploadColumns.indexOf('nama');
    if (nameIdx < 0) {
      setUploadError('Sila padankan sekurang-kurangnya satu lajur kepada "Nama".');
      return;
    }
    const gredIdx = uploadColumns.indexOf('gred');
    const jawIdx = uploadColumns.indexOf('jawatan');
    const opsIdx = uploadColumns.indexOf('opsyen');
    const wktIdx = uploadColumns.indexOf('waktu');
    const startRow = uploadHeaderRow >= 0 ? uploadHeaderRow + 1 : 0;

    const toAdd: Omit<Teacher, 'id' | 'urutan'>[] = uploadRows
      .slice(startRow)
      .map((r) => {
        const nama = r[nameIdx]?.trim();
        if (!nama) return null;
        const jaw = (jawIdx >= 0 ? r[jawIdx] : '') || 'Guru';
        const grd = gredIdx >= 0 ? r[gredIdx] || '' : '';
        const kat: TeacherCategory = /pengetua|guru besar|penolong kanan/i.test(jaw)
          ? 'pentadbir'
          : /pembantu|kerani|juruteknik/i.test(jaw)
          ? 'staf'
          : 'guru';
        return {
          nama,
          gred: grd,
          jawatan: jaw,
          opsyen: opsIdx >= 0 ? r[opsIdx] || '' : '',
          waktu: wktIdx >= 0 && r[wktIdx] && !Number.isNaN(Number(r[wktIdx])) ? Number(r[wktIdx]) : null,
          kategori: kat,
          analisis: kat === 'guru',
          catatan: '',
        };
      })
      .filter(Boolean) as Omit<Teacher, 'id' | 'urutan'>[];

    if (!toAdd.length) {
      setUploadError('Tiada baris nama yang sah dijumpai.');
      return;
    }
    addTeachersBulk(toAdd);
    notify(`${toAdd.length} guru dimuat naik daripada fail.`);
    setUploadRows([]);
    setUploadOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--ink)]">Guru &amp; Staf</h1>
          <p className="mt-1 text-sm text-[var(--ink-3)]">
            {analysis.senarai.length} orang dalam sesi {session.tahun.label}. Susunan kekananan di sini digunakan dalam Buku Pengurusan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {analysis.senarai.length > 0 && (
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--ink)] hover:bg-[var(--surface-3)] whitespace-nowrap shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Eksport CSV</span>
            </button>
          )}
          {canManage && (
            <>
              <button
                type="button"
                onClick={() => {
                  setUploadRows([]);
                  setUploadError('');
                  setUploadOpen(true);
                }}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--ink)] hover:bg-[var(--surface-3)] whitespace-nowrap shrink-0"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Muat naik Excel</span>
              </button>
              <button
                type="button"
                onClick={() => setPasteOpen(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--ink)] hover:bg-[var(--surface-3)] whitespace-nowrap shrink-0"
              >
                <ClipboardPaste className="h-3.5 w-3.5" />
                <span>Tampal</span>
              </button>
              <button
                type="button"
                onClick={() => openEditor(null)}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--brand)] px-3.5 text-xs font-semibold text-white hover:bg-[var(--brand-2)] whitespace-nowrap shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1 sm:max-w-[320px]">
          <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-[var(--ink-3)]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, gred, jawatan atau opsyen..."
            className="h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] pr-3 pl-9 text-sm text-[var(--ink)] placeholder:text-[var(--ink-3)] focus:border-[var(--brand)] focus:outline-none"
          />
        </div>

        <div className="inline-flex rounded-xl bg-[var(--surface-3)] p-1">
          {(
            [
              ['semua', `Semua ${counts.semua}`],
              ['guru', `Guru ${counts.guru}`],
              ['pentadbir', `Pentadbir ${counts.pentadbir}`],
              ['staf', `Staf ${counts.staf}`],
            ] as const
          ).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setCategory(val)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors whitespace-nowrap ${
                category === val
                  ? 'bg-[var(--surface)] text-[var(--ink)] shadow-sm'
                  : 'text-[var(--ink-2)] hover:text-[var(--ink)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <select
          aria-label="Susunan senarai"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortKey)}
          className="h-9 rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--ink)] focus:border-[var(--brand)] focus:outline-none"
        >
          <option value="asal">Susunan buku (kekananan)</option>
          <option value="nama">Nama A–Z</option>
          <option value="gred">Gred tertinggi</option>
          <option value="beban">Beban tertinggi</option>
        </select>
      </div>

      {/* Bulk actions bar */}
      {canManage && selectedKeys.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--berat)]/30 bg-[var(--berat-soft)] px-4 py-2.5 text-xs">
          <span className="font-bold text-[var(--berat-ink)]">{selectedKeys.length} orang dipilih</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setConfirmBulkDelete(true)}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[var(--berat)] px-3 text-xs font-semibold text-white hover:opacity-90 whitespace-nowrap"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Padam yang dipilih</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds({})}
              className="h-8 rounded-lg px-2.5 text-xs font-medium text-[var(--ink-2)] hover:bg-[var(--surface)]"
            >
              Batal pilihan
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[var(--surface-2)] text-[11px] font-semibold tracking-wider text-[var(--ink-3)] uppercase">
                {canManage && (
                  <th className="w-10 px-3 py-3 text-center">
                    <input
                      type="checkbox"
                      aria-label="Pilih semua"
                      checked={allVisibleSelected}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        const next = { ...selectedIds };
                        filtered.forEach((r) => {
                          if (checked) next[r.id] = true;
                          else delete next[r.id];
                        });
                        setSelectedIds(next);
                      }}
                      className="h-4 w-4 accent-[var(--brand)]"
                    />
                  </th>
                )}
                <th className="w-12 px-3 py-3 text-right">Bil</th>
                <th className="px-3 py-3">Nama</th>
                <th className="px-3 py-3">Gred</th>
                <th className="px-3 py-3">Jawatan</th>
                <th className="px-3 py-3">Opsyen</th>
                <th className="px-3 py-3 text-right">Waktu</th>
                <th className="px-3 py-3 text-right">Tugas</th>
                <th className="px-3 py-3 text-right">Mata</th>
                <th className="px-3 py-3">Status</th>
                {canManage && <th className="px-3 py-3 text-right">Tindakan</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 11 : 9} className="px-4 py-12 text-center text-sm text-[var(--ink-3)]">
                    Tiada rekod sepadan dengan tapisan.
                  </td>
                </tr>
              ) : (
                filtered.map((r, i) => {
                  const g = r.guru;
                  return (
                    <tr
                      key={g.id}
                      onClick={() => openTeacherModal(g.id)}
                      className="cursor-pointer transition-colors hover:bg-[var(--surface-2)]"
                    >
                      {canManage && (
                        <td
                          className="px-3 py-2.5 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            aria-label={`Pilih ${g.nama}`}
                            checked={!!selectedIds[g.id]}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setSelectedIds((prev) => ({ ...prev, [g.id]: checked }));
                            }}
                            className="h-4 w-4 accent-[var(--brand)]"
                          />
                        </td>
                      )}
                      <td className="font-mono-num px-3 py-2.5 text-right text-xs text-[var(--ink-3)]">
                        {i + 1}
                      </td>
                      <td className="px-3 py-2.5 font-semibold text-[var(--ink)]">
                        <div>{g.nama}</div>
                        {g.catatan && <div className="text-xs font-normal text-[var(--ink-3)]">{g.catatan}</div>}
                      </td>
                      <td className="px-3 py-2.5">
                        {g.gred ? (
                          <span className="font-mono-num inline-block rounded border border-[var(--line-2)] px-1.5 py-0.5 text-[11px] font-semibold text-[var(--ink-2)]">
                            {g.gred}
                          </span>
                        ) : (
                          <span className="text-[var(--ink-3)]">–</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-[var(--ink-2)]">{g.jawatan || '–'}</td>
                      <td className="px-3 py-2.5 text-xs text-[var(--ink-2)]">{g.opsyen || '–'}</td>
                      <td className="font-mono-num px-3 py-2.5 text-right text-xs text-[var(--ink-2)]">
                        {g.waktu ?? '–'}
                      </td>
                      <td className="font-mono-num px-3 py-2.5 text-right text-xs font-medium text-[var(--ink)]">
                        {r.bilTugas}
                      </td>
                      <td className="font-mono-num px-3 py-2.5 text-right text-xs font-bold text-[var(--ink)]">
                        {fmt(r.jumlah)}
                      </td>
                      <td className="px-3 py-2.5">
                        {r.analisis ? (
                          <StatusBadge status={r.status} />
                        ) : (
                          <span className="rounded border border-[var(--line-2)] px-2 py-0.5 text-[11px] font-medium text-[var(--ink-3)]">
                            {g.kategori === 'pentadbir' ? 'Pentadbir' : g.kategori === 'staf' ? 'Staf' : 'Dikecualikan'}
                          </span>
                        )}
                      </td>
                      {canManage && (
                        <td
                          className="px-3 py-2.5 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="inline-flex items-center gap-1">
                            {canReorder && (
                              <>
                                <button
                                  type="button"
                                  title="Alih ke atas"
                                  onClick={() => moveTeacher(g.id, -1)}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--ink-3)] hover:bg-[var(--surface-3)] hover:text-[var(--ink)]"
                                >
                                  <ArrowUp className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  title="Alih ke bawah"
                                  onClick={() => moveTeacher(g.id, 1)}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--ink-3)] hover:bg-[var(--surface-3)] hover:text-[var(--ink)]"
                                >
                                  <ArrowDown className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              title={`Sunting ${g.nama}`}
                              onClick={() => openEditor(g)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--ink-3)] hover:bg-[var(--surface-3)] hover:text-[var(--ink)]"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Teacher Modal */}
      <Modal
        open={editingTeacher !== null}
        onClose={() => setEditingTeacher(null)}
        title={editingTeacher === 'new' ? 'Tambah Guru / Staf' : 'Sunting Maklumat Guru'}
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditingTeacher(null)}
              className="h-9 rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--surface-3)]"
            >
              Batal
            </button>
            <button
              type="submit"
              form="teacher-form"
              className="h-9 rounded-lg bg-[var(--brand)] px-4 text-sm font-semibold text-white hover:bg-[var(--brand-2)]"
            >
              Simpan
            </button>
          </>
        }
      >
        <form id="teacher-form" onSubmit={handleSaveTeacher} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--ink-2)]">Nama penuh *</label>
            <input
              required
              value={formNama}
              onChange={(e) => setFormNama(e.target.value)}
              placeholder="cth. Pn. Siti Aminah binti Hassan"
              className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-sm focus:border-[var(--brand)] focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--ink-2)]">Gred</label>
              <input
                value={formGred}
                onChange={(e) => setFormGred(e.target.value)}
                list="gred-list"
                placeholder="cth. DG10 / DG44"
                className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-sm focus:border-[var(--brand)] focus:outline-none"
              />
              <datalist id="gred-list">
                {session.tetapan.gred.map((gr) => (
                  <option key={gr} value={gr} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--ink-2)]">Waktu mengajar / minggu</label>
              <input
                type="number"
                min={0}
                max={60}
                value={formWaktu}
                onChange={(e) => setFormWaktu(e.target.value)}
                placeholder="cth. 24"
                className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-sm focus:border-[var(--brand)] focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--ink-2)]">Jawatan hakiki</label>
              <input
                value={formJawatan}
                onChange={(e) => setFormJawatan(e.target.value)}
                placeholder="cth. Guru / PK HEM"
                className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-sm focus:border-[var(--brand)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--ink-2)]">Opsyen / Bidang</label>
              <input
                value={formOpsyen}
                onChange={(e) => setFormOpsyen(e.target.value)}
                placeholder="cth. Matematik"
                className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-sm focus:border-[var(--brand)] focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--ink-2)]">Kategori</label>
            <select
              value={formKategori}
              onChange={(e) => {
                const val = e.target.value as TeacherCategory;
                setFormKategori(val);
                setFormAnalisis(val === 'guru');
              }}
              className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-sm focus:border-[var(--brand)] focus:outline-none"
            >
              <option value="guru">Guru</option>
              <option value="pentadbir">Pentadbir (Pengetua / Guru Besar / PK)</option>
              <option value="staf">Staf Sokongan / AKP</option>
            </select>
          </div>
          <label className="flex items-start gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={formAnalisis}
              onChange={(e) => setFormAnalisis(e.target.checked)}
              className="mt-1 h-4 w-4 accent-[var(--brand)]"
            />
            <span>
              <span className="font-semibold text-[var(--ink)]">Masukkan dalam analisis keseimbangan beban</span>
              <span className="block text-xs text-[var(--ink-3)]">
                Nyahaktif bagi Pengetua, PK atau staf sokongan supaya purata guru tidak terpesong.
              </span>
            </span>
          </label>
          <div>
            <label className="block text-xs font-semibold text-[var(--ink-2)]">Catatan (pilihan)</label>
            <input
              value={formCatatan}
              onChange={(e) => setFormCatatan(e.target.value)}
              placeholder="cth. Guru baharu / Cuti bersalin"
              className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-sm focus:border-[var(--brand)] focus:outline-none"
            />
          </div>
        </form>
      </Modal>

      {/* Paste Modal */}
      <Modal
        open={pasteOpen}
        onClose={() => setPasteOpen(false)}
        title="Tampal senarai dari Excel"
        subtitle="Salin jadual daripada Excel atau Google Sheets (termasuk lajur Nama, Gred, Jawatan, Opsyen, Waktu) dan tampal di sini."
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setPasteOpen(false)}
              className="h-9 rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3.5 text-sm font-medium"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleImportPaste}
              className="h-9 rounded-lg bg-[var(--brand)] px-4 text-sm font-semibold text-white hover:bg-[var(--brand-2)]"
            >
              Import senarai
            </button>
          </>
        }
      >
        <textarea
          rows={9}
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder={`Nama\tGred\tJawatan\tOpsyen\tWaktu\nEn. Ahmad bin Ali\tDG10\tGuru\tMatematik\t24\nPn. Mei Ling\tDG9\tGuru\tBahasa Inggeris\t26`}
          className="w-full rounded-xl border border-[var(--line-2)] bg-[var(--surface-2)] p-3 font-mono-num text-xs text-[var(--ink)] focus:border-[var(--brand)] focus:outline-none"
        />
      </Modal>

      {/* Excel/CSV Upload Modal */}
      <Modal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Muat naik fail Excel (.xlsx) atau CSV"
        subtitle="Semua pemprosesan dibuat terus dalam pelayar anda tanpa menghantar fail keluar."
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setUploadOpen(false)}
              className="h-9 rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3.5 text-sm font-medium"
            >
              Batal
            </button>
            {uploadRows.length > 0 && (
              <button
                type="button"
                onClick={handleConfirmUpload}
                className="h-9 rounded-lg bg-[var(--brand)] px-4 text-sm font-semibold text-white hover:bg-[var(--brand-2)]"
              >
                Import {Math.max(0, uploadRows.length - (uploadHeaderRow >= 0 ? uploadHeaderRow + 1 : 0))} rekod
              </button>
            )}
          </>
        }
      >
        <div className="space-y-4">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--line-2)] bg-[var(--surface-2)] p-6 text-center hover:border-[var(--brand)]">
            <Upload className="h-6 w-6 text-[var(--brand)]" />
            <span className="text-sm font-semibold text-[var(--ink)]">Pilih fail .xlsx atau .csv</span>
            <span className="text-xs text-[var(--ink-3)]">Lajur akan dipadankan secara automatik.</span>
            <input
              type="file"
              accept=".xlsx,.csv,.tsv"
              className="hidden"
              onChange={(e) => handleFilePick(e.target.files?.[0] || null)}
            />
          </label>

          {uploadError && (
            <div className="rounded-lg bg-[var(--berat-soft)] px-3 py-2 text-xs font-medium text-[var(--berat-ink)]">
              {uploadError}
            </div>
          )}

          {uploadRows.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-[var(--line)]">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--line)] bg-[var(--surface-2)]">
                    {uploadColumns.map((col, idx) => (
                      <th key={idx} className="p-2">
                        <select
                          value={col}
                          onChange={(e) => {
                            const next = [...uploadColumns];
                            next[idx] = e.target.value as ImportField;
                            setUploadColumns(next);
                          }}
                          className="h-7 w-full rounded border border-[var(--line-2)] bg-[var(--surface)] px-2 text-xs font-semibold"
                        >
                          <option value="">(Abaikan lajur)</option>
                          <option value="nama">Nama *</option>
                          <option value="gred">Gred</option>
                          <option value="jawatan">Jawatan</option>
                          <option value="opsyen">Opsyen</option>
                          <option value="waktu">Waktu mengajar</option>
                        </select>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {uploadRows.slice(uploadHeaderRow >= 0 ? uploadHeaderRow + 1 : 0, 8).map((row, ri) => (
                    <tr key={ri}>
                      {uploadColumns.map((_, ci) => (
                        <td key={ci} className="max-w-[180px] truncate px-2 py-1.5 text-[var(--ink-2)]">
                          {row[ci] || ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>

      {/* Confirm Bulk Delete */}
      <ConfirmModal
        open={confirmBulkDelete}
        onClose={() => setConfirmBulkDelete(false)}
        onConfirm={() => {
          deleteTeachers(selectedKeys);
          notify(`${selectedKeys.length} orang dipadam.`);
          setSelectedIds({});
        }}
        title={`Padam ${selectedKeys.length} orang?`}
        message="Jawatan yang dipegang oleh guru ini akan ditandakan sebagai belum diisi dan jawatankuasanya kekal. Tindakan ini tidak boleh dibatalkan."
        confirmLabel={`Padam ${selectedKeys.length} orang`}
        danger
      />
    </div>
  );
};
