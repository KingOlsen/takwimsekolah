import React, { useState } from 'react';
import {
  Building2,
  ClipboardList,
  FolderPlus,
  Layers,
  Plus,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { bidangUntuk, JENIS_BAHAGIAN, JAWATAN_LALAI } from '../lib/templat';
import type { BurdenLevel, DivisionType, TeacherCategory } from '../types/tugasadil';
import { Modal } from './Ui';

type InsertTab = 'guru' | 'jawatankuasa' | 'bahagian' | 'sekolah';

export const QuickInsertModal: React.FC = () => {
  const {
    session,
    quickInsertOpen,
    setQuickInsertOpen,
    saveTeacher,
    saveDivision,
    saveCommittee,
    createSession,
    startBlankSchool,
    navigate,
    notify,
  } = useStore();

  const [tab, setTab] = useState<InsertTab>('guru');

  // Guru form
  const [gNama, setGNama] = useState('');
  const [gGred, setGGred] = useState('DG10');
  const [gJawatan, setGJawatan] = useState('Guru');
  const [gOpsyen, setGOpsyen] = useState('');
  const [gWaktu, setGWaktu] = useState('24');
  const [gKategori, setGKategori] = useState<TeacherCategory>('guru');

  // Jawatankuasa form
  const [jkDivId, setJkDivId] = useState(session.bahagian[0]?.id || '');
  const [jkNama, setJkNama] = useState('');
  const [jkKumpulan, setJkKumpulan] = useState('');
  const [jkTahap, setJkTahap] = useState<BurdenLevel>('sederhana');
  const [jkBidang, setJkBidang] = useState('');

  // Bahagian form
  const [divJenis, setDivJenis] = useState<DivisionType>('lain');
  const [divNama, setDivNama] = useState('');
  const [divSingkatan, setDivSingkatan] = useState('');

  // Sekolah / Sesi form
  const [schoolName, setSchoolName] = useState('');
  const [sessionLabel, setSessionLabel] = useState('2028');
  const [blankMode, setBlankMode] = useState<'sesi' | 'sekolah'>('sesi');
  const [copyCurrent, setCopyCurrent] = useState(true);

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gNama.trim()) return;
    saveTeacher({
      nama: gNama.trim(),
      gred: gGred.trim(),
      jawatan: gJawatan.trim() || 'Guru',
      opsyen: gOpsyen.trim(),
      waktu: gWaktu.trim() ? Number(gWaktu) : null,
      kategori: gKategori,
      analisis: gKategori === 'guru',
      catatan: '',
    });
    notify(`${gNama.trim()} ditambah ke senarai guru.`);
    setGNama('');
    setGOpsyen('');
  };

  const handleAddCommittee = (e: React.FormEvent) => {
    e.preventDefault();
    const targetDiv = jkDivId || session.bahagian[0]?.id;
    if (!jkNama.trim() || !targetDiv) return;
    saveCommittee({
      bahagianId: targetDiv,
      nama: jkNama.trim(),
      kumpulan: jkKumpulan.trim(),
      tahap: jkTahap,
      bidang: jkBidang.trim() || bidangUntuk(jkNama.trim()),
      ahli: JAWATAN_LALAI.map((jaw, i) => ({
        id: `a_${Date.now()}_${i}`,
        jawatan: jaw,
        butiran: '',
        guruId: null,
        nama: '',
        mata: null,
      })),
    });
    notify(`Jawatankuasa "${jkNama.trim()}" ditambah.`);
    setJkNama('');
    setJkBidang('');
    setQuickInsertOpen(false);
    navigate({ page: 'bahagian', bahagianId: targetDiv });
  };

  const handleAddDivision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!divNama.trim()) return;
    saveDivision({
      jenis: divJenis,
      nama: divNama.trim(),
      singkatan: (divSingkatan.trim() || divNama.trim().slice(0, 6)).toUpperCase(),
      aktif: true,
    });
    notify(`Bahagian "${divNama.trim()}" ditambah.`);
    setDivNama('');
    setDivSingkatan('');
    setQuickInsertOpen(false);
  };

  const handleCreateSessionOrSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (blankMode === 'sekolah') {
      startBlankSchool(schoolName || 'Sekolah Baharu', sessionLabel || '2027');
      setQuickInsertOpen(false);
      navigate({ page: 'guru' });
    } else {
      createSession(sessionLabel || '2028', copyCurrent ? session.tahun.id : undefined);
      setQuickInsertOpen(false);
      navigate({ page: 'pemuka' });
    }
  };

  return (
    <Modal
      open={quickInsertOpen}
      onClose={() => setQuickInsertOpen(false)}
      title="Tambah Data Baharu"
      subtitle="Masukkan rekod baharu guru, jawatankuasa, bahagian atau mulakan rekod sekolah baharu dengan pantas."
      size="lg"
    >
      <div className="space-y-4">
        {/* Tabs */}
        <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-[var(--surface-3)] p-1 sm:grid-cols-4">
          {(
            [
              ['guru', 'Guru / Staf', UserPlus],
              ['jawatankuasa', 'Jawatankuasa', ClipboardList],
              ['bahagian', 'Bahagian', Layers],
              ['sekolah', 'Sesi / Sekolah Baru', Building2],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors ${
                tab === id
                  ? 'bg-[var(--surface)] text-[var(--ink)] shadow-sm'
                  : 'text-[var(--ink-2)] hover:text-[var(--ink)]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: GURU / STAF */}
        {tab === 'guru' && (
          <form onSubmit={handleAddTeacher} className="space-y-3.5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[var(--ink-2)]">Nama penuh *</label>
                <input
                  required
                  autoFocus
                  value={gNama}
                  onChange={(e) => setGNama(e.target.value)}
                  placeholder="Contoh: Cikgu Amirul Hakim bin Roslan"
                  className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--ink-2)]">Gred</label>
                <select
                  value={gGred}
                  onChange={(e) => setGGred(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-sm"
                >
                  {session.tetapan.gred.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--ink-2)]">Kategori</label>
                <select
                  value={gKategori}
                  onChange={(e) => {
                    const k = e.target.value as TeacherCategory;
                    setGKategori(k);
                    if (k === 'staf' && gJawatan === 'Guru') setGJawatan('Pembantu Tadbir');
                    if (k === 'guru' && gJawatan !== 'Guru') setGJawatan('Guru');
                  }}
                  className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-sm"
                >
                  <option value="guru">Guru (dianalisis)</option>
                  <option value="pentadbir">Pentadbir (tidak dianalisis)</option>
                  <option value="staf">Staf sokongan (tidak dianalisis)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--ink-2)]">Jawatan hakiki</label>
                <input
                  value={gJawatan}
                  onChange={(e) => setGJawatan(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--ink-2)]">Opsyen &amp; Waktu / minggu</label>
                <div className="mt-1 flex gap-2">
                  <input
                    value={gOpsyen}
                    onChange={(e) => setGOpsyen(e.target.value)}
                    placeholder="Opsyen (cth: Sains)"
                    className="h-9 flex-1 rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-sm"
                  />
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={gWaktu}
                    onChange={(e) => setGWaktu(e.target.value)}
                    placeholder="Waktu"
                    className="h-9 w-20 rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-2.5 text-sm font-mono-num"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--line)] pt-3">
              <button
                type="button"
                onClick={() => {
                  setQuickInsertOpen(false);
                  navigate({ page: 'guru' });
                }}
                className="text-xs font-semibold text-[var(--brand-text)] hover:underline"
              >
                Import pukal (Excel / CSV / Tampal) →
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--brand)] px-4 text-xs font-semibold text-white hover:bg-[var(--brand-2)]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Simpan &amp; Tambah Lagi</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: JAWATANKUASA */}
        {tab === 'jawatankuasa' && (
          <form onSubmit={handleAddCommittee} className="space-y-3.5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[var(--ink-2)]">Bahagian</label>
                <select
                  value={jkDivId || session.bahagian[0]?.id || ''}
                  onChange={(e) => setJkDivId(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-sm"
                >
                  {session.bahagian.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nama}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--ink-2)]">Tahap beban</label>
                <select
                  value={jkTahap}
                  onChange={(e) => setJkTahap(e.target.value as BurdenLevel)}
                  className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-sm"
                >
                  <option value="ringan">Ringan (×0.5)</option>
                  <option value="sederhana">Sederhana (×1.0)</option>
                  <option value="berat">Berat (×1.5)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--ink-2)]">Nama jawatankuasa *</label>
                <input
                  required
                  value={jkNama}
                  onChange={(e) => setJkNama(e.target.value)}
                  placeholder="Contoh: Jawatankuasa Digital & ICT Sekolah"
                  className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--ink-2)]">Kumpulan (pilihan)</label>
                <input
                  value={jkKumpulan}
                  onChange={(e) => setJkKumpulan(e.target.value)}
                  placeholder="Contoh: Pengurusan / Panitia / Unit"
                  className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[var(--ink-2)]">Bidang tugas (pilihan)</label>
                  <button
                    type="button"
                    onClick={() => setJkBidang(bidangUntuk(jkNama || 'Jawatankuasa'))}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--brand-text)] hover:underline"
                  >
                    <Sparkles className="h-3 w-3" />
                    Cadang automatik
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={jkBidang}
                  onChange={(e) => setJkBidang(e.target.value)}
                  placeholder="Biarkan kosong untuk cadangan automatik mengikut nama jawatankuasa..."
                  className="mt-1 w-full rounded-lg border border-[var(--line-2)] p-2.5 text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end border-t border-[var(--line)] pt-3">
              <button
                type="submit"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--brand)] px-4 text-xs font-semibold text-white hover:bg-[var(--brand-2)]"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Cipta &amp; Buka Jawatankuasa</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: BAHAGIAN */}
        {tab === 'bahagian' && (
          <form onSubmit={handleAddDivision} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[var(--ink-2)]">Pilih jenis bahagian</label>
              <select
                value={divJenis}
                onChange={(e) => {
                  const j = e.target.value as DivisionType;
                  setDivJenis(j);
                  const preset = JENIS_BAHAGIAN.find((x) => x.jenis === j);
                  if (preset && j !== 'lain') {
                    setDivNama(preset.nama);
                    setDivSingkatan(preset.singkatan);
                  }
                }}
                className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-sm"
              >
                {JENIS_BAHAGIAN.map((jb) => (
                  <option key={jb.jenis} value={jb.jenis}>
                    {jb.nama} ({jb.singkatan})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[var(--ink-2)]">Nama bahagian *</label>
                <input
                  required
                  value={divNama}
                  onChange={(e) => setDivNama(e.target.value)}
                  placeholder="Contoh: Asrama / PPKI / Prasekolah"
                  className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--ink-2)]">Singkatan</label>
                <input
                  value={divSingkatan}
                  onChange={(e) => setDivSingkatan(e.target.value)}
                  placeholder="Contoh: ASRAMA"
                  className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-sm uppercase"
                />
              </div>
            </div>
            <div className="flex justify-end border-t border-[var(--line)] pt-3">
              <button
                type="submit"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--brand)] px-4 text-xs font-semibold text-white hover:bg-[var(--brand-2)]"
              >
                <FolderPlus className="h-3.5 w-3.5" />
                <span>Tambah Bahagian</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: SESI / SEKOLAH BARU */}
        {tab === 'sekolah' && (
          <form onSubmit={handleCreateSessionOrSchool} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setBlankMode('sesi')}
                className={`rounded-xl border p-3 text-left text-xs ${
                  blankMode === 'sesi'
                    ? 'border-[var(--brand)] bg-[var(--brand-soft)]'
                    : 'border-[var(--line-2)] bg-[var(--surface-2)]'
                }`}
              >
                <div className="font-bold text-[var(--ink)]">Tambah Sesi Baharu</div>
                <div className="mt-0.5 text-[var(--ink-3)]">Salin struktur semasa atau sesi kosong.</div>
              </button>
              <button
                type="button"
                onClick={() => setBlankMode('sekolah')}
                className={`rounded-xl border p-3 text-left text-xs ${
                  blankMode === 'sekolah'
                    ? 'border-[var(--brand)] bg-[var(--brand-soft)]'
                    : 'border-[var(--line-2)] bg-[var(--surface-2)]'
                }`}
              >
                <div className="font-bold text-[var(--ink)]">Mula Rekod Sekolah Sendiri</div>
                <div className="mt-0.5 text-[var(--ink-3)]">Kosongkan data demo &amp; isi data sekolah anda.</div>
              </button>
            </div>

            {blankMode === 'sekolah' && (
              <div>
                <label className="block text-xs font-semibold text-[var(--ink-2)]">Nama sekolah baharu *</label>
                <input
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="Contoh: SMK Taman Harmoni"
                  className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[var(--ink-2)]">Label sesi persekolahan *</label>
              <input
                required
                value={sessionLabel}
                onChange={(e) => setSessionLabel(e.target.value)}
                placeholder="Contoh: 2028"
                className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-sm font-mono-num"
              />
            </div>

            {blankMode === 'sesi' && (
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={copyCurrent}
                  onChange={(e) => setCopyCurrent(e.target.checked)}
                  className="h-4 w-4 accent-[var(--brand)]"
                />
                <span>Salin guru dan jawatankuasa daripada Sesi {session.tahun.label}</span>
              </label>
            )}

            <div className="flex justify-end border-t border-[var(--line)] pt-3">
              <button
                type="submit"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--brand)] px-4 text-xs font-semibold text-white hover:bg-[var(--brand-2)]"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{blankMode === 'sekolah' ? 'Cipta Sekolah Kosong' : 'Cipta Sesi Baharu'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
