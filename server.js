// server.js — AlgoScope Express backend with MySQL + JWT auth
const express  = require('express');
require('dotenv').config();
const cors     = require('cors');
const fetch    = require('node-fetch');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const path     = require('path');
const {
  initializeDatabase,
  testConnection,
  createUser, getUserByUsername, getUserByEmail, getUserById, getAllUsers,
  saveVisualization, getVisualization, getRecentVisualizations, getVisualizationsByUser,
  runAdminQuery, getSchema
} = require('./db');

const app = express();
const PORT       = process.env.PORT       || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'algoscope-secret-change-in-prod';
const OLLAMA_URL   = process.env.OLLAMA_URL   || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen3.5:9b';

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ── Auth middleware ───────────────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Please log in.' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Session expired — please log in again.' }); }
}

function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) { try { req.user = jwt.verify(token, JWT_SECRET); } catch {} }
  next();
}

// ── POST /api/auth/register ───────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: 'All fields are required.' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  try {
    if (await getUserByUsername(username))
      return res.status(409).json({ error: 'Username already taken.' });
    if (await getUserByEmail(email))
      return res.status(409).json({ error: 'Email already registered.' });
    const hash = await bcrypt.hash(password, 10);
    const userId = await createUser(username, email, hash);
    const token  = jwt.sign({ userId, username, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
    console.log(`[auth] Registered: ${username} (id=${userId})`);
    res.json({ token, user: { id: userId, username, email, role: 'user' } });
  } catch (err) {
    console.error('[auth] Register error:', err.message);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username and password required.' });
  try {
    const user = await getUserByUsername(username);
    if (!user) return res.status(401).json({ error: 'Invalid username or password.' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok)  return res.status(401).json({ error: 'Invalid username or password.' });
    const token = jwt.sign({ userId: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    console.log(`[auth] Login: ${username}`);
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.' });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  const user = await getUserById(req.user.userId);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json(user);
});

// ── GET /api/auth/my-visualizations ───────────────────────────────────────────
app.get('/api/auth/my-visualizations', authMiddleware, async (req, res) => {
  const vizzes = await getVisualizationsByUser(req.user.userId);
  res.json(vizzes);
});

// ── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are AlgoScope, an expert code execution trace generator and computer science educator. You analyze Java, C, or C++ code and produce DETAILED step-by-step execution traces as JSON that help students understand algorithms visually.

Think carefully and deeply about the code. Your goal is to make the algorithm CRYSTAL CLEAR to a student. Every step should teach something.

IMPORTANT: If the code contains MULTIPLE algorithms (e.g. both DFS and BFS), generate SEPARATE traces for each in an "algorithms" array. If the code has only ONE algorithm, still wrap it in the "algorithms" array.

Return ONLY valid JSON after your thinking — no markdown, no backticks.

Schema:
{
  "algorithms": [
    {
      "algorithm": "descriptive name",
      "language": "Java|C|C++",
      "dataStructure": "linkedlist|tree|array|stack|queue|graph|sort",
      "explanation": {
        "description": "3-5 sentences explaining what this algorithm does, how it works step by step, its real-world applications, and key insights",
        "timeComplexity": "O(V+E)",
        "spaceComplexity": "O(V)",
        "pseudocode": ["step 1", "step 2", "step 3", "step 4", "step 5", "step 6"],
        "codeSyntax": "The 3-6 line core code pattern showing the essential syntax of this algorithm"
      },
      "steps": [
        {
          "stepNumber": 1,
          "line": 5,
          "description": "DETAILED description of what happens in this step, why it matters, and how it changes the data structure. Example: 'Initialize visited array to track which nodes have been explored. Mark start node 0 as visited and add it to the queue. The queue ensures we process nodes in order of discovery (FIFO).'",
          "stackFrames": [
            { "name": "methodName", "variables": [{"name":"x","type":"int","value":"5","isNew":true,"isPointer":false}] }
          ],
          "heap": [
            {"id":"node_1","type":"Node","fields":{"val":1,"next":"node_2"},"isNew":false,"highlight":true}
          ],
          "visualization": {}
        }
      ]
    }
  ]
}

Visualization formats:
- linkedlist: {"type":"linkedlist","nodes":[{"id":"n1","value":1,"next":"n2","highlight":false,"isNew":false}]}
- tree: {"type":"tree","root":{"id":"n1","value":5,"left":null,"right":null,"highlight":false,"isNew":false}}
- array: {"type":"array","elements":[{"value":3,"index":0,"highlight":false,"comparing":false,"sorted":false}]}
- stack: {"type":"stack","elements":[{"value":10,"isTop":false},{"value":20,"isTop":true}]}
- queue: {"type":"queue","elements":[{"value":10,"isFront":true,"isRear":false}]}
- graph: {"type":"graph","nodes":[{"id":"0","value":"0","x":230,"y":60,"highlight":false,"visited":false},{"id":"1","value":"1","x":370,"y":150,"highlight":false,"visited":false},{"id":"2","value":"2","x":320,"y":310,"highlight":false,"visited":false},{"id":"3","value":"3","x":140,"y":310,"highlight":false,"visited":false},{"id":"4","value":"4","x":90,"y":150,"highlight":false,"visited":false}],"edges":[{"from":"0","to":"1","directed":false,"highlight":false}]}

CRITICAL RULES:
- Generate 12-18 DETAILED steps per algorithm. More steps = better understanding. Cover initialization, EVERY iteration, AND conclusion.
- Descriptions MUST be 2-4 sentences each. Explain WHAT happens, WHY it matters, and HOW the data structure changes.
  Good: "Dequeue node 0 from the front of the queue. Check all of node 0's neighbors in the adjacency matrix. Nodes 1 and 2 are adjacent and unvisited, so they will be added to the queue next."
  Bad: "Visit node 0" (too short!)
- For BFS/DFS: show EVERY node dequeue, EVERY neighbor check, highlight edges being traversed, mark nodes as visited progressively
- For sorting: show EVERY comparison and swap individually
- For linked lists: show each pointer change step by step
- Limit stackFrames to 4 variables max per frame
- Limit heap to 8 objects max
- Each step = full current state (not diffs)
- CRITICAL for graphs: Place ALL nodes with x,y spread across 60-400. Use circular layout. Every node in every step MUST have x,y.
- For graph edges: highlight the edge being traversed in the current step
- Always include full explanation with description, complexities, pseudocode (6+ steps), AND codeSyntax
- Detect the programming language and set the language field
- CRITICAL: Output must be complete valid JSON only after thinking`;


// ── JSON salvage helper ───────────────────────────────────────────────────────
function parseTrace(raw) {
  let clean = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  clean = clean.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

  let parsed;
  try { parsed = JSON.parse(clean); }
  catch (_) {
    // Try to salvage steps from broken JSON
    const stepObjs = [];
    const stepsIdx = clean.indexOf('"steps"');
    if (stepsIdx === -1) throw new Error('No steps found in model output.');
    const stepsStr = clean.slice(stepsIdx);
    let depth = 0, start = -1;
    for (let i = 0; i < stepsStr.length; i++) {
      const c = stepsStr[i];
      if (c === '{') { if (depth === 0) start = i; depth++; }
      else if (c === '}') { depth--; if (depth === 0 && start >= 0) { try { stepObjs.push(JSON.parse(stepsStr.slice(start, i + 1))); } catch {} start = -1; } }
    }
    if (!stepObjs.length) throw new Error('Could not parse model output.');
    const algoMatch = clean.match(/"algorithm"\s*:\s*"([^"]+)"/);
    const dsMatch   = clean.match(/"dataStructure"\s*:\s*"([^"]+)"/);
    const descMatch = clean.match(/"description"\s*:\s*"([^"]+)"/);
    const timeMatch = clean.match(/"timeComplexity"\s*:\s*"([^"]+)"/);
    const spaceMatch = clean.match(/"spaceComplexity"\s*:\s*"([^"]+)"/);
    parsed = {
      algorithm: algoMatch?.[1] || 'Algorithm',
      dataStructure: dsMatch?.[1] || 'array',
      explanation: {
        description: descMatch?.[1] || '',
        timeComplexity: timeMatch?.[1] || '',
        spaceComplexity: spaceMatch?.[1] || '',
        pseudocode: []
      },
      steps: stepObjs
    };
  }

  // Normalize: ensure we always have the multi-algorithm format
  if (parsed.algorithms && Array.isArray(parsed.algorithms)) {
    // New multi-algorithm format — pass through
    // But ensure each algo has explanation
    parsed.algorithms.forEach(a => {
      if (!a.explanation) a.explanation = { description: '', timeComplexity: '', spaceComplexity: '', pseudocode: [] };
    });
    return parsed;
  }

  // Old single-algorithm format — wrap it
  if (!parsed.explanation) {
    parsed.explanation = { description: '', timeComplexity: '', spaceComplexity: '', pseudocode: [] };
  }
  return {
    algorithms: [{
      algorithm: parsed.algorithm || 'Algorithm',
      dataStructure: parsed.dataStructure || 'array',
      explanation: parsed.explanation,
      steps: parsed.steps || []
    }]
  };
}

// ── POST /api/visualize ───────────────────────────────────────────────────────
app.post('/api/visualize', optionalAuth, async (req, res) => {
  const { code } = req.body;
  if (!code?.trim()) return res.status(400).json({ error: 'No Java code provided.' });
  const userId = req.user?.userId || null;
  console.log(`[viz] ${code.length} chars | user: ${req.user?.username || 'guest'}`);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 300000); // 5 min for thinking
  try {
    const ollamaRes = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({ model: OLLAMA_MODEL, stream: false, think: true, options: { temperature: 0.3, num_predict: 16384 }, prompt: `${SYSTEM_PROMPT}\n\nTrace this code:\n\n${code}` })
    });
    clearTimeout(timeout);
    if (!ollamaRes.ok) throw new Error(`Ollama ${ollamaRes.status}: ${(await ollamaRes.text()).slice(0, 200)}`);
    const raw = (await ollamaRes.json())?.response || '';
    if (!raw) throw new Error('Ollama returned empty response.');
    const trace = parseTrace(raw);
    const firstAlgo = trace.algorithms?.[0];
    if (!firstAlgo?.steps?.length) throw new Error('No steps generated.');
    const shareId = uuidv4();
    await saveVisualization(shareId, code, trace, firstAlgo.algorithm, firstAlgo.dataStructure, userId);
    const algoCount = trace.algorithms.length;
    console.log(`[viz] Saved ${shareId} (${algoCount} algo${algoCount > 1 ? 's' : ''}, ${firstAlgo.steps.length} steps)`);
    res.json({ shareId, trace });
  } catch (err) {
    clearTimeout(timeout);
    const msg = err.name === 'AbortError' ? 'Timed out (5 min). Try simpler code or a faster model.' : err.message;
    console.error('[viz] Error:', msg);
    res.status(500).json({ error: msg });
  }
});

// ── GET /api/share/:id ────────────────────────────────────────────────────────
app.get('/api/share/:id', async (req, res) => {
  const row = await getVisualization(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found.' });
  res.json({ shareId: row.id, code: row.code, trace: row.trace_json, algorithm: row.algorithm, createdAt: row.created_at });
});

// ── GET /api/recent ───────────────────────────────────────────────────────────
app.get('/api/recent', async (req, res) => { res.json(await getRecentVisualizations(20)); });

// ── Admin endpoints ───────────────────────────────────────────────────────────
app.post('/api/sql', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'No query.' });
  try { const rows = await runAdminQuery(query); res.json({ rows, count: rows.length }); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/schema', async (req, res) => {
  try { res.json(await getSchema()); } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/users', async (req, res) => { res.json(await getAllUsers()); });

// ── Page routes ───────────────────────────────────────────────────────────────
app.get('/login',     (_, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/dashboard', (_, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/admin',     (_, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('*',          (_, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// ── Start ─────────────────────────────────────────────────────────────────────
(async () => {
  await initializeDatabase();
  await testConnection();
  app.listen(PORT, () => {
    console.log(`\n  ◈  AlgoScope running on http://localhost:${PORT}`);
    console.log(`  ◈  Ollama: ${OLLAMA_MODEL} @ ${OLLAMA_URL}`);
    console.log(`  ◈  MySQL: localhost:3306/algoscope\n`);
  });
})();
