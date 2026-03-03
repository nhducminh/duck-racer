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

// API: Lấy danh sách sessions
app.get(BASE_PATH + '/api/sessions', (req, res) => {
    const sessions = db.prepare('SELECT * FROM sessions ORDER BY created_at DESC').all();
    res.json(sessions);
});

// API: Tạo session mới
app.post(BASE_PATH + '/api/sessions', (req, res) => {
    const { name } = req.body;
    const info = db.prepare('INSERT INTO sessions (name) VALUES (?)').run(name || `Chương trình ${new Date().toLocaleDateString('vi-VN')}`);
    res.json({ id: info.lastInsertRowid });
});

// API: Xóa session
app.delete(BASE_PATH + '/api/sessions/:id', (req, res) => {
    const id = req.params.id;
    const deleteWinners = db.prepare('DELETE FROM winners WHERE session_id = ?');
    const deleteSession = db.prepare('DELETE FROM sessions WHERE id = ?');

    // SQLite transaction for safety
    const transaction = db.transaction(() => {
        deleteWinners.run(id);
        deleteSession.run(id);
    });

    transaction();
    res.json({ success: true });
});

// API: Lưu người thắng
app.post(BASE_PATH + '/api/winners', (req, res) => {
    const { sessionId, items } = req.body; // items: list of {name, round, type, date}
    const insert = db.prepare('INSERT INTO winners (session_id, name, round, type, date) VALUES (?, ?, ?, ?, ?)');

    const transaction = db.transaction((winners) => {
        for (const w of winners) insert.run(sessionId, w.name, w.round, w.type, w.date);
    });

    transaction(items);
    res.json({ success: true });
});

// API: Lưu danh sách loại bỏ (excluded)
app.post(BASE_PATH + '/api/excluded', (req, res) => {
    const { sessionId, items } = req.body; // items: list of {name, reason, time}
    const insert = db.prepare('INSERT INTO excluded (session_id, name, reason, time) VALUES (?, ?, ?, ?)');

    const transaction = db.transaction((targets) => {
        for (const t of targets) insert.run(sessionId, t.name, t.reason, t.time);
    });

    transaction(items);
    res.json({ success: true });
});

// API: Lấy toàn bộ lịch sử (cho Admin)
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