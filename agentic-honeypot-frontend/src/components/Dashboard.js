import React, { useState, useEffect } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

const threatLocations = [
  { coordinates: [80.9, 21.0], name: "India (Server 1)", ip: "103.45.12.90" },
  { coordinates: [104.1, 35.8], name: "China (Proxy Hub)", ip: "218.11.3.111" },
  { coordinates: [37.6, 55.7], name: "Russia (Botnet Node)", ip: "46.17.20.9" },
  { coordinates: [-102.5, 23.6], name: "Mexico (Rerouted)", ip: "189.2.44.1" },
  { coordinates: [12.4, 41.9], name: "Italy (Compromised IP)", ip: "2.11.45.6" },
  { coordinates: [-55.4, -10.3], name: "Brazil (Node)", ip: "177.34.22.9" },
  { coordinates: [2.2, 48.8], name: "France (Gateway)", ip: "88.13.4.2" },
];

const GeminiIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="url(#gemini-gradient)"/>
    <defs>
      <linearGradient id="gemini-gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4285F4"/>
        <stop offset="0.5" stopColor="#9B72CB"/>
        <stop offset="1" stopColor="#D96570"/>
      </linearGradient>
    </defs>
  </svg>
);

const Dashboard = ({ messages = [], result }) => {
  const [markers, setMarkers] = useState([]);
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const newRow = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      ip: threatLocations[Math.floor(Math.random() * threatLocations.length)].ip,
      target: "Honeypot Core",
      method: "POST",
      endpoint: "/api/v1/honeypot",
      risk: result?.scamDetected ? "High" : "Low",
      insight: result?.scamDetected ? "Behavioral Anomaly" : "Normal Traffic"
    };
    
    setTableData(prev => [newRow, ...prev].slice(0, 5));

    if (result && result.scamDetected) {
      const shuffled = [...threatLocations].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, Math.floor(Math.random() * 3) + 1);
      setMarkers(selected);
    } else {
      setMarkers([]);
    }
  }, [result]);

  const totalMessages = messages.length;
  const attacksBlocked = messages.filter(m => m.sender === 'user').length;
  
  const barData = [
    { name: 'Payment', count: 45 },
    { name: 'Threat', count: 30 },
    { name: 'Phishing', count: 60 },
    { name: 'Auth', count: 20 },
  ];

  const styles = {
    container: { color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' },
    titleContainer: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' },
    title: { fontSize: '28px', fontWeight: 'bold', color: '#f8fafc', margin: 0 },
    gridTop: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' },
    gridMain: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px', '@media (max-width: 768px)': { gridTemplateColumns: '1fr' } },
    card: { background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '12px', padding: '20px', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column' },
    cardTitle: { fontSize: '15px', fontWeight: '600', marginBottom: '12px', color: '#cbd5e1', display: "flex", alignItems: "center", justifyContent: "space-between" },
    statNumber: { fontSize: '32px', fontWeight: '800', color: '#fff', lineHeight: '1.2' },
    statLabel: { fontSize: '13px', color: '#94a3b8', marginTop: '4px' },
    mapContainer: { height: 350, width: '100%', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', overflow: 'hidden', position: 'relative' },
    geminiCard: { background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))', border: '1px solid rgba(155, 114, 203, 0.3)', borderRadius: '12px', padding: '20px', position: 'relative', overflow: 'hidden' },
    geminiTitle: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: 'bold', color: '#fff', marginBottom: '16px' },
    insightText: { fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '12px' },
    insightMeta: { fontSize: '12px', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' },
    th: { padding: '12px 16px', borderBottom: '1px solid rgba(148, 163, 184, 0.2)', color: '#94a3b8', fontWeight: '600' },
    td: { padding: '12px 16px', borderBottom: '1px solid rgba(148, 163, 184, 0.1)', color: '#e2e8f0' },
    riskHigh: { color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' },
    riskLow: { color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' },
    radarPing: { position: "absolute", top: "12px", right: "12px", fontSize: "12px", color: "#ef4444", display: "flex", alignItems: "center", gap: "6px", background: 'rgba(0,0,0,0.5)', padding: '4px 10px', borderRadius: '20px' },
    dot: { width: "8px", height: "8px", backgroundColor: "#ef4444", borderRadius: "50%", boxShadow: "0 0 8px #ef4444", animation: 'pulse 1.5s infinite' }
  };

  return (
    <div style={styles.container}>
      
      {/* TOP STATS */}
      <div style={styles.gridTop}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>System Health <span style={{color: '#10b981', fontSize: '12px'}}>● ACTIVE</span></h3>
          <div style={styles.statNumber}>99.8%</div>
          <div style={styles.statLabel}>Uptime | 14 Agents Online</div>
        </div>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Attacks Blocked</h3>
          <div style={{...styles.statNumber, color: '#ef4444'}}>{attacksBlocked} <span style={{fontSize: '18px'}}>↗</span></div>
          <div style={styles.statLabel}>Session Data</div>
        </div>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Active Scam Threads</h3>
          <div style={{...styles.statNumber, color: '#38bdf8'}}>{result?.scamDetected ? 1 : 0}</div>
          <div style={styles.statLabel}>Currently tracked by AI</div>
        </div>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Total Intercepted</h3>
          <div style={styles.statNumber}>{totalMessages}</div>
          <div style={styles.statLabel}>Messages analyzed</div>
        </div>
      </div>

      {/* MAIN VISUALS */}
      <div style={styles.gridMain}>
        {/* MAP */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Honeypot Network Map</h3>
          <div style={styles.mapContainer}>
            {markers.length > 0 && (
              <div style={styles.radarPing}>
                <div style={styles.dot}></div> Threat Intercepted
              </div>
            )}
            <ComposableMap projection="geoMercator" projectionConfig={{ scale: 110 }} style={{ width: "100%", height: "100%" }}>
              <Geographies geography={geoUrl}>
                {({ geographies }) => geographies.map((geo) => (
                    <Geography key={geo.rsmKey} geography={geo} fill="#1e293b" stroke="#334155" strokeWidth={0.5} style={{ default: { outline: "none" }, hover: { fill: "#334155", outline: "none" } }} />
                ))}
              </Geographies>
              {markers.length > 0 ? markers.map(({ name, coordinates }) => (
                <Marker key={name} coordinates={coordinates}>
                  <circle r={5} fill="#ef4444" stroke="#fff" strokeWidth={1} />
                </Marker>
              )) : (
                <Marker coordinates={[80.9, 21.0]}>
                  <circle r={3} fill="#10b981" />
                </Marker>
              )}
            </ComposableMap>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={styles.geminiCard}>
            <div style={styles.geminiTitle}>
              <GeminiIcon />
              <span style={{background: 'linear-gradient(90deg, #4285F4, #9B72CB, #D96570)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '16px'}}>Gemini Insights</span>
            </div>
            <p style={styles.insightText}>
              <strong>Anomaly Detection:</strong><br/>
              {result?.scamDetected 
                ? "AI detected behavioral pattern matching Social Engineering." 
                : "Monitoring endpoints for suspicious behavior."}
            </p>
            <div style={styles.insightMeta}>
              <span>Confidence: {result?.scamDetected ? '94%' : 'N/A'}</span>
              <span>Rules: {result?.scamDetected ? '2' : '0'}</span>
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Top Targets</h3>
            <div style={{ height: 180, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={barData} margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#0f172a', border: '1px solid #334155'}} />
                  <Bar dataKey="count" fill="#38bdf8" radius={[0, 4, 4, 0]} barSize={16}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#ef4444', '#f59e0b', '#38bdf8', '#10b981'][index % 4]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Live Traffic Logs</h3>
        <div style={{overflowX: 'auto'}}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Timestamp</th>
                <th style={styles.th}>Source IP</th>
                <th style={styles.th}>Target</th>
                <th style={styles.th}>Method</th>
                <th style={styles.th}>Risk</th>
                <th style={styles.th}>Insight</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => (
                <tr key={row.id}>
                  <td style={styles.td}>{row.time}</td>
                  <td style={styles.td}>{row.ip}</td>
                  <td style={styles.td}>{row.target}</td>
                  <td style={styles.td}>{row.method}</td>
                  <td style={styles.td}>
                    <span style={row.risk === 'High' ? styles.riskHigh : styles.riskLow}>{row.risk}</span>
                  </td>
                  <td style={styles.td}>{row.insight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
