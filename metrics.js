export const number = (value) => {
  if (value === null || value === undefined) return 0;
  const n = Number(String(value).replace(/,/g, '').replace('%', '').trim());
  return Number.isFinite(n) ? n : 0;
};

export const pick = (row, names, fallback = '') => {
  for (const name of names) {
    if (row[name] !== undefined && row[name] !== '') return row[name];
  }
  const lower = Object.keys(row).find(k => names.map(x => x.toLowerCase()).includes(k.toLowerCase()));
  return lower ? row[lower] : fallback;
};

export const getDateValue = (row) => pick(row, ['REAL DATE', 'Date', 'date', 'วันที่', 'วันที่ Stamp', 'Date Stamp', 'Stamp Date']);
export const getMenu = (row) => pick(row, ['เมนู', 'Menu', 'Product', 'Item', 'สินค้า'], 'Unknown');
export const getLine = (row) => pick(row, ['Line', 'ไลน์', 'ไลน์ผลิต', 'Production Line'], 'All');
export const getShift = (row) => pick(row, ['Shift', 'กะ'], 'All');
export const getOutput = (row) => number(pick(row, ['จำนวนผลิตได้', 'Output', 'Output Qty', 'Daily output', 'output', 'Actual']));
export const getOrder = (row) => number(pick(row, ['Daily Order', 'Order', 'order', 'Plan', 'Target']));
export const getGap = (row) => getOutput(row) - getOrder(row);

export function normalizeDate(value) {
  if (!value) return '';
  const s = String(value).trim();
  const iso = s.match(/(20\d{2})[-/](\d{1,2})[-/](\d{1,2})/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, '0')}-${iso[3].padStart(2, '0')}`;
  const th = s.match(/(\d{1,2})[-/](\d{1,2})[-/](25\d{2}|20\d{2})/);
  if (th) {
    const y = Number(th[3]) > 2400 ? Number(th[3]) - 543 : Number(th[3]);
    return `${y}-${th[2].padStart(2, '0')}-${th[1].padStart(2, '0')}`;
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : d.toISOString().slice(0, 10);
}

export function enrichRows(rows) {
  return rows.map((row, idx) => {
    const date = normalizeDate(getDateValue(row));
    const output = getOutput(row);
    const order = getOrder(row);
    const achievement = order ? (output / order) * 100 : number(pick(row, ['Achievement %', 'Achievement', 'Status Output', 'Trend output']));
    const status = achievement >= 100 ? 'green' : achievement >= 80 ? 'yellow' : 'red';
    return {
      id: pick(row, ['OutputID', 'ID'], `R${idx + 1}`),
      raw: row,
      date,
      month: date ? date.slice(0, 7) : 'Unknown',
      menu: getMenu(row),
      line: getLine(row),
      shift: getShift(row),
      output,
      order,
      gap: output - order,
      achievement,
      status,
      insight: pick(row, ['Executive Insight', 'Insight', 'หมายเหตุ'], '')
    };
  }).filter(r => r.date || r.output || r.order);
}

export function aggregate(rows) {
  const output = rows.reduce((sum, r) => sum + r.output, 0);
  const order = rows.reduce((sum, r) => sum + r.order, 0);
  const gap = output - order;
  const achievement = order ? (output / order) * 100 : 0;
  const byDate = Object.values(rows.reduce((acc, r) => {
    const key = r.date || 'Unknown';
    acc[key] ||= { date: key, output: 0, order: 0 };
    acc[key].output += r.output;
    acc[key].order += r.order;
    return acc;
  }, {})).sort((a, b) => a.date.localeCompare(b.date)).map(r => ({...r, achievement: r.order ? r.output / r.order * 100 : 0}));
  const byMenu = Object.values(rows.reduce((acc, r) => {
    const key = r.menu || 'Unknown';
    acc[key] ||= { name: key, output: 0, order: 0, gap: 0 };
    acc[key].output += r.output;
    acc[key].order += r.order;
    acc[key].gap += r.gap;
    return acc;
  }, {})).sort((a,b) => b.output - a.output);
  const byLine = Object.values(rows.reduce((acc, r) => {
    const key = r.line || 'All';
    acc[key] ||= { name: key, output: 0, order: 0 };
    acc[key].output += r.output;
    acc[key].order += r.order;
    return acc;
  }, {})).map(x => ({...x, achievement: x.order ? x.output/x.order*100 : 0})).sort((a,b)=>b.achievement-a.achievement);
  return { output, order, gap, achievement, byDate, byMenu, byLine };
}
