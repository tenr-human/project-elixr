let patientData = [];

// Load patient database from server (static file)
async function loadPatientTable() {
  try {
    const response = await fetch('/static/patients.json');
    patientData = await response.json();
  } catch (err) {
    console.error('Failed to load patients.json', err);
    patientData = [];
  }
  const tbody = document.querySelector('#patientTable tbody');
  tbody.innerHTML = '';
  patientData.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.patient_id}</td>
      <td>${p.name}</td>
      <td>${p.diagnosis}</td>
      <td>${p.date_of_admission}</td>
      <td>${p.previous_ailments}</td>
      <td>${p.previous_diagnosis}</td>
      <td>${p.other_conditions}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Expanded symptom map (~60+ symptoms)
const symptomMap = {
  "headache": ["Migraine","Tension Headache","Cluster Headache","Hypertension"],
  "dizziness": ["Vertigo","Low Blood Pressure","Dehydration","Anemia"],
  "seizure": ["Epilepsy","Brain Injury","High Fever (Febrile Seizure)","Meningitis"],
  "numbness": ["Stroke","Multiple Sclerosis","Peripheral Neuropathy","Vitamin B12 Deficiency"],
  "confusion": ["Stroke","Hypoglycemia","Dementia","Encephalitis"],
  "memory loss": ["Dementia","Alzheimer’s Disease","Head Injury"],
  "cough": ["Common Cold","Bronchitis","Asthma","Pneumonia","COVID-19"],
  "fever": ["Flu (Influenza)","Pneumonia","Malaria","Typhoid","COVID-19"],
  "sore throat": ["Strep Throat","Pharyngitis","Tonsillitis","Common Cold"],
  "shortness of breath": ["Asthma","COPD","Heart Failure","Pneumonia","Pulmonary Embolism"],
  "wheezing": ["Asthma","Bronchitis","COPD"],
  "stomach pain": ["Gastritis","Peptic Ulcer","Food Poisoning","Irritable Bowel Syndrome"],
  "nausea": ["Food Poisoning","Gastroenteritis","Pregnancy (Morning Sickness)","Motion Sickness"],
  "vomiting": ["Gastroenteritis","Food Poisoning","Migraine","Pregnancy"],
  "diarrhea": ["Food Poisoning","Cholera","Gastroenteritis","Lactose Intolerance"],
  "constipation": ["Low Fiber Diet","Dehydration","Irritable Bowel Syndrome","Hypothyroidism"],
  "bloody stool": ["Hemorrhoids","Ulcerative Colitis","Colon Cancer"],
  "joint pain": ["Arthritis","Osteoarthritis","Gout","Rheumatoid Arthritis"],
  "back pain": ["Muscle Strain","Herniated Disc","Sciatica","Osteoporosis"],
  "muscle weakness": ["Myasthenia Gravis","Muscular Dystrophy","Electrolyte Imbalance"],
  "chest pain": ["Angina","Heart Attack (Myocardial Infarction)","GERD","Panic Attack"],
  "palpitations": ["Arrhythmia","Hyperthyroidism","Anxiety Disorder","Dehydration"],
  "swelling in legs": ["Heart Failure","Kidney Disease","Liver Disease","Deep Vein Thrombosis"],
  "rash": ["Allergic Reaction","Measles","Eczema","Chickenpox"],
  "itching": ["Allergy","Scabies","Eczema","Fungal Infection"],
  "yellow skin": ["Hepatitis","Liver Failure","Jaundice"],
  "fatigue": ["Anemia","Thyroid Disorder","Diabetes","Chronic Fatigue Syndrome"],
  "weight loss": ["Diabetes","Hyperthyroidism","Cancer","Malnutrition"],
  "weight gain": ["Hypothyroidism","Cushing's Syndrome","Obesity"],
  "night sweats": ["Tuberculosis","Lymphoma","HIV Infection"],
  "painful urination": ["Urinary Tract Infection","Kidney Stones","Prostatitis"],
  "frequent urination": ["Diabetes","Urinary Tract Infection","Pregnancy"],
  "blood in urine": ["Kidney Stones","Bladder Cancer","Urinary Tract Infection"],
  "irregular periods": ["Polycystic Ovary Syndrome (PCOS)","Thyroid Disorder","Stress"],
  "blurred vision": ["Cataracts","Diabetes","Glaucoma","Stroke"],
  "red eyes": ["Conjunctivitis","Dry Eyes","Glaucoma"],
  "hearing loss": ["Ear Infection","Earwax Blockage","Noise Damage"],
  "ear pain": ["Otitis Media","Ear Infection","Sinus Infection"],
  "anxiety": ["Generalized Anxiety Disorder","Panic Disorder","Hyperthyroidism"],
  "depression": ["Major Depressive Disorder","Hypothyroidism","Bipolar Disorder"],
  "insomnia": ["Stress","Depression","Anxiety","Sleep Apnea"]
};

function normalizeSymptom(s) {
  s = s.toLowerCase().trim();
  const map = {
    "sob":"shortness of breath","stomach ache":"stomach pain",
    "abdominal pain":"stomach pain","feverish":"fever",
    "high fever":"fever","throwing up":"vomiting",
    "poop blood":"bloody stool","urine blood":"blood in urine",
    "leg swelling":"swelling in legs","tired":"fatigue",
    "weight loss recent":"weight loss","gain weight":"weight gain"
  };
  return map[s] || s;
}

function localDiagnosis(query) {
  if (!query || !query.trim()) return null;
  const parts = query.toLowerCase().split(/[,;]+|\band\b|\+|\n/).map(s=>s.trim()).filter(Boolean);
  const symptoms = parts.map(normalizeSymptom);
  let possibleConditions = null; let anyMatched=false;
  for (const symptom of symptoms) {
    if (symptomMap[symptom]) {
      anyMatched=true;
      if (possibleConditions===null) {
        possibleConditions=new Set(symptomMap[symptom]);
      } else {
        const nextSet=new Set(symptomMap[symptom]);
        possibleConditions=new Set([...possibleConditions].filter(d=>nextSet.has(d)));
      }
    }
  }
  if (!anyMatched) return null;
  if (possibleConditions && possibleConditions.size>0) {
    return `🩺 Based on your symptoms, possible conditions are: ${[...possibleConditions].join(", ")}`;
  } else return "⚠️ No single condition matches all those symptoms together.";
}

async function diagnose() {
  const symptomsText=document.getElementById('queryInput').value.trim();
  const output=document.getElementById('diagnosisResult');
  if (!symptomsText) { alert('Please enter symptoms or a question.'); return; }
  const local=localDiagnosis(symptomsText);
  if (local) { output.textContent=local; return; }
  output.textContent='⏳ Asking AI (fallback)...';
  try {
    const resp=await fetch('/api/diagnose',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:symptomsText})});
    const data=await resp.json();
    if (data.error) output.textContent='⚠️ '+data.error; else output.textContent=data.answer;
  } catch(err) { console.error(err); output.textContent='⚠️ No probable disease found (offline mode).'; }
}

function localPatientQuery(input) {
  const keyword=input.toLowerCase();
  const patient=patientData.find(p=>keyword.includes(p.name.toLowerCase())||keyword.includes(p.diagnosis.toLowerCase()));
  if (patient) return `Patient: ${patient.name}\nDiagnosis: ${patient.diagnosis}\nDate of Admission: ${patient.date_of_admission}\nPrevious Ailments: ${patient.previous_ailments}\nPrevious Diagnosis: ${patient.previous_diagnosis}\nOther Conditions: ${patient.other_conditions}`;
  return null;
}

async function answerPatientQuery() {
  const input=document.getElementById('patientQueryInput').value.trim();
  const output=document.getElementById('patientAiAnswer');
  if (!input) { alert('Please enter a question.'); return; }
  const local=localPatientQuery(input);
  if (local) { output.textContent=local; return; }
  output.textContent='⏳ Asking AI (fallback)...';
  try {
    const resp=await fetch('/api/patient-query',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:input})});
    const data=await resp.json();
    if (data.error) output.textContent='⚠️ '+data.error; else output.textContent=data.answer;
  } catch(err) { console.error(err); output.textContent='⚠️ Could not answer (offline mode).'; }
}

async function addPatient() {
  const newPatient={
    name:document.getElementById('pName').value.trim(),
    diagnosis:document.getElementById('pDiagnosis').value.trim(),
    date_of_admission:document.getElementById('pDate').value,
    previous_ailments:document.getElementById('pPrevAilments').value.trim(),
    previous_diagnosis:document.getElementById('pPrevDiagnosis').value.trim(),
    other_conditions:document.getElementById('pOther').value.trim()
  };
  if (!newPatient.name||!newPatient.diagnosis) { alert('Name and Diagnosis are required'); return; }
  const nextId=(patientData.length?Math.max(...patientData.map(p=>p.patient_id)):0)+1;
  const localCopy={...newPatient,patient_id:nextId};
  patientData.push(localCopy); loadPatientTable();
  try {
    const resp=await fetch('/api/add-patient',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(newPatient)});
    const data=await resp.json();
    if (data.success) { alert('Patient saved (id: '+data.patient_id+')'); loadPatientTable(); }
    else alert('Saved locally, but server failed to persist.');
  } catch(err){ console.error(err); alert('Saved locally, server not reachable.'); }
}

function filterTable() {
  const filter=document.getElementById('searchInput').value.toLowerCase();
  const rows=document.querySelectorAll('#patientTable tbody tr');
  rows.forEach(row=>{row.style.display=Array.from(row.cells).some(cell=>cell.textContent.toLowerCase().includes(filter))?'':'none';});
}

// Screen switching
function showScreen(id) {
  document.querySelectorAll('#app-root > div').forEach(div=>div.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}
function goBack() { showScreen('dashboard'); }

document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('imageInput').addEventListener('change',async e=>{
    const file=e.target.files[0]; if (!file) return;
    document.getElementById('status').textContent='⏳ Processing...';
    try {
      const result=await Tesseract.recognize(file,'eng',{logger:m=>{if(m.status==='recognizing text'){document.getElementById('status').textContent=`⏳ Progress: ${(m.progress*100).toFixed(2)}%`;}}});
      document.getElementById('output').textContent=result.data.text; document.getElementById('status').textContent='✅ OCR Complete!';
    } catch(err){console.error('OCR failed',err); document.getElementById('status').textContent='⚠️ OCR Failed.';}
  });
  document.getElementById('askBtn').addEventListener('click',answerPatientQuery);
  document.getElementById('resetBtn').addEventListener('click',()=>{document.getElementById('patientQueryInput').value='';document.getElementById('patientAiAnswer').textContent='Ask a question above and get detailed answers here.';document.getElementById('searchInput').value='';loadPatientTable();});
  document.getElementById('backBtn2').addEventListener('click',goBack);
  showScreen('dashboard'); loadPatientTable();
});
