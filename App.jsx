import React, { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, Legend } from 'recharts';
import { RefreshCw, LogIn, Shield, Upload, Database, Table2, Settings, PencilLine, LayoutDashboard } from 'lucide-react';
import { loadOutputData } from './services/googleSheet';
import { filterRows, fmt, pct, summarize, groupBy, trendByDate, topGap, traffic } from './utils/metrics';
import KpiCard from './components/KpiCard';

const ADMIN_EMAIL = 'mastersunlove@gmail.com';
const TARGET = 100;
const BUFFER = 80;

export default function App(){
  const [rows,setRows] = useState([]);
  const [source,setSource] = useState('LOADING');
  const [error,setError] = useState('');
  const [last,setLast] = useState('');
  const [page,setPage] = useState('dashboard');
  const [email,setEmail] = useState(localStorage.getItem('dfmEmail') || '');
  const [logged,setLogged] = useState(Boolean(localStorage.getItem('dfmEmail')));
  const [entry,setEntry] = useState({date:'', line:'', shift:'D', menu:'', output:'', order:''});
  const [manualRows,setManualRows] = useState(JSON.parse(localStorage.getItem('manualOutputRows') || '[]'));
  const [filters,setFilters] = useState({from:'',to:'',month:'ALL',line:'ALL',shift:'ALL',menu:'ALL'});

  async function load(){
    const data = await loadOutputData();
    setRows([...data.rows, ...manualRows]);
    setSource(data.source);
    setError(data.error || '');
    setLast(new Date().toLocaleString('th-TH'));
  }
  useEffect(()=>{ load(); const t=setInterval(load,60000); return ()=>clearInterval(t); },[manualRows.length]);

  const months = useMemo(()=>['ALL', ...new Set(rows.map(r=>r.month).filter(Boolean).sort())], [rows]);
  const lines = useMemo(()=>['ALL', ...new Set(rows.map(r=>r.line).filter(Boolean).sort())], [rows]);
  const shifts = useMemo(()=>['ALL', ...new Set(rows.map(r=>r.shift).filter(Boolean).sort())], [rows]);
  const menus = useMemo(()=>['ALL', ...new Set(rows.map(r=>r.menu).filter(Boolean).sort())], [rows]);
  const viewRows = useMemo(()=>filterRows(rows, filters),[rows,filters]);
  const sum = useMemo(()=>summarize(viewRows),[viewRows]);
  const trend = useMemo(()=>trendByDate(viewRows),[viewRows]);
  const lineRank = useMemo(()=>groupBy(viewRows,'line','output').slice(0,8),[viewRows]);
  const menuRank = useMemo(()=>groupBy(viewRows,'menu','output').slice(0,10),[viewRows]);
  const gapRank = useMemo(()=>topGap(viewRows),[viewRows]);
  const tl = useMemo(()=>traffic(viewRows),[viewRows]);

  const role = email.toLowerCase() === ADMIN_EMAIL ? 'Admin' : logged ? 'Viewer' : 'Guest';
  const login = () => { if(email.includes('@')) { localStorage.setItem('dfmEmail', email); setLogged(true); } };
  const logout = () => { localStorage.removeItem('dfmEmail'); setLogged(false); setEmail(''); };

  const addEntry = (e) => {
    e.preventDefault();
    const output = Number(entry.output||0), order = Number(entry.order||0);
    const newRow = { id:`manual-${Date.now()}`, date:entry.date, month:entry.date?.slice(0,7), year:entry.date?.slice(0,4), line:entry.line||'Manual', shift:entry.shift, menu:entry.menu||'Manual Entry', output, order, gap:output-order, achievement: order?output/order*100:0, status: order && output/order*100 >= 100 ? 'green' : order && output/order*100 >= 80 ? 'yellow' : 'red', insight:'เพิ่มข้อมูลผ่านเว็บ', raw:{} };
    const next = [...manualRows, newRow];
    localStorage.setItem('manualOutputRows', JSON.stringify(next));
    setManualRows(next);
    setEntry({date:'', line:'', shift:'D', menu:'', output:'', order:''});
    setPage('dashboard');
  };

  if(!logged) return <div className="login-page">
    <div className="login-card">
      <div className="brand-mark">DFM</div>
      <h1>DFM Output Platform</h1>
      <p>Login ด้วยอีเมลเพื่อเข้า Dashboard องค์กร</p>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@company.com" />
      <button onClick={login}><LogIn size={18}/> Login</button>
      <small>Admin เริ่มต้น: {ADMIN_EMAIL}</small>
    </div>
  </div>

  return <div className="app">
    <aside className="sidebar">
      <div className="logo"><div className="logo-box">D</div><div><b>DFM</b><span>Output Platform</span></div></div>
      <nav>
        <button className={page==='dashboard'?'active':''} onClick={()=>setPage('dashboard')}><LayoutDashboard size={18}/> Dashboard</button>
        <button className={page==='entry'?'active':''} onClick={()=>setPage('entry')}><PencilLine size={18}/> Data Entry</button>
        <button className={page==='upload'?'active':''} onClick={()=>setPage('upload')}><Upload size={18}/> Upload File</button>
        <button className={page==='raw'?'active':''} onClick={()=>setPage('raw')}><Table2 size={18}/> Raw Data</button>
        <button className={page==='settings'?'active':''} onClick={()=>setPage('settings')}><Settings size={18}/> Settings</button>
      </nav>
      <div className="userbox"><Shield size={16}/><div><b>{role}</b><span>{email}</span></div></div>
      <button className="logout" onClick={logout}>Logout</button>
    </aside>

    <main className="main">
      <header className="header">
        <div><h1>Executive Output Dashboard</h1><p>Google Sheet powered • 3 source sheets • Real-time refresh every 60s</p></div>
        <div className={`live-pill ${source.includes('LIVE')?'live':'demo'}`}>{source}</div>
      </header>

      {page==='dashboard' && <>
        <section className="filters">
          <label>Date From<input type="date" value={filters.from} onChange={e=>setFilters({...filters,from:e.target.value})}/></label>
          <label>Date To<input type="date" value={filters.to} onChange={e=>setFilters({...filters,to:e.target.value})}/></label>
          <label>Month<select value={filters.month} onChange={e=>setFilters({...filters,month:e.target.value})}>{months.map(x=><option key={x}>{x}</option>)}</select></label>
          <label>Line<select value={filters.line} onChange={e=>setFilters({...filters,line:e.target.value})}>{lines.map(x=><option key={x}>{x}</option>)}</select></label>
          <label>Shift<select value={filters.shift} onChange={e=>setFilters({...filters,shift:e.target.value})}>{shifts.map(x=><option key={x}>{x}</option>)}</select></label>
          <label>Menu<select value={filters.menu} onChange={e=>setFilters({...filters,menu:e.target.value})}>{menus.slice(0,200).map(x=><option key={x}>{x}</option>)}</select></label>
          <button className="refresh" onClick={load}><RefreshCw size={16}/> Refresh</button>
          <button className="clear" onClick={()=>setFilters({from:'',to:'',month:'ALL',line:'ALL',shift:'ALL',menu:'ALL'})}>All Data</button>
        </section>
        <div className="status-line">Last refresh: {last} • Records: {fmt(viewRows.length)} {error && <span className="warn">• {error}</span>}</div>
        <section className="kpis">
          <KpiCard title="Output" value={fmt(sum.output)} subtitle="Good Output / selected period" tone="blue" icon="pc" />
          <KpiCard title="Order" value={fmt(sum.order)} subtitle="Total demand" tone="gold" icon="ord" />
          <KpiCard title="Achievement" value={pct(sum.achievement)} subtitle={`Target ${TARGET}% / Buffer ${BUFFER}%`} tone={sum.achievement>=100?'green':sum.achievement>=80?'gold':'red'} icon="%" />
          <KpiCard title="Gap" value={fmt(sum.gap)} subtitle="Output - Order" tone={sum.gap>=0?'green':'red'} icon="gap" />
          <KpiCard title="Risk Days" value={fmt(sum.cnRisk)} subtitle="Below 80% buffer" tone="red" icon="risk" />
          <KpiCard title="Records" value={fmt(sum.records)} subtitle="Rows in selected view" tone="blue" icon="row" />
        </section>
        <section className="grid two">
          <div className="panel large"><div className="panel-head"><h2>Output Trend by Date</h2><span>Actual vs Order</span></div><ResponsiveContainer width="100%" height={330}><AreaChart data={trend}><defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#38bdf8" stopOpacity={0.5}/><stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#223049"/><XAxis dataKey="date" stroke="#9fb0c7"/><YAxis stroke="#9fb0c7"/><Tooltip contentStyle={{background:'#101827',border:'1px solid #2f405e',borderRadius:12}}/><Legend/><Area type="monotone" dataKey="output" stroke="#38bdf8" fill="url(#g1)"/><Line type="monotone" dataKey="order" stroke="#f6c76f" strokeWidth={2}/></AreaChart></ResponsiveContainer></div>
          <div className="panel"><div className="panel-head"><h2>Line Performance</h2><span>Ranking by Output</span></div><ResponsiveContainer width="100%" height={330}><BarChart data={lineRank} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#223049"/><XAxis type="number" stroke="#9fb0c7"/><YAxis dataKey="name" type="category" width={90} stroke="#9fb0c7"/><Tooltip contentStyle={{background:'#101827',border:'1px solid #2f405e',borderRadius:12}}/><Bar dataKey="amount" fill="#36d399" radius={[0,8,8,0]}/></BarChart></ResponsiveContainer></div>
        </section>
        <section className="grid three">
          <div className="panel"><h2>AI Executive Insight</h2><p className="insight">ภาพรวม Output อยู่ที่ <b>{pct(sum.achievement)}</b> เทียบ Target 100% {sum.achievement>=100?'สถานะดี ผลิตครอบคลุม Order':'ยังมี Gap ต้องติดตาม'} โดย Gap รวม <b>{fmt(sum.gap)}</b> pc และมีรายการต่ำกว่า Buffer {BUFFER}% จำนวน <b>{fmt(sum.cnRisk)}</b> รายการ ควรโฟกัส Top Gap และไลน์ที่ Achievement ต่ำก่อน</p></div>
          <div className="panel"><h2>Top Gap Menu</h2><div className="list">{gapRank.slice(0,6).map((r,i)=><div className="list-row" key={r.name}><span>{i+1}. {r.name}</span><b className={r.gap<0?'neg':'pos'}>{fmt(r.gap)}</b></div>)}</div></div>
          <div className="panel"><h2>Daily Traffic Light</h2><div className="traffic">{tl.slice(-30).map(d=><div key={d.date} className={`dot ${d.status}`} title={`${d.date}: ${pct(d.achievement)}`}>{d.date.slice(8)}</div>)}</div><small>Green ≥100 / Yellow ≥80 / Red &lt;80</small></div>
        </section>
        <section className="panel"><div className="panel-head"><h2>Top 10 Menu by Output</h2><span>Selected period</span></div><ResponsiveContainer width="100%" height={300}><BarChart data={menuRank}><CartesianGrid strokeDasharray="3 3" stroke="#223049"/><XAxis dataKey="name" stroke="#9fb0c7" interval={0} angle={-20} textAnchor="end" height={90}/><YAxis stroke="#9fb0c7"/><Tooltip contentStyle={{background:'#101827',border:'1px solid #2f405e',borderRadius:12}}/><Bar dataKey="amount" fill="#38bdf8" radius={[8,8,0,0]}/></BarChart></ResponsiveContainer></section>
      </>}

      {page==='entry' && <section className="panel form-panel"><h2>Data Entry Form</h2><p>ข้อมูลที่คีย์ผ่านเว็บจะเก็บในเครื่องก่อน รุ่นถัดไปสามารถส่งเข้า Supabase/Google Sheet ได้</p><form onSubmit={addEntry} className="entry-form"><input type="date" value={entry.date} onChange={e=>setEntry({...entry,date:e.target.value})} required/><input placeholder="Line" value={entry.line} onChange={e=>setEntry({...entry,line:e.target.value})}/><select value={entry.shift} onChange={e=>setEntry({...entry,shift:e.target.value})}><option>D</option><option>N</option></select><input placeholder="Menu" value={entry.menu} onChange={e=>setEntry({...entry,menu:e.target.value})}/><input type="number" placeholder="Output" value={entry.output} onChange={e=>setEntry({...entry,output:e.target.value})}/><input type="number" placeholder="Order" value={entry.order} onChange={e=>setEntry({...entry,order:e.target.value})}/><button>Save Entry</button></form></section>}
      {page==='upload' && <section className="panel"><h2>Upload Excel / CSV</h2><p>V1 รองรับโครงหน้า Upload แล้ว รุ่นถัดไปจะอ่านไฟล์ CSV/XLSX และ append เข้า database</p><div className="upload-box">Drop Excel / CSV here</div></section>}
      {page==='raw' && <section className="panel"><h2>Raw Data View</h2><div className="table-wrap"><table><thead><tr><th>Date</th><th>Line</th><th>Shift</th><th>Menu</th><th>Output</th><th>Order</th><th>Ach%</th><th>Gap</th><th>Status</th></tr></thead><tbody>{viewRows.slice(0,300).map(r=><tr key={r.id}><td>{r.date}</td><td>{r.line}</td><td>{r.shift}</td><td>{r.menu}</td><td>{fmt(r.output)}</td><td>{fmt(r.order)}</td><td>{pct(r.achievement)}</td><td>{fmt(r.gap)}</td><td><span className={`badge ${r.status}`}>{r.status}</span></td></tr>)}</tbody></table></div></section>}
      {page==='settings' && <section className="panel"><h2>Settings</h2><div className="setting-grid"><div><b>Admin</b><p>{ADMIN_EMAIL}</p></div><div><b>Output Target</b><p>100%</p></div><div><b>Buffer</b><p>&gt;=80%</p></div><div><b>Data Source</b><p>Google Sheet 3 sheets</p></div></div></section>}
    </main>
  </div>
}
