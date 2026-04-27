import { useState, useEffect, useRef } from "react";
import API from "./services/api";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import Dashboard from "./components/Dashboard";

const GeminiIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="url(#gemini-gradient-app)"/>
    <defs>
      <linearGradient id="gemini-gradient-app" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4285F4"/>
        <stop offset="0.5" stopColor="#9B72CB"/>
        <stop offset="1" stopColor="#D96570"/>
      </linearGradient>
    </defs>
  </svg>
);

function App() {

  const [page, setPage] = useState("dashboard");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [killSwitchActive, setKillSwitchActive] = useState(false);
  const [firLoading, setFirLoading] = useState(false);
  const [firReport, setFirReport] = useState('');

  const chatRef = useRef();

  // DETECT MOBILE
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // LOAD HISTORY
  useEffect(() => {
    const saved = localStorage.getItem("chatData");
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  // SAVE HISTORY
  useEffect(() => {
    localStorage.setItem("chatData", JSON.stringify(messages));
  }, [messages]);

  // AUTO SCROLL
  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages]);

  const sendMessage = async () => {
    if (!input) return;
    const time = new Date().toLocaleTimeString();
    const userMsg = { text: input, sender: "user", time };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await API.post("/honeypot", {
        sessionId: "chat-session",
        message: { text: input, sender: "scammer" },
        conversationHistory: messages
      });
      setResult(res.data);
      const botMsg = { text: res.data.agentReply, sender: "bot", time };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      alert("API Error");
    }
    setInput("");
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const generateScam = () => {
    const samples = [
      "Your SBI account will be blocked. Send OTP now",
      "Urgent! Pay ₹5000 to this UPI id hacker@upi",
      "Click this link to verify http://fakebank.com"
    ];
    setInput(samples[Math.floor(Math.random() * samples.length)]);
  };

  const exportJSON = () => {
    if (!result) return alert("No data");
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "honeypot_report.json";
    a.click();
  };

  const exportPDF = () => {
    if (!result) return alert("No data");
    const doc = new jsPDF();
    doc.text("Scam Report", 10, 10);
    doc.text(JSON.stringify(result, null, 2), 10, 20);
    doc.save("honeypot_report.pdf");
  };

  // APP STYLES
  const styles = {
    appWrapper: {
      display: 'flex',
      minHeight: '100vh',
      background: '#0f172a',
      color: '#e2e8f0',
      fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif"
    },
    sidebar: {
      width: isMobile ? '60px' : '260px',
      background: 'rgba(15, 23, 42, 0.95)',
      borderRight: '1px solid rgba(56, 189, 248, 0.15)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      bottom: 0,
      left: 0,
      zIndex: 100,
      transition: 'width 0.3s ease'
    },
    logoArea: {
      padding: '24px 20px',
      borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    logoText: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#38bdf8',
      display: isMobile ? 'none' : 'block'
    },
    navMenu: {
      padding: '20px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    navItem: {
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      color: '#94a3b8',
      fontSize: '15px',
      fontWeight: '500'
    },
    navItemActive: {
      background: 'rgba(56, 189, 248, 0.1)',
      color: '#38bdf8',
      borderRight: '3px solid #38bdf8'
    },
    mainArea: {
      marginLeft: isMobile ? '60px' : '260px',
      flex: 1,
      padding: isMobile ? '20px' : '40px',
      width: '100%',
      maxWidth: `calc(100vw - ${isMobile ? '60px' : '260px'})`
    },
    pageTitle: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#f8fafc',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    grid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr",
      gap: "26px"
    },
    card: {
      background: "linear-gradient(180deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))",
      borderRadius: "20px",
      boxShadow: "0 24px 60px rgba(0, 0, 0, 0.4)",
      padding: "24px",
      border: "1px solid rgba(56, 189, 248, 0.15)",
      backdropFilter: "blur(12px)"
    },
    cardTitle: {
      fontSize: "20px",
      fontWeight: "700",
      color: "#e2e8f0",
      marginBottom: "20px",
      borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
      paddingBottom: "10px"
    },
    inputBox: {
      display: "flex",
      gap: "14px",
      marginBottom: "20px"
    },
    input: {
      flex: 1,
      padding: "14px 18px",
      borderRadius: "14px",
      border: "1px solid rgba(148, 163, 184, 0.2)",
      background: "rgba(15, 23, 42, 0.6)",
      color: "#f8fafc",
      outline: "none",
      fontSize: "15px"
    },
    primaryBtn: {
      padding: "14px 22px",
      background: "linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)",
      color: "white",
      border: "none",
      borderRadius: "14px",
      fontWeight: "700",
      cursor: "pointer"
    },
    autoBtn: {
      padding: "14px 18px",
      background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
      color: "white",
      border: "none",
      borderRadius: "14px",
      cursor: "pointer"
    },
    chatBox: {
      height: "450px",
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      gap: "14px",
      padding: "16px",
      background: "rgba(15, 23, 42, 0.4)",
      borderRadius: "16px",
      border: "1px solid rgba(56, 189, 248, 0.1)"
    },
    message: {
      padding: "14px 18px",
      borderRadius: "20px",
      maxWidth: "85%",
      lineHeight: 1.6
    },
    dataBox: {
      padding: "16px",
      background: "rgba(15, 23, 42, 0.6)",
      borderRadius: "16px",
      border: "1px solid rgba(56, 189, 248, 0.1)"
    },
    pre: {
      fontSize: "13px",
      color: "#38bdf8",
      whiteSpace: "pre-wrap"
    },
    btnGroup: {
      display: 'flex',
      gap: '12px',
      marginTop: '20px'
    },
    mockView: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '60vh',
      textAlign: 'center'
    },
    killSwitchBtn: {
      width: '120px',
      height: '60px',
      borderRadius: '30px',
      background: killSwitchActive ? '#ef4444' : '#10b981',
      border: 'none',
      position: 'relative',
      cursor: 'pointer',
      transition: 'all 0.3s',
      boxShadow: killSwitchActive ? '0 0 30px rgba(239, 68, 68, 0.6)' : '0 0 20px rgba(16, 185, 129, 0.4)'
    },
    toggleKnob: {
      width: '50px',
      height: '50px',
      borderRadius: '25px',
      background: '#fff',
      position: 'absolute',
      top: '5px',
      left: killSwitchActive ? '65px' : '5px',
      transition: 'all 0.3s',
      boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
    }
  };

  const NavItem = ({ id, icon, label }) => (
    <div 
      style={{...styles.navItem, ...(page === id ? styles.navItemActive : {})}}
      onClick={() => setPage(id)}
    >
      <span style={{display: 'flex', alignItems: 'center'}}>{icon}</span>
      {!isMobile && <span>{label}</span>}
    </div>
  );

  return (
    <div style={styles.appWrapper}>
      {/* LEFT SIDEBAR */}
      <nav style={styles.sidebar}>
        <div style={styles.logoArea}>
          <span style={{display: 'flex', alignItems: 'center'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </span>
          <span style={styles.logoText}>SOC Platform</span>
        </div>
        <div style={styles.navMenu}>
          <NavItem id="dashboard" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>} label="Overview" />
          <NavItem id="chat" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>} label="Live Honeypot" />
          <NavItem id="logs" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>} label="Analysis Logs" />
          <NavItem id="threat_intel" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>} label="Threat Intelligence" />
          <NavItem id="kill_switch" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>} label="Smart Block" />
          <NavItem id="about" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>} label="System About" />
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main style={styles.mainArea}>
        
        {page === "dashboard" && <Dashboard messages={messages} result={result} />}

        {page === "chat" && (
          <motion.div initial={{opacity: 0}} animate={{opacity: 1}}>
            <h2 style={styles.pageTitle}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Live Honeypot Engagement
            </h2>
            <div style={styles.grid}>
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Honeypot Terminal</h3>
                <div style={styles.inputBox}>
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Simulate scammer message..."
                    style={styles.input}
                    disabled={loading}
                  />
                  <button onClick={sendMessage} style={{...styles.primaryBtn, opacity: loading ? 0.6 : 1}} disabled={loading}>Send</button>
                  <button onClick={generateScam} style={styles.autoBtn} disabled={loading}>🎲</button>
                </div>
                <div style={styles.chatBox} ref={chatRef}>
                  {messages.length === 0 ? (
                    <div style={{textAlign: 'center', color: '#64748b', marginTop: '40px'}}>System online. Awaiting inbound threats.</div>
                  ) : (
                    messages.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          ...styles.message,
                          alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                          background: msg.sender === "user" ? "linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)" : "rgba(30, 41, 59, 0.8)",
                          color: msg.sender === "user" ? "white" : "#e2e8f0",
                          border: msg.sender === "user" ? "none" : "1px solid rgba(56, 189, 248, 0.2)"
                        }}
                      >
                        <div style={{fontSize: '11px', opacity: 0.7, marginBottom: '4px'}}>
                          {msg.sender === "user" ? "Attacker IP" : "AI Persona"} • {msg.time}
                        </div>
                        <div>{msg.text}</div>
                      </motion.div>
                    ))
                  )}
                  {loading && (
                    <div style={{...styles.message, alignSelf: "flex-start", background: "rgba(30, 41, 59, 0.8)", border: "1px solid rgba(56, 189, 248, 0.2)"}}>
                      <div className="typing-indicator" style={{display: 'flex', gap: '4px', padding: '5px'}}>
                        <span style={{background: '#38bdf8', width: '8px', height: '8px', borderRadius: '50%'}}></span>
                        <span style={{background: '#38bdf8', width: '8px', height: '8px', borderRadius: '50%'}}></span>
                        <span style={{background: '#38bdf8', width: '8px', height: '8px', borderRadius: '50%'}}></span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Live Threat Analysis</h3>
                {result ? (
                  <div>
                    <div style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '12px', borderLeft: `4px solid ${result.scamDetected ? '#ef4444' : '#10b981'}`, marginBottom: '20px' }}>
                      <h4 style={{ color: result.scamDetected ? '#ef4444' : '#10b981', margin: '0 0 5px 0' }}>
                        {result.scamDetected ? "Scam Payload Detected" : "Benign Traffic"}
                      </h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Real-time Gemini AI Evaluation</p>
                    </div>
                    <div style={styles.dataBox}>
                      <h4 style={{margin: '0 0 10px 0', color: '#94a3b8', fontSize: '14px'}}>Extracted Artifacts (IOCs)</h4>
                      <pre style={styles.pre}>{JSON.stringify(result.extractedIntelligence, null, 2)}</pre>
                    </div>
                  </div>
                ) : (
                  <div style={{color: '#64748b'}}>No active payload detected.</div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {page === "logs" && (
          <motion.div initial={{opacity: 0}} animate={{opacity: 1}}>
            <h2 style={styles.pageTitle}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              Analysis Logs & Reports
            </h2>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px'}}>
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Raw Data Export</h3>
                <p style={{color: '#94a3b8', fontSize: '14px', marginBottom: '20px'}}>Download session threat intelligence for SIEM integration.</p>
                <div style={styles.btnGroup}>
                  <button onClick={exportJSON} style={{...styles.primaryBtn, background: '#10b981', display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Export JSON
                  </button>
                  <button onClick={exportPDF} style={{...styles.primaryBtn, background: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    Export PDF
                  </button>
                </div>
              </div>

              <div style={{...styles.card, border: '1px solid rgba(56, 189, 248, 0.3)', boxShadow: '0 0 20px rgba(56, 189, 248, 0.1)'}}>
                <h3 style={{...styles.cardTitle, color: '#38bdf8'}}>Session Intelligence</h3>
                {result ? (
                  <div>
                    <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                      <span style={{padding: '4px 12px', background: result.scamDetected ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', borderRadius: '20px', color: result.scamDetected ? '#ef4444' : '#10b981', fontSize: '13px', fontWeight: 'bold'}}>
                        {result.scamDetected ? 'SCAM DETECTED' : 'CLEAN'}
                      </span>
                      <span style={{padding: '4px 12px', background: 'rgba(56,189,248,0.1)', borderRadius: '20px', color: '#38bdf8', fontSize: '13px'}}>
                        {messages.length} Messages
                      </span>
                    </div>
                    <div style={{marginTop: '12px'}}>
                      {result.extractedIntelligence?.upiIds?.length > 0 && <p style={{color: '#ef4444', fontSize: '13px', margin: '4px 0'}}>UPI: {result.extractedIntelligence.upiIds.join(', ')}</p>}
                      {result.extractedIntelligence?.phishingLinks?.length > 0 && <p style={{color: '#f59e0b', fontSize: '13px', margin: '4px 0'}}>Links: {result.extractedIntelligence.phishingLinks.join(', ')}</p>}
                    </div>
                  </div>
                ) : (
                  <p style={{color: '#64748b', fontSize: '14px'}}>No active session data. Go to Live Honeypot and send a message first.</p>
                )}
              </div>
            </div>

            <div style={{...styles.card, border: '1px solid rgba(239, 68, 68, 0.3)', boxShadow: '0 0 30px rgba(239, 68, 68, 0.1)'}}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                  <div style={{background: 'rgba(239,68,68,0.1)', padding: '10px', borderRadius: '10px'}}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <div>
                    <h3 style={{...styles.cardTitle, margin: 0, borderBottom: 'none', padding: 0, color: '#f8fafc'}}>FIR Report Generator</h3>
                    <p style={{color: '#94a3b8', fontSize: '13px', margin: '4px 0 0 0'}}>Powered by Gemini AI — Ready to submit to cybercell.gov.in</p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    if (!result) return alert("No scam session found. Go to Live Honeypot and engage a scammer first.");
                    setFirLoading(true);
                    setFirReport('');
                    try {
                      const res = await API.post("/generate-fir", {
                        conversationHistory: messages,
                        extractedIntelligence: result?.extractedIntelligence || {},
                        sessionId: "chat-session"
                      });
                      if (res.data.status === "success" && res.data.firReport) {
                        setFirReport(res.data.firReport);
                      } else {
                        setFirReport("Backend Error: " + (res.data.error || "Unknown error. Check backend logs."));
                      }
                    } catch(e) {
                      setFirReport("Network Error: Could not reach backend at port 8000. Make sure backend is running.");
                    }
                    setFirLoading(false);
                  }}
                  style={{...styles.primaryBtn, background: 'linear-gradient(135deg, #ef4444, #b91c1c)', display: 'flex', alignItems: 'center', gap: '8px', opacity: firLoading ? 0.7 : 1}}
                  disabled={firLoading}
                >
                  {firLoading ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      Generate FIR Report
                    </>
                  )}
                </button>
              </div>

              {firReport ? (
                <div>
                  <div style={{background: 'rgba(15, 23, 42, 0.6)', borderRadius: '12px', padding: '24px', border: '1px solid rgba(148,163,184,0.15)', maxHeight: '450px', overflowY: 'auto'}}>
                    <pre style={{...styles.pre, color: '#e2e8f0', fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: '1.8'}}>{firReport}</pre>
                  </div>
                  <div style={{...styles.btnGroup, marginTop: '16px'}}>
                    <button
                      onClick={() => {
                        const doc = new jsPDF();
                        const lines = doc.splitTextToSize(firReport, 180);
                        doc.setFontSize(10);
                        doc.text(lines, 15, 20);
                        doc.save(`FIR-HPOT-${Date.now()}.pdf`);
                      }}
                      style={{...styles.primaryBtn, background: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px'}}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Download FIR PDF
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText(firReport)}
                      style={{...styles.primaryBtn, background: '#475569', display: 'flex', alignItems: 'center', gap: '8px'}}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      Copy to Clipboard
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{textAlign: 'center', padding: '40px', color: '#64748b', border: '2px dashed rgba(148,163,184,0.2)', borderRadius: '12px'}}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.5" style={{margin: '0 auto 16px'}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  <p style={{margin: 0}}>Click "Generate FIR Report" to create an AI-powered cybercrime complaint</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {page === "threat_intel" && (
          <motion.div initial={{opacity: 0}} animate={{opacity: 1}} style={styles.card}>
            <h2 style={styles.pageTitle}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Global Threat Intelligence
            </h2>
            <div style={styles.mockView}>
              <GeminiIcon />
              <h3 style={{marginTop: '20px', color: '#38bdf8'}}>Syncing with Google Threat Intelligence...</h3>
              <p style={{color: '#94a3b8', maxWidth: '400px'}}>Cross-referencing extracted IOCs (IPs, UPIs, Domains) with global threat databases. This module requires Enterprise API access.</p>
              <div style={{marginTop: '30px', padding: '20px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '12px'}}>
                <span style={{color: '#ef4444', fontWeight: 'bold'}}>Found 3 matches in Global Botnet Registry</span>
              </div>
            </div>
          </motion.div>
        )}

        {page === "kill_switch" && (
          <motion.div initial={{opacity: 0}} animate={{opacity: 1}} style={styles.card}>
            <h2 style={styles.pageTitle}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
              Automatic Containment
            </h2>
            <div style={styles.mockView}>
              <h3 style={{color: '#e2e8f0', marginBottom: '10px'}}>Network Kill Switch</h3>
              <p style={{color: '#94a3b8', marginBottom: '40px', maxWidth: '500px'}}>Instantly drop all connections from IPs flagged by Gemini as High-Risk Scammers.</p>
              
              <button 
                style={styles.killSwitchBtn} 
                onClick={() => setKillSwitchActive(!killSwitchActive)}
              >
                <div style={styles.toggleKnob}></div>
              </button>
              <h2 style={{color: killSwitchActive ? '#ef4444' : '#10b981', marginTop: '20px'}}>
                {killSwitchActive ? "ENGAGED: Blocking Malicious IPs" : "STANDBY: Monitoring Only"}
              </h2>
            </div>
          </motion.div>
        )}

        {page === "about" && (
          <motion.div initial={{opacity: 0}} animate={{opacity: 1}}>
             <div style={{ textAlign: 'center', marginBottom: '50px', marginTop: '40px' }}>
              <div style={{ display: 'inline-block', padding: '10px 20px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '30px', color: '#38bdf8', fontSize: '14px', fontWeight: 'bold', marginBottom: '16px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                ✨ Powered by Google Gemini 2.5 Flash
              </div>
              <h1 style={{fontSize: '48px', backgroundImage: 'linear-gradient(90deg, #4285F4, #9B72CB, #D96570)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '20px'}}>
                Agentic Security SOC
              </h1>
              <p style={{fontSize: '18px', maxWidth: '700px', margin: '0 auto', lineHeight: '1.8', color: '#94a3b8'}}>
                An autonomous AI-powered honeypot designed to detect scam messages and intelligently engage scammers using a human-like persona to extract critical intelligence.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '50px' }}>
              <div style={{...styles.card, border: '1px solid rgba(168, 85, 247, 0.4)', boxShadow: '0 0 20px rgba(168, 85, 247, 0.15)', padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'}}>
                <div style={{ marginBottom: '20px', background: 'rgba(192, 132, 252, 0.1)', padding: '16px', borderRadius: '50%' }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>
                </div>
                <h3 style={{...styles.cardTitle, color: '#c084fc', borderBottom: 'none'}}>Agentic AI Engine</h3>
                <p style={{color: '#cbd5e1', lineHeight: '1.6'}}>Leverages Google Gemini to maintain adaptive, multi-turn conversations that sound completely human to the attacker.</p>
              </div>
              <div style={{...styles.card, border: '1px solid rgba(56, 189, 248, 0.4)', boxShadow: '0 0 20px rgba(56, 189, 248, 0.15)', padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'}}>
                <div style={{ marginBottom: '20px', background: 'rgba(56, 189, 248, 0.1)', padding: '16px', borderRadius: '50%' }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                </div>
                <h3 style={{...styles.cardTitle, color: '#38bdf8', borderBottom: 'none'}}>Intelligence Extraction</h3>
                <p style={{color: '#cbd5e1', lineHeight: '1.6'}}>Automatically parses and extracts high-value IOCs including UPI IDs, Bank Accounts, and Phishing URLs.</p>
              </div>
              <div style={{...styles.card, border: '1px solid rgba(16, 185, 129, 0.4)', boxShadow: '0 0 20px rgba(16, 185, 129, 0.15)', padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'}}>
                <div style={{ marginBottom: '20px', background: 'rgba(16, 185, 129, 0.1)', padding: '16px', borderRadius: '50%' }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                </div>
                <h3 style={{...styles.cardTitle, color: '#10b981', borderBottom: 'none'}}>Global Threat Mapping</h3>
                <p style={{color: '#cbd5e1', lineHeight: '1.6'}}>Real-time simulation of attacker IP tracing with a dedicated SOC dashboard and geographical pinpointing.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '50px' }}>
              <div style={{...styles.card, border: '1px solid rgba(245, 158, 11, 0.4)', boxShadow: '0 0 20px rgba(245, 158, 11, 0.15)', padding: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                  <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '12px', borderRadius: '12px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  </div>
                  <h3 style={{...styles.cardTitle, color: '#f59e0b', margin: 0, borderBottom: 'none', padding: 0}}>Browser Extension Integration</h3>
                </div>
                <p style={{color: '#cbd5e1', lineHeight: '1.6'}}>Includes a working Chrome Extension (Manifest V3) that allows users to instantly deploy the Agentic Honeypot from WhatsApp Web or Gmail with a single click.</p>
              </div>

              <div style={{...styles.card, border: '1px solid rgba(148, 163, 184, 0.3)', padding: '30px' }}>
                <h3 style={{...styles.cardTitle, color: '#f8fafc', borderBottom: 'none', margin: '0 0 10px 0'}}>Tech Stack</h3>
                <p style={{color: '#94a3b8', fontSize: '14px', marginBottom: '15px'}}>Built specifically for Google Hack2Skill with enterprise-ready architecture.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  <span style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', color: '#cbd5e1', fontSize: '13px', border: '1px solid rgba(255,255,255,0.1)'}}>React.js</span>
                  <span style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', color: '#cbd5e1', fontSize: '13px', border: '1px solid rgba(255,255,255,0.1)'}}>FastAPI</span>
                  <span style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', color: '#cbd5e1', fontSize: '13px', border: '1px solid rgba(255,255,255,0.1)'}}>Google Gemini AI</span>
                  <span style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', color: '#cbd5e1', fontSize: '13px', border: '1px solid rgba(255,255,255,0.1)'}}>Chrome Extension APIs</span>
                  <span style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', color: '#cbd5e1', fontSize: '13px', border: '1px solid rgba(255,255,255,0.1)'}}>Recharts & D3-Geo</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </main>
    </div>
  );
}

export default App;
