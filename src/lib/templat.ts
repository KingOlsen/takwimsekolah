import type { BurdenLevel, DivisionType, SchoolLevel } from '../types/tugasadil';

export const JENIS_SEKOLAH = [
  { id: 'SK', nama: 'Sekolah Kebangsaan (SK)', peringkat: 'rendah' as SchoolLevel },
  { id: 'SJKC', nama: 'Sekolah Jenis Kebangsaan Cina (SJKC)', peringkat: 'rendah' as SchoolLevel },
  { id: 'SJKT', nama: 'Sekolah Jenis Kebangsaan Tamil (SJKT)', peringkat: 'rendah' as SchoolLevel },
  { id: 'SMK', nama: 'Sekolah Menengah Kebangsaan (SMK)', peringkat: 'menengah' as SchoolLevel },
  { id: 'SBP', nama: 'Sekolah Berasrama Penuh (SBP)', peringkat: 'menengah' as SchoolLevel },
  { id: 'SMKA', nama: 'Sekolah Menengah Kebangsaan Agama (SMKA)', peringkat: 'menengah' as SchoolLevel },
  { id: 'SABK', nama: 'Sekolah Agama Bantuan Kerajaan (SABK)', peringkat: 'menengah' as SchoolLevel },
  { id: 'SMJK', nama: 'Sekolah Menengah Jenis Kebangsaan (SMJK)', peringkat: 'menengah' as SchoolLevel },
  { id: 'KV', nama: 'Kolej Vokasional', peringkat: 'menengah' as SchoolLevel },
  { id: 'KT6', nama: 'Kolej Tingkatan Enam', peringkat: 'menengah' as SchoolLevel },
  { id: 'SPK', nama: 'Sekolah Pendidikan Khas', peringkat: 'rendah' as SchoolLevel },
  { id: 'Lain', nama: 'Lain-lain', peringkat: 'menengah' as SchoolLevel },
];

export const NEGERI = [
  'Johor',
  'Kedah',
  'Kelantan',
  'Melaka',
  'Negeri Sembilan',
  'Pahang',
  'Perak',
  'Perlis',
  'Pulau Pinang',
  'Sabah',
  'Sarawak',
  'Selangor',
  'Terengganu',
  'Wilayah Persekutuan Kuala Lumpur',
  'Wilayah Persekutuan Labuan',
  'Wilayah Persekutuan Putrajaya',
];

export const JENIS_BAHAGIAN: { jenis: DivisionType; nama: string; singkatan: string; teras?: boolean }[] = [
  { jenis: 'pentadbiran', nama: 'Pentadbiran', singkatan: 'Pentadbiran', teras: true },
  { jenis: 'kurikulum', nama: 'Kurikulum', singkatan: 'Kurikulum', teras: true },
  { jenis: 'hem', nama: 'Hal Ehwal Murid', singkatan: 'HEM', teras: true },
  { jenis: 'koku', nama: 'Kokurikulum', singkatan: 'Koku', teras: true },
  { jenis: 't6', nama: 'Tingkatan 6', singkatan: 'Ting. 6' },
  { jenis: 'ppki', nama: 'Pendidikan Khas (PPKI)', singkatan: 'PPKI' },
  { jenis: 'prasekolah', nama: 'Prasekolah', singkatan: 'Prasekolah' },
  { jenis: 'asrama', nama: 'Asrama', singkatan: 'Asrama' },
  { jenis: 'petang', nama: 'Sesi Petang', singkatan: 'Petang' },
];

export const JAWATAN_LALAI = ['Pengerusi', 'Naib Pengerusi', 'Setiausaha', 'AJK', 'AJK', 'AJK'];
const PENYELARAS = ['Pengerusi', 'Naib Pengerusi', 'Penyelaras', 'Setiausaha', 'AJK', 'AJK'];
const PANITIA = ['Ketua Panitia', 'Setiausaha', 'AJK', 'AJK'];
const UNIT = ['Ketua Guru Penasihat', 'Guru Penasihat', 'Guru Penasihat'];
const SUKAN = ['Ketua Guru Penasihat', 'Guru Penasihat', 'Jurulatih'];
const RUMAH = ['Ketua Rumah', 'Guru Penasihat', 'Guru Penasihat'];

export interface CommitteeTemplate {
  nama: string;
  kumpulan?: string;
  tahap?: BurdenLevel;
  jawatan?: string[];
  peringkat?: SchoolLevel;
  bidang?: string;
}

const UB = 'Unit Beruniform';
const KP = 'Kelab dan Persatuan';
const SP = 'Sukan dan Permainan';
const RS = 'Rumah Sukan';
const PK = 'Pengurusan Kelas';

function panitia(subjek: string, peringkat?: SchoolLevel): CommitteeTemplate {
  return { nama: `Panitia ${subjek}`, kumpulan: 'Panitia Mata Pelajaran', jawatan: PANITIA, peringkat };
}

function unit(
  nama: string,
  kumpulan: string,
  jawatan: string[],
  peringkat?: SchoolLevel,
  tahap?: BurdenLevel
): CommitteeTemplate {
  return { nama, kumpulan, jawatan, peringkat, tahap };
}

export const TEMPLAT_JK: Record<string, CommitteeTemplate[]> = {
  pentadbiran: [
    {
      nama: 'Jawatankuasa Pengurusan dan Pentadbiran Sekolah',
      bidang:
        'Merancang dan menyelaras dasar serta hala tuju pengurusan sekolah.\nMemantau pelaksanaan keputusan mesyuarat dan arahan Kementerian, JPN dan PPD.\nMenyelaras tugas antara unit Pentadbiran, Kurikulum, Hal Ehwal Murid dan Kokurikulum.\nMenilai pencapaian sasaran tahunan sekolah.',
    },
    {
      nama: 'Jawatankuasa Pengurusan Kewangan dan Akaun Sekolah',
      tahap: 'berat',
      bidang:
        'Merancang anggaran belanja mengurus tahunan sekolah.\nMemastikan perbelanjaan mematuhi peraturan kewangan yang berkuat kuasa.\nMeneliti penyata kewangan bulanan dan laporan audit.\nMengambil tindakan pembetulan terhadap teguran audit.',
    },
    { nama: 'Jawatankuasa Pengurusan Aset Alih Kerajaan' },
    {
      nama: 'Jawatankuasa Pengurusan Maklumat Sekolah',
      tahap: 'berat',
      bidang:
        'Menguruskan pengumpulan dan pengemaskinian data sekolah dalam sistem Kementerian.\nMemastikan data guru, murid dan fizikal sekolah tepat dan terkini.\nMenyediakan laporan data apabila diperlukan oleh pengurusan sekolah, PPD dan JPN.',
    },
    { nama: 'Jawatankuasa Pemandu Standard Kualiti Pendidikan Malaysia Gelombang 2 (SKPMg2)' },
    { nama: 'Jawatankuasa Perancangan Strategik Sekolah' },
    { nama: 'Jawatankuasa Pembangunan Sumber Manusia dan Latihan Dalam Perkhidmatan' },
    { nama: 'Jawatankuasa Penilaian Prestasi Guru dan Staf' },
    { nama: 'Jawatankuasa Pembangunan Fizikal dan Penyelenggaraan Sekolah' },
    { nama: 'Jawatankuasa Permuafakatan PIBG dan Komuniti', jawatan: ['Penasihat', 'Setiausaha', 'Bendahari'] },
    { nama: 'Jawatankuasa Teknologi Maklumat dan Komunikasi (ICT)', jawatan: PENYELARAS },
    { nama: 'Jawatankuasa Dokumentasi dan Majalah Sekolah' },
    { nama: 'Jawatankuasa Buku Pengurusan dan Takwim Sekolah', tahap: 'ringan' },
    { nama: 'Jawatankuasa Kelab Guru dan Staf', tahap: 'ringan', jawatan: ['Pengerusi', 'Setiausaha', 'Bendahari'] },
    { nama: 'Jawatankuasa Sambutan Hari Guru', tahap: 'ringan' },
    { nama: 'Jawatankuasa Hari Anugerah Kecemerlangan', tahap: 'ringan' },
  ],
  kurikulum: [
    {
      nama: 'Jawatankuasa Kurikulum Sekolah',
      bidang:
        'Merancang, menyelaras dan memantau pelaksanaan kurikulum di sekolah.\nMenetapkan sasaran akademik dan strategi peningkatan pencapaian murid.\nMenyelaras aktiviti panitia mata pelajaran.\nMenilai keberkesanan program kurikulum dan mengambil tindakan susulan.',
    },
    {
      nama: 'Jawatankuasa Jadual Waktu',
      tahap: 'berat',
      bidang:
        'Menyediakan jadual waktu induk, kelas dan persendirian guru.\nMengagihkan waktu mengajar mengikut opsyen guru dan keperluan sekolah.\nMengemas kini jadual waktu apabila berlaku pertukaran guru.',
    },
    {
      nama: 'Jawatankuasa Peperiksaan dan Penilaian',
      tahap: 'berat',
      bidang:
        'Merancang takwim peperiksaan dalaman dan menyelaras peperiksaan awam.\nMenguruskan jadual, penyediaan kertas soalan dan pengawasan peperiksaan.\nMenganalisis keputusan peperiksaan dan melaporkannya kepada Jawatankuasa Kurikulum.\nMenyimpan rekod markah dan dokumen peperiksaan dengan selamat.',
    },
    { nama: 'Jawatankuasa Pentaksiran Bilik Darjah (PBD)', jawatan: PENYELARAS },
    { nama: 'Jawatankuasa Pusat Sumber Sekolah dan NILAM', jawatan: ['Pengerusi', 'Naib Pengerusi', 'Penyelaras', 'Setiausaha'] },
    { nama: 'Jawatankuasa Pencerapan dan Penyeliaan PdPc' },
    { nama: 'Jawatankuasa Program Kecemerlangan Akademik' },
    { nama: 'Jawatankuasa Jadual Waktu Ganti', jawatan: PENYELARAS },
    { nama: 'Jawatankuasa Pembelajaran Abad Ke-21 (PAK21)' },
    { nama: 'Jawatankuasa STEM' },
    { nama: 'Jawatankuasa Memartabatkan Bahasa Malaysia Memperkukuh Bahasa Inggeris (MBMMBI)' },
    { nama: 'Jawatankuasa Komuniti Pembelajaran Profesional (PLC)' },
    { nama: 'Jawatankuasa Pendidikan Digital' },
    { nama: 'Jawatankuasa Bilik Khas dan Makmal' },
    { nama: 'Jawatankuasa Headcount dan Post Mortem' },
    { nama: 'Jawatankuasa Pemulihan Khas', peringkat: 'rendah' },
    { nama: 'Jawatankuasa Literasi dan Numerasi', peringkat: 'rendah' },
    { nama: 'Jawatankuasa Kerja Kursus Peperiksaan Awam', peringkat: 'menengah', jawatan: PENYELARAS },
    panitia('Bahasa Melayu'),
    panitia('Bahasa Inggeris'),
    panitia('Matematik'),
    panitia('Sains'),
    panitia('Sejarah'),
    panitia('Pendidikan Islam'),
    panitia('Pendidikan Moral'),
    panitia('Pendidikan Jasmani dan Pendidikan Kesihatan'),
    panitia('Pendidikan Seni Visual'),
    panitia('Reka Bentuk dan Teknologi'),
    panitia('Bahasa Arab'),
    panitia('Bahasa Cina'),
    panitia('Bahasa Tamil'),
    panitia('Pendidikan Muzik', 'rendah'),
    panitia('Geografi', 'menengah'),
    panitia('Asas Sains Komputer dan Sains Komputer', 'menengah'),
    panitia('Matematik Tambahan', 'menengah'),
    panitia('Fizik', 'menengah'),
    panitia('Kimia', 'menengah'),
    panitia('Biologi', 'menengah'),
    panitia('Perniagaan', 'menengah'),
    panitia('Prinsip Perakaunan', 'menengah'),
  ],
  hem: [
    {
      nama: 'Jawatankuasa Hal Ehwal Murid Sekolah',
      bidang:
        'Merancang dan menyelaras program hal ehwal murid sepanjang tahun.\nMemantau kebajikan, disiplin, kesihatan dan keselamatan murid.\nMenyelaras tugas unit-unit di bawah Hal Ehwal Murid.\nMenilai keberkesanan program dan melaporkannya kepada pengurusan sekolah.',
    },
    {
      nama: 'Lembaga Disiplin dan Pengawas',
      tahap: 'berat',
      bidang:
        'Menguatkuasakan peraturan sekolah secara adil dan konsisten.\nMenyiasat dan mengambil tindakan terhadap kes salah laku murid mengikut prosedur.\nMerekod kes disiplin dalam sistem yang ditetapkan oleh Kementerian.\nMembimbing dan memantau tugas pengawas sekolah.',
    },
    { nama: 'Jawatankuasa Bimbingan dan Kaunseling' },
    {
      nama: 'Jawatankuasa Skim Pinjaman Buku Teks (SPBT)',
      tahap: 'berat',
      bidang:
        'Menguruskan penerimaan, agihan dan pemulangan buku teks.\nMengemas kini stok dan rekod buku teks dalam sistem yang ditetapkan.\nMenguruskan pelupusan buku teks mengikut prosedur.',
    },
    { nama: 'Jawatankuasa Bantuan dan Kebajikan Murid' },
    { nama: 'Jawatankuasa Pendaftaran, Data dan Kehadiran Murid', tahap: 'berat' },
    { nama: 'Jawatankuasa Kantin Sekolah' },
    { nama: 'Jawatankuasa Kesihatan Murid' },
    { nama: 'Jawatankuasa 3K (Kebersihan, Kesihatan dan Keselamatan)' },
    { nama: 'Jawatankuasa Sekolah Selamat' },
    { nama: 'Jawatankuasa Pendidikan Pencegahan Dadah (PPDa)' },
    { nama: 'Jawatankuasa Program Guru Penyayang', tahap: 'ringan' },
    { nama: 'Jawatankuasa Orientasi Murid Baharu', tahap: 'ringan' },
    { nama: 'Jawatankuasa Rancangan Makanan Tambahan (RMT) dan Program Susu Sekolah', peringkat: 'rendah' },
    { nama: 'Jawatankuasa Koperasi Sekolah', peringkat: 'menengah', jawatan: ['Pengerusi', 'Setiausaha', 'Bendahari'] },
    unit('Penyelaras Tahun', PK, ['Penyelaras', 'Penyelaras', 'Penyelaras'], 'rendah'),
    unit('Guru Kelas', PK, ['Guru Kelas', 'Guru Kelas', 'Guru Kelas', 'Guru Kelas'], 'rendah'),
    unit('Penyelaras Tingkatan', PK, ['Penyelaras', 'Penyelaras', 'Penyelaras'], 'menengah'),
    unit('Guru Tingkatan', PK, ['Guru Tingkatan', 'Guru Tingkatan', 'Guru Tingkatan', 'Guru Tingkatan'], 'menengah'),
  ],
  koku: [
    {
      nama: 'Jawatankuasa Kokurikulum Sekolah',
      bidang:
        'Merancang takwim dan aktiviti kokurikulum tahunan.\nMemastikan penyertaan murid secara menyeluruh dalam unit beruniform, kelab dan sukan.\nMenyelaras penyertaan sekolah ke pertandingan peringkat daerah, negeri dan kebangsaan.\nMemantau pelaksanaan dan keselamatan aktiviti kokurikulum.',
    },
    { nama: 'Jawatankuasa Pembangunan Sukan Sekolah' },
    { nama: 'Jawatankuasa Pentaksiran Aktiviti Jasmani, Sukan dan Kokurikulum (PAJSK)', tahap: 'berat' },
    { nama: 'Jawatankuasa Kejohanan Olahraga dan Merentas Desa', tahap: 'ringan' },
    { nama: 'Jawatankuasa Perkhemahan Perdana dan Hari Kokurikulum', tahap: 'ringan' },
    unit('Pengakap', UB, UNIT),
    unit('Persatuan Bulan Sabit Merah Malaysia (PBSM)', UB, UNIT),
    unit('Kadet Remaja Sekolah (KRS)', UB, UNIT, 'menengah'),
    unit('Tunas Kadet Remaja Sekolah (TKRS)', UB, UNIT, 'rendah'),
    unit('Pergerakan Puteri Islam Malaysia (PPIM)', UB, UNIT),
    unit('Persatuan Pandu Puteri Malaysia', UB, UNIT),
    unit('St. John Ambulans Malaysia', UB, UNIT, 'menengah'),
    unit('Kadet Polis', UB, UNIT, 'menengah'),
    unit('Persatuan Bahasa Melayu', KP, UNIT),
    unit('Persatuan Bahasa Inggeris', KP, UNIT),
    unit('Persatuan Sains, Teknologi, Kejuruteraan dan Matematik (STEM)', KP, UNIT),
    unit('Kelab Kerjaya dan Pembimbing Rakan Sebaya', KP, UNIT),
    unit('Kelab Rukun Negara', KP, UNIT),
    unit('Kelab Pencinta Alam dan Kitar Semula', KP, UNIT),
    unit('Kelab Komputer dan Media Digital', KP, UNIT),
    unit('Kelab Bola Sepak', SP, SUKAN),
    unit('Kelab Bola Jaring', SP, SUKAN),
    unit('Kelab Badminton', SP, SUKAN),
    unit('Kelab Bola Tampar', SP, SUKAN),
    unit('Kelab Ping Pong', SP, SUKAN),
    unit('Kelab Olahraga', SP, SUKAN),
    unit('Kelab Catur', SP, SUKAN),
    unit('Rumah Merah', RS, RUMAH),
    unit('Rumah Biru', RS, RUMAH),
    unit('Rumah Hijau', RS, RUMAH),
    unit('Rumah Kuning', RS, RUMAH),
  ],
  t6: [
    { nama: 'Jawatankuasa Induk Pengurusan Tingkatan 6' },
    { nama: 'Jawatankuasa Kurikulum Tingkatan 6' },
    { nama: 'Jawatankuasa Pentaksiran Berasaskan Sekolah (PBS) STPM', tahap: 'berat' },
    { nama: 'Jawatankuasa Hal Ehwal Pelajar Tingkatan 6' },
    { nama: 'Jawatankuasa Kokurikulum Tingkatan 6' },
    { nama: 'Majlis Perwakilan Pelajar Tingkatan 6', jawatan: ['Penasihat', 'Ketua Guru Penasihat', 'Guru Penasihat'] },
  ],
  ppki: [
    { nama: 'Jawatankuasa Pengurusan Program Pendidikan Khas Integrasi (PPKI)' },
    { nama: 'Jawatankuasa Rancangan Pendidikan Individu (RPI)', tahap: 'berat' },
    { nama: 'Jawatankuasa Program Pendidikan Inklusif (PPI)' },
    { nama: 'Jawatankuasa Elaun Murid Berkeperluan Pendidikan Khas (EMK)', tahap: 'ringan' },
    { nama: 'Jawatankuasa Kokurikulum PPKI' },
  ],
  prasekolah: [
    { nama: 'Jawatankuasa Pengurusan Prasekolah' },
    { nama: 'Jawatankuasa Pemilihan dan Pendaftaran Murid Prasekolah', tahap: 'ringan' },
    { nama: 'Jawatankuasa Pemakanan dan Kesihatan Prasekolah' },
  ],
  asrama: [
    { nama: 'Jawatankuasa Pengurusan Asrama', tahap: 'berat' },
    { nama: 'Lembaga Warden Asrama', tahap: 'berat', jawatan: ['Pengerusi', 'Ketua Warden', 'Warden', 'Warden'] },
    { nama: 'Jawatankuasa Keceriaan, Keselamatan dan Kebajikan Asrama' },
    { nama: 'Jawatankuasa Dewan Makan dan Pemakanan Asrama' },
  ],
  petang: [
    { nama: 'Jawatankuasa Pengurusan Sesi Petang' },
    { nama: 'Jawatankuasa Disiplin Sesi Petang', tahap: 'berat' },
    { nama: 'Jawatankuasa Guru Bertugas Mingguan Sesi Petang' },
  ],
};

const BIDANG_KATA: [RegExp, string][] = [
  [
    /panitia/,
    'Mempengerusikan mesyuarat panitia sekurang-kurangnya empat kali setahun.\nMenyelaras penyediaan rancangan pengajaran tahunan dan harian mengikut sukatan terkini.\nMerancang dan melaksanakan program peningkatan prestasi mata pelajaran.\nMenganalisis keputusan peperiksaan dan pentaksiran serta merancang intervensi.\nMenguruskan pembelian bahan bantu mengajar dan peruntukan PCG panitia.',
  ],
  [
    /kewangan|akaun|perolehan/,
    'Merancang anggaran belanja mengurus tahunan sekolah.\nMemastikan perbelanjaan mematuhi peraturan kewangan yang berkuat kuasa.\nMeneliti penyata kewangan bulanan dan laporan audit.\nMengambil tindakan pembetulan terhadap teguran audit.',
  ],
  [
    /aset|inventori|stor/,
    'Menguruskan penerimaan, pendaftaran dan pelabelan aset kerajaan.\nMenjalankan pemeriksaan tahunan ke atas semua aset sekolah.\nMenguruskan penyelenggaraan, pelupusan dan hapus kira aset mengikut prosedur.\nMenyediakan laporan kedudukan aset kepada pihak pentadbir.',
  ],
  [
    /maklumat|\bdata\b|emis|apdm|ict/,
    'Menguruskan pengumpulan dan pengemaskinian data sekolah dalam sistem Kementerian.\nMemastikan data guru, murid dan fizikal sekolah tepat dan terkini.\nMenyediakan laporan data apabila diperlukan oleh pengurusan sekolah, PPD dan JPN.',
  ],
  [
    /peperiksaan|pentaksiran|pbd|pajsk|stpm/,
    'Merancang takwim peperiksaan dan pentaksiran sepanjang tahun.\nMenguruskan penyediaan kertas soalan, jadual dan pengawasan peperiksaan.\nMenganalisis keputusan dan membentangkannya dalam mesyuarat kurikulum.\nMenyimpan rekod markah dan dokumen pentaksiran dengan selamat.',
  ],
  [
    /disiplin|pengawas/,
    'Menguatkuasakan peraturan sekolah secara adil dan konsisten.\nMenyiasat dan mengambil tindakan terhadap kes salah laku murid mengikut prosedur.\nMerekod kes disiplin dalam sistem yang ditetapkan oleh Kementerian.\nMembimbing dan memantau tugas pengawas sekolah.',
  ],
  [
    /spbt|buku teks/,
    'Menguruskan penerimaan, agihan dan pemulangan buku teks.\nMengemas kini stok dan rekod buku teks dalam sistem yang ditetapkan.\nMenguruskan pelupusan buku teks mengikut prosedur.',
  ],
  [
    /3k|kebersihan|kesihatan|keselamatan/,
    'Mengawasi kebersihan dan keceriaan kawasan sekolah serta kelas.\nMenganjurkan projek kebersihan, keceriaan dan gotong-royong.\nMenyelaras program kesihatan dan pemeriksaan murid.\nMemantau keselamatan murid di dalam dan di sekitar sekolah.',
  ],
  [
    /bimbingan|kaunseling|kerjaya/,
    'Merancang, melaksana dan menilai program bimbingan dan kaunseling.\nMenyediakan perkhidmatan kaunseling individu dan kelompok.\nMenyelaras pelaksanaan ujian psikometrik murid.\nMembimbing murid memahami potensi diri, hala tuju pendidikan dan kerjaya.',
  ],
  [
    /beruniform|pengakap|pbsm|krs|puteri|pandu|kadet/,
    'Merancang dan melaksanakan aktiviti mengikut takwim dan garis panduan badan induk.\nMembimbing murid sepanjang latihan, aktiviti dan perkhemahan.\nMenguruskan kehadiran, rekod ahli dan pentaksiran PAJSK.\nMemastikan disiplin, keselamatan dan kebajikan murid.',
  ],
  [
    /sukan|permainan|olahraga|bola|badminton|catur/,
    'Merancang dan melaksanakan latihan mengikut takwim kokurikulum.\nMelatih murid dari segi kemahiran asas, teknik dan peraturan permainan.\nMenguruskan penyertaan dalam pertandingan dan merekod pencapaian murid.\nMenguruskan peralatan dan keselamatan murid semasa latihan.',
  ],
  [
    /kelab|persatuan/,
    'Merancang aktiviti tahunan mengikut takwim kokurikulum.\nMengendalikan perjumpaan dan mesyuarat ahli.\nMembimbing murid meningkatkan pengetahuan, kemahiran dan minat.\nMenyediakan laporan aktiviti dan pencapaian.',
  ],
];

const BIDANG_UMUM =
  'Merancang program dan aktiviti sepanjang tahun.\nMenyediakan takwim dan mengagihkan tugas ahli.\nMengadakan mesyuarat mengikut takwim dan menyediakan minit.\nMelaksanakan dan memantau program yang dirancang.\nMenyediakan laporan dan dokumentasi untuk pentadbir.';

export function bidangUntuk(nama: string, umum = false): string {
  const n = String(nama || '').trim().toLowerCase().replace(/\s+/g, ' ');
  if (n.length < 4) return '';
  let fromTemplate = '';
  for (const jenis of Object.keys(TEMPLAT_JK)) {
    const found = TEMPLAT_JK[jenis].find((t) => t.bidang && t.nama.toLowerCase() === n);
    if (found?.bidang) {
      fromTemplate = found.bidang;
      break;
    }
  }
  let fromKw = '';
  for (const [rx, text] of BIDANG_KATA) {
    if (rx.test(n)) {
      fromKw = text;
      break;
    }
  }
  if (fromTemplate || fromKw) {
    return fromKw.split('\n').length >= fromTemplate.split('\n').length ? fromKw || fromTemplate : fromTemplate;
  }
  return umum ? BIDANG_UMUM : '';
}

export function templatUntuk(jenis: DivisionType, peringkat?: SchoolLevel): CommitteeTemplate[] {
  return (TEMPLAT_JK[jenis] || []).filter((t) => !peringkat || !t.peringkat || t.peringkat === peringkat);
}

export interface ExtraPageTemplate {
  id: string;
  nama: string;
  tajuk: string;
  letak: 'depan' | 'belakang';
  isi: string;
}

export const TEMPLAT_HALAMAN: ExtraPageTemplate[] = [
  {
    id: 'aluan',
    nama: 'Sekapur sirih (kata alu-aluan)',
    tajuk: 'Sekapur Sirih',
    letak: 'depan',
    isi: 'Assalamualaikum warahmatullahi wabarakatuh dan salam sejahtera.\n\nAlhamdulillah, bersyukur kita ke hadrat Ilahi kerana Buku Pengurusan Sekolah bagi sesi ini berjaya disiapkan dengan teratur dan telus.\n\nBuku ini menjadi panduan utama seluruh warga sekolah dalam melaksanakan amanah pengajaran, pengurusan kurikulum, hal ehwal murid dan kokurikulum secara seimbang.\n\nSelamat bertugas dengan penuh dedikasi dan integriti.',
  },
  {
    id: 'visi',
    nama: 'Falsafah, Visi & Misi KPM',
    tajuk: 'Falsafah, Visi dan Misi',
    letak: 'depan',
    isi: 'FALSAFAH PENDIDIKAN KEBANGSAAN\nPendidikan di Malaysia adalah suatu usaha berterusan ke arah lebih memperkembangkan potensi individu secara menyeluruh dan bersepadu untuk melahirkan insan yang seimbang dan harmonis dari segi intelek, rohani, emosi dan jasmani.\n\nVISI KPM\nPendidikan Berkualiti, Insan Terdidik, Negara Sejahtera.\n\nMISI KPM\nMelestarikan Sistem Pendidikan yang Berkualiti untuk Membangunkan Potensi Individu bagi Memenuhi Aspirasi Negara.',
  },
  {
    id: 'perakuan',
    nama: 'Perakuan menerima tugas',
    tajuk: 'Perakuan Menerima Tugas',
    letak: 'depan',
    isi: 'Saya mengaku telah menerima dan memahami tugas-tugas yang disenaraikan atas nama saya dalam Buku Pengurusan Sekolah ini, dan akan melaksanakannya dengan amanah serta penuh tanggungjawab.\n\nNama Guru: ........................................................................\nNo. Kad Pengenalan: ......................................................\nTandatangan: .................................   Tarikh: ....................',
  },
  {
    id: 'penggalB',
    nama: 'Kalendar Akademik 2027 (Kumpulan B)',
    tajuk: 'Kalendar Akademik Tahun 2027 (Kumpulan B)',
    letak: 'depan',
    isi: 'Penggal 1: 11 Januari 2027 – 12 Mac 2027 (9 minggu)\nCuti Penggal 1: 13 Mac 2027 – 21 Mac 2027\nPenggal 2: 22 Mac 2027 – 21 Mei 2027 (9 minggu)\nCuti Pertengahan Tahun: 22 Mei 2027 – 6 Jun 2027\nPenggal 3: 7 Jun 2027 – 20 Ogos 2027 (11 minggu)\nCuti Penggal 2: 21 Ogos 2027 – 29 Ogos 2027\nPenggal 4: 30 Ogos 2027 – 10 Disember 2027 (15 minggu)\nCuti Akhir Persekolahan: 11 Disember 2027 – 31 Disember 2027',
  },
  {
    id: 'gaji',
    nama: 'Tarikh Pembayaran Gaji 2027',
    tajuk: 'Tarikh Pembayaran Gaji 2027',
    letak: 'depan',
    isi: 'Januari: 25 Januari 2027 (Isnin)\nFebruari: 25 Februari 2027 (Khamis)\nMac: 25 Mac 2027 (Khamis)\nApril: 22 April 2027 (Khamis)\nMei: 12 Mei 2027 (Rabu) — Diawalkan sempena Aidiladha\nJun: 17 Jun 2027 (Khamis)\nJulai: 21 Julai 2027 (Rabu)\nOgos: 25 Ogos 2027 (Rabu)\nSeptember: 23 September 2027 (Khamis)\nOktober: 21 Oktober 2027 (Khamis) — Diawalkan sempena Deepavali\nNovember: 25 November 2027 (Khamis)\nDisember: 20 Disember 2027 (Isnin) — Diawalkan sempena Krismas',
  },
  {
    id: 'panduan',
    nama: 'Panduan Am Guru',
    tajuk: 'Panduan Am Guru',
    letak: 'depan',
    isi: '1. Kehadiran bertugas hendaklah direkodkan sebelum waktu rasmi persekolahan bermula.\n2. Rancangan Pengajaran Harian (RPH) wajib disediakan sebelum sesi PdPc bermula.\n3. Guru yang tidak dapat hadir bertugas hendaklah memaklumkan kepada Pengetua / Guru Besar seawal mungkin.\n4. Semua aktiviti kokurikulum dan mesyuarat rasmi hendaklah direkodkan dalam minit dan pelaporan sekolah.',
  },
  {
    id: 'kosong',
    nama: 'Halaman Catatan / Kosong',
    tajuk: 'Catatan Pentadbir',
    letak: 'belakang',
    isi: 'Gunakan ruangan ini untuk catatan tambahan, takwim mesyuarat, atau pindaan tugas sepanjang sesi persekolahan.',
  },
];
