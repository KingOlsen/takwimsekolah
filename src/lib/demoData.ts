import type {
  AppStoreData,
  BookConfig,
  Committee,
  Division,
  LetterConfig,
  SessionPayload,
  Teacher,
  TeacherCategory,
  UserAccount,
  WeightSettings,
} from '../types/tugasadil';
import { TETAPAN_LALAI } from './kira';

// Crisp custom SVG emblem for SMK Seri Contoh (Indigo, Cyan & Slate)
export const LOGO_SEKOLAH_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <path d="M60 8L104 24V58C104 86 84 105 60 114C36 105 16 86 16 58V24L60 8Z" fill="#4f46e5" stroke="#06b6d4" stroke-width="5"/>
    <path d="M60 18L94 31V57C94 79 78 95 60 103C42 95 26 79 26 57V31L60 18Z" fill="none" stroke="#e2e8f0" stroke-opacity="0.4" stroke-width="2"/>
    <path d="M40 46H57V78C50 75 44 74 40 75V46Z" fill="#f8fafc"/>
    <path d="M80 46H63V78C70 75 76 74 80 75V46Z" fill="#06b6d4"/>
    <circle cx="60" cy="34" r="6" fill="#06b6d4"/>
  </svg>`
)}`;

export function defaultBookConfig(schoolName = 'SMK Seri Contoh', motto = 'Ilmu Suluh Hidup'): BookConfig {
  return {
    kulit: {
      gaya: 'moden',
      warna: '#4f46e5',
      aksen: '#06b6d4',
      tajuk: 'BUKU PENGURUSAN SEKOLAH',
      subtajuk: 'PANDUAN TUGAS GURU & STAF',
      moto: motto,
      tunjukLogo: true,
    },
    bahagian: {
      kulit: true,
      kandungan: true,
      halamanAwal: true,
      senaraiGuru: true,
      carta: true,
      jawatankuasa: true,
      tugasGuru: true,
      rumusan: true,
      pengesahan: true,
    },
    pilihan: {
      paparJawatanHakiki: true,
      paparGred: true,
      paparBidang: true,
      paparMata: true,
      sorokKosong: false,
      hiasTajuk: true,
    },
    halamanTambahan: [
      {
        id: 'hp1',
        tajuk: 'Sekapur Sirih',
        letak: 'depan',
        aktif: true,
        isi: `Assalamualaikum warahmatullahi wabarakatuh dan salam sejahtera.\n\nAlhamdulillah, Buku Pengurusan ${schoolName} dapat disediakan sebagai rujukan rasmi pelaksanaan dasar, pengagihan tugas dan hala tuju sekolah sepanjang sesi persekolahan.\n\nDiharapkan setiap warga sekolah dapat melaksanakan tugas dengan penuh amanah, telus dan berintegriti demi kecemerlangan murid dan sekolah.`,
      },
      {
        id: 'hp2',
        tajuk: 'Falsafah, Visi dan Misi',
        letak: 'depan',
        aktif: true,
        isi: 'FALSAFAH PENDIDIKAN KEBANGSAAN\nPendidikan di Malaysia adalah suatu usaha berterusan ke arah lebih memperkembangkan potensi individu secara menyeluruh dan bersepadu untuk melahirkan insan yang seimbang dan harmonis dari segi intelek, rohani, emosi dan jasmani.\n\nVISI KPM\nPendidikan Berkualiti, Insan Terdidik, Negara Seformasi Sejahtera.\n\nMISI KPM\nMelestarikan Sistem Pendidikan yang Berkualiti untuk Membangunkan Potensi Individu bagi Memenuhi Aspirasi Negara.',
      },
    ],
    pengesahan: {
      penyediaNama: 'Pn. Hjh. Norhayati binti Abdullah',
      penyediaJawatan: 'Penolong Kanan Pentadbiran',
      pengesahNama: 'Tn. Hj. Roslan bin Mahmud',
      pengesahJawatan: 'Pengetua',
    },
  };
}

export function defaultLetterConfig(
  schoolName = 'SMK Seri Contoh',
  alamat = 'Jalan Pendidikan 1, 43000 Kajang, Selangor'
): LetterConfig {
  return {
    kepala: {
      atas: 'KEMENTERIAN PENDIDIKAN MALAYSIA',
      namaSekolah: schoolName.toUpperCase(),
      alamat,
      telefon: '03-0000 0000',
      emel: 'pentadbiran@smksericontoh.edu.my',
      tunjukLambang: true,
      garisBawah: true,
    },
    rujukan: {
      fail: 'SMKSC.100-1/5/1',
      mula: 1,
      tarikh: '2027-01-04',
    },
    kuatkuasa: {
      mula: '2027-01-01',
      tamat: '2027-12-31',
    },
    kandungan: {
      tajuk: 'PELANTIKAN TUGAS RASMI DAN JAWATANKUASA SEKOLAH SESI {tahun}',
      perenggan1:
        'Dengan segala hormatnya perkara di atas adalah dirujuk. Sukacita dimaklumkan bahawa tuan/puan telah dilantik untuk menjalankan tugas-tugas rasmi dan menganggotai jawatankuasa sekolah bagi sesi {tahun} berkuat kuasa mulai {mula} hingga {tamat} seperti jadual di bawah:',
      perenggan2:
        'Sehubungan dengan itu, pihak sekolah amat menghargai kerjasama, komitmen dan dedikasi tuan/puan dalam memastikan setiap amanah yang diberikan dapat dilaksanakan dengan penuh tanggungjawab mengikut garis panduan Kementerian Pendidikan Malaysia.',
      penutup: 'Sekian, terima kasih.',
      slogan: ['"MALAYSIA MADANI"', '"BERKHIDMAT UNTUK NEGARA"'],
      akhiran: 'Saya yang menjalankan amanah,',
      salinan: ['1. Fail Pengurusan Sekolah', '2. Fail Peribadi Guru'],
    },
    tandatangan: {
      nama: 'TN. HJ. ROSLAN BIN MAHMUD',
      jawatan: 'Pengetua',
      sekolah: schoolName,
    },
    pilihan: {
      saizFon: 11,
      bergarisTajuk: true,
      paparButiran: true,
    },
  };
}

const GURU_RAW: [string, string, string, string, number | null, TeacherCategory][] = [
  ['Tn. Hj. Roslan bin Mahmud', 'DG14', 'Pengetua', 'Sejarah', 6, 'pentadbir'],
  ['Pn. Hjh. Norhayati binti Abdullah', 'DG13', 'Penolong Kanan Pentadbiran', 'Matematik', 12, 'pentadbir'],
  ['En. Lim Wei Jian', 'DG12', 'Penolong Kanan Hal Ehwal Murid', 'Sains', 12, 'pentadbir'],
  ['En. Muthu a/l Krishnan', 'DG12', 'Penolong Kanan Kokurikulum', 'Pendidikan Jasmani', 12, 'pentadbir'],
  ['Dr. Faridah binti Osman', 'DG13', 'Penolong Kanan Tingkatan 6', 'Ekonomi', 12, 'pentadbir'],
  ['Pn. Zaleha binti Ismail', 'DG12', 'Penolong Kanan Pendidikan Khas', 'Pendidikan Khas', 12, 'pentadbir'],
  ['Pn. Chong Mei Ling', 'DG12', 'GKMP Sains dan Matematik', 'Kimia', 16, 'guru'],
  ['En. Azman bin Yusof', 'DG12', 'GKMP Bahasa', 'Bahasa Melayu', 16, 'guru'],
  ['Pn. Kavitha a/p Subramaniam', 'DG12', 'GKMP Kemanusiaan', 'Geografi', 16, 'guru'],
  ['En. Jeffry anak Jalong', 'DG12', 'GKMP Teknik dan Vokasional', 'Reka Bentuk dan Teknologi', 16, 'guru'],
  ['Pn. Siti Aminah binti Hassan', 'DG10', 'Guru', 'Bahasa Melayu', 24, 'guru'],
  ['En. Mohd Faizal bin Rahman', 'DG10', 'Guru', 'Matematik', 24, 'guru'],
  ['Cik Nurul Izzah binti Kamal', 'DG9', 'Guru', 'Bahasa Inggeris', 26, 'guru'],
  ['En. Tan Chee Keong', 'DG10', 'Guru', 'Fizik', 22, 'guru'],
  ['Pn. Rajeswari a/p Maniam', 'DG12', 'Guru', 'Bahasa Inggeris', 22, 'guru'],
  ['Ustaz Ahmad Syukri bin Zakaria', 'DG10', 'Guru', 'Pendidikan Islam', 24, 'guru'],
  ['Ustazah Nor Aini binti Salleh', 'DG9', 'Guru', 'Pendidikan Islam', 24, 'guru'],
  ['En. Daniel Lee Kah Seng', 'DG9', 'Guru', 'Sains Komputer', 24, 'guru'],
  ['Pn. Noraini binti Jaafar', 'DG10', 'Guru Bimbingan dan Kaunseling', 'Bimbingan dan Kaunseling', 6, 'guru'],
  ['Pn. Wong Siew Fong', 'DG10', 'Guru Perpustakaan dan Media', 'Bahasa Cina', 8, 'guru'],
  ['En. Hafiz bin Othman', 'DG9', 'Guru', 'Pendidikan Jasmani', 24, 'guru'],
  ['Pn. Lina anak Entri', 'DG9', 'Guru', 'Sejarah', 26, 'guru'],
  ['En. Suresh a/l Gopal', 'DG10', 'Guru', 'Matematik Tambahan', 22, 'guru'],
  ['Pn. Aishah binti Mohd Noor', 'DG12', 'Guru', 'Biologi', 20, 'guru'],
  ['Cik Farah Nadia binti Zulkifli', 'DG9', 'Guru', 'Bahasa Melayu', 26, 'guru'],
  ['En. Ravi a/l Chandran', 'DG10', 'Guru', 'Sejarah', 24, 'guru'],
  ['Pn. Ng Hui Min', 'DG10', 'Guru', 'Matematik', 24, 'guru'],
  ['En. Awang bin Damit', 'DG9', 'Guru', 'Geografi', 26, 'guru'],
  ['Pn. Maznah binti Idris', 'DG13', 'Guru', 'Bahasa Melayu', 18, 'guru'],
  ['En. Khairul Anuar bin Hashim', 'DG12', 'Guru', 'Perniagaan', 20, 'guru'],
  ['Pn. Priya a/p Nadarajan', 'DG9', 'Guru', 'Sains', 26, 'guru'],
  ['Cik Sharifah Nabila binti Syed Ali', 'DG9', 'Guru', 'Pendidikan Seni Visual', 26, 'guru'],
  ['En. Zulkarnain bin Ahmad', 'DG10', 'Guru', 'Reka Bentuk dan Teknologi', 24, 'guru'],
  ['Pn. Lau Pei Shan', 'DG9', 'Guru', 'Kimia', 24, 'guru'],
  ['En. Benedict Majalap', 'DG10', 'Guru', 'Pendidikan Moral', 24, 'guru'],
  ['Pn. Rohani binti Sulaiman', 'DG10', 'Guru Pendidikan Khas', 'Pendidikan Khas', 22, 'guru'],
  ['En. Amirul Hakim bin Roslee', 'DG9', 'Guru Pendidikan Khas', 'Pendidikan Khas', 24, 'guru'],
  ['Cik Tan Li Ying', 'DG9', 'Guru Pendidikan Khas', 'Pendidikan Khas', 24, 'guru'],
  ['En. Gopalan a/l Raman', 'DG13', 'Guru Tingkatan 6', 'Pengajian Am', 16, 'guru'],
  ['Pn. Hasnah binti Bakar', 'DG12', 'Guru Tingkatan 6', 'Ekonomi', 16, 'guru'],
  ['En. Chua Boon Hock', 'DG12', 'Guru Tingkatan 6', 'Matematik', 16, 'guru'],
  ['Pn. Elizabeth anak Ngau', 'DG9', 'Guru', 'Bahasa Inggeris', 24, 'guru'],
  ['Cik Amira Syazwani binti Rosli', 'DG9', 'Guru', 'Sains', 22, 'guru'],
  ['En. Wan Ahmad Fauzi bin Wan Ismail', 'DG13', 'Guru', 'Sejarah', 18, 'guru'],
  ['Pn. Salmah binti Daud', 'N6', 'Ketua Pembantu Tadbir', '', null, 'staf'],
  ['En. Shahrul Nizam bin Tahir', 'N1', 'Pembantu Pengurusan Murid', '', null, 'staf'],
];

const BAHAGIAN_RAW: [Division['jenis'], string, string][] = [
  ['pentadbiran', 'Pentadbiran', 'Pentadbiran'],
  ['kurikulum', 'Kurikulum', 'Kurikulum'],
  ['hem', 'Hal Ehwal Murid', 'HEM'],
  ['koku', 'Kokurikulum', 'Koku'],
  ['t6', 'Tingkatan 6', 'Ting. 6'],
  ['ppki', 'Pendidikan Khas (PPKI)', 'PPKI'],
];

const P = 'Pengerusi';
const NP = 'Naib Pengerusi';
const SU = 'Setiausaha';
const PSU = 'Penolong Setiausaha';
const BEN = 'Bendahari';
const PEN = 'Penyelaras';
const KP = 'Ketua Panitia';
const KGP = 'Ketua Guru Penasihat';
const GP = 'Guru Penasihat';
const JUR = 'Jurulatih';
const GT = 'Guru Tingkatan';
const NAS = 'Penasihat';
const A = 'AJK';
const PANITIA = 'Panitia Mata Pelajaran';

type MemberSpec = [string, number | string, string?];
type JkSpec = [number, string, string, Committee['tahap'], MemberSpec[], string?];

const JK_RAW: JkSpec[] = [
  [
    1,
    'Jawatankuasa Pengurusan dan Pentadbiran Sekolah',
    '',
    'sederhana',
    [
      [P, 1],
      [NP, 2],
      [NP, 3],
      [NP, 4],
      [SU, 11],
      [A, 7],
      [A, 8],
      [A, 9],
      [A, 10],
    ],
    'Merancang dan menyelaras dasar serta hala tuju pengurusan sekolah.\nMemantau pelaksanaan keputusan mesyuarat dan arahan Kementerian, JPN dan PPD.\nMenyelaras tugas antara unit Pentadbiran, Kurikulum, Hal Ehwal Murid dan Kokurikulum.\nMenilai pencapaian sasaran tahunan sekolah.',
  ],
  [
    1,
    'Jawatankuasa Pengurusan Kewangan dan Akaun Sekolah',
    '',
    'berat',
    [
      [P, 1],
      [NP, 2],
      [SU, 45],
      [A, 3],
      [A, 4],
      [A, 30],
    ],
  ],
  [
    1,
    'Jawatankuasa Pengurusan Aset Alih Kerajaan',
    '',
    'sederhana',
    [
      [P, 1],
      [NP, 2],
      [SU, 33],
      [A, 45],
      [A, 10],
    ],
  ],
  [
    1,
    'Jawatankuasa Pengurusan Maklumat Sekolah',
    '',
    'berat',
    [
      [P, 1],
      [NP, 2],
      [SU, 12],
      [PSU, 18],
      [A, 13],
    ],
  ],
  [
    1,
    'Jawatankuasa Pembangunan Sumber Manusia dan Latihan Dalam Perkhidmatan',
    '',
    'sederhana',
    [
      [P, 1],
      [NP, 2],
      [SU, 13],
      [A, 15],
      [A, 19],
      [A, 24],
    ],
  ],
  [
    1,
    'Jawatankuasa Permuafakatan PIBG dan Komuniti',
    '',
    'sederhana',
    [
      ['Yang Dipertua', 'YDP PIBG'],
      [NAS, 1],
      [SU, 11],
      [BEN, 15],
      [A, 30],
    ],
  ],
  // Kurikulum
  [
    2,
    'Jawatankuasa Kurikulum Sekolah',
    '',
    'sederhana',
    [
      [P, 1],
      [NP, 2],
      [SU, 11],
      [A, 7],
      [A, 8],
      [A, 9],
      [A, 10],
      [A, 20],
    ],
    'Merancang, menyelaras dan memantau pelaksanaan kurikulum di sekolah.\nMenetapkan sasaran akademik dan strategi peningkatan pencapaian murid.\nMenyelaras aktiviti panitia mata pelajaran.\nMenilai keberkesanan program kurikulum dan mengambil tindakan susulan.',
  ],
  [
    2,
    'Jawatankuasa Peperiksaan dan Penilaian',
    '',
    'berat',
    [
      [P, 1],
      [NP, 2],
      [SU, 14],
      [PSU, 27],
      [A, 23],
      [A, 13],
      [A, 31],
      [A, 7],
    ],
  ],
  [
    2,
    'Jawatankuasa Jadual Waktu',
    '',
    'berat',
    [
      [P, 1],
      [NP, 2],
      [SU, 12],
      [A, 27],
      [A, 10],
    ],
  ],
  [
    2,
    'Jawatankuasa Pentaksiran Bilik Darjah (PBD)',
    '',
    'sederhana',
    [
      [P, 1],
      [NP, 2],
      [PEN, 13],
      [A, 7],
      [A, 8],
      [A, 9],
      [A, 10],
      [A, 0],
    ],
  ],
  [
    2,
    'Jawatankuasa Pusat Sumber Sekolah dan NILAM',
    '',
    'sederhana',
    [
      [P, 1],
      [NP, 2],
      [PEN, 20],
      [SU, 22],
      [A, 25],
      [A, 32],
      [A, 18],
    ],
  ],
  [2, 'Panitia Bahasa Melayu', PANITIA, 'sederhana', [[KP, 8], [SU, 25], [A, 29], [A, 11]]],
  [2, 'Panitia Bahasa Inggeris', PANITIA, 'sederhana', [[KP, 15], [SU, 13], [A, 42], [A, 8]]],
  [2, 'Panitia Matematik', PANITIA, 'sederhana', [[KP, 27], [SU, 12], [A, 23], [A, 41]]],
  [2, 'Panitia Sains', PANITIA, 'sederhana', [[KP, 24], [SU, 31], [A, 7], [A, 34]]],
  // Hal Ehwal Murid
  [
    3,
    'Jawatankuasa Hal Ehwal Murid Sekolah',
    '',
    'sederhana',
    [
      [P, 1],
      [NP, 3],
      [SU, 22],
      [A, 19],
      [A, 21],
      [A, 6],
    ],
  ],
  [
    3,
    'Lembaga Disiplin dan Pengawas',
    '',
    'berat',
    [
      [P, 1],
      [NP, 3],
      [SU, 26],
      [PSU, 35],
      [A, 16],
      [A, 21],
      [A, 13],
    ],
    'Menguatkuasakan peraturan sekolah secara adil dan konsisten.\nMenyiasat dan mengambil tindakan terhadap kes salah laku murid mengikut prosedur.\nMerekod kes disiplin dalam sistem yang ditetapkan oleh Kementerian.\nMembimbing dan memantau tugas pengawas sekolah.',
  ],
  [
    3,
    'Jawatankuasa Bimbingan dan Kaunseling',
    '',
    'sederhana',
    [
      [P, 1],
      [NP, 3],
      [SU, 19],
      [A, 17],
      [A, 32],
    ],
  ],
  [
    3,
    'Jawatankuasa Skim Pinjaman Buku Teks (SPBT)',
    '',
    'berat',
    [
      [P, 1],
      [NP, 3],
      [SU, 28],
      [PSU, 34],
      [A, 11],
      [A, 0],
    ],
  ],
  [
    3,
    'Jawatankuasa Bantuan dan Kebajikan Murid',
    '',
    'sederhana',
    [
      [P, 1],
      [NP, 3],
      [SU, 20],
      [A, 17],
      [A, 19],
      [A, 22],
      [A, 31],
    ],
  ],
  [
    3,
    'Jawatankuasa 3K (Kebersihan, Kesihatan dan Keselamatan)',
    '',
    'sederhana',
    [
      [P, 1],
      [NP, 3],
      [SU, 33],
      [A, 21],
      [A, 24],
      [A, 45],
    ],
  ],
  [
    3,
    'Guru Tingkatan',
    'Pengurusan Kelas',
    'sederhana',
    [
      [GT, 25, '1 Amanah'],
      [GT, 0, '1 Bestari'],
      [GT, 16, '2 Amanah'],
      [GT, 34, '3 Amanah'],
      [GT, 14, '4 Sains'],
      [GT, 0, '4 Sastera'],
      [GT, 23, '5 Sains'],
    ],
  ],
  // Kokurikulum
  [
    4,
    'Jawatankuasa Kokurikulum Sekolah',
    '',
    'sederhana',
    [
      [P, 1],
      [NP, 4],
      [SU, 21],
      [PSU, 13],
      [A, 35],
      [A, 10],
    ],
  ],
  [
    4,
    'Jawatankuasa Pembangunan Sukan Sekolah',
    '',
    'sederhana',
    [
      [P, 1],
      [NP, 4],
      [SU, 21],
      [A, 35],
      [A, 28],
      [A, 37],
    ],
  ],
  [
    4,
    'Jawatankuasa Pentaksiran Aktiviti Jasmani, Sukan dan Kokurikulum (PAJSK)',
    '',
    'berat',
    [
      [P, 1],
      [NP, 4],
      [PEN, 12],
      [A, 21],
      [A, 18],
    ],
  ],
  [4, 'Pengakap', 'Unit Beruniform', 'sederhana', [[KGP, 26], [GP, 33], [GP, 0], [GP, 0]]],
  [4, 'Persatuan Bulan Sabit Merah Malaysia (PBSM)', 'Unit Beruniform', 'sederhana', [[KGP, 24], [GP, 31], [GP, 38], [GP, 18]]],
  [4, 'Kelab Bola Sepak', 'Sukan dan Permainan', 'sederhana', [[KGP, 35], [JUR, 28], [GP, 16], [GP, 37]]],
  // Tingkatan 6
  [
    5,
    'Jawatankuasa Induk Pengurusan Tingkatan 6',
    '',
    'sederhana',
    [
      [P, 1],
      [NP, 5],
      [SU, 40],
      [A, 39],
      [A, 41],
      [A, 19],
    ],
  ],
  [
    5,
    'Jawatankuasa Pentaksiran Berasaskan Sekolah (PBS) STPM',
    '',
    'berat',
    [
      [P, 5],
      [PEN, 39],
      [A, 40],
      [A, 41],
    ],
  ],
  [5, 'Majlis Perwakilan Pelajar Tingkatan 6', '', 'sederhana', [[NAS, 5], [KGP, 41], [GP, 40], [GP, 39]]],
  // PPKI
  [
    6,
    'Jawatankuasa Pengurusan Program Pendidikan Khas Integrasi (PPKI)',
    '',
    'sederhana',
    [
      [P, 1],
      [NP, 6],
      [SU, 36],
      [A, 37],
      [A, 38],
      [A, 46],
    ],
  ],
  [
    6,
    'Jawatankuasa Rancangan Pendidikan Individu (RPI)',
    '',
    'berat',
    [
      [P, 6],
      [PEN, 36],
      [A, 37],
      [A, 38],
    ],
  ],
  [
    6,
    'Jawatankuasa Program Pendidikan Inklusif (PPI)',
    '',
    'sederhana',
    [
      [P, 6],
      [PEN, 38],
      [A, 37],
      [A, 15],
      [A, 7],
    ],
  ],
];

export function createDemoStore(): AppStoreData {
  const guru: Teacher[] = GURU_RAW.map((g, i) => ({
    id: `g${i + 1}`,
    nama: g[0],
    gred: g[1],
    jawatan: g[2],
    opsyen: g[3],
    waktu: g[4],
    kategori: g[5],
    analisis: g[5] === 'guru',
    catatan: '',
    urutan: i + 1,
  }));

  const bahagian: Division[] = BAHAGIAN_RAW.map((b, i) => ({
    id: `b${i + 1}`,
    jenis: b[0],
    nama: b[1],
    singkatan: b[2],
    urutan: i + 1,
    aktif: true,
  }));

  let bilAhli = 0;
  const urutanBahagian: Record<string, number> = {};
  const jk: Committee[] = JK_RAW.map((j, i) => {
    const bid = `b${j[0]}`;
    urutanBahagian[bid] = (urutanBahagian[bid] || 0) + 1;
    return {
      id: `j${i + 1}`,
      bahagianId: bid,
      urutan: urutanBahagian[bid],
      nama: j[1],
      kumpulan: j[2],
      tahap: j[3],
      bidang: j[5] || '',
      ahli: j[4].map((a) => {
        const luar = typeof a[1] === 'string';
        return {
          id: `a${++bilAhli}`,
          jawatan: a[0],
          butiran: a[2] || '',
          guruId: !luar && a[1] ? `g${a[1]}` : null,
          nama: luar ? String(a[1]) : '',
          mata: null,
        };
      }),
    };
  });

  const tetapan: WeightSettings = {
    ...TETAPAN_LALAI,
    status: {
      b1: { siap: true, oleh: 'Pn. Hjh. Norhayati binti Abdullah', pada: 1793836800 },
      b5: { siap: true, oleh: 'Dr. Faridah binti Osman', pada: 1794096000 },
    },
    buku: defaultBookConfig('SMK Seri Contoh', 'Ilmu Suluh Hidup'),
    surat: defaultLetterConfig('SMK Seri Contoh', 'Jalan Pendidikan 1, 43000 Kajang, Selangor'),
  };

  const session2027: SessionPayload = {
    tahun: { id: 't2027', label: '2027', aktif: true, kunci: false },
    tetapan,
    bahagian,
    guru,
    jk,
  };

  const pengguna: UserAccount[] = [
    { id: 'u1', nama: 'Pentadbir Demo', emel: 'demo@contoh.my', peranan: 'admin', bahagian: [], aktif: true },
    { id: 'u2', nama: 'En. Lim Wei Jian', emel: 'pkhem@contoh.my', peranan: 'pentadbir', bahagian: ['b3'], aktif: true },
    { id: 'u3', nama: 'En. Muthu a/l Krishnan', emel: 'pkkoku@contoh.my', peranan: 'pentadbir', bahagian: ['b4'], aktif: true },
    { id: 'u4', nama: 'Dr. Faridah binti Osman', emel: 'pkt6@contoh.my', peranan: 'pentadbir', bahagian: ['b5'], aktif: true },
    { id: 'u5', nama: 'Pn. Siti Aminah binti Hassan', emel: 'guru@contoh.my', peranan: 'pemerhati', bahagian: [], aktif: true },
  ];

  return {
    sekolah: {
      kod: 'DEMO001',
      nama: 'SMK Seri Contoh',
      jenis: 'SMK',
      peringkat: 'menengah',
      alamat: 'Jalan Pendidikan 1',
      poskod: '43000',
      bandar: 'Kajang',
      negeri: 'Selangor',
      telefon: '03-0000 0000',
      emel: 'pentadbiran@smksericontoh.edu.my',
      moto: 'Ilmu Suluh Hidup',
      logo: LOGO_SEKOLAH_SVG,
    },
    pengguna,
    penggunaAktifId: 'u1',
    sesiAktifId: 't2027',
    sesi: {
      t2027: session2027,
    },
  };
}
