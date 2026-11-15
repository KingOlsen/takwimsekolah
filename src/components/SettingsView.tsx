import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Cloud,
  CloudOff,
  Download,
  Lock,
  Plus,
  RefreshCw,
  RotateCcw,
  Trash2,
  Unlock,
  Upload,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { PERANAN_GRED, TETAPAN_LALAI } from '../lib/kira';
import { JENIS_BAHAGIAN, JENIS_SEKOLAH, NEGERI } from '../lib/templat';
import type { DivisionType, GradeTier, SchoolLevel, UserRole } from '../types/tugasadil';
import { Modal } from './Ui';

type SettingsTab = 'sekolah' | 'bahagian' | 'wajaran' | 'sesi' | 'pengguna' | 'sandaran';

export const SettingsView: React.FC = () => {
  const {
    store,
    session,
    isAdmin,
    canManage,
    updateSchool,
    saveDivision,
    moveDivision,
    updateSettings,
    switchSession,
    createSession,
    toggleLockSession,
    deleteSession,
    saveUser,
    deleteUser,
    resetDemoData,
    importFullJson,
    notify,
    cloudUser,
    syncStatus,
    lastSyncedAt,
    loginCloud,
    logoutCloud,
    forcePushToCloud,
  } = useStore();

  const [tab, setTab] = useState<SettingsTab>('sekolah');

  // New session modal
  const [newSessionOpen, setNewSessionOpen] = useState(false);
  const [newSessionLabel, setNewSessionLabel] = useState('2028');
  const [copyFromId, setCopyFromId] = useState(session.tahun.id);

  // Add role weight
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleMata, setNewRoleMata] = useState('2');
  const [newRoleMain, setNewRoleMain] = useState(false);

  // Add/Edit user modal
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<string | undefined>(undefined);
  const [uNama, setUNama] = useState('');
  const [uEmel, setUEmel] = useState('');
  const [uPeranan, setUPeranan] = useState<UserRole>('pentadbir');
  const [uBahagian, setUBahagian] = useState<string[]>([]);

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TugasAdil-${store.sekolah.nama.replace(/\s+/g, '-')}-Sandaran.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify('Fail sandaran JSON dimuat turun.');
  };

  const handleImportJson = async (file: File | null) => {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed.sesi || !parsed.sekolah) throw new Error('Format fail sandaran tidak sah.');
      importFullJson(parsed);
    } catch {
      notify('Fail sandaran tidak sah.', 'err');
    }
  };

  const openUserModal = (u?: (typeof store.pengguna)[number]) => {
    if (u) {
      setEditUserId(u.id);
      setUNama(u.nama);
      setUEmel(u.emel);
      setUPeranan(u.peranan);
      setUBahagian(u.bahagian || []);
    } else {
      setEditUserId(undefined);
      setUNama('');
      setUEmel('');
      setUPeranan('pentadbir');
      setUBahagian([]);
    }
    setUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uNama.trim() || !uEmel.trim()) return;
    saveUser({
      id: editUserId,
      nama: uNama.trim(),
      emel: uEmel.trim(),
      peranan: uPeranan,
      bahagian: uPeranan === 'pentadbir' ? uBahagian : [],
      aktif: true,
    });
    notify('Pengguna disimpan.');
    setUserModalOpen(false);
  };

  const handleLogoUpload = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateSchool({ logo: reader.result });
        notify('Lencana sekolah dikemaskini.');
      }
    };
    reader.readAsDataURL(file);
  };

  const sortedDivisions = [...session.bahagian].sort((a, b) => (a.urutan || 0) - (b.urutan || 0));
  const sessions = Object.values(store.sesi).map((s) => s.tahun);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--ink)]">Tetapan</h1>
        <p className="mt-1 text-sm text-[var(--ink-3)]">
          Konfigurasi profil sekolah, bahagian aktif, wajaran jawatan, sesi persekolahan dan akses pengguna.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-[var(--line)] pb-2">
        {(
          [
            ['sekolah', 'Profil Sekolah'],
            ['bahagian', 'Bahagian'],
            ['wajaran', 'Wajaran & Sasaran'],
            ['sesi', 'Sesi'],
            ['pengguna', 'Pengguna'],
            ['sandaran', 'Data & Sandaran'],
          ] as [SettingsTab, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
              tab === id
                ? 'bg-[var(--brand-soft)] text-[var(--brand-text)]'
                : 'text-[var(--ink-2)] hover:bg-[var(--surface-3)] hover:text-[var(--ink)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {!isAdmin && (
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-xs text-[var(--ink-2)]">
          Tetapan sekolah diuruskan oleh Pentadbir Sekolah. Tukar ke akaun Pentadbir Demo untuk mengubah tetapan.
        </div>
      )}

      {/* TAB: SEKOLAH */}
      {tab === 'sekolah' && (
        <div className="max-w-2xl space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[var(--ink-2)]">Nama sekolah</label>
              <input
                disabled={!canManage}
                value={store.sekolah.nama}
                onChange={(e) => updateSchool({ nama: e.target.value })}
                className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--ink-2)]">Kod sekolah</label>
              <input
                disabled={!canManage}
                value={store.sekolah.kod}
                onChange={(e) => updateSchool({ kod: e.target.value })}
                className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-sm font-mono-num"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--ink-2)]">Jenis sekolah</label>
              <select
                disabled={!canManage}
                value={store.sekolah.jenis}
                onChange={(e) => {
                  const found = JENIS_SEKOLAH.find((j) => j.id === e.target.value);
                  updateSchool({
                    jenis: e.target.value,
                    peringkat: (found?.peringkat || 'menengah') as SchoolLevel,
                  });
                }}
                className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-sm"
              >
                {JENIS_SEKOLAH.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.nama}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[var(--ink-2)]">Alamat</label>
              <input
                disabled={!canManage}
                value={store.sekolah.alamat}
                onChange={(e) => updateSchool({ alamat: e.target.value })}
                className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--ink-2)]">Bandar &amp; Poskod</label>
              <div className="mt-1 flex gap-2">
                <input
                  disabled={!canManage}
                  value={store.sekolah.poskod}
                  onChange={(e) => updateSchool({ poskod: e.target.value })}
                  placeholder="Poskod"
                  className="h-9 w-24 rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-2.5 text-sm font-mono-num"
                />
                <input
                  disabled={!canManage}
                  value={store.sekolah.bandar}
                  onChange={(e) => updateSchool({ bandar: e.target.value })}
                  placeholder="Bandar"
                  className="h-9 flex-1 rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-2.5 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--ink-2)]">Negeri</label>
              <select
                disabled={!canManage}
                value={store.sekolah.negeri}
                onChange={(e) => updateSchool({ negeri: e.target.value })}
                className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-sm"
              >
                {NEGERI.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--ink-2)]">Moto sekolah</label>
              <input
                disabled={!canManage}
                value={store.sekolah.moto}
                onChange={(e) => updateSchool({ moto: e.target.value })}
                className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--ink-2)]">Lencana sekolah</label>
              <div className="mt-1 flex items-center gap-3">
                {store.sekolah.logo && (
                  <img
                    src={store.sekolah.logo}
                    alt="Lencana sekolah"
                    className="h-10 w-10 rounded border border-[var(--line)] object-contain p-0.5"
                    referrerPolicy="no-referrer"
                  />
                )}
                {canManage && (
                  <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--line-2)] px-3 text-xs font-semibold hover:bg-[var(--surface-3)]">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Muat naik PNG/SVG</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleLogoUpload(e.target.files?.[0] || null)}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: BAHAGIAN */}
      {tab === 'bahagian' && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--surface-2)] text-[11px] font-semibold text-[var(--ink-3)] uppercase">
                  <th className="px-4 py-3">Nama Bahagian</th>
                  <th className="px-4 py-3">Singkatan</th>
                  <th className="px-4 py-3">Status</th>
                  {canManage && <th className="px-4 py-3 text-right">Susunan</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {sortedDivisions.map((b) => (
                  <tr key={b.id}>
                    <td className="px-4 py-2.5 font-semibold text-[var(--ink)]">{b.nama}</td>
                    <td className="px-4 py-2.5 text-xs text-[var(--ink-2)]">{b.singkatan}</td>
                    <td className="px-4 py-2.5">
                      <label className="inline-flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          disabled={!canManage}
                          checked={b.aktif !== false}
                          onChange={(e) => saveDivision({ ...b, aktif: e.target.checked })}
                          className="h-4 w-4 accent-[var(--brand)]"
                        />
                        <span>{b.aktif !== false ? 'Aktif' : 'Disembunyikan'}</span>
                      </label>
                    </td>
                    {canManage && (
                      <td className="px-4 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => moveDivision(b.id, -1)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-[var(--surface-3)]"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveDivision(b.id, 1)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-[var(--surface-3)]"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {canManage && (
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
              <div className="text-xs font-bold text-[var(--ink-2)] uppercase">Tambah Bahagian Pilihan</div>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {JENIS_BAHAGIAN.filter(
                  (jb) => !session.bahagian.some((b) => b.jenis === jb.jenis)
                ).map((jb) => (
                  <button
                    key={jb.jenis}
                    type="button"
                    onClick={() => {
                      saveDivision({
                        jenis: jb.jenis as DivisionType,
                        nama: jb.nama,
                        singkatan: jb.singkatan,
                        aktif: true,
                      });
                      notify(`Bahagian ${jb.nama} ditambah.`);
                    }}
                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--line-2)] px-3 text-xs font-semibold hover:bg-[var(--surface-3)]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{jb.nama}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: WAJARAN */}
      {tab === 'wajaran' && (
        <div className="space-y-5">
          {/* Thresholds & Grade weighting */}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
              <h2 className="text-sm font-bold text-[var(--ink)]">Ambang Keseimbangan &amp; Waktu Mengajar</h2>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-[var(--ink-2)]">Berat (&gt; %)</label>
                  <input
                    type="number"
                    disabled={!canManage}
                    value={session.tetapan.ambang.berat}
                    onChange={(e) =>
                      updateSettings({
                        ambang: { ...session.tetapan.ambang, berat: Number(e.target.value) || 125 },
                      })
                    }
                    className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] px-2.5 font-mono-num"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--ink-2)]">Kurang (&lt; %)</label>
                  <input
                    type="number"
                    disabled={!canManage}
                    value={session.tetapan.ambang.kurang}
                    onChange={(e) =>
                      updateSettings({
                        ambang: { ...session.tetapan.ambang, kurang: Number(e.target.value) || 75 },
                      })
                    }
                    className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] px-2.5 font-mono-num"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--ink-2)]">Had jawatan utama</label>
                  <input
                    type="number"
                    disabled={!canManage}
                    value={session.tetapan.hadUtama}
                    onChange={(e) =>
                      updateSettings({ hadUtama: Math.max(1, Number(e.target.value) || 4) })
                    }
                    className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] px-2.5 font-mono-num"
                  />
                </div>
              </div>

              <div className="border-t border-[var(--line)] pt-3 space-y-2 text-xs">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    disabled={!canManage}
                    checked={session.tetapan.waktu.kira}
                    onChange={(e) =>
                      updateSettings({ waktu: { ...session.tetapan.waktu, kira: e.target.checked } })
                    }
                    className="h-4 w-4 accent-[var(--brand)]"
                  />
                  <span className="font-semibold text-[var(--ink)]">
                    Kira waktu mengajar mingguan dalam jumlah beban
                  </span>
                </label>
                {session.tetapan.waktu.kira && (
                  <div className="flex items-center gap-2 pl-6">
                    <span>Mata setiap 1 waktu mengajar:</span>
                    <input
                      type="number"
                      step={0.05}
                      disabled={!canManage}
                      value={session.tetapan.waktu.mata}
                      onChange={(e) =>
                        updateSettings({
                          waktu: { ...session.tetapan.waktu, mata: Number(e.target.value) || 0.1 },
                        })
                      }
                      className="h-8 w-20 rounded-lg border border-[var(--line-2)] px-2 font-mono-num"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[var(--ink)]">Jangkaan Beban Mengikut Gred</h2>
                <label className="inline-flex items-center gap-2 text-xs font-semibold">
                  <input
                    type="checkbox"
                    disabled={!canManage}
                    checked={session.tetapan.gredKira.hidup}
                    onChange={(e) =>
                      updateSettings({
                        gredKira: { ...session.tetapan.gredKira, hidup: e.target.checked },
                      })
                    }
                    className="h-4 w-4 accent-[var(--brand)]"
                  />
                  <span>Aktif</span>
                </label>
              </div>
              <div className="space-y-1.5 text-xs">
                {PERANAN_GRED.map((pg) => (
                  <div key={pg.id} className="flex items-center justify-between gap-2">
                    <span className="text-[var(--ink-2)]">
                      <strong>{pg.gred}</strong> ({pg.peranan})
                    </span>
                    <input
                      type="number"
                      step={0.1}
                      min={0.5}
                      max={3}
                      disabled={!canManage || !session.tetapan.gredKira.hidup}
                      value={session.tetapan.gredKira.faktor[pg.id]}
                      onChange={(e) =>
                        updateSettings({
                          gredKira: {
                            ...session.tetapan.gredKira,
                            faktor: {
                              ...session.tetapan.gredKira.faktor,
                              [pg.id]: Number(e.target.value) || 1,
                            },
                          },
                        })
                      }
                      className="h-7 w-20 rounded border border-[var(--line-2)] px-2 text-right font-mono-num"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Role Weights List */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-[var(--ink)]">Wajaran Jawatan</h2>
              {canManage && (
                <button
                  type="button"
                  onClick={() => {
                    updateSettings({ jawatan: TETAPAN_LALAI.jawatan });
                    notify('Wajaran dipulihkan kepada nilai asal.');
                  }}
                  className="text-xs font-semibold text-[var(--ink-3)] hover:text-[var(--ink)]"
                >
                  Pulih nilai asal
                </button>
              )}
            </div>

            {canManage && (
              <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-[var(--surface-2)] p-3 text-xs">
                <input
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="Nama jawatan baharu..."
                  className="h-8 flex-1 min-w-[160px] rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-2.5"
                />
                <input
                  type="number"
                  step={0.5}
                  value={newRoleMata}
                  onChange={(e) => setNewRoleMata(e.target.value)}
                  className="h-8 w-20 rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-2 font-mono-num"
                />
                <label className="inline-flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={newRoleMain}
                    onChange={(e) => setNewRoleMain(e.target.checked)}
                    className="h-3.5 w-3.5 accent-[var(--brand)]"
                  />
                  <span>Utama</span>
                </label>
                <button
                  type="button"
                  disabled={!newRoleName.trim()}
                  onClick={() => {
                    updateSettings({
                      jawatan: [
                        { nama: newRoleName.trim(), mata: Number(newRoleMata) || 1, utama: newRoleMain },
                        ...session.tetapan.jawatan,
                      ],
                    });
                    setNewRoleName('');
                    notify('Jawatan ditambah ke senarai wajaran.');
                  }}
                  className="h-8 rounded-lg bg-[var(--brand)] px-3 font-semibold text-white disabled:opacity-40"
                >
                  Tambah
                </button>
              </div>
            )}

            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {session.tetapan.jawatan.map((j, idx) => (
                <div
                  key={`${j.nama}-${idx}`}
                  className="flex items-center justify-between gap-2 rounded-lg border border-[var(--line)] px-3 py-2 text-xs"
                >
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-[var(--ink)]">{j.nama}</div>
                    <div className="text-[11px] text-[var(--ink-3)]">{j.utama ? 'Jawatan utama' : 'Sokongan'}</div>
                  </div>
                  <input
                    type="number"
                    step={0.5}
                    min={0}
                    disabled={!canManage}
                    value={j.mata}
                    onChange={(e) => {
                      const next = [...session.tetapan.jawatan];
                      next[idx] = { ...j, mata: Number(e.target.value) || 0 };
                      updateSettings({ jawatan: next });
                    }}
                    className="h-7 w-16 rounded border border-[var(--line-2)] px-2 text-right font-mono-num font-bold"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: SESI */}
      {tab === 'sesi' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--ink)]">Sesi Persekolahan</h2>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setNewSessionOpen(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--brand)] px-3.5 text-xs font-semibold text-white hover:bg-[var(--brand-2)]"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Sesi baharu</span>
              </button>
            )}
          </div>
          <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--surface-2)] text-[11px] font-semibold text-[var(--ink-3)] uppercase">
                  <th className="px-4 py-3">Sesi</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {sessions.map((t) => (
                  <tr key={t.id}>
                    <td className="px-4 py-3 font-semibold text-[var(--ink)]">
                      Sesi {t.label}{' '}
                      {t.id === session.tahun.id && (
                        <span className="ml-2 rounded bg-[var(--brand-soft)] px-2 py-0.5 text-[11px] text-[var(--brand-text)]">
                          Sedang dibuka
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {t.kunci ? (
                        <span className="inline-flex items-center gap-1 text-[var(--amaran-ink)] font-semibold">
                          <Lock className="h-3.5 w-3.5" /> Dikunci
                        </span>
                      ) : (
                        <span className="text-[var(--baik-ink)] font-semibold">Boleh diubah</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        {t.id !== session.tahun.id && (
                          <button
                            type="button"
                            onClick={() => switchSession(t.id)}
                            className="rounded-lg border border-[var(--line-2)] px-2.5 py-1 text-xs font-semibold hover:bg-[var(--surface-3)]"
                          >
                            Buka
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => toggleLockSession(t.id, !t.kunci)}
                            className="inline-flex items-center gap-1 rounded-lg border border-[var(--line-2)] px-2.5 py-1 text-xs font-semibold hover:bg-[var(--surface-3)]"
                          >
                            {t.kunci ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                            <span>{t.kunci ? 'Buka kunci' : 'Kunci'}</span>
                          </button>
                        )}
                        {isAdmin && sessions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => deleteSession(t.id)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded text-[var(--ink-3)] hover:bg-[var(--berat-soft)] hover:text-[var(--berat)]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: PENGGUNA */}
      {tab === 'pengguna' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--ink)]">Akaun Pentadbir &amp; Pemerhati</h2>
            {isAdmin && (
              <button
                type="button"
                onClick={() => openUserModal()}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--brand)] px-3.5 text-xs font-semibold text-white hover:bg-[var(--brand-2)]"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Pengguna baharu</span>
              </button>
            )}
          </div>
          <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--surface-2)] text-[11px] font-semibold text-[var(--ink-3)] uppercase">
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">E-mel</th>
                  <th className="px-4 py-3">Peranan</th>
                  <th className="px-4 py-3">Bahagian</th>
                  {isAdmin && <th className="px-4 py-3 text-right">Tindakan</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {store.pengguna.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-2.5 font-semibold text-[var(--ink)]">{u.nama}</td>
                    <td className="px-4 py-2.5 text-xs text-[var(--ink-2)]">{u.emel}</td>
                    <td className="px-4 py-2.5 text-xs">
                      {u.peranan === 'admin'
                        ? 'Pentadbir sekolah'
                        : u.peranan === 'pentadbir'
                        ? 'Pentadbir bahagian'
                        : 'Pemerhati'}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-[var(--ink-2)]">
                      {u.peranan === 'admin'
                        ? 'Semua'
                        : u.peranan === 'pentadbir'
                        ? session.bahagian
                            .filter((b) => u.bahagian.includes(b.id))
                            .map((b) => b.singkatan)
                            .join(', ') || 'Tiada'
                        : 'Lihat sahaja'}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => openUserModal(u)}
                          className="mr-2 text-xs font-semibold text-[var(--brand-text)] hover:underline"
                        >
                          Sunting
                        </button>
                        {store.pengguna.length > 1 && u.id !== store.penggunaAktifId && (
                          <button
                            type="button"
                            onClick={() => deleteUser(u.id)}
                            className="text-xs font-semibold text-[var(--berat)] hover:underline"
                          >
                            Padam
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: SANDARAN */}
      {tab === 'sandaran' && (
        <div className="max-w-xl space-y-5">
          {/* Cloud Sync Across All Devices */}
          <div className="space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-[var(--ink)]">Segerak Awan (Semua Peranti)</h2>
                <p className="mt-1 text-xs leading-relaxed text-[var(--ink-2)]">
                  Sambungkan akaun Google anda supaya semua rekod guru, jawatankuasa, Buku Pengurusan dan Surat Lantikan disegerakkan secara langsung merentas komputer, komputer riba, tablet dan telefon pintar anda.
                </p>
              </div>
              <span
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                  cloudUser
                    ? 'bg-[var(--baik-soft)] text-[var(--baik-ink)]'
                    : 'bg-[var(--surface-3)] text-[var(--ink-3)]'
                }`}
              >
                {cloudUser ? <Cloud className="h-3.5 w-3.5" /> : <CloudOff className="h-3.5 w-3.5" />}
                <span>
                  {cloudUser
                    ? syncStatus === 'syncing'
                      ? 'Menyimpan…'
                      : 'Segerak Aktif'
                    : 'Belum Disambung'}
                </span>
              </span>
            </div>

            {cloudUser ? (
              <div className="space-y-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-3.5 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-[var(--ink)]">{cloudUser.displayName || 'Akaun Google'}</div>
                    <div className="text-[var(--ink-3)]">{cloudUser.email}</div>
                  </div>
                  {lastSyncedAt && (
                    <div className="font-mono-num text-[11px] text-[var(--ink-3)]">
                      Disegerak: {lastSyncedAt}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => void forcePushToCloud()}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--brand)] px-4 text-xs font-semibold text-white hover:bg-[var(--brand-2)]"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Segerak Sekarang</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void logoutCloud()}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3.5 text-xs font-semibold text-[var(--ink)] hover:bg-[var(--surface-3)]"
                  >
                    <span>Putuskan Sambungan</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => void loginCloud()}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-[var(--brand)] px-4 text-xs font-semibold text-white hover:bg-[var(--brand-2)]"
              >
                <Cloud className="h-4 w-4" />
                <span>Log Masuk Google &amp; Aktifkan Segerak Semua Peranti</span>
              </button>
            )}
          </div>

          {/* Local JSON Backup & Restore */}
          <div className="space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
            <h2 className="text-base font-bold text-[var(--ink)]">Sandaran &amp; Pemulihan Fail (JSON)</h2>
            <p className="text-xs leading-relaxed text-[var(--ink-2)]">
              Eksport keseluruhan data sekolah (semua sesi, senarai guru, jawatankuasa dan tetapan) sebagai fail JSON untuk simpanan luar talian atau perkongsian fail.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={handleExportJson}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--brand)] px-4 text-xs font-semibold text-white hover:bg-[var(--brand-2)]"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Muat turun sandaran JSON</span>
              </button>
              <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--line-2)] px-4 text-xs font-semibold hover:bg-[var(--surface-3)]">
                <Upload className="h-3.5 w-3.5" />
                <span>Import fail JSON</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => handleImportJson(e.target.files?.[0] || null)}
                />
              </label>
              <button
                type="button"
                onClick={resetDemoData}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--berat)]/40 bg-[var(--berat-soft)] px-4 text-xs font-semibold text-[var(--berat-ink)] hover:opacity-90"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Set semula data demo asal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Session Modal */}
      <Modal
        open={newSessionOpen}
        onClose={() => setNewSessionOpen(false)}
        title="Sesi Baharu"
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setNewSessionOpen(false)}
              className="h-9 rounded-lg border border-[var(--line-2)] px-3.5 text-sm font-medium"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => {
                if (!newSessionLabel.trim()) return;
                createSession(newSessionLabel.trim(), copyFromId || undefined);
                setNewSessionOpen(false);
              }}
              className="h-9 rounded-lg bg-[var(--brand)] px-4 text-sm font-semibold text-white"
            >
              Cipta sesi
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--ink-2)]">Label sesi / tahun *</label>
            <input
              value={newSessionLabel}
              onChange={(e) => setNewSessionLabel(e.target.value)}
              placeholder="cth. 2028"
              className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] px-3 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--ink-2)]">Mulakan dengan</label>
            <select
              value={copyFromId}
              onChange={(e) => setCopyFromId(e.target.value)}
              className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-sm"
            >
              {sessions.map((t) => (
                <option key={t.id} value={t.id}>
                  Salinan Sesi {t.label}
                </option>
              ))}
              <option value="">Sesi kosong</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* User Modal */}
      <Modal
        open={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        title={editUserId ? 'Sunting Pengguna' : 'Pengguna Baharu'}
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setUserModalOpen(false)}
              className="h-9 rounded-lg border border-[var(--line-2)] px-3.5 text-sm font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              form="user-form"
              className="h-9 rounded-lg bg-[var(--brand)] px-4 text-sm font-semibold text-white"
            >
              Simpan
            </button>
          </>
        }
      >
        <form id="user-form" onSubmit={handleSaveUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--ink-2)]">Nama *</label>
            <input
              required
              value={uNama}
              onChange={(e) => setUNama(e.target.value)}
              className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] px-3 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--ink-2)]">E-mel *</label>
            <input
              required
              type="email"
              value={uEmel}
              onChange={(e) => setUEmel(e.target.value)}
              className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] px-3 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--ink-2)]">Peranan</label>
            <select
              value={uPeranan}
              onChange={(e) => setUPeranan(e.target.value as UserRole)}
              className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-sm"
            >
              <option value="pentadbir">Pentadbir bahagian (PK)</option>
              <option value="admin">Pentadbir sekolah (akses penuh)</option>
              <option value="pemerhati">Pemerhati (lihat sahaja)</option>
            </select>
          </div>
          {uPeranan === 'pentadbir' && (
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-[var(--ink-2)]">Bahagian yang diurus</div>
              {sortedDivisions.map((b) => (
                <label key={b.id} className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={uBahagian.includes(b.id)}
                    onChange={(e) => {
                      if (e.target.checked) setUBahagian((p) => [...p, b.id]);
                      else setUBahagian((p) => p.filter((x) => x !== b.id));
                    }}
                    className="h-3.5 w-3.5 accent-[var(--brand)]"
                  />
                  <span>{b.nama}</span>
                </label>
              ))}
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};
