import { Database } from "bun:sqlite";
import { initTodosTable } from "./schema/todos";

// Create database connection (use specified path for testing)
let db: Database;

export function setupDatabase(dbPath: string = "tiny-todo.db") {
  // Close existing connection if any
  if (db) {
    try {
      db.close();
    } catch (e) {
      // Ignore if already closed
      console.error("Error while closing database connection:", e);
    }
  }

  try {
    // Create new connection
    db = new Database(dbPath);
    return db;
  } catch (error) {
    console.error(`Database connection error: ${error}`);
    console.log("Using in-memory database as fallback");
    db = new Database(":memory:");
    return db;
  }
}

// Create tables
export function initializeDatabase() {
  initTodosTable();
}

// Function to close the database
export function closeDatabase() {
  if (db) {
    db.close();
    console.log("Database connection closed");
  }
}

// Function to get the current database connection
export function getDatabase() {
  return db;
}
