import Database from 'better-sqlite3';
import path from 'path';

const dbDir = path.resolve(process.cwd(), 'data');
const dbPath = path.join(dbDir, 'database.sqlite');

// Đảm bảo thư mục data tồn tại
import fs from 'fs';
try {
  if (!fs.existsSync(dbDir)) {
    console.log('Creating data directory at:', dbDir);
    fs.mkdirSync(dbDir, { recursive: true });
  }
} catch (err) {
  console.error('Failed to create data directory:', err);
}

console.log('Connecting to database at:', dbPath);
const db = new Database(dbPath);

// Khởi tạo cấu trúc bảng cho SQLite
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active', -- 'active' hoặc 'archived'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS winners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER,
    name TEXT NOT NULL,
    round TEXT NOT NULL,
    type TEXT NOT NULL,
    date TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions (id)
  );

  CREATE TABLE IF NOT EXISTS excluded (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER,
    name TEXT NOT NULL,
    reason TEXT NOT NULL,
    time TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions (id)
  );
`);

export default db;
