export default function TrendChart({ data, target = 100 }) {
  const width = 900;
  const height = 280;
  const pad = 42;
  const values = data.length ? data.map(d => d.achievement || 0) : [0];
  const max = Math.max(120, ...values, target);
  const min = 0;
  const points = data.map((d, i) => {
    const x = pad + (i * (width - pad * 2)) / Math.max(1, data.length - 1);
    const y = height - pad - ((d.achievement - min) / (max - min)) * (height - pad * 2);
    return { x, y, ...d };
  });
  const targetY = height - pad - ((target - min) / (max - min)) * (height - pad * 2);
  const path = points.map((p, i) => `${i ? 'L' : 'M'} ${p.x} ${p.y}`).join(' ');
  return (
    <div className="chart-shell">
      <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" role="img" aria-label="Output achievement trend">
        {[0,25,50,75,100].map(v => {
          const y = height - pad - ((v - min) / (max - min)) * (height - pad * 2);
          return <g key={v}><line x1={pad} x2={width-pad} y1={y} y2={y} className="grid"/><text x={12} y={y+5} className="axis">{v}</text></g>;
        })}
        <line x1={pad} x2={width-pad} y1={targetY} y2={targetY} className="target-line"/>
        <text x={width-pad-80} y={targetY-8} className="target-label">Target {target}%</text>
        {points.length > 1 && <path d={path} className="trend-line" fill="none"/>}
        {points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="5" className={p.achievement >= target ? 'dot green' : p.achievement >= 80 ? 'dot yellow' : 'dot red'}><title>{p.date}: {p.achievement.toFixed(1)}%</title></circle>)}
        {points.filter((_, i) => i % Math.ceil(points.length / 6 || 1) === 0).map((p, i) => <text key={i} x={p.x-24} y={height-10} className="axis">{p.date?.slice(5)}</text>)}
      </svg>
    </div>
  );
}
