let messages = [];

document.getElementById('sendBtn').addEventListener('click', async () => {
  const inputEl = document.getElementById('messageInput');
  const text = inputEl.value.trim();
  if (!text) return;

  // Add user message to UI
  addMessage(text, 'user');
  inputEl.value = '';
  
  // Track in history
  messages.push({ text: text, sender: "scammer" });

  // Show loading
  const btn = document.getElementById('sendBtn');
  const loading = document.getElementById('loading');
  const alertBox = document.getElementById('alertBox');
  const intelData = document.getElementById('intelData');
  
  btn.disabled = true;
  loading.style.display = 'block';
  alertBox.classList.remove('scam');

  try {
    const response = await fetch('http://localhost:8000/honeypot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': '12345'
      },
      body: JSON.stringify({
        sessionId: "extension-session",
        message: { text: text, sender: "scammer" },
        conversationHistory: messages
      })
    });

    const data = await response.json();
    
    // Add bot response to UI
    addMessage(data.agentReply, 'bot');
    messages.push({ text: data.agentReply, sender: "bot" });

    // Show alert if scam detected
    if (data.scamDetected) {
      alertBox.classList.add('scam');
      const intel = [];
      if (data.extractedIntelligence.upiIds.length > 0) intel.push(`UPI: ${data.extractedIntelligence.upiIds.join(', ')}`);
      if (data.extractedIntelligence.phishingLinks.length > 0) intel.push(`Links: ${data.extractedIntelligence.phishingLinks.join(', ')}`);
      
      intelData.innerText = intel.length > 0 ? intel.join(' | ') : 'Malicious intent identified.';
    }

  } catch (error) {
    console.error('Error connecting to Honeypot API:', error);
    addMessage('Connection failed. Make sure local backend (port 8000) is running.', 'bot');
  } finally {
    btn.disabled = false;
    loading.style.display = 'none';
  }
});

function addMessage(text, sender) {
  const chatBox = document.getElementById('chatBox');
  const div = document.createElement('div');
  div.className = `msg ${sender}`;
  div.innerText = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}
