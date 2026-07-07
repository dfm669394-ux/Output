export const SHEET_ID = '1dxNnhgPRjO1Fw53ClaHxXeE64Xm4Im1xARuCx7JNzDU';

export const SHEETS = [
  { key: 'main', name: 'ALL_DATA.outputOEE' },
  { key: 'orderSap', name: 'Order.outputSAP' },
  { key: 'order', name: 'ORDER' }
];

const clean = (value = '') => String(value).replace(/^"|"$/g, '').trim();

export function parseCsv(text) {
  const rows = [];
  let current = [];
  let value = '';
  let quote = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && quote && next === '"') {
      value += '"';
      i += 1;
    } else if (char === '"') {
      quote = !quote;
    } else if (char === ',' && !quote) {
      current.push(clean(value));
      value = '';
    } else if ((char === '\n' || char === '\r') && !quote) {
      if (value || current.length) {
        current.push(clean(value));
        rows.push(current);
        current = [];
        value = '';
      }
      if (char === '\r' && next === '\n') i += 1;
    } else {
      value += char;
    }
  }
  if (value || current.length) {
    current.push(clean(value));
    rows.push(current);
  }
  if (!rows.length) return [];
  const headers = rows[0].map((h, idx) => clean(h) || `Column_${idx + 1}`);
  return rows.slice(1).filter(row => row.some(Boolean)).map(row => {
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = clean(row[idx] ?? ''); });
    return obj;
  });
}

export async function fetchSheetByName(sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}&cacheBust=${Date.now()}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Cannot load ${sheetName}: HTTP ${res.status}`);
  const text = await res.text();
  if (text.includes('<!DOCTYPE html') || text.includes('Sign in')) {
    throw new Error(`Google Sheet permission blocked for ${sheetName}`);
  }
  return parseCsv(text);
}

export async function fetchAllSheets() {
  const output = {};
  for (const sheet of SHEETS) {
    try {
      output[sheet.key] = await fetchSheetByName(sheet.name);
    } catch (err) {
      output[sheet.key] = [];
      output[`${sheet.key}Error`] = err.message;
    }
  }
  return output;
}
