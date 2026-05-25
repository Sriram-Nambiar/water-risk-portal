import React, { useState } from 'react';

const fields = [
  { key: 'lake_name', label: 'Lake name', placeholder: 'Ulsoor Lake', type: 'text' },
  { key: 'latitude', label: 'Latitude', placeholder: '12.9817', type: 'number' },
  { key: 'longitude', label: 'Longitude', placeholder: '77.6192', type: 'number' },
  { key: 'ph', label: 'pH level', placeholder: '7.2', type: 'number' },
  { key: 'cod', label: 'COD', placeholder: '24', type: 'number', unit: 'mg/L' },
  { key: 'bod', label: 'BOD', placeholder: '3.8', type: 'number', unit: 'mg/L' },
  { key: 'tds', label: 'TDS', placeholder: '420', type: 'number', unit: 'ppm' },
] as const;

type FieldKey = (typeof fields)[number]['key'];
type FormData = Record<FieldKey, string>;

const initialData: FormData = {
  lake_name: '',
  latitude: '',
  longitude: '',
  ph: '',
  cod: '',
  bod: '',
  tds: '',
};

export default function WaterReportForm() {
  const [data, setData] = useState<FormData>(initialData);
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('');
    setIsSubmitting(true);
    
    try {
      const res = await fetch('https://water-risk-portal.onrender.com/report/risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lake_name: data.lake_name,
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude),
          ph: parseFloat(data.ph),
          cod: parseFloat(data.cod),
          bod: parseFloat(data.bod),
          tds: parseFloat(data.tds),
        }),
      });
      const response = await res.json();
      setStatus(`[${response.risk_level} RISK] ${response.message}`);
    } catch {
      setStatus('Error connecting to the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const riskTone = status.toLowerCase().includes('high')
    ? 'danger'
    : status.toLowerCase().includes('medium')
      ? 'warning'
      : status.toLowerCase().includes('low')
        ? 'success'
        : status
          ? 'neutral'
          : '';

  return (
    <section className="portal">
      <div className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">Urban water intelligence</span>
          <h1>Bengaluru Water Risk Portal</h1>
          {/* <p>
            Capture lake chemistry readings and get a fast risk signal for
            nearby monitoring teams.
          </p> */}
        </div>
        <div className="signal-visual" aria-hidden="true">
          <span className="signal-ring ring-a"></span>
          <span className="signal-ring ring-b"></span>
          <span className="signal-dot"></span>
        </div>
      </div>

      <div className="workspace-grid">
        <form className="report-form" onSubmit={submit}>
          <div className="section-heading">
            <span>New sample</span>
            <strong>7 parameters</strong>
          </div>

          <div className="field-grid">
            {fields.map((field) => (
              <label className="field" key={field.key}>
                <span>{field.label}</span>
                <div className="input-wrap">
                  <input
                    required
                    value={data[field.key]}
                    type={field.type}
                    step={field.type === 'number' ? 'any' : undefined}
                    placeholder={field.placeholder}
                    onChange={(e) => setData({ ...data, [field.key]: e.target.value })}
                  />
                  {field.unit && <em>{field.unit}</em>}
                </div>
              </label>
            ))}
          </div>

          <button className="submit-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Analyzing...' : 'Analyze risk'}
          </button>
        </form>

        <aside className="result-panel">
          <div className="section-heading">
            <span>Risk output</span>
            <strong>Live</strong>
          </div>
          <div className={`status-card ${riskTone}`}>
            <span className="pulse"></span>
            <h2>{status ? 'Assessment ready' : 'Waiting for sample'}</h2>
            <p>{status || 'Submit a report to see the current lake risk level and model response.'}</p>
          </div>
          <div className="metric-row">
            <div>
              <span>pH</span>
              <strong>{data.ph || '--'}</strong>
            </div>
            <div>
              <span>TDS</span>
              <strong>{data.tds || '--'}</strong>
            </div>
            <div>
              <span>BOD</span>
              <strong>{data.bod || '--'}</strong>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
