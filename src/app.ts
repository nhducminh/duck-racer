import express from 'express';
import path from 'path';
import cors from 'cors';
import db from './database';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const BASE_PATH = process.env.BASE_PATH || '';

app.use(cors());
app.use(express.json());

// Serve static files
app.use(BASE_PATH, express.static(path.join(__dirname, '../public')));

// --- SESSIONS ---
app.get(BASE_PATH + '/api/sessions', (req, res) => {
    const sessions = db.prepare('SELECT * FROM sessions ORDER BY created_at DESC').all();
    res.json(sessions);
});

app.post(BASE_PATH + '/api/sessions', (req, res) => {
    const { name } = req.body;
    const info = db.prepare('INSERT INTO sessions (name) VALUES (?)').run(name || `Chương trình ${new Date().toLocaleDateString('vi-VN')}`);
    res.json({ id: info.lastInsertRowid });
});

app.put(BASE_PATH + '/api/sessions/:id', (req, res) => {
    const { name, status } = req.body;
    db.prepare('UPDATE sessions SET name = COALESCE(?, name), status = COALESCE(?, status) WHERE id = ?').run(name, status, req.params.id);
    res.json({ success: true });
});

app.delete(BASE_PATH + '/api/sessions/:id', (req, res) => {
    const id = req.params.id;
    const transaction = db.transaction(() => {
        db.prepare('DELETE FROM winners WHERE session_id = ?').run(id);
        db.prepare('DELETE FROM excluded WHERE session_id = ?').run(id);
        db.prepare('DELETE FROM sessions WHERE id = ?').run(id);
    });
    transaction();
    res.json({ success: true });
});

// --- WINNERS ---
app.get(BASE_PATH + '/api/winners/:sessionId', (req, res) => {
    const winners = db.prepare('SELECT * FROM winners WHERE session_id = ?').all(req.params.sessionId);
    res.json(winners);
});

app.post(BASE_PATH + '/api/winners', (req, res) => {
    const { sessionId, items } = req.body;
    const insert = db.prepare('INSERT INTO winners (session_id, name, round, type, date) VALUES (?, ?, ?, ?, ?)');
    const transaction = db.transaction((winners) => {
        for (const w of winners) insert.run(sessionId, w.name, w.round, w.type, w.date);
    });
    transaction(items);
    res.json({ success: true });
});

app.delete(BASE_PATH + '/api/winners/:id', (req, res) => {
    db.prepare('DELETE FROM winners WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

// --- EXCLUDED ---
app.get(BASE_PATH + '/api/excluded/:sessionId', (req, res) => {
    const items = db.prepare('SELECT * FROM excluded WHERE session_id = ?').all(req.params.sessionId);
    res.json(items);
});

app.post(BASE_PATH + '/api/excluded', (req, res) => {
    const { sessionId, items } = req.body;
    const insert = db.prepare('INSERT INTO excluded (session_id, name, reason, time) SELECT ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM excluded WHERE session_id = ? AND name = ? AND reason = ?)');
    const transaction = db.transaction((targets) => {
        for (const t of targets) {
            const name = typeof t === 'string' ? t : t.name;
            const reason = typeof t === 'string' ? 'Bị loại' : t.reason;
            const time = typeof t === 'string' ? new Date().toLocaleString('vi-VN') : t.time;
            insert.run(sessionId, name, reason, time, sessionId, name, reason);
        }
    });
    transaction(items);
    res.json({ success: true });
});

app.delete(BASE_PATH + '/api/excluded/:sessionId/:name', (req, res) => {
    db.prepare('DELETE FROM excluded WHERE session_id = ? AND name = ?').run(req.params.sessionId, req.params.name);
    res.json({ success: true });
});

// --- PARTICIPANTS ---
app.get(BASE_PATH + '/api/participants/:sessionId', (req, res) => {
    const list = db.prepare('SELECT name FROM participants WHERE session_id = ?').all(req.params.sessionId) as { name: string }[];
    res.json(list.map(p => p.name));
});

app.post(BASE_PATH + '/api/participants', (req, res) => {
    const { sessionId, items } = req.body;
    const transaction = db.transaction((names) => {
        // Xoá danh sách cũ của session này
        db.prepare('DELETE FROM participants WHERE session_id = ?').run(sessionId);
        // Thêm mới
        const insert = db.prepare('INSERT INTO participants (session_id, name) VALUES (?, ?)');
        for (const name of names) insert.run(sessionId, name);
    });
    transaction(items);
    res.json({ success: true });
});

// --- ADMIN / HISTORY ---
app.get(BASE_PATH + '/api/admin/history', (req, res) => {
    const history = db.prepare(`
    SELECT s.id as session_id, s.name as session_name, w.name, w.round, w.type, w.date, w.created_at
    FROM winners w
    JOIN sessions s ON w.session_id = s.id
    ORDER BY w.created_at DESC
  `).all();
    res.json(history);
});

// Serve HTML pages
app.get(BASE_PATH + '/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get(BASE_PATH + '/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// Create a default session if none exists
const existing = db.prepare('SELECT id FROM sessions LIMIT 1').get();
if (!existing) {
    db.prepare('INSERT INTO sessions (name) VALUES (?)').run('Chương trình khởi tạo');
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});