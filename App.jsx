import { useEffect, useMemo, useState } from 'react';
import KpiCard from './components/KpiCard.jsx';
import TrendChart from './components/TrendChart.jsx';
import BarList from './components/BarList.jsx';
import TrafficMatrix from './components/TrafficMatrix.jsx';
import DataTable from './components/DataTable.jsx';
import { fetchAllSheets } from './services/googleSheet.js';
import { aggregate, enrichRows } from './utils/metrics.js';
import './styles.css';

const ADMIN_EMAIL = 'mastersunlove@gmail.com';
const TARGET = 100;
const BUFFER = 80;

const demoRows = [
  { 'REAL DATE': '2026-06-01', 'เมนู': 'Menu A', 'Line': 'Line 1', 'Shift': 'D', 'จำนวนผลิตได้': '12000', 'Daily Order': '11000', 'Executive Insight': 'Output above target' },
  { 'REAL DATE': '2026-06-02', 'เมนู': 'Menu B', 'Line': 'Line 2', 'Shift': 'N', 'จำนวนผลิตได้': '8900', 'Daily Order': '10000' },
  { 'REAL DATE': '2026-06-03', 'เมนู': 'Menu C', 'Line': 'Line 3', 'Shift': 'D', 'จำนวนผลิตได้': '7800', 'Daily Order': '9600' }
];

export default function App() {
  const [email, setEmail] = useState(localStorage.getItem('dfmUserEmail') || '');
  const [loggedIn, setLoggedIn] = useState(Boolean(localStorage.getItem('dfmUserEmail')));
  const [rows, setRows] = useState([]);
  const [sourceStatus, setSourceStatus] = useState('Loading Google Sheet...');
  const [lastRefresh, setLastRefresh] = useState('');
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', month: 'ALL', line: 'ALL', shift: 'ALL', menu: 'ALL' });
  const [manualRows, setManualRows] = useState(() => JSON.parse(localStorage.getItem('dfmManualOutputRows') || '[]'));

  const role = email.toLowerCase() === ADMIN_EMAIL ? 'Admin' : 'Viewer';

  async function load() {
    setSourceStatus('Loading Google Sheet...');
    const result = await fetchAllSheets();
    const main = result.main || [];
    if (main.length) {
      setRows(enrichRows([...main, ...manualRows]));
      setSourceStatus(`LIVE DATA: ALL_DATA.outputOEE ${main.length.toLocaleString()} rows`);
    } else {
      setRows(enrichRows([...demoRows, ...manualRows]));
      setSourceStatus(`NO LIVE DATA: check Google Sheet sharing. ${result.mainError || ''}`);
    }
    setLastRefresh(new Date().toLocaleString('th-TH'));
  }

  useEffect(() => { load(); const t = setInterval(load, 60000); return () => clearInterval(t); }, [manualRows.length]);

  const options = useMemo(() => ({
    months: ['ALL', ...new Set(rows.map(r => r.month).filter(Boolean))],
    lines: ['ALL', ...new Set(rows.map(r => r.line).filter(Boolean))],
    shifts: ['ALL', ...new Set(rows.map(r => r.shift).filter(Boolean))],
    menus: ['ALL', ...new Set(rows.map(r => r.menu).filter(Boolean).slice(0, 300))]
  }), [rows]);

  const filtered = useMemo(() => rows.filter(r => {
    if (filters.dateFrom && r.date < filters.dateFrom) return false;
    if (filters.dateTo && r.date > filters.dateTo) return false;
    if (filters.month !== 'ALL' && r.month !== filters.month) return false;
    if (filters.line !== 'ALL' && r.line !== filters.line) return false;
    if (filters.shift !== 'ALL' && r.shift !== filters.shift) return false;
    if (filters.menu !== 'ALL' && r.menu !== filters.menu) return false;
    return true;
  }), [rows, filters]);

  const metrics = useMemo(() => aggregate(filtered), [filtered]);
  const status = metrics.achievement >= TARGET ? 'green' : metrics.achievement >= BUFFER ? 'yellow' : 'red';
  const insight = useMemo(() => {
    const worst = [...metrics.byMenu].sort((a,b)=>a.gap-b.gap)[0];
    const bestLine = metrics.byLine[0];
    const text = [];
    text.push(`ภาพรวม Output ทำได้ ${metrics.achievement.toFixed(1)}% เทียบ Target ${TARGET}%`);
    if (metrics.achievement >= TARGET) text.push('สถานะดี ผลิตได้ตามหรือสูงกว่าเป้าหมาย');
    else if (metrics.achievement >= BUFFER) text.push('สถานะเฝ้าระวัง ยังอยู่ใน buffer แต่ควรติดตาม gap รายวัน');
    else text.push('สถานะเสี่ยง ต้องเร่งติดตามสาเหตุ Output ต่ำกว่า buffer');
    if (worst) text.push(`เมนูที่ควรโฟกัส: ${worst.name} Gap ${worst.gap.toLocaleString()} ชิ้น`);
    if (bestLine) text.push(`ไลน์ที่ทำได้ดีที่สุด: ${bestLine.name} ${bestLine.achievement.toFixed(1)}%`);
    return text.join(' • ');
  }, [metrics]);

  function login(e) {
    e.preventDefault();
    if (!email.includes('@')) return alert('กรุณากรอกอีเมล');
    localStorage.setItem('dfmUserEmail', email);
    setLoggedIn(true);
  }

  function addManualRow(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const row = {
      'REAL DATE': form.get('date'),
      'เมนู': form.get('menu'),
      'Line': form.get('line'),
      'Shift': form.get('shift'),
      'จำนวนผลิตได้': form.get('output'),
      'Daily Order': form.get('order'),
      'Executive Insight': form.get('note')
    };
    const next = [...manualRows, row];
    localStorage.setItem('dfmManualOutputRows', JSON.stringify(next));
    setManualRows(next);
    e.currentTarget.reset();
  }

  if (!loggedIn) {
    return <main className="login-page"><form className="login-card" onSubmit={login}><img src="/logo.svg" alt="logo"/><h1>DFM Output Platform</h1><p>เข้าสู่ระบบด้วยอีเมล</p><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com"/><button>Login</button><small>Admin เริ่มต้น: {ADMIN_EMAIL}</small></form></main>;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar"><div className="brand"><img src="/logo.svg"/><div><b>DFM</b><span>Intelligence</span></div></div><nav><a className="active">Output</a><a>Data Entry</a><a>Raw Data</a><a>Users</a><a>Settings</a></nav><div className="user-box"><b>{role}</b><small>{email}</small><button onClick={()=>{localStorage.removeItem('dfmUserEmail'); setLoggedIn(false);}}>Logout</button></div></aside>
      <main className="dashboard">
        <header className="hero"><div><p className="eyebrow">Executive Manufacturing Dashboard</p><h1>Output Performance</h1><p>{sourceStatus}</p><small>Last refresh: {lastRefresh || '-'}</small></div><button className="refresh" onClick={load}>Refresh Live</button></header>

        <section className="filters">
          <label>Date From<input type="date" value={filters.dateFrom} onChange={e=>setFilters({...filters,dateFrom:e.target.value})}/></label>
          <label>Date To<input type="date" value={filters.dateTo} onChange={e=>setFilters({...filters,dateTo:e.target.value})}/></label>
          <label>Month<select value={filters.month} onChange={e=>setFilters({...filters,month:e.target.value})}>{options.months.map(o=><option key={o}>{o}</option>)}</select></label>
          <label>Line<select value={filters.line} onChange={e=>setFilters({...filters,line:e.target.value})}>{options.lines.map(o=><option key={o}>{o}</option>)}</select></label>
          <label>Shift<select value={filters.shift} onChange={e=>setFilters({...filters,shift:e.target.value})}>{options.shifts.map(o=><option key={o}>{o}</option>)}</select></label>
          <button onClick={()=>setFilters({ dateFrom:'', dateTo:'', month:'ALL', line:'ALL', shift:'ALL', menu:'ALL' })}>All Data</button>
        </section>

        <section className="kpi-grid">
          <KpiCard title="Achievement" value={`${metrics.achievement.toFixed(1)}%`} subtitle="Target 100% / Buffer 80%" status={status}/>
          <KpiCard title="Output" value={metrics.output.toLocaleString()} subtitle="Actual production" status="blue"/>
          <KpiCard title="Order" value={metrics.order.toLocaleString()} subtitle="Demand / order" status="blue"/>
          <KpiCard title="Gap" value={metrics.gap.toLocaleString()} subtitle="Output - Order" status={metrics.gap >= 0 ? 'green' : 'red'}/>
        </section>

        <section className="grid-two"><div className="panel wide"><div className="panel-title">Output Achievement Trend by Date</div><TrendChart data={metrics.byDate} target={TARGET}/></div><BarList title="Line Performance" items={metrics.byLine} valueKey="achievement" suffix="%"/></section>
        <section className="grid-three"><div className="panel insight"><div className="panel-title">AI Executive Insight</div><p>{insight}</p></div><BarList title="Top Output Menu" items={metrics.byMenu} valueKey="output" suffix=" pc"/><TrafficMatrix rows={metrics.byDate}/></section>

        <section className="entry panel"><div className="panel-title">Data Entry Form</div><form onSubmit={addManualRow}><input name="date" type="date" required/><input name="menu" placeholder="Menu" required/><input name="line" placeholder="Line"/><select name="shift"><option>D</option><option>N</option></select><input name="output" type="number" placeholder="Output" required/><input name="order" type="number" placeholder="Order"/><input name="note" placeholder="Note"/><button>Add Data</button></form><small>ข้อมูลที่คีย์ผ่านเว็บจะเก็บใน browser ชั่วคราวก่อน ระยะถัดไปจะเชื่อม Supabase/Google Sheet write-back</small></section>
        <DataTable rows={filtered}/>
      </main>
    </div>
  );
}
