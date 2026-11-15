export type TeacherCategory = 'guru' | 'pentadbir' | 'staf';
export type BurdenLevel = 'ringan' | 'sederhana' | 'berat';
export type WorkloadStatus = 'berat' | 'seimbang' | 'kurang' | 'tiada' | 'awal';
export type GradeTier = 'khas' | 'g14' | 'g13' | 'g12' | 'g10' | 'g9';
export type DivisionType =
  | 'pentadbiran'
  | 'kurikulum'
  | 'hem'
  | 'koku'
  | 't6'
  | 'ppki'
  | 'prasekolah'
  | 'asrama'
  | 'petang'
  | 'lain';

export type SchoolLevel = 'rendah' | 'menengah';
export type UserRole = 'admin' | 'pentadbir' | 'pemerhati';

export interface RoleWeight {
  nama: string;
  mata: number;
  utama: boolean;
}

export interface DivisionStatus {
  siap: boolean;
  oleh: string;
  pada: number;
}

export interface CoverConfig {
  gaya: 'klasik' | 'moden' | 'jalur' | 'minimal' | 'rasmi';
  warna: string;
  aksen: string;
  tajuk: string;
  subtajuk: string;
  moto: string;
  tunjukLogo: boolean;
}

export interface ExtraPage {
  id: string;
  tajuk: string;
  isi: string;
  letak: 'depan' | 'belakang';
  aktif: boolean;
}

export interface BookConfig {
  kulit: CoverConfig;
  bahagian: {
    kulit: boolean;
    kandungan: boolean;
    halamanAwal: boolean;
    senaraiGuru: boolean;
    carta: boolean;
    jawatankuasa: boolean;
    tugasGuru: boolean;
    rumusan: boolean;
    pengesahan: boolean;
  };
  pilihan: {
    paparJawatanHakiki: boolean;
    paparGred: boolean;
    paparBidang: boolean;
    paparMata: boolean;
    sorokKosong: boolean;
    hiasTajuk: boolean;
  };
  halamanTambahan: ExtraPage[];
  pengesahan: {
    penyediaNama: string;
    penyediaJawatan: string;
    pengesahNama: string;
    pengesahJawatan: string;
  };
}

export interface LetterConfig {
  kepala: {
    atas: string;
    namaSekolah: string;
    alamat: string;
    telefon: string;
    emel: string;
    tunjukLambang: boolean;
    garisBawah: boolean;
  };
  rujukan: {
    fail: string;
    mula: number;
    tarikh: string;
  };
  kuatkuasa: {
    mula: string;
    tamat: string;
  };
  kandungan: {
    tajuk: string;
    perenggan1: string;
    perenggan2: string;
    penutup: string;
    slogan: string[];
    akhiran: string;
    salinan: string[];
  };
  tandatangan: {
    nama: string;
    jawatan: string;
    sekolah: string;
  };
  pilihan: {
    saizFon: 11 | 12;
    bergarisTajuk: boolean;
    paparButiran: boolean;
  };
}

export interface WeightSettings {
  jawatan: RoleWeight[];
  mataLalai: number;
  tahap: Record<BurdenLevel, number>;
  ambang: { berat: number; kurang: number };
  hadUtama: number;
  waktu: { kira: boolean; mata: number };
  gredKira: {
    hidup: boolean;
    faktor: Record<GradeTier, number>;
  };
  gred: string[];
  status: Record<string, DivisionStatus>;
  buku: Partial<BookConfig>;
  surat: Partial<LetterConfig>;
}

export interface Teacher {
  id: string;
  nama: string;
  gred: string;
  jawatan: string;
  opsyen: string;
  waktu: number | null;
  kategori: TeacherCategory;
  analisis: boolean;
  catatan: string;
  urutan: number;
}

export interface Division {
  id: string;
  jenis: DivisionType;
  nama: string;
  singkatan: string;
  urutan: number;
  aktif: boolean;
}

export interface CommitteeMember {
  id: string;
  jawatan: string;
  butiran: string;
  guruId: string | null;
  nama: string; // external person name when guruId is null
  mata: number | null; // manual override
}

export interface Committee {
  id: string;
  bahagianId: string;
  urutan: number;
  nama: string;
  kumpulan: string;
  tahap: BurdenLevel;
  bidang: string;
  ahli: CommitteeMember[];
}

export interface SchoolProfile {
  kod: string;
  nama: string;
  jenis: string;
  peringkat: SchoolLevel;
  alamat: string;
  poskod: string;
  bandar: string;
  negeri: string;
  telefon: string;
  emel: string;
  moto: string;
  logo: string;
}

export interface SchoolSession {
  id: string;
  label: string;
  aktif: boolean;
  kunci: boolean;
}

export interface UserAccount {
  id: string;
  nama: string;
  emel: string;
  peranan: UserRole;
  bahagian: string[];
  aktif: boolean;
}

export interface TeacherTaskEntry {
  jkId: string;
  jkNama: string;
  kumpulan: string;
  bahagianId: string;
  ahliId: string;
  jawatan: string;
  butiran: string;
  mata: number;
  utama: boolean;
  manual: boolean;
  tahap: BurdenLevel;
}

export interface TeacherResult {
  id: string;
  guru: Teacher;
  analisis: boolean;
  mataTugas: number;
  mataWaktu: number;
  jumlah: number;
  bilTugas: number;
  bilUtama: number;
  ikutBahagian: Record<string, number>;
  bilIkutBahagian: Record<string, number>;
  tugas: TeacherTaskEntry[];
  peringkat: GradeTier;
  faktorGred: number;
  sasaran: number | null;
  ambangBerat: number | null;
  ambangKurang: number | null;
  status: WorkloadStatus | null;
  nisbah: number | null;
}

export interface DivisionResult {
  id: string;
  bahagian: Division;
  indeks: number;
  bilJk: number;
  bilJawatan: number;
  bilKosong: number;
  bilDiisi: number;
  mata: number;
  guruIds: string[];
  siap: boolean;
  oleh: string;
  pada: number;
}

export interface GradeSummary {
  gred: string;
  n: number;
  purata: number;
  min: number;
  max: number;
  peringkat: GradeTier;
  peranan: string;
  faktor: number;
  sasaran: number;
  nisbah: number | null;
  kedudukan: 'berat' | 'seimbang' | 'kurang' | null;
}

export interface AnalysisResult {
  tetapan: WeightSettings;
  guruMap: Record<string, TeacherResult>;
  senarai: TeacherResult[];
  analisis: TeacherResult[];
  bahagianMap: Record<string, DivisionResult>;
  senaraiBahagian: DivisionResult[];
  stat: {
    n: number;
    purata: number;
    median: number;
    sp: number;
    min: number;
    max: number;
    maxSemua: number;
    ambangBerat: number;
    ambangKurang: number;
    bil: Record<WorkloadStatus, number>;
    awal: boolean;
    gredKira: boolean;
    asas: number;
    maksAmbang: number;
    peratusSeimbang: number;
    bilJk: number;
    bilJawatan: number;
    bilKosong: number;
  };
  gred: GradeSummary[];
  kosong: { jkId: string; jkNama: string; bahagianId: string; ahliId: string; jawatan: string }[];
  pendua: { jkId: string; jkNama: string; bahagianId: string; guruId: string }[];
  lebihUtama: TeacherResult[];
  luarSenarai: { jawatan: string; bil: number }[];
}

export interface SessionPayload {
  tahun: SchoolSession;
  tetapan: WeightSettings;
  bahagian: Division[];
  guru: Teacher[];
  jk: Committee[];
}

export interface AppStoreData {
  sekolah: SchoolProfile;
  pengguna: UserAccount[];
  penggunaAktifId: string;
  sesiAktifId: string;
  sesi: Record<string, SessionPayload>;
}
