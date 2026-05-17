const state = {
  apiUrl: resolveApiUrl(),
  lastAnalysis: null,
  activeNodeId: null,
};

const sampleText = `Patient: Amina Rahman, Age: 54. Diagnosis: Type 2 diabetes and hypertension. Medications: Metformin 500 mg twice daily, Lisinopril 10 mg once daily, Aspirin 75 mg daily. Lab results: HbA1c 8.2%, BP 150/95 mmHg, Creatinine 1.1 mg/dL. Allergy: Penicillin. Follow up after 2 weeks.`;

const els = {
  apiUrlInput: document.getElementById('apiUrlInput'),
  backendStatus: document.getElementById('backendStatus'),
  textForm: document.getElementById('textForm'),
  uploadForm: document.getElementById('uploadForm'),
  documentText: document.getElementById('documentText'),
  documentType: document.getElementById('documentType'),
  patientNotes: document.getElementById('patientNotes'),
  uploadDocumentType: document.getElementById('uploadDocumentType'),
  uploadPatientNotes: document.getElementById('uploadPatientNotes'),
  fileInput: document.getElementById('fileInput'),
  fileName: document.getElementById('fileName'),
  dropzone: document.getElementById('dropzone'),
  emptyState: document.getElementById('emptyState'),
  loadingState: document.getElementById('loadingState'),
  resultsContent: document.getElementById('resultsContent'),
  analysisState: document.getElementById('analysisState'),
  dashboardBlocks: document.getElementById('dashboardBlocks'),
  graphSvg: document.getElementById('graphSvg'),
  nodeDetails: document.getElementById('nodeDetails'),
  manualMeds: document.getElementById('manualMeds'),
  manualInteractionResults: document.getElementById('manualInteractionResults'),
  toast: document.getElementById('toast'),
};

init();

function init() {
  els.apiUrlInput.value = state.apiUrl;
  bindEvents();
  checkBackend();
}

function bindEvents() {
  document.getElementById('mobileMenuBtn').addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('open'));
  document.querySelectorAll('.nav-links a').forEach((link) => {
    link.addEventListener('click', () => document.querySelector('.sidebar').classList.remove('open'));
  });

  document.querySelectorAll('.tab').forEach((button) => {
    button.addEventListener('click', () => switchTab(button.dataset.tab));
  });

  document.getElementById('saveApiUrlBtn').addEventListener('click', () => {
    const value = normalizeApiUrl(els.apiUrlInput.value);
    state.apiUrl = value;
    localStorage.setItem('mdi_api_url', value);
    els.apiUrlInput.value = value;
    showToast('API URL saved. Testing connection...', 'success');
    checkBackend();
  });

  document.getElementById('loadSampleBtn').addEventListener('click', loadSample);
  document.getElementById('sampleHealthCheckBtn').addEventListener('click', checkBackend);
  document.getElementById('clearBtn').addEventListener('click', () => {
    els.documentText.value = '';
    els.patientNotes.value = '';
  });
  document.getElementById('resetUploadBtn').addEventListener('click', () => {
    els.uploadForm.reset();
    els.fileName.textContent = 'No file selected';
  });

  els.textForm.addEventListener('submit', onTextAnalyze);
  els.uploadForm.addEventListener('submit', onUploadAnalyze);
  els.fileInput.addEventListener('change', () => updateFileName());
  els.dropzone.addEventListener('dragover', (event) => {
    event.preventDefault();
    els.dropzone.classList.add('dragover');
  });
  els.dropzone.addEventListener('dragleave', () => els.dropzone.classList.remove('dragover'));
  els.dropzone.addEventListener('drop', (event) => {
    event.preventDefault();
    els.dropzone.classList.remove('dragover');
    if (event.dataTransfer.files?.length) {
      els.fileInput.files = event.dataTransfer.files;
      updateFileName();
    }
  });

  document.getElementById('checkMedsBtn').addEventListener('click', onManualInteractionCheck);
}

function resolveApiUrl() {
  const stored = localStorage.getItem('mdi_api_url');
  const configured = window.__MDI_CONFIG__?.API_URL;
  return normalizeApiUrl(stored || configured || '');
}

function normalizeApiUrl(value) {
  return String(value || '').trim().replace(/\/+$/, '');
}

function endpoint(path) {
  if (!state.apiUrl) throw new Error('API URL is missing. Add your Render backend URL in API settings.');
  return `${state.apiUrl}${path}`;
}

async function apiFetch(path, options = {}) {
  const response = await fetch(endpoint(path), options);
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      message = typeof data.detail === 'string' ? data.detail : data.detail?.message || data.message || message;
    } catch {}
    throw new Error(message);
  }
  return response.json();
}

async function checkBackend() {
  updateBackendStatus('pending', 'Checking API connection...');
  try {
    if (!state.apiUrl) throw new Error('No API URL configured');
    const data = await apiFetch('/health');
    updateBackendStatus('online', `${data.service || 'Backend'} is ${data.status || 'online'}.`);
  } catch (error) {
    updateBackendStatus('offline', error.message || 'Backend is not reachable.');
  }
}

function updateBackendStatus(status, text) {
  const dot = els.backendStatus.querySelector('.status-dot');
  dot.className = `status-dot ${status}`;
  els.backendStatus.querySelector('p').textContent = text;
}

function switchTab(tab) {
  document.querySelectorAll('.tab').forEach((btn) => btn.classList.toggle('active', btn.dataset.tab === tab));
  document.querySelectorAll('.tab-content').forEach((content) => content.classList.remove('active'));
  document.getElementById(`${tab}Form`).classList.add('active');
}

function loadSample() {
  switchTab('text');
  els.documentType.value = 'medical_report';
  els.documentText.value = sampleText;
  els.patientNotes.value = 'Patient wants a simple explanation and a medication safety check.';
  document.querySelector('#analyze').scrollIntoView({ behavior: 'smooth' });
}

function updateFileName() {
  const file = els.fileInput.files?.[0];
  els.fileName.textContent = file ? `${file.name} • ${formatBytes(file.size)}` : 'No file selected';
}

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, index)).toFixed(index ? 1 : 0)} ${units[index]}`;
}

async function onTextAnalyze(event) {
  event.preventDefault();
  const content = els.documentText.value.trim();
  if (content.length < 10) {
    showToast('Please paste at least 10 characters of medical text.', 'error');
    return;
  }
  await runAnalysis(async () => apiFetch('/api/v1/documents/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content,
      document_type: els.documentType.value,
      patient_notes: els.patientNotes.value.trim() || null,
      source_name: 'Frontend text input',
    }),
  }));
}

async function onUploadAnalyze(event) {
  event.preventDefault();
  const file = els.fileInput.files?.[0];
  if (!file) {
    showToast('Please choose a PDF, image, or text file first.', 'error');
    return;
  }
  const formData = new FormData();
  formData.append('file', file);
  formData.append('document_type', els.uploadDocumentType.value);
  formData.append('patient_notes', els.uploadPatientNotes.value.trim());
  await runAnalysis(async () => apiFetch('/api/v1/documents/upload', {
    method: 'POST',
    body: formData,
  }));
}

async function runAnalysis(action) {
  setLoading(true);
  try {
    const data = await action();
    state.lastAnalysis = data;
    renderResults(data);
    renderGraph(data.knowledge_graph);
    els.dashboardBlocks.classList.remove('hidden');
    els.analysisState.textContent = 'Completed';
    showToast('Analysis completed successfully.', 'success');
    document.querySelector('#results').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    showToast(error.message || 'Analysis failed.', 'error');
    els.analysisState.textContent = 'Error';
  } finally {
    setLoading(false);
  }
}

function setLoading(isLoading) {
  els.emptyState.classList.toggle('hidden', true);
  els.loadingState.classList.toggle('hidden', !isLoading);
  els.resultsContent.classList.toggle('hidden', isLoading || !state.lastAnalysis);
  els.analysisState.textContent = isLoading ? 'Analyzing' : state.lastAnalysis ? 'Completed' : 'Waiting';
}

function renderResults(data) {
  const patientName = data.patient?.name || 'Unknown patient';
  const confidence = Math.round((Number(data.confidence_score) || 0) * 100);
  const meds = data.medications || [];
  const diagnoses = data.diagnoses || [];
  const alerts = data.alerts || [];
  const labs = data.labs || [];
  const vitals = data.vitals || [];
  const interactions = data.interactions || [];
  const allergies = data.allergies || [];
  const reminders = data.reminders || [];

  els.manualMeds.value = meds.map((med) => med.name).filter(Boolean).join(', ');

  els.resultsContent.innerHTML = `
    <div class="summary-grid">
      ${summaryCard('Confidence', `${confidence}%`, `<div class="confidence-bar"><div class="confidence-fill" style="width:${Math.max(3, confidence)}%"></div></div>`)}
      ${summaryCard('Medications', meds.length)}
      ${summaryCard('Alerts', alerts.length)}
      ${summaryCard('Interactions', interactions.length)}
    </div>

    <div class="result-section">
      <h3>Patient snapshot</h3>
      <div class="data-grid">
        ${dataCard(patientName, [
          `Age: ${escapeHtml(data.patient?.age || 'Not found')}`,
          `Gender: ${escapeHtml(data.patient?.gender || 'Not found')}`,
          `Patient ID: ${escapeHtml(data.patient?.patient_id || 'Not found')}`,
          `Visit date: ${escapeHtml(data.patient?.visit_date || 'Not found')}`,
        ])}
        ${dataCard('Simple summary', [escapeHtml(data.simple_summary || 'No summary generated.')])}
      </div>
    </div>

    ${renderEntitySection('Diagnoses', diagnoses, (item) => dataCard(item.name, [`Evidence: ${escapeHtml(item.evidence || 'Not stated')}`, `Confidence: ${Math.round((item.confidence || 0) * 100)}%`]))}
    ${renderEntitySection('Medications', meds, renderMedicationCard)}
    ${renderEntitySection('Allergies', allergies, (item) => dataCard(item.substance, [`Reaction: ${escapeHtml(item.reaction || 'Not stated')}`]))}
    ${renderEntitySection('Lab results', labs, renderLabCard)}
    ${renderEntitySection('Vitals', vitals, renderVitalCard)}
    ${renderEntitySection('Medication interactions', interactions, renderInteractionCard)}
    ${renderEntitySection('Clinical alerts', alerts, renderAlertCard)}
    ${renderEntitySection('Reminder plan', reminders, renderReminderCard)}

    <div class="result-section">
      <h3>Health insights in simple language</h3>
      ${renderList(data.health_insights)}
    </div>

    <div class="result-section">
      <h3>Questions to ask a doctor or pharmacist</h3>
      ${renderList(data.recommended_questions)}
    </div>

    <div class="result-section">
      <h3>Extraction notes</h3>
      ${renderList(data.extraction_notes)}
    </div>

    <div class="result-section">
      <h3>Extracted text</h3>
      <div class="extracted-text">${escapeHtml(data.extracted_text || 'No extracted text returned.')}</div>
    </div>

    <div class="action-strip">
      <button class="secondary-btn" id="copySummaryBtn">Copy summary</button>
      <button class="secondary-btn" id="exportRecordBtn">Export structured record</button>
      <button class="ghost-btn" id="downloadAnalysisBtn">Download full JSON</button>
    </div>
  `;

  els.resultsContent.classList.remove('hidden');
  document.getElementById('copySummaryBtn').addEventListener('click', () => copySummary(data));
  document.getElementById('downloadAnalysisBtn').addEventListener('click', () => downloadJson(data, `medical-analysis-${data.analysis_id || Date.now()}.json`));
  document.getElementById('exportRecordBtn').addEventListener('click', exportRecord);
}

function summaryCard(label, value, extra = '') {
  return `<div class="summary-card"><span>${label}</span><strong>${value}</strong>${extra}</div>`;
}

function dataCard(title, lines) {
  return `<article class="data-card"><strong>${escapeHtml(title || 'Untitled')}</strong>${lines.map((line) => `<p>${line}</p>`).join('')}</article>`;
}

function renderEntitySection(title, items, renderer) {
  if (!items?.length) return '';
  return `<div class="result-section"><h3>${title}</h3><div class="data-grid">${items.map(renderer).join('')}</div></div>`;
}

function renderMedicationCard(item) {
  return dataCard(item.name, [
    `Dose: ${escapeHtml(item.dose || 'Not stated')}`,
    `Frequency: ${escapeHtml(item.frequency || 'Not stated')}`,
    `Route: ${escapeHtml(item.route || 'Not stated')}`,
    `Purpose: ${escapeHtml(item.purpose || 'Not stated')}`,
    `Instructions: ${escapeHtml(item.instructions || 'Not stated')}`,
  ]);
}

function renderLabCard(item) {
  return `<article class="data-card"><strong>${escapeHtml(item.test)}</strong><span class="badge ${escapeHtml(item.status || 'unknown')}">${escapeHtml(item.status || 'unknown')}</span><p>Value: ${escapeHtml(item.value || 'Not stated')} ${escapeHtml(item.unit || '')}</p><p>Reference: ${escapeHtml(item.reference_range || 'Not stated')}</p><p>${escapeHtml(item.explanation || '')}</p></article>`;
}

function renderVitalCard(item) {
  return `<article class="data-card"><strong>${escapeHtml(item.name)}</strong><span class="badge ${escapeHtml(item.status || 'unknown')}">${escapeHtml(item.status || 'unknown')}</span><p>Value: ${escapeHtml(item.value || 'Not stated')}</p></article>`;
}

function renderInteractionCard(item) {
  return `<article class="data-card"><strong>${escapeHtml((item.medications || []).join(' + ') || 'Interaction')}</strong><span class="badge ${escapeHtml(item.severity || 'unknown')}">${escapeHtml(item.severity || 'unknown')}</span><p>${escapeHtml(item.explanation || '')}</p><p><b>Recommendation:</b> ${escapeHtml(item.recommendation || '')}</p></article>`;
}

function renderAlertCard(item) {
  return `<article class="data-card"><strong>${escapeHtml(item.title)}</strong><span class="badge ${escapeHtml(item.severity || 'unknown')}">${escapeHtml(item.severity || 'unknown')}</span><p>${escapeHtml(item.description || '')}</p><p><b>Recommendation:</b> ${escapeHtml(item.recommendation || '')}</p></article>`;
}

function renderReminderCard(item) {
  return dataCard(item.medication, [
    `Dose: ${escapeHtml(item.dose || 'Not stated')}`,
    `Frequency: ${escapeHtml(item.frequency || 'Not stated')}`,
    `Suggested times: ${escapeHtml((item.suggested_times || []).join(', ') || 'Not generated')}`,
    `Notes: ${escapeHtml(item.notes || 'No notes')}`,
  ]);
}

function renderList(items) {
  if (!items?.length) return '<p class="muted">No items returned.</p>';
  return `<ul class="list-clean">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function renderGraph(graph = { nodes: [], edges: [] }) {
  const nodes = graph.nodes || [];
  const edges = graph.edges || [];
  els.graphSvg.innerHTML = '';
  if (!nodes.length) {
    els.graphSvg.innerHTML = '<text x="50%" y="50%" text-anchor="middle" fill="#617086" font-weight="800">No graph data returned</text>';
    return;
  }

  const center = { x: 450, y: 260 };
  const positions = new Map();
  const patient = nodes.find((n) => n.type === 'patient') || nodes[0];
  positions.set(patient.id, center);
  const remaining = nodes.filter((n) => n.id !== patient.id);
  const radius = remaining.length > 8 ? 205 : 185;
  remaining.forEach((node, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(remaining.length, 1) - Math.PI / 2;
    positions.set(node.id, { x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) });
  });

  const edgeLayer = svgEl('g');
  edges.forEach((edge) => {
    const source = positions.get(edge.source);
    const target = positions.get(edge.target);
    if (!source || !target) return;
    const line = svgEl('line', { x1: source.x, y1: source.y, x2: target.x, y2: target.y, class: 'graph-edge' });
    edgeLayer.appendChild(line);
    const label = svgEl('text', { x: (source.x + target.x) / 2, y: (source.y + target.y) / 2 - 7, class: 'edge-label', 'text-anchor': 'middle' });
    label.textContent = edge.label || 'related';
    edgeLayer.appendChild(label);
  });
  els.graphSvg.appendChild(edgeLayer);

  const nodeLayer = svgEl('g');
  nodes.forEach((node) => {
    const pos = positions.get(node.id);
    const group = svgEl('g', { class: 'graph-node', tabindex: '0' });
    const color = graphColor(node.risk, node.type);
    group.appendChild(svgEl('circle', { cx: pos.x, cy: pos.y, r: node.id === patient.id ? 48 : 39, fill: color.fill, stroke: color.stroke, 'stroke-width': 3 }));
    const label = svgEl('text', { x: pos.x, y: pos.y + 5, class: 'graph-label', 'text-anchor': 'middle' });
    label.textContent = shorten(node.label || node.id, 16);
    group.appendChild(label);
    group.addEventListener('click', () => showNodeDetails(node));
    group.addEventListener('keyup', (event) => { if (event.key === 'Enter') showNodeDetails(node); });
    nodeLayer.appendChild(group);
  });
  els.graphSvg.appendChild(nodeLayer);
  showNodeDetails(patient);
}

function svgEl(name, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', name);
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
  return el;
}

function graphColor(risk, type) {
  if (risk === 'critical') return { fill: '#fee2e2', stroke: '#991b1b' };
  if (risk === 'high') return { fill: '#ffedd5', stroke: '#c2410c' };
  if (risk === 'moderate') return { fill: '#fef3c7', stroke: '#d97706' };
  if (risk === 'low') return { fill: '#dcfce7', stroke: '#16a34a' };
  if (type === 'patient') return { fill: '#dbeafe', stroke: '#2563eb' };
  return { fill: '#eef5ff', stroke: '#64748b' };
}

function showNodeDetails(node) {
  els.nodeDetails.innerHTML = `
    <strong>${escapeHtml(node.label || node.id)}</strong>
    <p><b>Type:</b> ${escapeHtml(node.type || 'unknown')}</p>
    <p><b>Risk:</b> <span class="badge ${escapeHtml(node.risk || 'unknown')}">${escapeHtml(node.risk || 'neutral')}</span></p>
    <p><b>Details:</b></p>
    <pre>${escapeHtml(JSON.stringify(node.details || {}, null, 2))}</pre>
  `;
}

async function onManualInteractionCheck() {
  const meds = els.manualMeds.value.split(',').map((m) => m.trim()).filter(Boolean);
  if (!meds.length) {
    showToast('Enter at least one medication name.', 'error');
    return;
  }
  els.manualInteractionResults.innerHTML = '<div class="spinner"></div>';
  try {
    const interactions = await apiFetch('/api/v1/interactions/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ medications: meds }),
    });
    if (!interactions.length) {
      els.manualInteractionResults.innerHTML = '<article class="data-card"><strong>No known interaction detected by the rule set.</strong><p>Still confirm medication safety with a licensed pharmacist or clinician.</p></article>';
      return;
    }
    els.manualInteractionResults.innerHTML = interactions.map(renderInteractionCard).join('');
  } catch (error) {
    els.manualInteractionResults.innerHTML = '';
    showToast(error.message || 'Interaction check failed.', 'error');
  }
}

async function exportRecord() {
  if (!state.lastAnalysis) return;
  try {
    const record = await apiFetch('/api/v1/records/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysis: state.lastAnalysis }),
    });
    downloadJson(record, `structured-health-record-${state.lastAnalysis.analysis_id || Date.now()}.json`);
  } catch (error) {
    showToast(error.message || 'Could not export structured record.', 'error');
  }
}

function copySummary(data) {
  const text = [
    `Patient: ${data.patient?.name || 'Unknown'}`,
    `Summary: ${data.simple_summary || 'No summary'}`,
    `Medications: ${(data.medications || []).map((m) => `${m.name}${m.dose ? ` ${m.dose}` : ''}`).join(', ') || 'None found'}`,
    `Alerts: ${(data.alerts || []).map((a) => `${a.severity}: ${a.title}`).join('; ') || 'None'}`,
    `Questions: ${(data.recommended_questions || []).join(' | ') || 'None'}`,
  ].join('\n');
  navigator.clipboard.writeText(text).then(() => showToast('Summary copied.', 'success'));
}

function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function showToast(message, type = '') {
  els.toast.textContent = message;
  els.toast.className = `toast ${type}`.trim();
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => els.toast.classList.add('hidden'), 4500);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function shorten(value, max) {
  const text = String(value || '');
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}
