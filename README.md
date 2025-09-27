# Elixr – AI-Powered Hospital Support System

## 🌍 Problem Statement
Hospitals worldwide face growing challenges:
- **Lack of healthcare workers** and **staff burnout**  
- **High patient wait times** and inefficient triage  
- Doctors often receive patient details late, slowing treatment  
- Patients need **quick preliminary diagnoses** so doctors can focus on verification and treatment  

## 💡 Solution: Elixr
Elixr is an AI system designed for **hospital-wide deployment** to support medical staff, not replace them. It helps by:
- 📋 **Organizing patients by priority order** to reduce wait times  
- 🚑 **Receiving patient details from ambulances** in advance so doctors are prepared  
- 🩺 **Offering quick AI-assisted preliminary diagnoses**, which doctors can verify and finalize  
- ⚡ **Reducing burnout** by handling repetitive tasks and data lookups  

Elixr combines a **local rule-based engine** (always available offline) with an **LLM fallback** (when an API key is available), ensuring reliability even without internet or cloud access.  

---

## 🚀 Features
- **Patient Database Management**  
  Add, view, and query patient records with structured data.  
- **Local + LLM Diagnosis**  
  - Local rule-based multi-symptom diagnosis (offline)  
  - LLM fallback for deeper explanations (requires OpenAI API key)  
- **OCR Tool**  
  Extracts text from scanned documents/images for easy record integration.  
- **Triage Support**  
  Patients can be sorted by urgency based on symptoms and ambulance data.  

---

## ⚙️ How to Run

### 1. Clone / Download
Download the project and unzip:
```bash
unzip elixr-complete.zip
cd elixr-llm-complete
2. Install Dependencies
Run the following code on your command prompt/terminal:
>>> pip install flask openai python-dotenv
3. Run Without an API Key (Offline Mode)
If you don’t have an OpenAI API key, the system will still work in offline mode:
Execute Elixr.cmd in the project root.
or

Run the following command on your terminal:

>>> python server.py

Open http://127.0.0.1:5000/ in your browser.

Diagnoses will come from the rule-based local system.

Patient database and OCR tool will work fully.

4. Run With an OpenAI API Key (LLM Mode)
Paste your OpenAI api key on the .env file located in the project root at 'sk-your-real-key-here'
OPENAI_API_KEY=sk-your-real-key-here

Start the server:
>>> python server.py
Open http://127.0.0.1:5000/ in your browser.
_________________________________________________________________________________________________________________________________________________________________________
Local rule-based diagnosis is still the first step.

If no match is found, the system calls OpenAI’s API for fallback.

AI answers can provide richer medical context, but doctors remain the final decision-makers.

🛡️ Notes
Elixr does not replace doctors — it is an assistant to improve efficiency.

All patient data is stored in static/patients.json.

Doctors and admins can extend the symptom map or connect ambulance feeds.

Without an API key, everything still works offline.

👩‍⚕️ Future Directions
Real-time ambulance integration for automatic triage

Doctor dashboards with burnout-monitoring alerts

Expanded symptom coverage and multimodal inputs (voice, video, wearables)

🖥️ Tech Stack
Frontend: HTML, CSS, JavaScript (Tesseract.js for OCR)

Backend: Python (Flask)

AI: Local rule-based diagnosis + OpenAI LLM fallback

✅ Summary
Elixr reduces wait times, combats staff burnout, and improves hospital efficiency by automating routine tasks while keeping doctors in control of final decisions.
