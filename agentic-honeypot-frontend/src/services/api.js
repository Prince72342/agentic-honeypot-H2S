import axios from "axios";

const API = axios.create({
  baseURL: "https://agentic-honeypot-h2s.onrender.com",
  headers: {
    "Content-Type": "application/json",   // 🔥 IMPORTANT
    "x-api-key": "12345"                  // 🔥 exact same as backend
  }
});

export default API;