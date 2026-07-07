export default function KpiCard({ title, value, subtitle, status = 'neutral' }) {
  return (
    <div className={`kpi-card ${status}`}>
      <div className="kpi-title">{title}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-subtitle">{subtitle}</div>
    </div>
  );
}
