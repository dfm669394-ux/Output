export default function DataTable({ rows }) {
  return (
    <div className="panel table-panel">
      <div className="panel-title">Raw Data Preview</div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Date</th><th>Menu</th><th>Line</th><th>Shift</th><th>Output</th><th>Order</th><th>Achievement</th><th>Gap</th></tr></thead>
          <tbody>{rows.slice(0, 80).map((r, i) => <tr key={i}><td>{r.date}</td><td>{r.menu}</td><td>{r.line}</td><td>{r.shift}</td><td>{r.output.toLocaleString()}</td><td>{r.order.toLocaleString()}</td><td>{r.achievement.toFixed(1)}%</td><td className={r.gap < 0 ? 'negative' : 'positive'}>{r.gap.toLocaleString()}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
