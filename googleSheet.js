import Papa from 'papaparse';

export const SHEET_ID = '1dxNnhgPRjO1Fw53ClaHxXeE64Xm4Im1xARuCx7JNzDU';
export const SHEETS = [
  { name: 'ALL_DATA.outputOEE', gid: '649828711', primary: true },
  { name: 'Order.outputSAP', gid: '', primary: false },
  { name: 'ORDER', gid: '', primary: false }
];

const demoRows = [
  { date:'2026-06-01', month:'2026-06', line:'Topseal', menu:'Sandwich A', output: 15420, order: 17000, gap:-1580, achievement:90.7, shift:'D', status:'yellow', insight:'Output ต่ำกว่า Order จาก Topseal gap 1,580 pc' },
  { date:'2026-06-02', month:'2026-06', line:'FFS1', menu:'Burger B', output: 23100, order: 22000, gap:1100, achievement:105, shift:'N', status:'green', insight:'FFS1 ทำได้เกินเป้าหมาย' },
  { date:'2026-06-03', month:'2026-06', line:'Onigiri', menu:'Onigiri Tuna', output: 18200, order: 24000, gap:-5800, achievement:75.8, shift:'D', status:'red', insight:'Onigiri ต่ำกว่า buffer 80% ต้องติดตาม' },
  { date:'2026-07-01', month:'2026-07', line:'Sushi', menu:'Sushi Set', output: 12100, order: 12000, gap:100, achievement:100.8, shift:'D', status:'green', insight:'Sushi ปิด Order ได้ครบ' },
  { date:'2026-07-02', month:'2026-07', line:'Banding', menu:'Salad Roll', output: 19800, order: 25000, gap:-5200, achievement:79.2, shift:'N', status:'red', insight:'Banding ต่ำกว่า buffer จาก gap สูง' }
];

function getValue(row, names) {
  for (const key of Object.keys(row)) {
    const k = key.toLowerCase().replace(/\s+/g,'').trim();
    for (const name of names) {
      if (k === name.toLowerCase().replace(/\s+/g,'').trim()) return row[key];
    }
  }
  return '';
}

function toNumber(v) {
  if (v === null || v === undefined) return 0;
  const n = Number(String(v).replace(/,/g,'').replace('%','').trim());
  return Number.isFinite(n) ? n : 0;
}

function normalizeDate(v, year, month, day) {
  if (v) {
    const s = String(v).trim();
    const m1 = s.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (m1) return `${m1[1]}-${String(m1[2]).padStart(2,'0')}-${String(m1[3]).padStart(2,'0')}`;
    const m2 = s.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (m2) return `${m2[3]}-${String(m2[2]).padStart(2,'0')}-${String(m2[1]).padStart(2,'0')}`;
  }
  if (year && month && day) return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  return '';
}

export function normalizeRows(rawRows) {
  return rawRows.map((r, i) => {
    const year = getValue(r, ['Year','ปี']);
    const monthNum = getValue(r, ['Month','เดือน']);
    const day = getValue(r, ['Day','วัน']);
    const date = normalizeDate(getValue(r, ['REAL DATE','Date','วันที่','Date Stamp','Stamp Date']), year, monthNum, day);
    const output = toNumber(getValue(r, ['จำนวนผลิตได้','Output','Output Qty','Daily output','Trend output','Out put (pc)','Good Output']));
    const order = toNumber(getValue(r, ['order','Order','Daily Order','Order Qty','Plan','Forecast']));
    const gapRaw = getValue(r, ['Gap','Gap Qty','ผลต่าง']);
    const gap = gapRaw !== '' ? toNumber(gapRaw) : output - order;
    const achRaw = getValue(r, ['Achievement %','Achievement','%Achievement','Status Output','% output','Output %']);
    const achievement = achRaw !== '' ? toNumber(achRaw) : (order ? output / order * 100 : 0);
    const line = getValue(r, ['Line','ไลน์','Lineผลิต','Production Line','เครื่อง']) || 'ไม่ระบุไลน์';
    const menu = getValue(r, ['เมนู','Menu','Product','Item','ชื่อเมนู']) || 'ไม่ระบุเมนู';
    const shift = getValue(r, ['Shift','กะ']) || 'All';
    const status = achievement >= 100 ? 'green' : achievement >= 80 ? 'yellow' : 'red';
    return {
      id: i + 1,
      date,
      month: date ? date.slice(0,7) : String(monthNum || ''),
      year: date ? date.slice(0,4) : String(year || ''),
      line, menu, shift, output, order, gap, achievement,
      status,
      insight: getValue(r, ['Executive Insight','Insight','หมายเหตุ']) || '',
      raw: r
    };
  }).filter(r => r.date || r.output || r.order);
}

export async function fetchSheetRows(gid='649828711') {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}&cacheBust=${Date.now()}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Google Sheet HTTP ${res.status}`);
  const text = await res.text();
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  if (parsed.errors?.length) console.warn(parsed.errors);
  return normalizeRows(parsed.data);
}

export async function loadOutputData() {
  try {
    const rows = await fetchSheetRows('649828711');
    if (!rows.length) throw new Error('No rows');
    return { rows, source: 'LIVE GOOGLE SHEET', isLive: true, error: '' };
  } catch (err) {
    return { rows: demoRows, source: 'DEMO FALLBACK', isLive: false, error: err.message };
  }
}
