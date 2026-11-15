import type {
  AnalysisResult,
  BurdenLevel,
  Committee,
  Division,
  DivisionResult,
  GradeSummary,
  GradeTier,
  Teacher,
  TeacherResult,
  WeightSettings,
  WorkloadStatus,
} from '../types/tugasadil';

export const TETAPAN_LALAI: WeightSettings = {
  jawatan: [
    // Pimpinan jawatankuasa
    { nama: 'Pengerusi', mata: 3, utama: true },
    { nama: 'Timbalan Pengerusi', mata: 2.5, utama: true },
    { nama: 'Naib Pengerusi', mata: 2, utama: true },
    { nama: 'Yang Dipertua', mata: 3, utama: true },
    { nama: 'Naib Yang Dipertua', mata: 2, utama: true },
    { nama: 'Penasihat', mata: 1, utama: false },
    // Penggerak utama
    { nama: 'Penyelaras', mata: 3, utama: true },
    { nama: 'Setiausaha', mata: 3, utama: true },
    { nama: 'Penolong Setiausaha', mata: 2, utama: false },
    { nama: 'Bendahari', mata: 2, utama: true },
    { nama: 'Penolong Bendahari', mata: 1.5, utama: false },
    { nama: 'GKMP', mata: 3, utama: true },
    { nama: 'Ketua Bidang', mata: 3, utama: true },
    { nama: 'Ketua Panitia', mata: 3, utama: true },
    { nama: 'Ketua Unit', mata: 2.5, utama: true },
    { nama: 'Ketua', mata: 2, utama: true },
    { nama: 'Guru Data', mata: 3, utama: true },
    { nama: 'Guru Penyelaras', mata: 3, utama: true },
    { nama: 'Guru Perpustakaan dan Media', mata: 3, utama: true },
    { nama: 'Pegawai Aset', mata: 3, utama: true },
    { nama: 'Pegawai', mata: 2, utama: false },
    // Kelas, disiplin dan asrama
    { nama: 'Guru Kelas', mata: 3, utama: true },
    { nama: 'Guru Tingkatan', mata: 3, utama: true },
    { nama: 'Penolong Guru Kelas', mata: 1.5, utama: false },
    { nama: 'Penolong Guru Tingkatan', mata: 1.5, utama: false },
    { nama: 'Guru Pembantu', mata: 1.5, utama: false },
    { nama: 'Ketua Guru Disiplin', mata: 3, utama: true },
    { nama: 'Guru Disiplin', mata: 2, utama: false },
    { nama: 'Penyiasat', mata: 1.5, utama: false },
    { nama: 'Ketua Warden', mata: 3, utama: true },
    { nama: 'Warden', mata: 2, utama: false },
    // Kokurikulum
    { nama: 'Ketua Guru Penasihat', mata: 2.5, utama: true },
    { nama: 'Guru Penasihat', mata: 1.5, utama: false },
    { nama: 'Guru Pemimpin', mata: 1.5, utama: false },
    { nama: 'Jurulatih', mata: 1.5, utama: false },
    { nama: 'Pengurus Pasukan', mata: 1.5, utama: false },
    { nama: 'Guru Pengiring', mata: 1, utama: false },
    { nama: 'Ketua Rumah', mata: 2, utama: true },
    { nama: 'Guru Rumah', mata: 1, utama: false },
    // Ahli dan tugas sokongan
    { nama: 'Urus Setia', mata: 1.5, utama: false },
    { nama: 'Pencatat', mata: 1, utama: false },
    { nama: 'Pemeriksa', mata: 1, utama: false },
    { nama: 'Pemverifikasi', mata: 1, utama: false },
    { nama: 'Juruaudit', mata: 1, utama: false },
    { nama: 'Guru Bertugas', mata: 1, utama: false },
    { nama: 'AJK', mata: 1, utama: false },
  ],
  mataLalai: 1,
  tahap: { ringan: 0.5, sederhana: 1, berat: 1.5 },
  ambang: { berat: 125, kurang: 75 },
  hadUtama: 4,
  waktu: { kira: false, mata: 0.1 },
  gredKira: {
    hidup: true,
    faktor: { khas: 1.5, g14: 1.4, g13: 1.3, g12: 1.2, g10: 1.1, g9: 1 },
  },
  gred: ['JUSA C', 'DG14', 'DG13', 'DG12', 'DG10', 'DG9', 'DG8', 'DG7', 'DG6', 'DG5'],
  status: {},
  buku: {},
  surat: {},
};

export const PERANAN_GRED: { id: GradeTier; gred: string; lama: string; peranan: string }[] = [
  { id: 'khas', gred: 'Gred Khas', lama: 'Gred Khas', peranan: 'Pemikir Holistik' },
  { id: 'g14', gred: 'DG14', lama: 'DG54', peranan: 'Pemikir Strategik' },
  { id: 'g13', gred: 'DG13', lama: 'DG52', peranan: 'Peneraju Perubahan' },
  { id: 'g12', gred: 'DG12', lama: 'DG48', peranan: 'Pembimbing dan Mentor' },
  { id: 'g10', gred: 'DG10', lama: 'DG44', peranan: 'Penggerak' },
  { id: 'g9', gred: 'DG9 dan ke bawah', lama: 'DG41 dan ke bawah', peranan: 'Pelaksana' },
];

export const TAHAP: { id: BurdenLevel; nama: string; nota: string }[] = [
  { id: 'ringan', nama: 'Ringan', nota: 'Bermusim atau sekali setahun' },
  { id: 'sederhana', nama: 'Sederhana', nota: 'Berjalan sepanjang tahun' },
  { id: 'berat', nama: 'Berat', nota: 'Kerja berterusan dan banyak dokumentasi' },
];

export const STATUS: Record<WorkloadStatus, { nama: string; nada: string }> = {
  berat: { nama: 'Berat', nada: 'berat' },
  seimbang: { nama: 'Seimbang', nada: 'baik' },
  kurang: { nama: 'Kurang', nada: 'kurang' },
  tiada: { nama: 'Tiada tugas', nada: 'tiada' },
  awal: { nama: 'Belum dinilai', nada: 'awal' },
};

export function norm(s: unknown): string {
  return String(s == null ? '' : s)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

export function bundar(x: number): number {
  return Math.round(x * 100) / 100;
}

function nombor(x: unknown, lalai: number): number {
  const n = Number(x);
  return Number.isFinite(n) ? n : lalai;
}

export function huraiGred(gred: string): { peringkat: GradeTier; dikenali: boolean } {
  const s = String(gred == null ? '' : gred).toUpperCase();
  const m = /DG\s*[A-Z]?\s*-?\s*(\d+)/.exec(s) || /^[^A-Z]*?(\d+)[^A-Z]*$/.exec(s);
  if (!m) {
    return /JUSA|GRED\s*KHAS|^\s*KHAS|GRED\s*UTAMA|^\s*UTAMA/.test(s)
      ? { peringkat: 'khas', dikenali: true }
      : { peringkat: 'g9', dikenali: false };
  }
  const n = parseInt(m[1], 10);
  let p: GradeTier;
  if (n >= 29) {
    p = n >= 53 ? 'g14' : n >= 51 ? 'g13' : n >= 47 ? 'g12' : n >= 43 ? 'g10' : 'g9';
  } else {
    p = n >= 14 ? 'g14' : n === 13 ? 'g13' : n === 12 ? 'g12' : n >= 10 ? 'g10' : 'g9';
  }
  return { peringkat: p, dikenali: true };
}

export function peringkatGred(gred: string): GradeTier {
  return huraiGred(gred).peringkat;
}

export function perananGred(gred: string): string {
  const x = huraiGred(gred);
  if (!x.dikenali) return '';
  const found = PERANAN_GRED.find((p) => p.id === x.peringkat);
  return found ? found.peranan : '';
}

export function nilaiGred(gred: string): number {
  const s = String(gred || '').toUpperCase().trim();
  if (/JUSA\s*A|UTAMA\s*A/.test(s)) return 103;
  if (/JUSA\s*B|UTAMA\s*B/.test(s)) return 102;
  if (/JUSA|KHAS|UTAMA/.test(s)) return 101;
  const m = /(\d+)/.exec(s);
  if (!m) return 0;
  const n = parseInt(m[1], 10);
  if (n >= 29) return n; // legacy codes e.g. DG54 -> 54
  // SSPA codes e.g. DG14 -> ~54 equivalent for sorting
  const map: Record<number, number> = { 14: 54, 13: 52, 12: 48, 10: 44, 9: 41, 8: 38, 7: 34, 6: 32, 5: 29 };
  return map[n] ?? n;
}

export function lengkap(t?: Partial<WeightSettings> | null): WeightSettings {
  const src = t || {};
  return {
    ...TETAPAN_LALAI,
    ...src,
    tahap: { ...TETAPAN_LALAI.tahap, ...(src.tahap || {}) },
    ambang: { ...TETAPAN_LALAI.ambang, ...(src.ambang || {}) },
    waktu: { ...TETAPAN_LALAI.waktu, ...(src.waktu || {}) },
    gredKira: {
      hidup: typeof src.gredKira?.hidup === 'boolean' ? src.gredKira.hidup : TETAPAN_LALAI.gredKira.hidup,
      faktor: { ...TETAPAN_LALAI.gredKira.faktor, ...(src.gredKira?.faktor || {}) },
    },
    jawatan: Array.isArray(src.jawatan) && src.jawatan.length ? src.jawatan : TETAPAN_LALAI.jawatan,
    gred: Array.isArray(src.gred) ? src.gred : TETAPAN_LALAI.gred,
    mataLalai: nombor(src.mataLalai, TETAPAN_LALAI.mataLalai),
    hadUtama: nombor(src.hadUtama, TETAPAN_LALAI.hadUtama),
    status: src.status || {},
    buku: src.buku || {},
    surat: src.surat || {},
  };
}

const SINGKATAN: Record<string, string> = {
  timb: 'timbalan',
  tim: 'timbalan',
  pen: 'penolong',
  pnl: 'penolong',
  pgrsi: 'pengerusi',
  su: 'setiausaha',
  psu: 'penolong setiausaha',
  peny: 'penyelaras',
  bend: 'bendahari',
  ydp: 'yang dipertua',
  nydp: 'naib yang dipertua',
  kp: 'ketua panitia',
  gp: 'guru penasihat',
  kgp: 'ketua guru penasihat',
  gpm: 'guru perpustakaan dan media',
  gbk: 'guru bimbingan dan kaunseling',
  jk: 'jawatankuasa',
};

const FRASA: [RegExp, string][] = [
  [/\bsetia usaha\b/g, 'setiausaha'],
  [/\bahli (jawatankuasa|jawatan kuasa)\b/g, 'ajk'],
  [/\bjuru audit\b/g, 'juruaudit'],
  [/\bjuru latih\b/g, 'jurulatih'],
  [/\byang di[- ]?pertua\b/g, 'yang dipertua'],
  [/\burusetia\b/g, 'urus setia'],
  [/\bguru kanan mata pelajaran\b/g, 'gkmp'],
  [/\bguru kanan\b/g, 'gkmp'],
];

export function kunciJawatan(s: string): string {
  let n = norm(s);
  if (!n) return '';
  n = n.replace(/\bs\s*[./]\s*u\b\.?/g, 'setiausaha').replace(/&/g, ' dan ').replace(/\.(?=\S)/g, '. ');
  const ketua = /\(\s*(k|ketua)\s*\)\s*$/.test(n);
  if (ketua) n = n.replace(/\(\s*(k|ketua)\s*\)\s*$/, '');
  n = n
    .split(' ')
    .map((k) => {
      const asas = k.replace(/[.:,;]+$/, '');
      return Object.prototype.hasOwnProperty.call(SINGKATAN, asas) ? SINGKATAN[asas] : asas;
    })
    .filter(Boolean)
    .join(' ');
  FRASA.forEach((f) => {
    n = n.replace(f[0], f[1]);
  });
  n = n.replace(/\s+/g, ' ').trim();
  if (/^ahli( |$)/.test(n)) n = n.replace(/^ahli/, 'ajk');
  if (ketua && n.indexOf('ketua') !== 0) n = n ? `ketua ${n}` : 'ketua';
  return n;
}

interface PetaItem {
  n: string;
  nama: string;
  mata: number;
  utama: boolean;
  terbitan?: string;
}

function petaJawatan(t: WeightSettings): PetaItem[] {
  return t.jawatan
    .map((j) => ({
      n: kunciJawatan(j.nama),
      nama: j.nama,
      mata: nombor(j.mata, t.mataLalai),
      utama: !!j.utama,
    }))
    .filter((j) => j.n)
    .sort((a, b) => b.n.length - a.n.length);
}

function padanTerus(peta: PetaItem[], n: string): PetaItem | null {
  for (let i = 0; i < peta.length; i++) if (peta[i].n === n) return peta[i];
  for (let i = 0; i < peta.length; i++) if (n.indexOf(peta[i].n + ' ') === 0) return peta[i];
  return null;
}

const TIMBALAN = /^(penolong|timbalan|naib) (.+)$/;

function padan(peta: PetaItem[], n: string): PetaItem | null {
  const p = padanTerus(peta, n);
  if (p) return p;
  const m = TIMBALAN.exec(n);
  if (m) {
    const base = padanTerus(peta, m[2]);
    if (base) {
      return {
        n,
        nama: base.nama,
        mata: Math.max(0.5, Math.round(((base.mata * 2) / 3) * 2) / 2),
        utama: false,
        terbitan: m[1],
      };
    }
  }
  return null;
}

function cariJawatan(
  peta: PetaItem[],
  jawatan: string,
  mataLalai: number
): { n: string; nama: string | null; mata: number; utama: boolean } {
  const n = kunciJawatan(jawatan);
  let p = n ? padan(peta, n) : null;
  if (!p && n.indexOf('/') > 0) {
    n.split('/').forEach((bahagian) => {
      const q = padan(peta, bahagian.trim());
      if (q && (!p || q.mata > p.mata)) p = q;
    });
  }
  return p
    ? { n, nama: p.nama, mata: p.mata, utama: p.utama }
    : { n, nama: null, mata: mataLalai, utama: false };
}

export function mataJawatan(tetapan: Partial<WeightSettings>, jawatan: string): { mata: number; utama: boolean; dikenali: boolean } {
  const t = lengkap(tetapan);
  const w = cariJawatan(petaJawatan(t), jawatan, t.mataLalai);
  return { mata: w.mata, utama: w.utama, dikenali: !!w.nama };
}

export function diAnalisis(g: Teacher): boolean {
  return typeof g.analisis === 'boolean' ? g.analisis : (g.kategori || 'guru') === 'guru';
}

export function fmt(x: number | null | undefined): string {
  if (x == null || !Number.isFinite(x)) return '–';
  const s = (Math.round(x * 10) / 10).toFixed(1);
  return s.endsWith('.0') ? s.slice(0, -2) : s;
}

export function kira(data: {
  tetapan?: Partial<WeightSettings>;
  guru: Teacher[];
  bahagian: Division[];
  jk: Committee[];
}): AnalysisResult {
  const t = lengkap(data.tetapan);
  const peta = petaJawatan(t);
  const guruMap: Record<string, TeacherResult> = {};
  const bahagianMap: Record<string, DivisionResult> = {};
  const guruSets: Record<string, Set<string>> = {};

  const kosong: AnalysisResult['kosong'] = [];
  const pendua: AnalysisResult['pendua'] = [];
  const luar: Record<string, { jawatan: string; bil: number }> = {};

  (data.guru || []).forEach((g) => {
    guruMap[g.id] = {
      id: g.id,
      guru: g,
      analisis: diAnalisis(g),
      mataTugas: 0,
      mataWaktu: 0,
      jumlah: 0,
      bilTugas: 0,
      bilUtama: 0,
      ikutBahagian: {},
      bilIkutBahagian: {},
      tugas: [],
      peringkat: peringkatGred(g.gred),
      faktorGred: 1,
      sasaran: null,
      ambangBerat: null,
      ambangKurang: null,
      status: null,
      nisbah: null,
    };
  });

  const senaraiBahagianDef = (data.bahagian || [])
    .filter((b) => b.aktif !== false)
    .slice()
    .sort((a, b) => (a.urutan || 0) - (b.urutan || 0));

  const senaraiBahagian: DivisionResult[] = senaraiBahagianDef.map((b, i) => {
    const st = t.status[b.id] || { siap: false, oleh: '', pada: 0 };
    const dr: DivisionResult = {
      id: b.id,
      bahagian: b,
      indeks: i,
      bilJk: 0,
      bilJawatan: 0,
      bilKosong: 0,
      bilDiisi: 0,
      mata: 0,
      guruIds: [],
      siap: !!st.siap,
      oleh: st.oleh || '',
      pada: st.pada || 0,
    };
    bahagianMap[b.id] = dr;
    guruSets[b.id] = new Set();
    return dr;
  });

  const jkSusun = (data.jk || []).slice().sort((a, b) => (a.urutan || 0) - (b.urutan || 0));
  jkSusun.forEach((jk) => {
    const b = bahagianMap[jk.bahagianId];
    if (!b) return;
    b.bilJk++;
    const faktor = nombor(t.tahap[jk.tahap || 'sederhana'], 1);
    const nampak: Record<string, boolean> = {};

    (jk.ahli || []).forEach((a) => {
      b.bilJawatan++;
      const r = a.guruId ? guruMap[a.guruId] : null;
      if (!r) {
        if (a.nama && String(a.nama).trim()) {
          b.bilDiisi++;
          return;
        }
        b.bilKosong++;
        kosong.push({
          jkId: jk.id,
          jkNama: jk.nama,
          bahagianId: jk.bahagianId,
          ahliId: a.id,
          jawatan: a.jawatan || '',
        });
        return;
      }
      b.bilDiisi++;
      const w = cariJawatan(peta, a.jawatan, t.mataLalai);
      const manual = typeof a.mata === 'number' && Number.isFinite(a.mata);
      if (!w.nama && !manual) {
        const kl = w.n || '(tiada jawatan)';
        if (!luar[kl]) luar[kl] = { jawatan: String(a.jawatan || '').trim() || 'Ahli', bil: 0 };
        luar[kl].bil++;
      }
      const mata = bundar(manual ? (a.mata as number) : w.mata * faktor);
      if (nampak[r.id]) {
        pendua.push({ jkId: jk.id, jkNama: jk.nama, bahagianId: jk.bahagianId, guruId: r.id });
      }
      nampak[r.id] = true;

      r.mataTugas += mata;
      r.bilTugas++;
      if (w.utama) r.bilUtama++;
      r.ikutBahagian[b.id] = bundar((r.ikutBahagian[b.id] || 0) + mata);
      r.bilIkutBahagian[b.id] = (r.bilIkutBahagian[b.id] || 0) + 1;
      r.tugas.push({
        jkId: jk.id,
        jkNama: jk.nama,
        kumpulan: jk.kumpulan || '',
        bahagianId: b.id,
        ahliId: a.id,
        jawatan: a.jawatan || '',
        butiran: a.butiran || '',
        mata,
        utama: w.utama,
        manual,
        tahap: jk.tahap || 'sederhana',
      });
      b.mata = bundar(b.mata + mata);
      guruSets[b.id].add(r.id);
    });
  });

  senaraiBahagian.forEach((b) => {
    b.guruIds = Array.from(guruSets[b.id]);
  });

  const senarai: TeacherResult[] = Object.values(guruMap).map((r) => {
    r.mataTugas = bundar(r.mataTugas);
    r.mataWaktu = t.waktu.kira ? bundar(nombor(r.guru.waktu, 0) * nombor(t.waktu.mata, 0)) : 0;
    r.jumlah = bundar(r.mataTugas + r.mataWaktu);
    return r;
  });

  const A = senarai.filter((r) => r.analisis);
  const nilai = A.map((r) => r.jumlah).sort((a, b) => a - b);
  const n = nilai.length;
  const jum = nilai.reduce((s, x) => s + x, 0);
  const purata = n ? jum / n : 0;
  const median = n ? (n % 2 ? nilai[(n - 1) / 2] : (nilai[n / 2 - 1] + nilai[n / 2]) / 2) : 0;
  const sp = n ? Math.sqrt(nilai.reduce((s, x) => s + (x - purata) * (x - purata), 0) / n) : 0;
  const ambangBerat = (purata * t.ambang.berat) / 100;
  const ambangKurang = (purata * t.ambang.kurang) / 100;

  const gunaGred = !!t.gredKira.hidup;
  A.forEach((r) => {
    r.peringkat = peringkatGred(r.guru.gred);
    r.faktorGred = gunaGred ? Math.max(0.1, nombor(t.gredKira.faktor[r.peringkat], 1)) : 1;
  });

  const jumFaktor = A.reduce((s, r) => s + r.faktorGred, 0);
  const asas = jumFaktor ? jum / jumFaktor : 0;
  let maksAmbang = 0;

  const bil: Record<WorkloadStatus, number> = { berat: 0, seimbang: 0, kurang: 0, tiada: 0, awal: 0 };

  A.forEach((r) => {
    r.sasaran = asas * r.faktorGred;
    r.ambangBerat = (r.sasaran * t.ambang.berat) / 100;
    r.ambangKurang = (r.sasaran * t.ambang.kurang) / 100;
    maksAmbang = Math.max(maksAmbang, r.ambangBerat);

    if (r.bilTugas === 0) r.status = 'tiada';
    else if (asas > 0 && r.jumlah > r.ambangBerat + 1e-9) r.status = 'berat';
    else if (asas > 0 && r.jumlah < r.ambangKurang - 1e-9) r.status = 'kurang';
    else r.status = 'seimbang';

    r.nisbah = r.sasaran > 0 ? r.jumlah / r.sasaran : null;
    bil[r.status]++;
  });

  const awal = n > 0 && bil.tiada > n / 2;
  if (awal) {
    A.forEach((r) => {
      if (r.status !== 'tiada') {
        r.status = 'awal';
        bil.awal++;
      }
    });
    bil.berat = 0;
    bil.seimbang = 0;
    bil.kurang = 0;
  }

  const kumpulanGred: Record<string, number[]> = {};
  A.forEach((r) => {
    const k = String(r.guru.gred || '').trim() || '—';
    (kumpulanGred[k] = kumpulanGred[k] || []).push(r.jumlah);
  });

  const gred: GradeSummary[] = Object.keys(kumpulanGred)
    .map((k) => {
      const v = kumpulanGred[k];
      const pg = peringkatGred(k);
      const fk = gunaGred ? Math.max(0.1, nombor(t.gredKira.faktor[pg], 1)) : 1;
      const pur = v.reduce((s, x) => s + x, 0) / v.length;
      const sas = asas * fk;
      const nis = sas > 0 ? pur / sas : null;
      const kedudukan: GradeSummary['kedudukan'] =
        nis == null || awal
          ? null
          : nis > t.ambang.berat / 100 + 1e-9
          ? 'berat'
          : nis < t.ambang.kurang / 100 - 1e-9
          ? 'kurang'
          : 'seimbang';
      return {
        gred: k,
        n: v.length,
        purata: bundar(pur),
        min: Math.min(...v),
        max: Math.max(...v),
        peringkat: pg,
        peranan: perananGred(k),
        faktor: fk,
        sasaran: bundar(sas),
        nisbah: nis,
        kedudukan,
      };
    })
    .sort((a, b) => nilaiGred(b.gred) - nilaiGred(a.gred) || a.gred.localeCompare(b.gred));

  const lebihUtama = senarai
    .filter((r) => r.analisis && r.bilUtama > t.hadUtama)
    .sort((a, b) => b.bilUtama - a.bilUtama);

  return {
    tetapan: t,
    guruMap,
    senarai,
    analisis: A,
    bahagianMap,
    senaraiBahagian,
    stat: {
      n,
      purata: bundar(purata),
      median: bundar(median),
      sp: bundar(sp),
      min: n ? nilai[0] : 0,
      max: n ? nilai[n - 1] : 0,
      maxSemua: senarai.reduce((m, r) => Math.max(m, r.jumlah), 0),
      ambangBerat: bundar(ambangBerat),
      ambangKurang: bundar(ambangKurang),
      bil,
      awal,
      gredKira: gunaGred,
      asas: bundar(asas),
      maksAmbang: bundar(maksAmbang),
      peratusSeimbang: n && !awal ? Math.round((bil.seimbang / n) * 100) : 0,
      bilJk: senaraiBahagian.reduce((s, b) => s + b.bilJk, 0),
      bilJawatan: senaraiBahagian.reduce((s, b) => s + b.bilJawatan, 0),
      bilKosong: kosong.length,
    },
    gred,
    kosong,
    pendua,
    lebihUtama,
    luarSenarai: Object.values(luar).sort((a, b) => b.bil - a.bil || a.jawatan.localeCompare(b.jawatan)),
  };
}
