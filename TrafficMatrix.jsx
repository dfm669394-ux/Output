export default function TrafficMatrix({ rows }) {
  const data = rows.slice(-35);
  return (
    <div className="panel traffic-panel">
      <div className="panel-title">Daily Traffic Light</div>
      <div className="traffic-grid">
        {data.map((r, idx) => <div key={`${r.date}-${idx}`} className={`traffic-cell ${r.achievement >= 100 ? 'green' : r.achievement >= 80 ? 'yellow' : 'red'}`} title={`${r.date}: ${r.achievement.toFixed(1)}%`}>
          <b>{r.date?.slice(8) || idx+1}</b><small>{r.achievement.toFixed(0)}%</small>
        </div>)}
      </div>
      <div className="legend"><span className="green-dot"/> ≥100% <span className="yellow-dot"/> ≥80% <span className="red-dot"/> &lt;80%</div>
    </div>
  );
}
