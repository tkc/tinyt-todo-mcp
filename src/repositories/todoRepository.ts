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
 * Add a single todo item to the existing todo list
 */
export function addSingleTodo(todo: TodoCreateInput): number {
  const db = getDatabase();
  const latestTodo = getLatestTodo();

  // 新しいTODOアイテムを追加（既存のものがあれば、それに追加）
  let newContent = todo.content;
  if (latestTodo) {
    // 既存のTODOに新しいアイテムを追加
    newContent = `${latestTodo.content}\n- [ ] ${todo.content}`;
  } else {
    // 初めてのTODOの場合、適切なフォーマットで開始
    newContent = `- [ ] ${todo.content}`;
  }

  const insert = db.prepare("INSERT INTO todos (content) VALUES (?)");
  const result = insert.run(newContent);
  return Number(result.lastInsertRowid);
}

/**
 * Update the entire todo list with a new revision
 */
export function updateTodoList(todo: TodoCreateInput): number {
  const db = getDatabase();
  const latestTodo = getLatestTodo();

  const newRevision = latestTodo
    ? `${todo.content}\n${latestTodo.content}`
    : todo.content;
  const insert = db.prepare("INSERT INTO todos (content) VALUES (?)");
  const result = insert.run(newRevision);
  return Number(result.lastInsertRowid);
}

// 注: updateLatestTodo は削除し、代わりに addTodoRevision を使用

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
