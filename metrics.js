export const fmt = (n) => Number(n || 0).toLocaleString('en-US');
export const pct = (n) => `${Number(n || 0).toFixed(1)}%`;

export function filterRows(rows, filters) {
  return rows.filter(r => {
    if (filters.from && r.date < filters.from) return false;
    if (filters.to && r.date > filters.to) return false;
    if (filters.month !== 'ALL' && r.month !== filters.month) return false;
    if (filters.line !== 'ALL' && r.line !== filters.line) return false;
    if (filters.shift !== 'ALL' && r.shift !== filters.shift) return false;
    if (filters.menu !== 'ALL' && r.menu !== filters.menu) return false;
    return true;
  });
}

export function summarize(rows) {
  const output = rows.reduce((s,r)=>s+r.output,0);
  const order = rows.reduce((s,r)=>s+r.order,0);
  const gap = output - order;
  const achievement = order ? output / order * 100 : 0;
  const cnRisk = rows.filter(r=>r.achievement < 80).length;
  return { output, order, gap, achievement, cnRisk, records: rows.length };
}

export function groupBy(rows, key, value='output') {
  const map = new Map();
  rows.forEach(r => map.set(r[key] || 'ไม่ระบุ', (map.get(r[key] || 'ไม่ระบุ') || 0) + Number(r[value] || 0)));
  return Array.from(map, ([name, amount]) => ({ name, amount })).sort((a,b)=>b.amount-a.amount);
}

export function trendByDate(rows) {
  const map = new Map();
  rows.forEach(r => {
    if (!r.date) return;
    const prev = map.get(r.date) || { date:r.date, output:0, order:0 };
    prev.output += r.output; prev.order += r.order;
    map.set(r.date, prev);
  });
  return Array.from(map.values()).sort((a,b)=>a.date.localeCompare(b.date)).map(d=>({ ...d, achievement: d.order ? d.output/d.order*100 : 0 }));
}

export function topGap(rows) {
  const map = new Map();
  rows.forEach(r => {
    const k = r.menu || 'ไม่ระบุเมนู';
    const prev = map.get(k) || { name:k, output:0, order:0, gap:0 };
    prev.output += r.output; prev.order += r.order; prev.gap = prev.output - prev.order;
    map.set(k, prev);
  });
  return Array.from(map.values()).sort((a,b)=>a.gap-b.gap).slice(0,10);
}

export function traffic(rows) {
  return trendByDate(rows).map(d=>({ ...d, status: d.achievement >= 100 ? 'green' : d.achievement >= 80 ? 'yellow' : 'red' }));
}
