import React from 'react';

export default function KpiCard({title, value, subtitle, tone='blue', icon}) {
  return <div className={`kpi-card ${tone}`}>
    <div className="kpi-top"><span>{title}</span><span className="kpi-icon">{icon}</span></div>
    <div className="kpi-value">{value}</div>
    <div className="kpi-subtitle">{subtitle}</div>
  </div>
}
