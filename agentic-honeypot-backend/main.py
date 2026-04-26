from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import Optional
import os, re, requests, json

from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types

load_dotenv()

app = FastAPI(title="Agentic Honey-Pot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.getenv("API_KEY", "12345")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

try:
    gemini_client = genai.Client(api_key=GEMINI_API_KEY)
except Exception as e:
    print(f"Error initializing Gemini: {e}")
    gemini_client = None

# =========================
# SECURITY
# =========================
def verify_api_key(x_api_key):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API Key")

# =========================
# SESSION MEMORY
# =========================
SESSIONS = {}

# =========================
# GEMINI INTELLIGENCE EXTRACTION
# =========================
def analyze_message_with_gemini(text: str, history: list):
    if not gemini_client:
        return {"scamDetected": False, "intents": [], "extracted": {}}
    
    prompt = f"""
    Analyze the following message and the conversation history to detect if it's a scam.
    Extract any intelligence data (Bank Accounts, UPI IDs, Phishing Links, Phone Numbers).
    Detect intents (e.g., THREAT, PAYMENT, URGENCY, CREDENTIAL, LINK).
    
    Conversation History:
    {json.dumps(history)}
    
    Latest Message:
    {text}
    
    Respond in strict JSON format:
    {{
        "scamDetected": true/false,
        "intents": ["INTENT1", "INTENT2"],
        "extracted": {{
            "bankAccounts": [],
            "upiIds": [],
            "phishingLinks": [],
            "phoneNumbers": []
        }}
    }}
    """
    
    try:
        response = gemini_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Gemini Analysis Error: {e}")
        return {"scamDetected": False, "intents": [], "extracted": {}}

# =========================
# GEMINI PERSONA REPLY
# =========================
def generate_agent_reply(text: str, history: list, extracted_intel: dict):
    if not gemini_client:
        return "I am having trouble understanding this right now."

    system_instruction = """
    You are an autonomous AI Honey-Pot. Your goal is to engage scammers, keep them talking, and extract actionable intelligence (like bank accounts or UPI IDs).
    Play the persona of a gullible, slightly confused, and trusting user who is worried about their account but not very tech-savvy.
    Do NOT reveal that you are an AI. Keep your responses short, natural, and human-like.
    If the scammer asks for payment, ask for clear details on where to send it.
    If they threaten you, act worried and ask how to fix it.
    """
    
    # Format history for Gemini chat
    chat_history = []
    for msg in history:
        # Avoid passing empty text or improperly structured history
        msg_text = msg.get("text", "").strip()
        if not msg_text: continue
        role = "model" if msg.get("sender") == "agent" else "user"
        chat_history.append({"role": role, "parts": [{"text": msg_text}]})
        
    chat_history.append({"role": "user", "parts": [{"text": text}]})
    
    try:
        response = gemini_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=chat_history,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7,
            )
        )
        return response.text
    except Exception as e:
        print(f"Gemini Reply Error: {e}")
        return "Can you please explain that again? I want to make sure I do the right thing."

# =========================
# INTELLIGENCE EXTRACTION (REGEX FALLBACK)
# =========================
def extract_info_regex(text: str):
    return {
        "bankAccounts": re.findall(r"\b\d{9,18}\b", text),
        "upiIds": re.findall(r"\b[\w.-]+@[\w.-]+\b", text),
        "phishingLinks": re.findall(r"https?://\S+", text),
        "phoneNumbers": re.findall(r"\+91\d{10}", text)
    }

def dedup(data: dict):
    return {k: list(set(v)) for k, v in data.items()}

# =========================
# FINAL CALLBACK
# =========================
def send_final(session_id, intel, turns):
    payload = {
        "sessionId": session_id,
        "scamDetected": True,
        "totalMessagesExchanged": turns,
        "extractedIntelligence": intel,
        "agentNotes": "Engaged by Google Gemini Agentic Persona"
    }
    try:
        requests.post(
            "https://hackathon.guvi.in/api/updateHoneyPotFinalResult",
            json=payload,
            timeout=5
        )
    except:
        pass

# =========================
# MAIN ENDPOINT
# =========================
@app.post("/honeypot")
def honeypot(payload: Optional[dict] = None, x_api_key: str = Header(None)):
    verify_api_key(x_api_key)

    if payload is None:
        payload = {}

    session_id = payload.get("sessionId", "default-session")
    msg = payload.get("message", {})
    text = msg.get("text", "")
    sender = msg.get("sender", "scammer")
    history = payload.get("conversationHistory", [])

    if session_id not in SESSIONS:
        SESSIONS[session_id] = {
            "intel": {
                "bankAccounts": [],
                "upiIds": [],
                "phishingLinks": [],
                "phoneNumbers": []
            },
            "scam_detected": False,
            "turns": 0
        }

    session = SESSIONS[session_id]
    session["turns"] += 1

    intents = []
    agent_reply = None
    
    if sender == "scammer":
        # 1. Analyze with Gemini
        analysis = analyze_message_with_gemini(text, history)
        
        is_scam = analysis.get("scamDetected", False)
        intents = analysis.get("intents", [])
        extracted_gemini = analysis.get("extracted", {})
        
        # 2. Regex fallback for extra safety
        extracted_regex = extract_info_regex(text)
        
        if is_scam or session["scam_detected"] or any(intents):
            session["scam_detected"] = True
            
            # Merge extractions
            if isinstance(extracted_gemini, dict):
                for k in session["intel"]:
                    if k in extracted_gemini and isinstance(extracted_gemini[k], list):
                        session["intel"][k].extend(extracted_gemini[k])
            for k in session["intel"]:
                session["intel"][k].extend(extracted_regex.get(k, []))
            
            session["intel"] = dedup(session["intel"])
            
            # 3. Generate Agent Reply using Gemini
            agent_reply = generate_agent_reply(text, history, session["intel"])

    stop = session["scam_detected"] and session["turns"] >= 6 and any(session["intel"].values())
    if stop:
        send_final(session_id, session["intel"], session["turns"])

    return {
        "status": "success",
        "scamDetected": session["scam_detected"],
        "detectedIntents": intents,
        "agentReply": agent_reply or (
            "Please explain this message. I am not aware of any such issue."
            if session["scam_detected"] else None
        ),
        "engagementMetrics": {
            "totalMessagesExchanged": session["turns"]
        },
        "extractedIntelligence": session["intel"],
        "agentNotes": "Powered by Gemini AI"
    }

# =========================
# FIR REPORT GENERATOR
# =========================
class FIRRequest(BaseModel):
    conversationHistory: list = []
    extractedIntelligence: dict = {}
    sessionId: str = "unknown"

@app.post("/generate-fir")
async def generate_fir(req: FIRRequest, x_api_key: Optional[str] = Header(None)):
    verify_api_key(x_api_key)

    intel = req.extractedIntelligence
    history = req.conversationHistory

    conversation_text = "\n".join([
        f"{'SCAMMER' if m.get('sender') == 'user' else 'AI AGENT'}: {m.get('text', '')}"
        for m in history
    ])

    prompt = f"""
You are a cybercrime FIR (First Information Report) drafting assistant for Indian Police.

Based on the following scam conversation and extracted intelligence, generate a professional, formal FIR report in English.

--- SCAM CONVERSATION ---
{conversation_text if conversation_text else "No conversation recorded."}

--- EXTRACTED INTELLIGENCE ---
UPI IDs Found: {intel.get('upiIds', [])}
Bank Accounts Found: {intel.get('bankAccounts', [])}
Phone Numbers Found: {intel.get('phoneNumbers', [])}
Phishing Links Found: {intel.get('phishingLinks', [])}

Generate a formal FIR with these sections:
1. COMPLAINT REFERENCE NUMBER (auto-generate like FIR-HPOT-YYYY-XXXX)
2. DATE AND TIME OF INCIDENT
3. NATURE OF OFFENCE (UPI Fraud / Phishing / etc.)
4. DESCRIPTION OF INCIDENT (detailed paragraph)
5. ACCUSED DETAILS (from extracted intelligence)
6. DIGITAL EVIDENCE (list all IOCs)
7. RELEVANT IPC SECTIONS (66C, 66D IT Act, 420 IPC etc.)
8. DECLARATION

Keep it formal, professional and ready to submit to cybercell.gov.in
"""

    if not gemini_client:
        return {"error": "Gemini not configured", "status": "failed"}

    try:
        response = gemini_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        fir_text = response.text
        return {"firReport": fir_text, "status": "success"}
    except Exception as e:
        print(f"FIR Generation Error: {e}")
        return {"error": str(e), "firReport": None, "status": "failed"}
