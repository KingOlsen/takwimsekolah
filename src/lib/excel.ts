import type { TeacherCategory } from '../types/tugasadil';

export type ImportField = '' | 'nama' | 'gred' | 'jawatan' | 'opsyen' | 'waktu';

export interface ParsedSheet {
  nama: string;
  baris: string[][];
}

const HAD_BARIS = 2000;
const HAD_LAJUR = 40;

function kemas(s: unknown): string {
  return String(s == null ? '' : s)
    .replace(/[\u00a0\u200b-\u200f\ufeff]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseCsvText(teks: string): ParsedSheet[] {
  const clean = String(teks).replace(/^\ufeff/, '');
  const contoh = clean.slice(0, 4000);
  const kira = (c: string) => contoh.split(c).length - 1;
  const pemisah =
    kira('\t') >= kira(';') && kira('\t') >= kira(',') && kira('\t') > 0
      ? '\t'
      : kira(';') > kira(',')
      ? ';'
      : ',';

  const baris: string[][] = [];
  let r: string[] = [];
  let sel = '';
  let petik = false;

  for (let i = 0; i < clean.length; i++) {
    const c = clean.charAt(i);
    if (petik) {
      if (c === '"') {
        if (clean.charAt(i + 1) === '"') {
          sel += '"';
          i++;
        } else {
          petik = false;
        }
      } else {
        sel += c;
      }
    } else if (c === '"' && sel === '') {
      petik = true;
    } else if (c === pemisah) {
      r.push(kemas(sel));
      sel = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && clean.charAt(i + 1) === '\n') i++;
      r.push(kemas(sel));
      sel = '';
      baris.push(r);
      r = [];
      if (baris.length >= HAD_BARIS) break;
    } else {
      sel += c;
    }
  }
  if (sel !== '' || r.length) {
    r.push(kemas(sel));
    baris.push(r);
  }
  return [
    {
      nama: 'CSV / Teks',
      baris: baris.map((x) => x.slice(0, HAD_LAJUR)).filter((x) => x.some(Boolean)),
    },
  ];
}

function u16(d: Uint8Array, i: number) {
  return d[i] | (d[i + 1] << 8);
}
function u32(d: Uint8Array, i: number) {
  return (d[i] | (d[i + 1] << 8) | (d[i + 2] << 16) | (d[i + 3] << 24)) >>> 0;
}

async function nyahmampat(bait: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream === 'undefined') {
    throw new Error('Pelayar ini tidak menyokong penyahmampatan .xlsx. Sila simpan sebagai CSV.');
  }
  const ds = new DecompressionStream('deflate-raw');
  const w = ds.writable.getWriter();
  await w.write(new Uint8Array(bait));
  await w.close();
  const ab = await new Response(ds.readable).arrayBuffer();
  return new Uint8Array(ab);
}

function bukaZip(buf: ArrayBuffer): Record<string, () => Promise<string>> {
  const d = new Uint8Array(buf);
  let eocd = -1;
  for (let i = d.length - 22; i >= 0 && i > d.length - 66000; i--) {
    if (u32(d, i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error('Fail ini bukan fail Excel (.xlsx) yang sah.');
  const bil = u16(d, eocd + 10);
  let p = u32(d, eocd + 16);
  const fail: Record<string, () => Promise<string>> = {};
  const dec = new TextDecoder('utf-8');

  for (let n = 0; n < bil && p + 46 <= d.length; n++) {
    if (u32(d, p) !== 0x02014b50) break;
    const kaedah = u16(d, p + 10);
    const saizMampat = u32(d, p + 20);
    const pjNama = u16(d, p + 28);
    const pjTambah = u16(d, p + 30);
    const pjKomen = u16(d, p + 32);
    const tempat = u32(d, p + 42);
    const nama = dec.decode(d.subarray(p + 46, p + 46 + pjNama));

    fail[nama] = async () => {
      const mula = tempat + 30 + u16(d, tempat + 26) + u16(d, tempat + 28);
      const bait = d.subarray(mula, mula + saizMampat);
      if (kaedah === 0) return dec.decode(bait);
      if (kaedah === 8) return dec.decode(await nyahmampat(bait));
      throw new Error('Mampatan fail Excel tidak disokong.');
    };
    p += 46 + pjNama + pjTambah + pjKomen;
  }
  return fail;
}

function lajurDaripada(rujukan: string | null): number {
  const m = /^([A-Z]+)/.exec(rujukan || '');
  if (!m) return -1;
  let n = 0;
  for (let i = 0; i < m[1].length; i++) n = n * 26 + (m[1].charCodeAt(i) - 64);
  return n - 1;
}

async function bacaXlsx(buf: ArrayBuffer): Promise<ParsedSheet[]> {
  const zip = bukaZip(buf);
  if (!zip['xl/workbook.xml']) throw new Error('Fail ini bukan buku kerja Excel (.xlsx).');
  const parser = new DOMParser();
  const xml = (t: string) => parser.parseFromString(t, 'application/xml');
  const semua = (el: Document | Element, nama: string) => Array.from(el.getElementsByTagNameNS('*', nama));

  const kongsi: string[] = [];
  if (zip['xl/sharedStrings.xml']) {
    const sst = await zip['xl/sharedStrings.xml']();
    semua(xml(sst), 'si').forEach((si) => {
      kongsi.push(
        semua(si, 't')
          .filter((x) => !x.parentNode || (x.parentNode as Element).localName !== 'rPh')
          .map((x) => x.textContent || '')
          .join('')
      );
    });
  }

  const wbStr = await zip['xl/workbook.xml']();
  const relStr = zip['xl/_rels/workbook.xml.rels'] ? await zip['xl/_rels/workbook.xml.rels']() : '';
  const sasaran: Record<string, string> = {};
  if (relStr) {
    semua(xml(relStr), 'Relationship').forEach((x) => {
      const id = x.getAttribute('Id');
      const target = x.getAttribute('Target');
      if (id && target) sasaran[id] = target;
    });
  }

  const helaian = semua(xml(wbStr), 'sheet')
    .map((s, i) => {
      const rid =
        s.getAttribute('r:id') ||
        s.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id') ||
        '';
      const t = sasaran[rid] || `worksheets/sheet${i + 1}.xml`;
      return {
        nama: s.getAttribute('name') || `Helaian ${i + 1}`,
        fail: t.startsWith('/') ? t.slice(1) : `xl/${t.replace(/^\.\//, '')}`,
      };
    })
    .filter((s) => !!zip[s.fail])
    .slice(0, 12);

  if (!helaian.length) throw new Error('Tiada helaian dijumpai dalam fail ini.');

  const out: ParsedSheet[] = [];
  for (const s of helaian) {
    const t = await zip[s.fail]();
    const baris: string[][] = [];
    semua(xml(t), 'row')
      .slice(0, HAD_BARIS)
      .forEach((row) => {
        const r: string[] = [];
        let seterusnya = 0;
        semua(row, 'c').forEach((c) => {
          let k = lajurDaripada(c.getAttribute('r'));
          if (k < 0) k = seterusnya;
          seterusnya = k + 1;
          if (k >= HAD_LAJUR) return;
          const jenis = c.getAttribute('t');
          const v = semua(c, 'v')[0];
          let nilai = '';
          if (jenis === 'inlineStr') {
            nilai = semua(c, 't')
              .map((x) => x.textContent || '')
              .join('');
          } else if (v) {
            nilai = jenis === 's' ? kongsi[parseInt(v.textContent || '0', 10)] || '' : v.textContent || '';
          }
          if (!jenis && /^-?\d+\.\d{6,}$/.test(nilai)) {
            nilai = String(Math.round(parseFloat(nilai) * 100) / 100);
          }
          r[k] = kemas(nilai);
        });
        for (let i = 0; i < r.length; i++) if (r[i] == null) r[i] = '';
        if (r.some(Boolean)) baris.push(r);
      });
    if (baris.length) out.push({ nama: s.nama, baris });
  }
  return out;
}

export async function readSpreadsheetFile(file: File): Promise<ParsedSheet[]> {
  if (file.size > 8 * 1024 * 1024) {
    throw new Error('Fail melebihi 8 MB.');
  }
  const name = file.name.toLowerCase();
  if (name.endsWith('.xls')) {
    throw new Error('Fail .xls lama tidak disokong. Sila simpan sebagai .xlsx atau .csv.');
  }
  if (/\.(csv|tsv|txt)$/.test(name)) {
    const text = await file.text();
    const sheets = parseCsvText(text);
    if (!sheets[0]?.baris.length) throw new Error('Fail ini kosong.');
    return sheets;
  }
  if (name.endsWith('.xlsx')) {
    const buf = await file.arrayBuffer();
    const sheets = await bacaXlsx(buf);
    if (!sheets.length) throw new Error('Fail Excel ini kosong.');
    return sheets;
  }
  throw new Error('Sila pilih fail Excel (.xlsx) atau CSV (.csv).');
}

const CORAK_TAJUK: Record<Exclude<ImportField, ''>, RegExp> = {
  nama: /^(nama|name)\b(?!.*(ibu|bapa|waris|sekolah|pasangan|kelas))/i,
  gred: /\bgred\b|^dg$|grade/i,
  jawatan: /jawatan|tugas hakiki|position/i,
  opsyen: /opsyen|option|opsion|pengkhususan|major|bidang/i,
  waktu: /waktu|masa mengajar|\bwkt\b|periods?/i,
};

const CORAK_GRED = /^(dg[a-z]?|n|ft|kp|ga|s|c|h|w|j|u|ja)\s?-?\d{1,2}\b|^jusa|^gred khas/i;
const CORAK_JAWATAN = /guru|pengetua|penolong|pembantu|ketua|kaunselor|pentadbir|juruteknik|pengawal|penyelia|pekerja|warden|jurulatih/i;

export function guessColumns(baris: string[][]): { tajuk: number; lajur: ImportField[] } {
  const bilLajur = baris.reduce((m, r) => Math.max(m, r.length), 0);
  const lajur: ImportField[] = Array(bilLajur).fill('');
  let tajuk = -1;

  for (let i = 0; i < Math.min(baris.length, 5); i++) {
    const r = baris[i];
    const padanRow = r.filter((c) => Object.values(CORAK_TAJUK).some((rx) => rx.test(c))).length;
    if (padanRow >= 1 && r.some((c) => CORAK_TAJUK.nama.test(c))) {
      tajuk = i;
      break;
    }
  }

  if (tajuk >= 0) {
    const header = baris[tajuk];
    header.forEach((h, idx) => {
      for (const [k, rx] of Object.entries(CORAK_TAJUK) as [Exclude<ImportField, ''>, RegExp][]) {
        if (rx.test(h) && !lajur.includes(k)) {
          lajur[idx] = k;
          break;
        }
      }
    });
    return { tajuk, lajur };
  }

  const start = 0;
  const sample = baris.slice(start, start + 15);
  for (let c = 0; c < bilLajur; c++) {
    const vals = sample.map((r) => r[c] || '').filter(Boolean);
    if (!vals.length) continue;
    const gredHits = vals.filter((v) => CORAK_GRED.test(v)).length;
    const numHits = vals.filter((v) => /^\d+(\.\d+)?$/.test(v) && Number(v) <= 45).length;
    const jawHits = vals.filter((v) => CORAK_JAWATAN.test(v)).length;

    if (gredHits >= vals.length * 0.5 && !lajur.includes('gred')) {
      lajur[c] = 'gred';
    } else if (numHits >= vals.length * 0.6 && vals.every((v) => Number(v) < 60) && !lajur.includes('waktu')) {
      lajur[c] = 'waktu';
    } else if (jawHits >= vals.length * 0.4 && !lajur.includes('jawatan')) {
      lajur[c] = 'jawatan';
    } else if (!lajur.includes('nama') && vals.some((v) => v.length > 4 && /[a-zA-Z]/.test(v))) {
      lajur[c] = 'nama';
    }
  }
  return { tajuk, lajur };
}

export function tekaKategoriDariJawatan(jawatan: string, gred: string): TeacherCategory {
  const j = jawatan.toLowerCase();
  if (/^(pengetua|guru besar|penolong kanan|\bpk\b|penyelia petang)/.test(j)) return 'pentadbir';
  if (/pembantu tadbir|pembantu pengurusan|juruteknik|juruukur|kerani|pekerja|pengawal|pemandu|staf/.test(j))
    return 'staf';
  const g = gred.toUpperCase().trim();
  if (/^(N|FT|KP|H|W|C|U|J|S)\d/.test(g) && !/DG/.test(g)) return 'staf';
  return 'guru';
}

export function buildCsv(rows: (string | number)[][]): string {
  return rows
    .map((r) =>
      r
        .map((c) => {
          const s = String(c ?? '');
          return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(',')
    )
    .join('\n');
}

export function downloadTextFile(filename: string, content: string, mime = 'text/csv;charset=utf-8') {
  const blob = new Blob(['\ufeff' + content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Reliable print helper that works both in standalone tabs and inside sandboxed preview iframes.
 * Clones the current document's stylesheets and target printable content into a dedicated
 * hidden print iframe and triggers print() on its contentWindow, falling back to window.print().
 */
export function printDocument(options?: { selector?: string; title?: string; onAfterPrint?: () => void }) {
  const selector = options?.selector;
  const targetEl = selector ? (document.querySelector(selector) as HTMLElement | null) : null;

  try {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    const win = iframe.contentWindow;
    if (!doc || !win) {
      iframe.remove();
      window.print();
      options?.onAfterPrint?.();
      return;
    }

    const styleLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((node) => node.outerHTML)
      .join('\n');

    const sourceHtml = targetEl
      ? targetEl.outerHTML
      : (document.querySelector('main.print-main') || document.body).innerHTML;

    doc.open();
    doc.write(`<!doctype html>
<html lang="ms">
  <head>
    <meta charset="UTF-8" />
    <title>${options?.title || document.title}</title>
    ${styleLinks}
    <style>
      html, body {
        background: #ffffff !important;
        color: #000000 !important;
        margin: 0 !important;
        padding: 0 !important;
        height: auto !important;
        overflow: visible !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .no-print {
        display: none !important;
      }
      .print-only-root {
        zoom: 1 !important;
        transform: none !important;
        margin: 0 auto !important;
        box-shadow: none !important;
      }
      @page {
        size: A4 portrait;
        margin: 12mm 14mm;
      }
    </style>
  </head>
  <body>
    <div class="print-shell print-main">${sourceHtml}</div>
  </body>
</html>`);
    doc.close();

    const cleanup = () => {
      options?.onAfterPrint?.();
      setTimeout(() => {
        iframe.remove();
      }, 1500);
    };

    const runPrint = () => {
      try {
        win.focus();
        win.print();
      } catch {
        window.print();
      } finally {
        cleanup();
      }
    };

    if (doc.readyState === 'complete') {
      setTimeout(runPrint, 250);
    } else {
      iframe.onload = () => setTimeout(runPrint, 250);
    }
  } catch {
    window.print();
    options?.onAfterPrint?.();
  }
}

