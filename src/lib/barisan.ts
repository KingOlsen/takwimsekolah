import type { Committee, CommitteeMember, Division, DivisionType, Teacher } from '../types/tugasadil';

export type LeadershipRoleKey = 'ketua' | 'pentadbiran' | 'hem' | 'koku' | 't6' | 'ppki' | 'petang';

export const PERANAN_BARISAN: { key: LeadershipRoleKey; label: string }[] = [
  { key: 'ketua', label: 'Pengerusi (Pengetua / Guru Besar)' },
  { key: 'pentadbiran', label: 'PK Pentadbiran' },
  { key: 'hem', label: 'PK Hal Ehwal Murid' },
  { key: 'koku', label: 'PK Kokurikulum' },
  { key: 't6', label: 'PK Tingkatan 6' },
  { key: 'ppki', label: 'PK Pendidikan Khas' },
  { key: 'petang', label: 'PK Petang / Penyelia Petang' },
];

const POLA_BARISAN = /^(pengerusi|timbalan pengerusi|naib pengerusi)(\s*[0-9ivx]+)?$/i;
const PK_REGEX = /penolong\s+kanan|\bg?pk\b/i;

export function perananHakiki(jawatan: string): LeadershipRoleKey | '' {
  const j = String(jawatan || '').toLowerCase().replace(/\s+/g, ' ').trim();
  if (!j) return '';
  if (/^(pengetua|guru besar)\b/.test(j) && !/penolong|pembantu|timbalan/.test(j)) return 'ketua';
  if (/penyelia petang/.test(j)) return 'petang';
  if (!PK_REGEX.test(j)) return '';
  if (/hal ehwal murid|\bhem\b/.test(j)) return 'hem';
  if (/ko-?kurikulum|\bkoku\b|\bkoko\b/.test(j)) return 'koku';
  if (/tingkatan\s*(6|enam)|ting\.?\s*(6|enam)|\bt6\b|pra-?u/.test(j)) return 't6';
  if (/pendidikan khas|\bppki\b|\bkhas\b/.test(j)) return 'ppki';
  if (/petang/.test(j)) return 'petang';
  return 'pentadbiran';
}

export function kesanBarisan(guru: Teacher[]): Record<LeadershipRoleKey, string | null> {
  const res: Record<LeadershipRoleKey, string | null> = {
    ketua: null,
    pentadbiran: null,
    hem: null,
    koku: null,
    t6: null,
    ppki: null,
    petang: null,
  };
  for (const g of guru) {
    const p = perananHakiki(g.jawatan);
    if (p && !res[p]) res[p] = g.id;
  }
  return res;
}

export function susunanBarisan(jenis: DivisionType, siapa: Record<LeadershipRoleKey, string | null>): (string | null)[] {
  const utama: LeadershipRoleKey =
    jenis === 'hem' || jenis === 'asrama'
      ? 'hem'
      : jenis === 'koku'
      ? 'koku'
      : jenis === 't6'
      ? 't6'
      : jenis === 'ppki'
      ? 'ppki'
      : jenis === 'petang'
      ? 'petang'
      : 'pentadbiran';

  const lain: LeadershipRoleKey[] = (['pentadbiran', 'hem', 'koku', 't6', 'ppki', 'petang'] as LeadershipRoleKey[]).filter(
    (p) => p !== utama
  );
  const khusus = utama === 't6' || utama === 'ppki' || utama === 'petang';
  const keluar: (string | null)[] = [];
  if (siapa[utama]) keluar.push(siapa[utama]);
  else if (khusus) keluar.push(null);

  lain.forEach((p) => {
    if (siapa[p]) keluar.push(siapa[p]);
  });
  return keluar;
}

export function isiBarisanJk(
  jk: Committee,
  jenis: DivisionType,
  siapa: Record<LeadershipRoleKey, string | null>
): { ahli: CommitteeMember[]; bil: number } {
  let bil = 0;
  const ada: Record<string, boolean> = {};
  const ahli = (jk.ahli || []).map((a) => {
    if (a.guruId) ada[a.guruId] = true;
    return { ...a };
  });

  const giliran = susunanBarisan(jenis, siapa).filter((id) => id === null || !ada[id]);

  ahli.forEach((a) => {
    const j = String(a.jawatan || '').trim();
    if (!POLA_BARISAN.test(j)) return;
    const kosong = !a.guruId && !String(a.nama || '').trim();
    if (/^pengerusi$/i.test(j)) {
      if (kosong && siapa.ketua && !ada[siapa.ketua]) {
        a.guruId = siapa.ketua;
        ada[siapa.ketua] = true;
        bil++;
      }
      return;
    }
    if (!kosong) return;
    const id = giliran.shift();
    if (id) {
      a.guruId = id;
      ada[id] = true;
      bil++;
    }
  });

  return { ahli, bil };
}

export function rancangBarisan(
  jks: Committee[],
  bahagian: Division[],
  siapa: Record<LeadershipRoleKey, string | null>,
  allowedBahagianIds?: Set<string>
): { jk: Committee; ahli: CommitteeMember[]; bil: number }[] {
  const jenisMap: Record<string, DivisionType> = {};
  bahagian.forEach((b) => {
    jenisMap[b.id] = b.jenis;
  });

  return jks
    .filter((j) => !allowedBahagianIds || allowedBahagianIds.has(j.bahagianId))
    .map((j) => {
      const r = isiBarisanJk(j, jenisMap[j.bahagianId] || 'pentadbiran', siapa);
      return { jk: j, ahli: r.ahli, bil: r.bil };
    })
    .filter((x) => x.bil > 0);
}
