import { getDatabase } from "../database";

export interface Todo {
  id: number;
  content: string;
  created_at: string;
}

export interface TodoCreateInput {
  content: string;
}

/**
 * Create a todo
 */
export function createTodo(todo: TodoCreateInput): number {
  const db = getDatabase();
  const insert = db.prepare("INSERT INTO todos (content) VALUES (?)");
  const result = insert.run(todo.content);

  return Number(result.lastInsertRowid);
}

/**
 * Update or create the latest todo
 * 最新のTODOを更新または作成する
 */
export function updateLatestTodo(todo: TodoCreateInput): number {
  const db = getDatabase();
  const latestTodo = getLatestTodo();

  if (latestTodo) {
    // 最新のTODOが存在する場合は更新
    const update = db.prepare("UPDATE todos SET content = ? WHERE id = ?");
    update.run(todo.content, latestTodo.id);
    return latestTodo.id;
  } else {
    // 最新のTODOが存在しない場合は新規作成
    const insert = db.prepare("INSERT INTO todos (content) VALUES (?)");
    const result = insert.run(todo.content);
    return Number(result.lastInsertRowid);
  }
}

/**
 * Get todo by ID
 */
export function getTodoById(id: number): Todo | null {
  const db = getDatabase();
  return db.prepare("SELECT * FROM todos WHERE id = ?").get(id) as Todo | null;
}

/**
 * Get latest todo
 */
export function getLatestTodo(): Todo | null {
  const db = getDatabase();
  return db
    .prepare("SELECT * FROM todos ORDER BY id DESC LIMIT 1")
    .get() as Todo | null;
}

/**
 * Search todos by text
 */
export function searchTodosByText(searchText: string): Todo[] {
  const db = getDatabase();
  return db
    .prepare("SELECT * FROM todos WHERE content LIKE ? ORDER BY id DESC")
    .all(`%${searchText}%`) as Todo[];
}
