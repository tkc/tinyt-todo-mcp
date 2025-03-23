import { getDatabase } from "../index";

/**
 * Initialize the Todos table
 */
export function initTodosTable() {
  const db = getDatabase();

  db.run(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}
