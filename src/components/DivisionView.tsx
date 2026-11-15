import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronRight,
  ListPlus,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { uid, useStore } from '../context/StoreContext';
import { fmt, mataJawatan, norm, TAHAP } from '../lib/kira';
import { bidangUntuk, JAWATAN_LALAI, templatUntuk, type CommitteeTemplate } from '../lib/templat';
import { isiBarisanJk, kesanBarisan, PERANAN_BARISAN, rancangBarisan, type LeadershipRoleKey } from '../lib/barisan';
import type { BurdenLevel, Committee, CommitteeMember } from '../types/tugasadil';
import { ConfirmModal, DivisionSquare, Modal, StatusBadge, WorkloadBar } from './Ui';

export const DivisionView: React.FC<{ bahagianId: string }> = ({ bahagianId }) => {
  const {
    store,
    session,
    analysis,
    canEditDivision,
    focusedCommitteeId,
    setFocusedCommitteeId,
    openTeacherModal,
    toggleDivisionReady,
    saveCommittee,
    addCommitteesBulk,
    updateCommittee,
    deleteCommittee,
    moveCommittee,
    notify,
  } = useStore();

  const divResult = analysis.bahagianMap[bahagianId];
  const editable = canEditDivision(bahagianId);

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [searchJk, setSearchJk] = useState('');

  // Teacher Picker Modal for assigning a committee slot
  const [pickingSlot, setPickingSlot] = useState<{ jkId: string; memberId: string } | null>(null);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCategory, setPickerCategory] = useState<'analisis' | 'semua'>('analisis');
  const [externalName, setExternalName] = useState('');

  // Add/Edit Committee Modal
  const [jkModal, setJkModal] = useState<Committee | null | 'new'>(null);
  const [jkNama, setJkNama] = useState('');
  const [jkKumpulan, setJkKumpulan] = useState('');
  const [jkTahap, setJkTahap] = useState<BurdenLevel>('sederhana');
  const [jkBidang, setJkBidang] = useState('');
  const [jkAutoSlot, setJkAutoSlot] = useState(true);

  // Add/Edit Member Slot Modal
  const [slotModal, setSlotModal] = useState<{ jkId: string; member: CommitteeMember | null } | null>(null);
  const [slotJawatan, setSlotJawatan] = useState('AJK');
  const [slotButiran, setSlotButiran] = useState('');
  const [slotMata, setSlotMata] = useState('');

  // Templates Modal
  const [templateOpen, setTemplateOpen] = useState(false);
  const [selectedTemplates, setSelectedTemplates] = useState<Record<number, boolean>>({});

  // Auto-fill Barisan Pengerusi Modal
  const [barisanOpen, setBarisanOpen] = useState(false);
  const [barisanMap, setBarisanMap] = useState<Record<LeadershipRoleKey, string | null>>({
    ketua: null,
    pentadbiran: null,
    hem: null,
    koku: null,
    t6: null,
    ppki: null,
    petang: null,
  });

  // Delete Committee confirm
  const [deletingJk, setDeletingJk] = useState<Committee | null>(null);

  useEffect(() => {
    if (focusedCommitteeId) {
      setCollapsed((prev) => ({ ...prev, [focusedCommitteeId]: false }));
      const el = document.getElementById(`jk-${focusedCommitteeId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const timer = setTimeout(() => setFocusedCommitteeId(null), 1500);
      return () => clearTimeout(timer);
    }
  }, [focusedCommitteeId, setFocusedCommitteeId]);

  const divisionCommittees = useMemo(() => {
    const q = norm(searchJk);
    return session.jk
      .filter((j) => j.bahagianId === bahagianId)
      .filter((j) => !q || norm(`${j.nama} ${j.kumpulan}`).includes(q))
      .sort((a, b) => (a.urutan || 0) - (b.urutan || 0));
  }, [session.jk, bahagianId, searchJk]);

  const groupedCommittees = useMemo(() => {
    const groups: { name: string; items: Committee[] }[] = [];
    const map: Record<string, { name: string; items: Committee[] }> = {};
    divisionCommittees.forEach((jk) => {
      const k = jk.kumpulan || '';
      if (!map[k]) {
        map[k] = { name: k, items: [] };
        if (k) groups.push(map[k]);
        else groups.unshift(map[k]);
      }
      map[k].items.push(jk);
    });
    return groups;
  }, [divisionCommittees]);

  const lightestTeachers = useMemo(() => {
    return [...analysis.analisis]
      .sort((a, b) => (a.nisbah ?? 0) - (b.nisbah ?? 0) || a.jumlah - b.jumlah)
      .slice(0, 8);
  }, [analysis.analisis]);

  const templatesForDiv = useMemo(() => {
    if (!divResult) return [];
    const existingNames = new Set(
      session.jk.filter((j) => j.bahagianId === bahagianId).map((j) => norm(j.nama))
    );
    return templatUntuk(divResult.bahagian.jenis, store.sekolah.peringkat).filter(
      (t) => !existingNames.has(norm(t.nama))
    );
  }, [divResult, session.jk, bahagianId, store.sekolah.peringkat]);

  if (!divResult) {
    return (
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-8 text-center text-sm text-[var(--ink-3)]">
        Bahagian tidak dijumpai.
      </div>
    );
  }

  const openJkEditor = (jk: Committee | null) => {
    if (jk) {
      setJkModal(jk);
      setJkNama(jk.nama);
      setJkKumpulan(jk.kumpulan);
      setJkTahap(jk.tahap);
      setJkBidang(jk.bidang);
    } else {
      setJkModal('new');
      setJkNama('');
      setJkKumpulan('');
      setJkTahap('sederhana');
      setJkBidang('');
      setJkAutoSlot(true);
    }
  };

  const handleSaveJk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jkNama.trim()) return;
    if (jkModal && jkModal !== 'new') {
      saveCommittee({
        ...jkModal,
        nama: jkNama.trim(),
        kumpulan: jkKumpulan.trim(),
        tahap: jkTahap,
        bidang: jkBidang.trim(),
      });
      notify('Jawatankuasa dikemaskini.');
    } else {
      const ahli: CommitteeMember[] = jkAutoSlot
        ? JAWATAN_LALAI.map((jaw) => ({
            id: uid('a'),
            jawatan: jaw,
            butiran: '',
            guruId: null,
            nama: '',
            mata: null,
          }))
        : [];
      saveCommittee({
        bahagianId,
        nama: jkNama.trim(),
        kumpulan: jkKumpulan.trim(),
        tahap: jkTahap,
        bidang: jkBidang.trim(),
        ahli,
      });
      notify('Jawatankuasa baharu ditambah.');
    }
    setJkModal(null);
  };

  const openSlotEditor = (jkId: string, member: CommitteeMember | null) => {
    setSlotModal({ jkId, member });
    setSlotJawatan(member ? member.jawatan : 'AJK');
    setSlotButiran(member ? member.butiran : '');
    setSlotMata(member && member.mata != null ? String(member.mata) : '');
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotModal || !slotJawatan.trim()) return;
    const manualMata = slotMata.trim() !== '' && Number.isFinite(Number(slotMata)) ? Number(slotMata) : null;
    updateCommittee(slotModal.jkId, (prev) => {
      if (slotModal.member) {
        return {
          ...prev,
          ahli: prev.ahli.map((a) =>
            a.id === slotModal.member!.id
              ? { ...a, jawatan: slotJawatan.trim(), butiran: slotButiran.trim(), mata: manualMata }
              : a
          ),
        };
      }
      const created: CommitteeMember = {
        id: uid('a'),
        jawatan: slotJawatan.trim(),
        butiran: slotButiran.trim(),
        guruId: null,
        nama: '',
        mata: manualMata,
      };
      return { ...prev, ahli: [...prev.ahli, created] };
    });
    setSlotModal(null);
  };

  const openPicker = (jkId: string, memberId: string) => {
    setPickingSlot({ jkId, memberId });
    setPickerSearch('');
    setPickerCategory('analisis');
    setExternalName('');
  };

  const assignMember = (guruId: string | null, external = '') => {
    if (!pickingSlot) return;
    updateCommittee(pickingSlot.jkId, (prev) => ({
      ...prev,
      ahli: prev.ahli.map((a) =>
        a.id === pickingSlot.memberId ? { ...a, guruId, nama: external } : a
      ),
    }));
    setPickingSlot(null);
  };

  const handleAddTemplates = () => {
    const chosen: CommitteeTemplate[] = templatesForDiv.filter((_, idx) => selectedTemplates[idx]);
    if (!chosen.length) return;
    addCommitteesBulk(
      chosen.map((t) => ({
        bahagianId,
        nama: t.nama,
        kumpulan: t.kumpulan || '',
        tahap: t.tahap || 'sederhana',
        bidang: t.bidang || bidangUntuk(t.nama, false),
        ahli: (t.jawatan || JAWATAN_LALAI).map((jaw) => ({
          id: uid('a'),
          jawatan: jaw,
          butiran: '',
          guruId: null,
          nama: '',
          mata: null,
        })),
      }))
    );
    notify(`${chosen.length} jawatankuasa daripada templat ditambah.`);
    setSelectedTemplates({});
    setTemplateOpen(false);
  };

  const openBarisan = () => {
    setBarisanMap(kesanBarisan(session.guru));
    setBarisanOpen(true);
  };

  const barisanPlan = useMemo(() => {
    if (!barisanOpen) return [];
    return rancangBarisan(session.jk, session.bahagian, barisanMap, new Set([bahagianId]));
  }, [barisanOpen, session.jk, session.bahagian, barisanMap, bahagianId]);

  const applyBarisan = () => {
    let totalFilled = 0;
    barisanPlan.forEach((plan) => {
      totalFilled += plan.bil;
      updateCommittee(plan.jk.id, (prev) => ({
        ...prev,
        ahli: isiBarisanJk(prev, divResult.bahagian.jenis, barisanMap).ahli,
      }));
    });
    notify(`Barisan pengerusi diisi: ${totalFilled} jawatan dalam ${barisanPlan.length} jawatankuasa.`);
    setBarisanOpen(false);
  };

  // Picker candidate list sorted lightest-first!
  const pickerCandidates = useMemo(() => {
    if (!pickingSlot) return [];
    const currentJk = session.jk.find((j) => j.id === pickingSlot.jkId);
    const existingGuruIds = new Set(
      (currentJk?.ahli || []).map((a) => a.guruId).filter(Boolean) as string[]
    );
    const q = norm(pickerSearch);
    return analysis.senarai
      .filter((r) => (pickerCategory === 'analisis' ? r.analisis : true))
      .filter((r) => !q || norm(`${r.guru.nama} ${r.guru.gred} ${r.guru.opsyen} ${r.guru.jawatan}`).includes(q))
      .sort((a, b) => {
        const aRatio = a.nisbah ?? (a.analisis ? 0 : 99);
        const bRatio = b.nisbah ?? (b.analisis ? 0 : 99);
        return aRatio - bRatio || a.jumlah - b.jumlah;
      })
      .map((r) => ({
        result: r,
        alreadyInJk: existingGuruIds.has(r.id),
      }));
  }, [pickingSlot, session.jk, analysis.senarai, pickerCategory, pickerSearch]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <DivisionSquare index={divResult.indeks} className="mt-2.5 h-3.5 w-3.5" />
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-[var(--ink)]">
                {divResult.bahagian.nama}
              </h1>
              <span
                className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                  divResult.siap
                    ? 'bg-[var(--baik-soft)] text-[var(--baik-ink)]'
                    : 'border border-[var(--line-2)] text-[var(--ink-3)]'
                }`}
              >
                {divResult.siap ? 'Siap' : 'Draf'}
              </span>
            </div>
            <p className="mt-1 text-sm text-[var(--ink-3)]">
              {divResult.bilJk} jawatankuasa · {divResult.bilDiisi}/{divResult.bilJawatan} jawatan diisi
              {divResult.bilKosong > 0 ? ` · ${divResult.bilKosong} kosong` : ''} · {fmt(divResult.mata)} mata
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {editable && (
            <>
              <button
                type="button"
                onClick={openBarisan}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--ink)] hover:bg-[var(--surface-3)] whitespace-nowrap shrink-0"
              >
                <Users className="h-3.5 w-3.5" />
                <span>Isi barisan pengerusi</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedTemplates({});
                  setTemplateOpen(true);
                }}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--ink)] hover:bg-[var(--surface-3)] whitespace-nowrap shrink-0"
              >
                <ListPlus className="h-3.5 w-3.5" />
                <span>Tambah dari templat</span>
              </button>
              <button
                type="button"
                onClick={() => openJkEditor(null)}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--brand)] px-3.5 text-xs font-semibold text-white hover:bg-[var(--brand-2)] whitespace-nowrap shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Jawatankuasa baharu</span>
              </button>
              <button
                type="button"
                onClick={() => toggleDivisionReady(bahagianId, !divResult.siap)}
                className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold whitespace-nowrap shrink-0 ${
                  divResult.siap
                    ? 'border border-[var(--line-2)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-3)]'
                    : 'bg-[var(--baik)] text-white hover:opacity-90'
                }`}
              >
                <Check className="h-3.5 w-3.5" />
                <span>{divResult.siap ? 'Buka semula' : 'Tanda siap'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {!editable && (
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-xs text-[var(--ink-2)]">
          Paparan sahaja. Anda tidak mempunyai akses untuk menyunting bahagian ini atau sesi sedang dikunci.
        </div>
      )}

      {/* Search + Two column workspace */}
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-[var(--ink-3)]" />
            <input
              type="search"
              value={searchJk}
              onChange={(e) => setSearchJk(e.target.value)}
              placeholder="Cari jawatankuasa dalam bahagian ini..."
              className="h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] pr-3 pl-9 text-sm text-[var(--ink)] focus:border-[var(--brand)] focus:outline-none"
            />
          </div>

          {groupedCommittees.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--line-2)] bg-[var(--surface)] p-10 text-center">
              <p className="text-sm font-semibold text-[var(--ink)]">Belum ada jawatankuasa dalam bahagian ini</p>
              <p className="mt-1 text-xs text-[var(--ink-3)]">
                Pilih daripada senarai templat KPM atau cipta jawatankuasa baharu.
              </p>
            </div>
          ) : (
            groupedCommittees.map((group) => (
              <div key={group.name || 'utama'} className="space-y-3">
                {group.name && (
                  <div className="flex items-center gap-3 pt-2 text-[11px] font-semibold tracking-wider text-[var(--ink-3)] uppercase">
                    <span>{group.name}</span>
                    <span className="h-px flex-1 bg-[var(--line)]" />
                  </div>
                )}

                {group.items.map((jk, jIdx) => {
                  const isClosed = !!collapsed[jk.id];
                  const emptyCount = jk.ahli.filter((a) => !a.guruId && !a.nama.trim()).length;
                  const faktor = analysis.tetapan.tahap[jk.tahap] || 1;
                  const isHighlighted = focusedCommitteeId === jk.id;

                  return (
                    <div
                      key={jk.id}
                      id={`jk-${jk.id}`}
                      className={`rounded-2xl border bg-[var(--surface)] transition-colors ${
                        isHighlighted ? 'border-[var(--brand)] ring-2 ring-[var(--brand-soft)]' : 'border-[var(--line)]'
                      }`}
                    >
                      {/* Committee header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setCollapsed((p) => ({ ...p, [jk.id]: !p[jk.id] }))}
                            aria-label={isClosed ? 'Buka jawatankuasa' : 'Tutup jawatankuasa'}
                            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--ink-3)] hover:bg-[var(--surface-3)] hover:text-[var(--ink)]"
                          >
                            {isClosed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                          <span className="font-mono-num text-xs font-semibold text-[var(--ink-3)]">
                            {jIdx + 1}.
                          </span>
                          <h3 className="truncate text-sm font-bold text-[var(--ink)]">{jk.nama}</h3>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {emptyCount > 0 && (
                            <span className="rounded bg-[var(--amaran-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--amaran-ink)]">
                              {emptyCount} kosong
                            </span>
                          )}
                          <select
                            aria-label="Tahap beban jawatankuasa"
                            disabled={!editable}
                            value={jk.tahap}
                            onChange={(e) =>
                              updateCommittee(jk.id, (prev) => ({
                                ...prev,
                                tahap: e.target.value as BurdenLevel,
                              }))
                            }
                            className="h-7 rounded-md border border-[var(--line-2)] bg-[var(--surface-2)] px-2 text-xs font-medium text-[var(--ink-2)] disabled:opacity-60"
                          >
                            {TAHAP.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.nama} (×{analysis.tetapan.tahap[t.id]})
                              </option>
                            ))}
                          </select>
                          {editable && (
                            <div className="inline-flex items-center gap-0.5">
                              <button
                                type="button"
                                title="Alih ke atas"
                                onClick={() => moveCommittee(jk.id, -1)}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--ink-3)] hover:bg-[var(--surface-3)] hover:text-[var(--ink)]"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                title="Alih ke bawah"
                                onClick={() => moveCommittee(jk.id, 1)}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--ink-3)] hover:bg-[var(--surface-3)] hover:text-[var(--ink)]"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                title="Sunting jawatankuasa"
                                onClick={() => openJkEditor(jk)}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--ink-3)] hover:bg-[var(--surface-3)] hover:text-[var(--ink)]"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                title="Padam jawatankuasa"
                                onClick={() => setDeletingJk(jk)}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--ink-3)] hover:bg-[var(--berat-soft)] hover:text-[var(--berat)]"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Members list */}
                      {!isClosed && (
                        <div className="border-t border-[var(--line)] px-4 py-2.5">
                          <div className="divide-y divide-[var(--line)]">
                            {jk.ahli.map((a) => {
                              const teacherRes = a.guruId ? analysis.guruMap[a.guruId] : null;
                              const isExternal = !a.guruId && !!a.nama.trim();
                              const isEmpty = !a.guruId && !a.nama.trim();
                              const roleWeight = mataJawatan(analysis.tetapan, a.jawatan);
                              const effectivePts =
                                a.mata != null ? a.mata : Math.round(roleWeight.mata * faktor * 100) / 100;

                              return (
                                <div
                                  key={a.id}
                                  className="grid grid-cols-[minmax(120px,0.9fr)_minmax(160px,1.4fr)_auto] items-center gap-3 py-2 text-sm"
                                >
                                  <div className="min-w-0">
                                    <div className="truncate text-xs font-semibold text-[var(--ink)]">
                                      {a.jawatan}
                                    </div>
                                    {a.butiran && (
                                      <div className="truncate text-[11px] text-[var(--ink-3)]">{a.butiran}</div>
                                    )}
                                  </div>

                                  <div className="min-w-0">
                                    {editable ? (
                                      <button
                                        type="button"
                                        onClick={() => openPicker(jk.id, a.id)}
                                        className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                                          isEmpty
                                            ? 'border border-dashed border-[var(--brand)] bg-[var(--brand-soft)]/50 font-semibold text-[var(--brand-text)] hover:bg-[var(--brand-soft)]'
                                            : 'border border-[var(--line)] bg-[var(--surface-2)] hover:border-[var(--brand)]'
                                        }`}
                                      >
                                        <span className="truncate">
                                          {teacherRes
                                            ? teacherRes.guru.nama
                                            : isExternal
                                            ? `${a.nama} (Luar)`
                                            : '+ Pilih guru'}
                                        </span>
                                        {teacherRes && teacherRes.analisis && (
                                          <span className="font-mono-num shrink-0 text-[11px] text-[var(--ink-3)]">
                                            {fmt(teacherRes.jumlah)}
                                          </span>
                                        )}
                                      </button>
                                    ) : (
                                      <div className="truncate text-xs font-medium text-[var(--ink)]">
                                        {teacherRes ? (
                                          <button
                                            type="button"
                                            onClick={() => openTeacherModal(teacherRes.id)}
                                            className="hover:underline"
                                          >
                                            {teacherRes.guru.nama}
                                          </button>
                                        ) : isExternal ? (
                                          a.nama
                                        ) : (
                                          <span className="text-[var(--ink-3)]">(Belum diisi)</span>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <span className="font-mono-num text-xs text-[var(--ink-3)]">
                                      {fmt(effectivePts)}m
                                    </span>
                                    {editable && (
                                      <>
                                        <button
                                          type="button"
                                          title="Sunting jawatan / mata"
                                          onClick={() => openSlotEditor(jk.id, a)}
                                          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--ink-3)] hover:bg-[var(--surface-3)] hover:text-[var(--ink)]"
                                        >
                                          <Pencil className="h-3 w-3" />
                                        </button>
                                        <button
                                          type="button"
                                          title="Buang slot jawatan"
                                          onClick={() =>
                                            updateCommittee(jk.id, (prev) => ({
                                              ...prev,
                                              ahli: prev.ahli.filter((x) => x.id !== a.id),
                                            }))
                                          }
                                          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--ink-3)] hover:bg-[var(--berat-soft)] hover:text-[var(--berat)]"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {editable && (
                            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--line)] pt-2">
                              <button
                                type="button"
                                onClick={() => openSlotEditor(jk.id, null)}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-text)] hover:underline"
                              >
                                <UserPlus className="h-3.5 w-3.5" />
                                <span>Tambah jawatan</span>
                              </button>
                              {jk.bidang && (
                                <span className="text-[11px] text-[var(--ink-3)]">
                                  Bidang tugas ditetapkan ({jk.bidang.split('\n').length} baris)
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Sticky Helper Panel: Lightest Teachers */}
        <aside className="hidden space-y-4 xl:sticky xl:top-20 xl:block">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
            <h3 className="text-xs font-bold tracking-wider text-[var(--ink-3)] uppercase">
              Cadangan Guru Paling Ringan
            </h3>
            <p className="mt-1 text-xs text-[var(--ink-3)]">
              Guru di bawah sasaran untuk pertimbangan pelantikan baharu.
            </p>
            <div className="mt-3 space-y-2">
              {lightestTeachers.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => openTeacherModal(r.id)}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-xs hover:bg-[var(--surface-3)]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-[var(--ink)]">{r.guru.nama}</div>
                    <div className="truncate text-[11px] text-[var(--ink-3)]">
                      {r.guru.gred} · {r.bilTugas} tugas
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-mono-num font-bold text-[var(--ink)]">{fmt(r.jumlah)}</span>
                    <StatusBadge status={r.status} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Smart Teacher Picker Modal */}
      <Modal
        open={pickingSlot !== null}
        onClose={() => setPickingSlot(null)}
        title="Pilih Guru untuk Jawatan"
        subtitle="Guru disusun daripada beban paling ringan berbanding sasaran grednya."
        size="lg"
        footer={
          <>
            {pickingSlot && (
              <button
                type="button"
                onClick={() => assignMember(null, '')}
                className="mr-auto h-9 rounded-lg border border-[var(--berat)]/30 bg-[var(--berat-soft)] px-3 text-xs font-semibold text-[var(--berat-ink)] hover:opacity-90"
              >
                Kosongkan jawatan
              </button>
            )}
            <button
              type="button"
              onClick={() => setPickingSlot(null)}
              className="h-9 rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3.5 text-sm font-medium"
            >
              Batal
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-[var(--ink-3)]" />
              <input
                autoFocus
                type="search"
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                placeholder="Cari nama, opsyen atau jawatan..."
                className="h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] pr-3 pl-9 text-sm focus:border-[var(--brand)] focus:outline-none"
              />
            </div>
            <div className="inline-flex rounded-lg bg-[var(--surface-3)] p-1 text-xs">
              <button
                type="button"
                onClick={() => setPickerCategory('analisis')}
                className={`rounded-md px-2.5 py-1 font-semibold ${
                  pickerCategory === 'analisis' ? 'bg-[var(--surface)] text-[var(--ink)] shadow-sm' : 'text-[var(--ink-2)]'
                }`}
              >
                Guru Sahaja
              </button>
              <button
                type="button"
                onClick={() => setPickerCategory('semua')}
                className={`rounded-md px-2.5 py-1 font-semibold ${
                  pickerCategory === 'semua' ? 'bg-[var(--surface)] text-[var(--ink)] shadow-sm' : 'text-[var(--ink-2)]'
                }`}
              >
                Semua Warga
              </button>
            </div>
          </div>

          <div className="custom-scroll max-h-[340px] divide-y divide-[var(--line)] overflow-y-auto rounded-xl border border-[var(--line)]">
            {pickerCandidates.map(({ result: r, alreadyInJk }) => (
              <button
                key={r.id}
                type="button"
                onClick={() => assignMember(r.id, '')}
                className="grid w-full grid-cols-[minmax(0,1.4fr)_130px_54px_auto] items-center gap-3 px-3 py-2.5 text-left text-xs transition-colors hover:bg-[var(--surface-2)]"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold text-[var(--ink)]">{r.guru.nama}</span>
                    {alreadyInJk && (
                      <span className="rounded bg-[var(--amaran-soft)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--amaran-ink)]">
                        Sudah ahli
                      </span>
                    )}
                  </div>
                  <div className="truncate text-[11px] text-[var(--ink-3)]">
                    {[r.guru.gred, r.guru.opsyen, r.guru.jawatan].filter(Boolean).join(' · ')}
                  </div>
                </div>
                <div className="hidden sm:block">
                  <WorkloadBar teacher={r} analysis={analysis} />
                </div>
                <span className="font-mono-num text-right font-bold text-[var(--ink)]">
                  {fmt(r.jumlah)}
                </span>
                <div>
                  <StatusBadge status={r.status} />
                </div>
              </button>
            ))}
          </div>

          {/* External person fallback */}
          <div className="flex items-center gap-2 border-t border-[var(--line)] pt-3">
            <input
              value={externalName}
              onChange={(e) => setExternalName(e.target.value)}
              placeholder="Atau masukkan nama orang luar (cth. YDP PIBG)..."
              className="h-9 flex-1 rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-xs focus:border-[var(--brand)] focus:outline-none"
            />
            <button
              type="button"
              disabled={!externalName.trim()}
              onClick={() => assignMember(null, externalName.trim())}
              className="h-9 rounded-lg border border-[var(--line-2)] bg-[var(--surface-2)] px-3 text-xs font-semibold text-[var(--ink)] hover:bg-[var(--surface-3)] disabled:opacity-40 whitespace-nowrap"
            >
              Guna nama luar
            </button>
          </div>
        </div>
      </Modal>

      {/* Add/Edit Committee Modal */}
      <Modal
        open={jkModal !== null}
        onClose={() => setJkModal(null)}
        title={jkModal === 'new' ? 'Jawatankuasa Baharu' : 'Sunting Jawatankuasa'}
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setJkModal(null)}
              className="h-9 rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3.5 text-sm font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              form="jk-form"
              className="h-9 rounded-lg bg-[var(--brand)] px-4 text-sm font-semibold text-white hover:bg-[var(--brand-2)]"
            >
              {jkModal === 'new' ? 'Tambah' : 'Simpan'}
            </button>
          </>
        }
      >
        <form id="jk-form" onSubmit={handleSaveJk} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--ink-2)]">Nama jawatankuasa / unit *</label>
            <input
              required
              value={jkNama}
              onChange={(e) => {
                const v = e.target.value;
                setJkNama(v);
                if (jkModal === 'new' && !jkBidang.trim()) {
                  const suggested = bidangUntuk(v, false);
                  if (suggested) setJkBidang(suggested);
                }
              }}
              placeholder="cth. Jawatankuasa STEM Sekolah"
              className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-sm focus:border-[var(--brand)] focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--ink-2)]">Kumpulan (pilihan)</label>
              <input
                value={jkKumpulan}
                onChange={(e) => setJkKumpulan(e.target.value)}
                placeholder="cth. Panitia Mata Pelajaran"
                className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-sm focus:border-[var(--brand)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--ink-2)]">Tahap beban</label>
              <select
                value={jkTahap}
                onChange={(e) => setJkTahap(e.target.value as BurdenLevel)}
                className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-sm focus:border-[var(--brand)] focus:outline-none"
              >
                {TAHAP.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nama} (×{analysis.tetapan.tahap[t.id]}) · {t.nota}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[var(--ink-2)]">Bidang tugas (pilihan)</label>
              <button
                type="button"
                onClick={() => setJkBidang(bidangUntuk(jkNama, true))}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-text)] hover:underline"
              >
                <Sparkles className="h-3 w-3" />
                Cadangkan bidang tugas
              </button>
            </div>
            <textarea
              rows={5}
              value={jkBidang}
              onChange={(e) => setJkBidang(e.target.value)}
              placeholder="Satu tugas setiap baris. Dicetak dalam Buku Pengurusan."
              className="mt-1 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] p-3 text-sm leading-relaxed focus:border-[var(--brand)] focus:outline-none"
            />
          </div>
          {jkModal === 'new' && (
            <label className="flex items-center gap-2 text-xs font-medium text-[var(--ink-2)]">
              <input
                type="checkbox"
                checked={jkAutoSlot}
                onChange={(e) => setJkAutoSlot(e.target.checked)}
                className="h-4 w-4 accent-[var(--brand)]"
              />
              <span>Sediakan slot jawatan asas (Pengerusi, Naib Pengerusi, Setiausaha, AJK)</span>
            </label>
          )}
        </form>
      </Modal>

      {/* Edit/Add Slot Modal */}
      <Modal
        open={slotModal !== null}
        onClose={() => setSlotModal(null)}
        title={slotModal?.member ? 'Sunting Jawatan' : 'Tambah Jawatan Baharu'}
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setSlotModal(null)}
              className="h-9 rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3.5 text-sm font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              form="slot-form"
              className="h-9 rounded-lg bg-[var(--brand)] px-4 text-sm font-semibold text-white hover:bg-[var(--brand-2)]"
            >
              Simpan
            </button>
          </>
        }
      >
        <form id="slot-form" onSubmit={handleSaveSlot} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--ink-2)]">Nama jawatan *</label>
            <input
              required
              list="jawatan-list"
              value={slotJawatan}
              onChange={(e) => setSlotJawatan(e.target.value)}
              className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-sm focus:border-[var(--brand)] focus:outline-none"
            />
            <datalist id="jawatan-list">
              {analysis.tetapan.jawatan.map((j) => (
                <option key={j.nama} value={j.nama} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--ink-2)]">Butiran (pilihan)</label>
            <input
              value={slotButiran}
              onChange={(e) => setSlotButiran(e.target.value)}
              placeholder="cth. 4 Sains, Bola Sepak B15"
              className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-sm focus:border-[var(--brand)] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--ink-2)]">Ganti mata manual (pilihan)</label>
            <input
              type="number"
              step={0.5}
              min={0}
              max={99}
              value={slotMata}
              onChange={(e) => setSlotMata(e.target.value)}
              placeholder={`Kosongkan untuk kiraan automatik (${mataJawatan(analysis.tetapan, slotJawatan).mata} mata)`}
              className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-sm focus:border-[var(--brand)] focus:outline-none"
            />
          </div>
        </form>
      </Modal>

      {/* Add from Templates Modal */}
      <Modal
        open={templateOpen}
        onClose={() => setTemplateOpen(false)}
        title={`Tambah daripada Templat (${divResult.bahagian.nama})`}
        subtitle="Pilih jawatankuasa lazim KPM yang belum ada dalam bahagian ini."
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setTemplateOpen(false)}
              className="h-9 rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3.5 text-sm font-medium"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={!Object.values(selectedTemplates).some(Boolean)}
              onClick={handleAddTemplates}
              className="h-9 rounded-lg bg-[var(--brand)] px-4 text-sm font-semibold text-white hover:bg-[var(--brand-2)] disabled:opacity-40"
            >
              Tambah yang dipilih ({Object.values(selectedTemplates).filter(Boolean).length})
            </button>
          </>
        }
      >
        {templatesForDiv.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--ink-3)]">
            Semua templat bagi bahagian ini telah dimasukkan.
          </p>
        ) : (
          <div className="divide-y divide-[var(--line)] rounded-xl border border-[var(--line)]">
            {templatesForDiv.map((t, idx) => (
              <label
                key={t.nama}
                className="flex cursor-pointer items-center justify-between gap-3 px-3.5 py-2.5 hover:bg-[var(--surface-2)]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={!!selectedTemplates[idx]}
                    onChange={(e) => setSelectedTemplates((p) => ({ ...p, [idx]: e.target.checked }))}
                    className="h-4 w-4 accent-[var(--brand)]"
                  />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-[var(--ink)]">{t.nama}</div>
                    <div className="text-xs text-[var(--ink-3)]">
                      {[t.kumpulan, `Tahap ${t.tahap || 'sederhana'}`, `${(t.jawatan || JAWATAN_LALAI).length} jawatan`]
                        .filter(Boolean)
                        .join(' · ')}
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}
      </Modal>

      {/* Auto-fill Barisan Pengerusi Modal */}
      <Modal
        open={barisanOpen}
        onClose={() => setBarisanOpen(false)}
        title="Isi barisan pengerusi secara automatik"
        subtitle="Sistem mengenal pasti Pengetua dan Penolong Kanan daripada jawatan hakiki untuk mengisi slot Pengerusi dan Naib Pengerusi yang masih kosong."
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setBarisanOpen(false)}
              className="h-9 rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3.5 text-sm font-medium"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={barisanPlan.length === 0}
              onClick={applyBarisan}
              className="h-9 rounded-lg bg-[var(--brand)] px-4 text-sm font-semibold text-white hover:bg-[var(--brand-2)] disabled:opacity-40"
            >
              Isi {barisanPlan.reduce((s, p) => s + p.bil, 0)} jawatan
            </button>
          </>
        }
      >
        <div className="space-y-3">
          {PERANAN_BARISAN.map((p) => (
            <div key={p.key}>
              <label className="block text-xs font-semibold text-[var(--ink-2)]">{p.label}</label>
              <select
                value={barisanMap[p.key] || ''}
                onChange={(e) => setBarisanMap((prev) => ({ ...prev, [p.key]: e.target.value || null }))}
                className="mt-1 h-9 w-full rounded-lg border border-[var(--line-2)] bg-[var(--surface)] px-3 text-xs font-medium"
              >
                <option value="">(Tiada / biarkan kosong)</option>
                {session.guru.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nama} {g.jawatan ? `· ${g.jawatan}` : ''}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-3 text-xs text-[var(--ink-2)]">
            {barisanPlan.length > 0
              ? `${barisanPlan.reduce((s, p) => s + p.bil, 0)} jawatan kosong dalam ${barisanPlan.length} jawatankuasa bahagian ini akan diisi.`
              : 'Tiada slot Pengerusi / Naib Pengerusi yang kosong dalam bahagian ini.'}
          </div>
        </div>
      </Modal>

      {/* Delete committee confirm */}
      <ConfirmModal
        open={deletingJk !== null}
        onClose={() => setDeletingJk(null)}
        onConfirm={() => {
          if (deletingJk) {
            deleteCommittee(deletingJk.id);
            notify('Jawatankuasa dipadam.');
          }
        }}
        title={`Padam ${deletingJk?.nama}?`}
        message="Jawatankuasa ini dan semua slot ahlinya akan dibuang. Rekod guru tidak terjejas."
        confirmLabel="Padam"
        danger
      />
    </div>
  );
};
