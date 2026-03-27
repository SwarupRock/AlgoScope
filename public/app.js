// ─── AlgoScope app.js — frontend logic ───────────────────────────────────────

// ─── AUTH (redirect-based — login page at /login) ─────────────────────────────
let currentUser = null;

function getToken()    { return localStorage.getItem('algo_token'); }
function clearToken()  { localStorage.removeItem('algo_token'); localStorage.removeItem('algo_user'); }
function authHeaders() { const t = getToken(); return t ? { 'Authorization': `Bearer ${t}` } : {}; }

function doLogout() {
  clearToken(); currentUser = null;
  window.location.href = '/login';
}

function updateAuthUI() {
  const userInfo = document.getElementById('user-info');
  const loginLink = document.getElementById('login-link');
  const nameLbl  = document.getElementById('user-name-label');
  if (currentUser) {
    if (nameLbl) nameLbl.textContent = currentUser.username;
    if (userInfo) userInfo.style.display = 'flex';
    if (loginLink) loginLink.style.display = 'none';
  } else {
    if (userInfo) userInfo.style.display = 'none';
    if (loginLink) loginLink.style.display = 'flex';
  }
}

async function restoreSession() {
  const token = getToken();
  if (!token) { updateAuthUI(); return; } // guest mode — don't redirect
  try {
    const res = await fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) { currentUser = await res.json(); updateAuthUI(); }
    else { clearToken(); updateAuthUI(); }
  } catch { updateAuthUI(); }
}


// ─── EXAMPLES ────────────────────────────────────────────────────────────────
const EXAMPLES = {
"Linked List":`// Linked List — Insert at Head
class Node {
    int val; Node next;
    Node(int v) { this.val = v; this.next = null; }
}
public class Main {
    static Node head = null;
    static void insertHead(int v) {
        Node n = new Node(v);
        n.next = head; head = n;
    }
    public static void main(String[] args) {
        insertHead(30); insertHead(20); insertHead(10);
    }
}`,
"BST":`// Binary Search Tree — Insert
public class BST {
    int val; BST left, right;
    BST(int v) { this.val = v; }
    static BST insert(BST root, int v) {
        if (root == null) return new BST(v);
        if (v < root.val) root.left = insert(root.left, v);
        else root.right = insert(root.right, v);
        return root;
    }
    public static void main(String[] args) {
        BST root = null;
        root = insert(root, 5); root = insert(root, 3);
        root = insert(root, 7); root = insert(root, 1); root = insert(root, 9);
    }
}`,
"Bubble Sort":`// Bubble Sort
public class Main {
    static void sort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++)
            for (int j = 0; j < n - i - 1; j++)
                if (arr[j] > arr[j+1]) { int t=arr[j]; arr[j]=arr[j+1]; arr[j+1]=t; }
    }
    public static void main(String[] args) {
        int[] arr = {64, 34, 25, 12, 22}; sort(arr);
    }
}`,
"Stack":`// Stack — Push/Pop
public class Main {
    static int[] data = new int[8]; static int top = -1;
    static void push(int v) { data[++top] = v; }
    static int pop() { return data[top--]; }
    public static void main(String[] args) {
        push(10); push(20); push(30);
        int x = pop(); push(40); push(50); int y = pop();
    }
}`,
"Graph BFS":`// Graph — BFS Traversal
import java.util.*;
public class Main {
    static boolean[][] adj = {
        {false,true,true,false,false},{true,false,false,true,false},
        {true,false,false,false,true},{false,true,false,false,true},{false,false,true,true,false}
    };
    static void bfs(int s) {
        boolean[] vis = new boolean[5];
        Queue<Integer> q = new LinkedList<>();
        vis[s]=true; q.add(s);
        while (!q.isEmpty()) {
            int node = q.poll();
            for (int i=0;i<5;i++) if (adj[node][i]&&!vis[i]) { vis[i]=true; q.add(i); }
        }
    }
    public static void main(String[] args) { bfs(0); }
}`,
"Queue":`// Queue — Enqueue/Dequeue
import java.util.*;
public class Main {
    static LinkedList<Integer> queue = new LinkedList<>();
    static void enqueue(int v) { queue.addLast(v); }
    static int dequeue() { return queue.removeFirst(); }
    public static void main(String[] args) {
        enqueue(10); enqueue(20); enqueue(30);
        int x = dequeue(); enqueue(40); int y = dequeue();
    }
}`,
"Merge Sort":`// Merge Sort
public class Main {
    static void merge(int[] arr, int l, int m, int r) {
        int n1=m-l+1, n2=r-m;
        int[] L=new int[n1], R=new int[n2];
        for(int i=0;i<n1;i++) L[i]=arr[l+i];
        for(int j=0;j<n2;j++) R[j]=arr[m+1+j];
        int i=0,j=0,k=l;
        while(i<n1&&j<n2) arr[k++]=L[i]<=R[j]?L[i++]:R[j++];
        while(i<n1) arr[k++]=L[i++]; while(j<n2) arr[k++]=R[j++];
    }
    static void sort(int[] arr,int l,int r) {
        if(l<r){int m=(l+r)/2;sort(arr,l,m);sort(arr,m+1,r);merge(arr,l,m,r);}
    }
    public static void main(String[] args) {
        int[] arr={38,27,43,3,9}; sort(arr,0,arr.length-1);
    }
}`,
"Fibonacci":`// Fibonacci — Recursive Call Stack
public class Main {
    static int fib(int n) {
        if (n <= 1) return n;
        int a = fib(n-1); int b = fib(n-2); return a+b;
    }
    public static void main(String[] args) { int result = fib(5); }
}`,
"Create Your Own":`// Add Your Own Code!
// AlgoScope supports Java, C, and C++.
// Write your code below and click Run Visualization.
//
// Supported data structures:
//   - Linked Lists, Trees (BST), Arrays, Stacks, Queues, Graphs
// 
// Tips:
//   - Include a main() method/function as the entry point
//   - You can include multiple algorithms (e.g., DFS + BFS)
//   - The AI will detect the language and data structure automatically

public class Main {
    // Your code here...
    
    public static void main(String[] args) {
        // Call your methods here
    }
}`
};

// ─── STATE ────────────────────────────────────────────────────────────────────
let monacoEditor=null, monacoReady=false, decorations=[];
let trace=null, currentStep=0, isPlaying=false, playTimer=null, playSpeed=1, activeTab='viz';
let currentShareId=null, isSharedView=false;
let allAlgorithms=[], currentAlgoIndex=0;

// ─── INIT ─────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(location.search);
  const shareId = params.get('share');
  if (shareId) {
    loadSharedView(shareId);
  } else {
    loadMonaco();
    updateControlStates();
    restoreSession();
    restoreVisualizationState();
  }
});

// ─── SHARED VIEW ──────────────────────────────────────────────────────────────
async function loadSharedView(shareId) {
  document.getElementById('shared-banner').style.display = 'flex';
  // Hide editor, expand viz panel
  const ep = document.getElementById('editor-panel');
  ep.style.display = 'none';
  document.getElementById('share-btn').style.display = 'none';
  isSharedView = true;
  showState('loading');
  try {
    const res = await fetch(`/api/share/${shareId}`);
    if (!res.ok) throw new Error('Visualization not found.');
    const data = await res.json();
    trace = data.trace;
    document.getElementById('shared-algo').textContent = data.algorithm || '';
    onTraceReady();
  } catch (e) {
    showState('error');
    document.getElementById('error-msg').textContent = e.message;
  }
}

// ─── MONACO ───────────────────────────────────────────────────────────────────
function loadMonaco() {
  const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/loader.min.js';
  s.onload = () => {
    window.require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });
    window.require(['vs/editor/editor.main'], initMonaco);
  };
  s.onerror = () => {
    const ta = document.getElementById('editor-fallback');
    ta.style.display = 'flex'; ta.value = EXAMPLES['Linked List'];
  };
  document.head.appendChild(s);
}

function initMonaco() {
  const el = document.getElementById('editor-container');
  if (!el || monacoEditor) return;
  window.monaco.editor.defineTheme('algo', {
    base: 'vs-dark', inherit: true,
    rules: [
      { token: 'keyword',  foreground: 'a5b4fc', fontStyle: 'bold' },
      { token: 'type',     foreground: '67e8f9' },
      { token: 'string',   foreground: '4ade80' },
      { token: 'number',   foreground: 'fbbf24' },
      { token: 'comment',  foreground: '374151', fontStyle: 'italic' },
      { token: 'delimiter', foreground: '374151' },
      { token: 'identifier', foreground: 'cbd5e1' },
    ],
    colors: {
      'editor.background': '#030712', 'editor.foreground': '#cbd5e1',
      'editor.lineHighlightBackground': '#0a0f1e',
      'editorLineNumber.foreground': '#1e293b',
      'editorLineNumber.activeForeground': '#475569',
      'editor.selectionBackground': '#1e3a5f',
      'editorCursor.foreground': '#6366f1',
    }
  });
  monacoEditor = window.monaco.editor.create(el, {
    value: EXAMPLES['Linked List'], language: 'java', theme: 'algo',
    fontSize: 13, fontFamily: "'JetBrains Mono','Fira Code','Courier New',monospace",
    fontLigatures: true, minimap: { enabled: false }, scrollBeyondLastLine: false,
    lineNumbers: 'on', glyphMargin: false, folding: false,
    renderLineHighlight: 'all', padding: { top: 14, bottom: 14 },
    automaticLayout: true, wordWrap: 'on', lineHeight: 21,
    cursorBlinking: 'smooth', smoothScrolling: true,
    scrollbar: { verticalScrollbarSize: 4, horizontalScrollbarSize: 4 }
  });
  monacoReady = true;
}

function getCode() { return monacoEditor ? monacoEditor.getValue() : document.getElementById('editor-fallback').value; }
function setCode(c) { if (monacoEditor) monacoEditor.setValue(c); else document.getElementById('editor-fallback').value = c; }

// ─── EXAMPLES ─────────────────────────────────────────────────────────────────
let examplesOpen = false;
function toggleExamples() {
  examplesOpen = !examplesOpen;
  document.getElementById('examples-menu').style.display = examplesOpen ? 'block' : 'none';
}
document.addEventListener('click', e => {
  if (examplesOpen && !e.target.closest('[onclick="toggleExamples()"]') && !e.target.closest('#examples-menu')) {
    examplesOpen = false; document.getElementById('examples-menu').style.display = 'none';
  }
});
function loadExample(name) {
  setCode(EXAMPLES[name] || EXAMPLES['Create Your Own']);
  trace = null; currentStep = 0; currentShareId = null; isPlaying = false; clearInterval(playTimer);
  allAlgorithms = []; currentAlgoIndex = 0;
  resetUI(); examplesOpen = false; document.getElementById('examples-menu').style.display = 'none';
}

function resetUI() {
  showState('empty');
  document.getElementById('step-desc').style.display = 'none';
  document.getElementById('algo-badge').style.display = 'none';
  document.getElementById('step-counter').textContent = '—/—';
  document.getElementById('progress-fill').style.width = '0%';
  document.getElementById('progress-thumb').style.display = 'none';
  document.getElementById('step-markers').innerHTML = '';
  document.getElementById('line-indicator').textContent = '';
  document.getElementById('share-btn').disabled = true;
  document.getElementById('algo-selector').style.display = 'none';
  document.getElementById('algo-tabs-bar').innerHTML = '';
  document.getElementById('algo-explanation').innerHTML = '';
  updateControlStates();
}

// ─── API CALL → backend ───────────────────────────────────────────────────────
const loadingMsgs = ['AI is thinking deeply...','analyzing control flow...','mapping heap objects...','tracing pointer refs...','building execution steps...','generating visualizations...'];
let loadIdx = 0, loadInterval = null;

async function runVisualization() {
  const code = getCode().trim();
  if (!code) return;
  trace = null; currentStep = 0; currentShareId = null;
  isPlaying = false; clearInterval(playTimer); setBtnPlay(false);

  const btn = document.getElementById('run-btn');
  const icon = document.getElementById('run-icon');
  const lbl = document.getElementById('run-label');
  btn.disabled = true;
  icon.innerHTML = '<circle cx="6" cy="6" r="4" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="12 4"/>';
  icon.classList.add('spin'); lbl.textContent = 'Analyzing...';
  document.getElementById('algo-badge').style.display = 'none';
  document.getElementById('share-btn').disabled = true;
  showState('loading'); document.getElementById('step-desc').style.display = 'none';

  loadIdx = 0; clearInterval(loadInterval);
  document.getElementById('loading-msg').textContent = loadingMsgs[0];
  loadInterval = setInterval(() => {
    loadIdx = (loadIdx + 1) % loadingMsgs.length;
    document.getElementById('loading-msg').textContent = loadingMsgs[loadIdx];
  }, 1800);

  try {
    const res = await fetch('/api/visualize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ code })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Server error');
    currentShareId = data.shareId;
    trace = data.trace;
    clearInterval(loadInterval);
    // Detect language and update filename
    updateEditorLanguage(code);
    // Save state for persistence
    saveVisualizationState(code, data.trace, data.shareId);
    onTraceReady();
    document.getElementById('share-btn').disabled = false;
  } catch (e) {
    clearInterval(loadInterval);
    showState('error');
    document.getElementById('error-msg').textContent = e.message || 'Could not connect to backend. Is the server running?';
  }

  btn.disabled = false; icon.classList.remove('spin');
  icon.innerHTML = '<polygon points="2,1 11,6 2,11" fill="currentColor"/>';
  lbl.textContent = 'Run Visualization';
}

// ─── SHARE ────────────────────────────────────────────────────────────────────
function shareVisualization() {
  if (!currentShareId) return;
  const url = `${location.origin}/?share=${currentShareId}`;
  navigator.clipboard.writeText(url).then(() => showToast('🔗 Link copied to clipboard!')).catch(() => {
    prompt('Copy this link:', url);
  });
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.style.display = 'block';
  setTimeout(() => { t.style.display = 'none'; }, 2800);
}

// ─── TRACE READY ──────────────────────────────────────────────────────────────
function onTraceReady() {
  // Normalize: handle both old single-algo and new multi-algo format
  if (trace.algorithms && Array.isArray(trace.algorithms)) {
    allAlgorithms = trace.algorithms;
  } else {
    // Old format: wrap in array
    allAlgorithms = [{
      algorithm: trace.algorithm || 'Algorithm',
      dataStructure: trace.dataStructure || 'array',
      explanation: trace.explanation || { description: '', timeComplexity: '', spaceComplexity: '', pseudocode: [] },
      steps: trace.steps || []
    }];
  }

  if (!allAlgorithms.length || !allAlgorithms[0].steps?.length) {
    showState('error'); document.getElementById('error-msg').textContent = 'No steps returned.'; return;
  }

  currentAlgoIndex = 0;
  // Build algorithm selector tabs if multiple
  const tabsBar = document.getElementById('algo-tabs-bar');
  tabsBar.innerHTML = '';
  if (allAlgorithms.length > 1) {
    document.getElementById('algo-selector').style.display = 'block';
    allAlgorithms.forEach((algo, i) => {
      const btn = document.createElement('button');
      btn.className = 'algo-tab' + (i === 0 ? ' active' : '');
      btn.textContent = algo.algorithm || `Algorithm ${i + 1}`;
      btn.onclick = () => switchAlgorithm(i);
      tabsBar.appendChild(btn);
    });
  } else {
    document.getElementById('algo-selector').style.display = 'none';
  }

  loadCurrentAlgorithm();
}

function switchAlgorithm(idx) {
  if (idx === currentAlgoIndex) return;
  currentAlgoIndex = idx;
  isPlaying = false; clearInterval(playTimer); setBtnPlay(false);
  // Update tab active state
  document.querySelectorAll('.algo-tab').forEach((tab, i) => {
    tab.className = 'algo-tab' + (i === idx ? ' active' : '');
  });
  loadCurrentAlgorithm();
}

function loadCurrentAlgorithm() {
  const algo = allAlgorithms[currentAlgoIndex];
  // Set trace to current algo for compatibility
  trace = algo;
  currentStep = 0;

  const badge = document.getElementById('algo-badge');
  badge.style.display = 'inline-flex';
  document.getElementById('badge-text').textContent = algo.algorithm || 'Algorithm';

  const markers = document.getElementById('step-markers');
  markers.innerHTML = '';
  const steps = algo.steps || [];
  steps.forEach((_, i) => {
    const d = document.createElement('div');
    d.style.cssText = `position:absolute;top:50%;left:${steps.length > 1 ? (i / (steps.length - 1)) * 100 : 0}%;transform:translate(-50%,-50%);width:2px;height:4px;background:rgba(99,102,241,0.2);border-radius:1px`;
    d.id = `marker-${i}`; markers.appendChild(d);
  });
  document.getElementById('progress-thumb').style.display = 'block';

  // Render algorithm explanation
  renderAlgoExplanation();

  renderStep(); updateControlStates();
}

// ─── RENDER STEP ──────────────────────────────────────────────────────────────
function renderStep() {
  if (!trace) return;
  const steps = trace.steps, step = steps[currentStep], total = steps.length;
  const pct = total > 1 ? (currentStep / (total - 1)) * 100 : 0;
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-thumb').style.left = pct + '%';
  document.getElementById('step-counter').textContent = `${currentStep + 1}/${total}`;
  document.getElementById('line-indicator').textContent = step.line ? `line ${step.line}` : '';
  steps.forEach((_, i) => {
    const m = document.getElementById(`marker-${i}`);
    if (m) { m.style.height = i === currentStep ? '8px' : '4px'; m.style.background = i === currentStep ? '#6366f1' : 'rgba(99,102,241,0.2)'; }
  });
  document.getElementById('step-desc').style.display = 'flex';
  document.getElementById('step-num').textContent = currentStep + 1;
  document.getElementById('step-text').textContent = step.description || '';
  highlightLine(step.line);
  if (activeTab === 'viz') renderViz(step); else if (activeTab === 'mem') renderMemory(step);
  updateControlStates();
}

function highlightLine(line) {
  if (!monacoReady || !monacoEditor || !line) return;
  try {
    decorations = monacoEditor.deltaDecorations(decorations, [{
      range: new window.monaco.Range(line, 1, line, 1),
      options: { isWholeLine: true, className: 'algo-active-line', overviewRuler: { color: '#6366f1', position: 1 } }
    }]);
    monacoEditor.revealLineInCenterIfOutsideViewport(line);
  } catch (_) {}
}

// ─── SVG HELPERS ──────────────────────────────────────────────────────────────
const NS = 'http://www.w3.org/2000/svg';
function mk(tag, a = {}, p = null) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(a)) if (v !== undefined && v !== null) e.setAttribute(k, v);
  if (p) p.appendChild(e); return e;
}
function txt(svg, t, x, y, o = {}) {
  const e = mk('text', { x, y, 'text-anchor': o.anchor || 'middle', 'dominant-baseline': 'central', fill: o.fill || '#cbd5e1', 'font-size': o.size || 13, 'font-family': "'JetBrains Mono',monospace", 'font-weight': o.bold ? 700 : 400 }, svg);
  e.textContent = String(t); return e;
}
function defs(svg) {
  const d = mk('defs', {}, svg);
  const ma = mk('marker', { id: 'ac', markerWidth: '8', markerHeight: '6', refX: '7', refY: '3', orient: 'auto' }, d); mk('polygon', { points: '0 0,8 3,0 6', fill: '#6366f1' }, ma);
  const mg = mk('marker', { id: 'ag', markerWidth: '8', markerHeight: '6', refX: '7', refY: '3', orient: 'auto' }, d); mk('polygon', { points: '0 0,8 3,0 6', fill: '#1e293b' }, mg);
  const mp = mk('marker', { id: 'ap', markerWidth: '8', markerHeight: '6', refX: '7', refY: '3', orient: 'auto' }, d); mk('polygon', { points: '0 0,8 3,0 6', fill: '#a78bfa' }, mp);
  const f = mk('filter', { id: 'glow', x: '-30%', y: '-30%', width: '160%', height: '160%' }, d);
  mk('feGaussianBlur', { stdDeviation: '2.5', result: 'blur' }, f);
  const fm = mk('feMerge', {}, f); mk('feMergeNode', { in: 'blur' }, fm); mk('feMergeNode', { in: 'SourceGraphic' }, fm);
}
function showState(s) {
  document.getElementById('empty-state').style.display   = s === 'empty'   ? 'flex' : 'none';
  document.getElementById('loading-state').style.display = s === 'loading'  ? 'flex' : 'none';
  document.getElementById('error-state').style.display   = s === 'error'    ? 'flex' : 'none';
  document.getElementById('viz-display').style.display   = s === 'viz'      ? 'flex' : 'none';
}

// ─── VISUALIZERS ──────────────────────────────────────────────────────────────
function renderViz(step) {
  if (!step?.visualization) { showState('empty'); return; }
  showState('viz');
  const cont = document.getElementById('viz-svg-container');
  cont.innerHTML = '';
  const { type } = step.visualization, v = step.visualization;
  let s;
  if      (type === 'linkedlist')          s = visLinkedList(v.nodes || []);
  else if (type === 'tree')                s = visTree(v.root);
  else if (type === 'array' || type === 'sort') s = visArray(v.elements || []);
  else if (type === 'stack')               s = visStack(v.elements || []);
  else if (type === 'queue')               s = visQueue(v.elements || []);
  else if (type === 'graph')               s = visGraph(v.nodes || [], v.edges || []);
  else return;
  cont.appendChild(s);
}

function visLinkedList(nodes) {
  const nW = 100, nH = 44, sep = 50, px = 32, py = 60;
  const W = Math.max(nodes.length * (nW + sep) + 80, 500);
  const svg = mk('svg', { width: '100%', height: '180', viewBox: `0 0 ${W} 180` }); defs(svg);
  if (nodes.length > 0) {
    txt(svg, 'HEAD', px + nW / 2, 20, { fill: '#a78bfa', size: 12, bold: true });
    mk('line', { x1: px + nW / 2, y1: 30, x2: px + nW / 2, y2: py - 2, stroke: '#a78bfa', 'stroke-width': '1.5', 'marker-end': 'url(#ap)' }, svg);
  }
  nodes.forEach((node, i) => {
    const x = px + i * (nW + sep), y = py, hl = node.highlight || node.isNew;
    mk('rect', { x, y, width: nW, height: nH, rx: 8, fill: hl ? 'rgba(99,102,241,0.15)' : 'rgba(10,15,26,0.9)', stroke: hl ? '#6366f1' : '#1a2540', 'stroke-width': hl ? 2.5 : 1.2, filter: hl ? 'url(#glow)' : undefined }, svg);
    mk('line', { x1: x + nW - 26, y1: y, x2: x + nW - 26, y2: y + nH, stroke: hl ? '#6366f1' : '#1a2540', 'stroke-width': hl ? 1.5 : 1 }, svg);
    txt(svg, node.value, x + (nW - 26) / 2, y + nH / 2, { fill: hl ? '#a5b4fc' : '#e2e8f0', bold: hl, size: 15 });
    mk('circle', { cx: x + nW - 13, cy: y + nH / 2, r: hl ? 5 : 4, fill: node.next ? '#6366f1' : '#1e293b' }, svg);
    const nxt = nodes.find(n => n.id === node.next);
    if (nxt) mk('line', { x1: x + nW - 7, y1: y + nH / 2, x2: x + nW + sep - 2, y2: y + nH / 2, stroke: '#6366f1', 'stroke-width': '1.8', 'marker-end': 'url(#ac)' }, svg);
    else txt(svg, 'null', x + nW + sep / 2, y + nH / 2, { fill: '#374151', size: 11 });
    if (node.isNew) { mk('rect', { x: x + 2, y: y - 20, width: 36, height: 16, rx: 5, fill: 'rgba(139,92,246,0.18)', stroke: '#a78bfa', 'stroke-width': '0.8' }, svg); txt(svg, 'NEW', x + 20, y - 12, { fill: '#a78bfa', size: 10, bold: true }); }
    txt(svg, node.id, x + nW / 2, y + nH + 16, { fill: '#374151', size: 10 });
  });
  if (!nodes.length) txt(svg, 'empty list', 250, 90, { fill: '#1a2540', size: 14 });
  return svg;
}

function visTree(root) {
  const svg = mk('svg', { width: '100%', height: '400', viewBox: '0 0 700 400' }); defs(svg);
  if (!root) { txt(svg, 'null (empty tree)', 350, 200, { fill: '#1a2540', size: 14 }); return svg; }
  drawNode(svg, root, 350, 40, 150, 0); return svg;
}
function drawNode(svg, node, x, y, sp, d) {
  if (!node) return;
  const r = 26, vg = 78, hl = node.highlight || node.isNew;
  if (node.left)  { const lx = x - sp, ly = y + vg; mk('line', { x1: x, y1: y + r, x2: lx, y2: ly - r, stroke: '#1e293b', 'stroke-width': '1.5' }, svg); drawNode(svg, node.left,  lx, ly, Math.max(sp * 0.52, 32), d + 1); }
  if (node.right) { const rx = x + sp, ry = y + vg; mk('line', { x1: x, y1: y + r, x2: rx, y2: ry - r, stroke: '#1e293b', 'stroke-width': '1.5' }, svg); drawNode(svg, node.right, rx, ry, Math.max(sp * 0.52, 32), d + 1); }
  if (node.isNew) mk('circle', { cx: x, cy: y, r: r + 5, fill: 'none', stroke: '#a78bfa', 'stroke-width': '1.2', 'stroke-dasharray': '4 3' }, svg);
  mk('circle', { cx: x, cy: y, r, fill: hl ? 'rgba(99,102,241,0.18)' : 'rgba(10,15,26,0.9)', stroke: hl ? '#6366f1' : '#1e293b', 'stroke-width': hl ? 2.5 : 1.2, filter: hl ? 'url(#glow)' : undefined }, svg);
  txt(svg, node.value, x, y, { fill: hl ? '#a5b4fc' : '#cbd5e1', bold: hl, size: 15 });
}

function visArray(elements) {
  const cW = 56, cH = 46, W = Math.max(elements.length * cW + 40, 400);
  const svg = mk('svg', { width: '100%', height: '120', viewBox: `0 0 ${W} 120` }); defs(svg);
  elements.forEach((el, i) => {
    const x = 20 + i * cW, isS = el.sorted, isC = el.comparing, isH = el.highlight;
    mk('rect', { x, y: 36, width: cW - 2, height: cH, rx: 5, fill: isS ? 'rgba(99,102,241,0.10)' : isC ? 'rgba(251,191,36,0.12)' : isH ? 'rgba(139,92,246,0.12)' : 'rgba(10,15,26,0.9)', stroke: isS ? '#6366f1' : isC ? '#fbbf24' : isH ? '#a78bfa' : '#1e293b', 'stroke-width': isS || isC || isH ? 1.8 : 1, filter: (isC || isH) ? 'url(#glow)' : undefined }, svg);
    txt(svg, el.value, x + cW / 2 - 1, 36 + cH / 2, { fill: isS ? '#a5b4fc' : isC ? '#fbbf24' : isH ? '#a78bfa' : '#e2e8f0', bold: isS || isC || isH });
    txt(svg, i, x + cW / 2 - 1, 36 + cH + 14, { fill: '#374151', size: 10 });
  });
  return svg;
}

function visStack(elements) {
  const cW = 160, cH = 36, gap = 3;
  const rev = [...elements].reverse();
  const svgH = Math.max(rev.length * (cH + gap) + 60, 160);
  const svg = mk('svg', { width: '100%', height: svgH, viewBox: `0 0 280 ${svgH}` }); defs(svg);
  txt(svg, 'STACK', 140, 22, { fill: '#374151', size: 10 });
  mk('rect', { x: 60, y: 34, width: cW, height: rev.length * (cH + gap) + 8, rx: 5, fill: 'none', stroke: '#1e293b', 'stroke-width': '1', 'stroke-dasharray': '4 3' }, svg);
  rev.forEach((el, i) => {
    const y = 38 + i * (cH + gap), isT = el.isTop;
    mk('rect', { x: 63, y, width: cW - 6, height: cH, rx: 4, fill: isT ? 'rgba(99,102,241,0.12)' : 'rgba(10,15,26,0.75)', stroke: isT ? '#6366f1' : '#1e293b', 'stroke-width': isT ? 1.8 : 1, filter: isT ? 'url(#glow)' : undefined }, svg);
    txt(svg, el.value, 63 + (cW - 6) / 2, y + cH / 2, { fill: isT ? '#a5b4fc' : '#cbd5e1', bold: isT });
    if (isT) { mk('line', { x1: 228, y1: y + cH / 2, x2: 240, y2: y + cH / 2, stroke: '#6366f1', 'stroke-width': '1' }, svg); txt(svg, 'TOP', 254, y + cH / 2, { fill: '#a5b4fc', size: 10, anchor: 'start', bold: true }); }
  });
  return svg;
}

function visQueue(elements) {
  const cW = 64, cH = 44, gap = 3, W = Math.max(elements.length * (cW + gap) + 110, 400);
  const svg = mk('svg', { width: '100%', height: '110', viewBox: `0 0 ${W} 110` }); defs(svg);
  txt(svg, 'FRONT', 24, 52, { fill: '#374151', size: 9 });
  elements.forEach((el, i) => {
    const x = 50 + i * (cW + gap), isF = el.isFront, isR = el.isRear;
    mk('rect', { x, y: 30, width: cW, height: cH, rx: 5, fill: isF ? 'rgba(99,102,241,0.12)' : isR ? 'rgba(139,92,246,0.12)' : 'rgba(10,15,26,0.9)', stroke: isF ? '#6366f1' : isR ? '#a78bfa' : '#1e293b', 'stroke-width': isF || isR ? 1.8 : 1 }, svg);
    txt(svg, el.value, x + cW / 2, 30 + cH / 2, { fill: isF ? '#a5b4fc' : isR ? '#a78bfa' : '#cbd5e1', bold: isF || isR });
    if (i < elements.length - 1) mk('line', { x1: x + cW + 1, y1: 52, x2: x + cW + gap - 1, y2: 52, stroke: '#1e293b', 'stroke-width': '1', 'marker-end': 'url(#ag)' }, svg);
  });
  if (elements.length > 0) txt(svg, 'REAR', 50 + elements.length * (cW + gap) + 3, 52, { fill: '#374151', size: 9, anchor: 'start' });
  return svg;
}

function visGraph(nodes, edges) {
  // Auto-compute viewport based on actual node positions
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  nodes.forEach(n => {
    if (n.x < minX) minX = n.x;
    if (n.x > maxX) maxX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.y > maxY) maxY = n.y;
  });
  const pad = 70, nodeR = 28;
  const vbX = Math.max(0, minX - pad - nodeR);
  const vbY = Math.max(0, minY - pad - nodeR);
  const vbW = Math.max(450, (maxX - minX) + pad * 2 + nodeR * 2);
  const vbH = Math.max(300, (maxY - minY) + pad * 2 + nodeR * 2);
  const svgH = Math.max(380, vbH);
  const svg = mk('svg', { width: '100%', height: svgH, viewBox: `${vbX} ${vbY} ${vbW} ${vbH}` }); defs(svg);
  // Draw edges first
  edges.forEach(e => {
    const fn = nodes.find(n => n.id === e.from), tn = nodes.find(n => n.id === e.to);
    if (!fn || !tn) return;
    const dx = tn.x - fn.x, dy = tn.y - fn.y;
    const dist = Math.sqrt(dx*dx + dy*dy) || 1;
    const ox = (dx / dist) * nodeR, oy = (dy / dist) * nodeR;
    const l = mk('line', { x1: fn.x + ox, y1: fn.y + oy, x2: tn.x - ox, y2: tn.y - oy, stroke: e.highlight ? '#818cf8' : '#1e293b', 'stroke-width': e.highlight ? 3 : 1.5, filter: e.highlight ? 'url(#glow)' : undefined }, svg);
    if (e.directed) l.setAttribute('marker-end', e.highlight ? 'url(#ac)' : 'url(#ag)');
  });
  // Draw nodes with labels
  nodes.forEach(node => {
    const hl = node.highlight, vis = node.visited;
    // Outer ring for highlighted/visited nodes
    if (hl) mk('circle', { cx: node.x, cy: node.y, r: nodeR + 5, fill: 'none', stroke: '#6366f1', 'stroke-width': '1.5', 'stroke-dasharray': '4 3', filter: 'url(#glow)' }, svg);
    // Main circle
    mk('circle', { cx: node.x, cy: node.y, r: nodeR, fill: hl ? 'rgba(99,102,241,0.22)' : vis ? 'rgba(139,92,246,0.18)' : 'rgba(10,15,26,0.9)', stroke: hl ? '#6366f1' : vis ? '#a78bfa' : '#1e293b', 'stroke-width': hl ? 2.5 : vis ? 2 : 1.5 }, svg);
    txt(svg, node.value || node.id, node.x, node.y, { fill: hl ? '#a5b4fc' : vis ? '#c4b5fd' : '#cbd5e1', bold: hl || vis, size: 16 });
    // Status label below node
    if (hl) {
      txt(svg, 'CURRENT', node.x, node.y + nodeR + 14, { fill: '#6366f1', size: 9, bold: true });
    } else if (vis) {
      txt(svg, 'visited', node.x, node.y + nodeR + 14, { fill: '#7c3aed', size: 8 });
    }
  });
  return svg;
}

// ─── MEMORY VIEW ──────────────────────────────────────────────────────────────
function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function renderMemory(step) {
  const sc = document.getElementById('mem-stack-col'), hc = document.getElementById('mem-heap-col');
  sc.innerHTML = '<div style="font-size:10px;color:#475569;font-family:\'JetBrains Mono\',monospace;margin-bottom:8px;letter-spacing:.08em;text-transform:uppercase;font-weight:600">Call Stack</div>';
  hc.innerHTML = '<div style="font-size:10px;color:#475569;font-family:\'JetBrains Mono\',monospace;margin-bottom:8px;letter-spacing:.08em;text-transform:uppercase;font-weight:600">Heap Objects</div>';
  (step.stackFrames || []).forEach(fr => {
    const d = document.createElement('div'); d.className = 'mem-frame';
    const hdr = document.createElement('div'); hdr.className = 'mem-frame-hdr'; hdr.textContent = fr.name + '()'; d.appendChild(hdr);
    const body = document.createElement('div'); body.style.cssText = 'padding:6px 10px;background:rgba(5,7,14,0.5)';
    (fr.variables || []).forEach(v => {
      const row = document.createElement('div'); row.className = 'kv';
      row.innerHTML = `<span style="color:#475569">${esc(v.type)}</span><span style="color:${v.isNew?'#a5b4fc':'#e2e8f0'};font-weight:${v.isNew?700:400}">${esc(v.name)}</span><span style="color:#374151">=</span><span style="color:${v.isPointer?'#a78bfa':'#fbbf24'}">${esc(String(v.value))}</span>${v.isNew?'<span style="font-size:8px;color:#a5b4fc;border:1px solid rgba(99,102,241,0.4);border-radius:3px;padding:0 3px;line-height:13px;margin-left:2px">NEW</span>':''}`;
      body.appendChild(row);
    });
    if (!(fr.variables || []).length) { const e = document.createElement('div'); e.style.cssText = 'color:#374151;font-family:JetBrains Mono,monospace;font-size:11px'; e.textContent = '// empty'; body.appendChild(e); }
    d.appendChild(body); sc.appendChild(d);
  });
  (step.heap || []).forEach(obj => {
    const d = document.createElement('div'); d.className = `mem-obj ${obj.highlight ? 'hl' : 'nhl'}`;
    const hdr = document.createElement('div'); hdr.className = 'mem-obj-hdr';
    hdr.style.background = obj.highlight ? 'rgba(99,102,241,0.07)' : 'rgba(5,7,14,0.5)';
    hdr.innerHTML = `<span style="color:${obj.isNew?'#a5b4fc':'#475569'};font-family:'JetBrains Mono',monospace">${esc(obj.id)}</span><span style="color:#a78bfa;font-family:'JetBrains Mono',monospace">${esc(obj.type)}</span>`;
    const body = document.createElement('div'); body.style.cssText = 'padding:5px 10px;background:rgba(5,7,14,0.35)';
    Object.entries(obj.fields || {}).forEach(([k, v]) => {
      const ref = typeof v === 'string' && (v.startsWith('node') || v.startsWith('n') || v.startsWith('obj'));
      const row = document.createElement('div'); row.className = 'kv';
      row.innerHTML = `<span style="color:#475569">${esc(k)}:</span><span style="color:${ref?'#a78bfa':'#fbbf24'}">${esc(String(v))}</span>`;
      body.appendChild(row);
    });
    d.appendChild(hdr); d.appendChild(body); hc.appendChild(d);
  });
}

// ─── TABS ─────────────────────────────────────────────────────────────────────
function switchTab(tab) {
  activeTab = tab;
  document.getElementById('tab-viz').className = 'tab-btn ' + (tab === 'viz' ? 'on' : 'off');
  document.getElementById('tab-mem').className = 'tab-btn ' + (tab === 'mem' ? 'on' : 'off');
  document.getElementById('tab-algo').className = 'tab-btn ' + (tab === 'algo' ? 'on' : 'off');
  document.getElementById('viz-content').style.display  = tab === 'viz' ? 'block' : 'none';
  document.getElementById('mem-content').style.display  = tab === 'mem' ? 'flex'  : 'none';
  document.getElementById('algo-content').style.display = tab === 'algo' ? 'block' : 'none';
  if (trace && tab !== 'algo') renderStep();
}

// ─── ALGORITHM EXPLANATION ────────────────────────────────────────────────────
function renderAlgoExplanation() {
  const container = document.getElementById('algo-explanation');
  container.innerHTML = '';

  const algos = allAlgorithms.length ? allAlgorithms : (trace ? [trace] : []);
  if (!algos.length) {
    container.innerHTML = '<div style="color:#374151;font-family:JetBrains Mono,monospace;font-size:12px;text-align:center;padding:40px">Run a visualization to see the algorithm explanation</div>';
    return;
  }

  algos.forEach((algo, idx) => {
    const expl = algo.explanation || {};
    const card = document.createElement('div');
    card.className = 'algo-card';
    card.innerHTML = `
      <h3><span>📝</span> ${esc(algo.algorithm || 'Algorithm')} ${algos.length > 1 ? `<span style="font-size:10px;color:#475569;font-weight:500">(${idx + 1}/${algos.length})</span>` : ''}</h3>
      ${expl.description ? `<div class="algo-desc">${esc(expl.description)}</div>` : ''}
      <div class="complexity-row">
        ${expl.timeComplexity ? `<div class="complexity-badge time">⏱ Time: ${esc(expl.timeComplexity)}</div>` : ''}
        ${expl.spaceComplexity ? `<div class="complexity-badge space">💾 Space: ${esc(expl.spaceComplexity)}</div>` : ''}
        ${algo.dataStructure ? `<div class="complexity-badge time">📦 ${esc(algo.dataStructure)}</div>` : ''}
      </div>
      ${(expl.pseudocode && expl.pseudocode.length) ? `
        <h3 style="margin-top:16px"><span>📋</span> Pseudocode</h3>
        <ul class="pseudo-list">
          ${expl.pseudocode.map(line => `<li>${esc(line)}</li>`).join('')}
        </ul>
      ` : ''}
      ${(expl.codeSyntax) ? `
        <h3 style="margin-top:16px"><span>💻</span> Code Syntax</h3>
        <div style="background:rgba(5,7,14,0.6);border:1px solid rgba(99,102,241,0.1);border-radius:10px;padding:14px 18px;font-family:'JetBrains Mono',monospace;font-size:12px;color:#a5b4fc;line-height:1.65;white-space:pre-wrap;overflow-x:auto">${esc(expl.codeSyntax)}</div>
      ` : ''}
      <div style="margin-top:14px;font-size:10px;color:#374151;font-family:'JetBrains Mono',monospace">${algo.steps?.length || 0} execution steps traced</div>
    `;
    container.appendChild(card);
  });
}

// ─── LANGUAGE DETECTION ───────────────────────────────────────────────────────
function detectLanguage(code) {
  if (/^\s*#include/m.test(code)) {
    if (/\bcout\b|\bcin\b|\bstd::|\bvector\s*<|\busing\s+namespace/.test(code)) return 'C++';
    return 'C';
  }
  if (/\bdef\s+\w+|\bprint\s*\(|\bimport\s+\w+/m.test(code) && !/\bclass\s+\w+.*\{/.test(code)) return 'Python';
  if (/\bpublic\s+class\b|\bSystem\.out|\bString\[\]\s+args/m.test(code)) return 'Java';
  return 'Java'; // default
}

function getFileExtension(lang) {
  switch (lang) {
    case 'C': return '.c';
    case 'C++': return '.cpp';
    case 'Python': return '.py';
    default: return '.java';
  }
}

function updateEditorLanguage(code) {
  const lang = detectLanguage(code);
  const ext = getFileExtension(lang);
  const fn = document.querySelector('.editor-filename');
  if (fn) fn.textContent = `Main${ext}  •  ${lang}`;
}

// ─── STATE PERSISTENCE ───────────────────────────────────────────────────────
function saveVisualizationState(code, traceData, shareId) {
  try {
    sessionStorage.setItem('algoscope_state', JSON.stringify({
      code, trace: traceData, shareId, timestamp: Date.now()
    }));
  } catch (_) { /* quota exceeded — ignore */ }
}

function restoreVisualizationState() {
  try {
    const saved = sessionStorage.getItem('algoscope_state');
    if (!saved) return;
    const state = JSON.parse(saved);
    // Only restore if saved within last 30 min
    if (Date.now() - state.timestamp > 30 * 60 * 1000) {
      sessionStorage.removeItem('algoscope_state');
      return;
    }
    if (state.code) {
      // Wait for Monaco editor to be initialized, then restore
      let attempts = 0;
      const waitForMonaco = setInterval(() => {
        attempts++;
        if (monacoEditor || attempts > 50) {
          clearInterval(waitForMonaco);
          if (!monacoEditor && attempts > 50) return; // gave up
          setCode(state.code);
          if (state.trace) {
            trace = state.trace;
            currentShareId = state.shareId || null;
            updateEditorLanguage(state.code);
            onTraceReady();
            document.getElementById('share-btn').disabled = !state.shareId;
          }
        }
      }, 200);
    }
  } catch (_) { /* parse error — ignore */ }
}

// ─── TIMELINE ─────────────────────────────────────────────────────────────────
function goStart()    { if (!trace) return; setIsPlaying(false); currentStep = 0; renderStep(); }
function stepBack()   { if (!trace) return; setIsPlaying(false); if (currentStep > 0) { currentStep--; renderStep(); } }
function stepFwd()    { if (!trace) return; setIsPlaying(false); if (currentStep < trace.steps.length - 1) { currentStep++; renderStep(); } }
function goEnd()      { if (!trace) return; setIsPlaying(false); currentStep = trace.steps.length - 1; renderStep(); }
function togglePlay() { if (!trace) return; setIsPlaying(!isPlaying); if (isPlaying && currentStep >= trace.steps.length - 1) { currentStep = 0; renderStep(); } }

function setIsPlaying(val) {
  isPlaying = val; clearInterval(playTimer); setBtnPlay(isPlaying);
  if (isPlaying) playTimer = setInterval(() => {
    if (currentStep >= trace.steps.length - 1) { setIsPlaying(false); return; }
    currentStep++; renderStep();
  }, Math.round(1300 / playSpeed));
}

function setBtnPlay(v) { const b = document.getElementById('btn-play'); b.textContent = v ? '⏸' : '▶'; b.className = 'btn-ctrl' + (v ? ' active' : ''); }

function seekTo(e) {
  if (!trace) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  currentStep = Math.round(pct * (trace.steps.length - 1)); setIsPlaying(false); renderStep();
}

function updateSpeed(v) { playSpeed = parseFloat(v); document.getElementById('speed-label').textContent = v + '×'; if (isPlaying) setIsPlaying(true); }

function updateControlStates() {
  const has = !!trace && trace.steps?.length > 0;
  const atS = !has || currentStep === 0, atE = !has || currentStep >= (trace?.steps?.length || 0) - 1;
  document.getElementById('btn-start').disabled = !has || atS;
  document.getElementById('btn-back').disabled  = !has || atS;
  document.getElementById('btn-play').disabled  = !has;
  document.getElementById('btn-fwd').disabled   = !has || atE;
  document.getElementById('btn-end').disabled   = !has || atE;
}

updateControlStates();
