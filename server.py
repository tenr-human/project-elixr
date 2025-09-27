from flask import Flask, send_from_directory, request, jsonify
import os, json, threading
from openai import OpenAI
from dotenv import load_dotenv

# load .env
load_dotenv()

app = Flask(__name__)
STATIC_DIR = os.path.join(os.path.dirname(__file__), 'static')

OPENAI_KEY = os.getenv('OPENAI_API_KEY')
print('DEBUG: OpenAI key detected:', bool(OPENAI_KEY))
client = OpenAI(api_key=OPENAI_KEY) if OPENAI_KEY else None

@app.route('/')
def index():
    return send_from_directory(STATIC_DIR, 'index.html')

@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory(STATIC_DIR, filename)

PATIENTS_FILE = os.path.join(STATIC_DIR, 'patients.json')
patients_lock = threading.Lock()

def load_patients():
    with open(PATIENTS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_patients(patients):
    with patients_lock:
        with open(PATIENTS_FILE, 'w', encoding='utf-8') as f:
            json.dump(patients, f, indent=2, ensure_ascii=False)

@app.route('/api/add-patient', methods=['POST'])
def add_patient():
    data = request.json
    patients = load_patients()
    new_id = max([p.get('patient_id',0) for p in patients]) + 1 if patients else 1
    data['patient_id'] = new_id
    patients.append(data)
    save_patients(patients)
    return jsonify({'success': True, 'patient_id': new_id})

@app.route('/api/patient-query', methods=['POST'])
def patient_query():
    data = request.json or {}
    question = data.get('query','')
    if not client:
        return jsonify({'error':'⚠️ No OpenAI API key configured. Add it to .env to enable LLM fallback.'})
    try:
        prompt = f"""You are a helpful medical-records assistant. The user asks: {question}
Provide a concise helpful answer using patient records context if relevant."""
        resp = client.chat.completions.create(model='gpt-4o-mini', messages=[{'role':'user','content':prompt}], max_tokens=500)
        answer = resp.choices[0].message.content.strip()
        return jsonify({'answer': answer})
    except Exception as e:
        return jsonify({'error':'LLM request failed: '+str(e)})

@app.route('/api/diagnose', methods=['POST'])
def diagnose():
    data = request.json or {}
    query = data.get('query','')
    if not client:
        return jsonify({'error':'⚠️ No OpenAI API key configured. Add it to .env to enable LLM fallback.'})
    try:
        prompt = f"""You are an experienced doctor. The patient symptoms are: {query}.
Provide a concise list of possible diagnoses and recommended next steps (what tests to consider)."""
        resp = client.chat.completions.create(model='gpt-4o-mini', messages=[{'role':'user','content':prompt}], max_tokens=500)
        answer = resp.choices[0].message.content.strip()
        return jsonify({'answer': answer})
    except Exception as e:
        return jsonify({'error':'LLM request failed: '+str(e)})

if __name__ == '__main__':
    print('Serving on http://127.0.0.1:5000/')
    app.run(host='127.0.0.1', port=5000, debug=True)
