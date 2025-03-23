import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import {
  setupDatabase,
  initializeDatabase,
  closeDatabase,
  getDatabase,
} from "../src/database";
import * as fs from "fs";

// テスト用の一時データベースファイル
const TEST_DB_FILE = "test-db.sqlite";

describe("データベース機能テスト", () => {
  // 各テスト前に実行
  beforeEach(() => {
    console.log("Setting up test database");
    // 既存のテストDBファイルがあれば削除
    if (fs.existsSync(TEST_DB_FILE)) {
      fs.unlinkSync(TEST_DB_FILE);
    }

    // テスト用のDBファイルを作成して初期化
    setupDatabase(TEST_DB_FILE);
    initializeDatabase();
  });

  // 各テスト後に実行
  afterEach(() => {
    closeDatabase();
    // テストDBファイルを削除
    if (fs.existsSync(TEST_DB_FILE)) {
      fs.unlinkSync(TEST_DB_FILE);
    }
  });

  test("データベースが正しく初期化される", () => {
    console.log("Testing database initialization");
    // todosテーブルが存在するか確認
    const db = getDatabase();

    // todosテーブルが存在するか確認
    const todosTableExists = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='todos'",
      )
      .get();

    console.log("Table exists result:", todosTableExists);
    expect(todosTableExists).toBeTruthy();
  });

  test("todosテーブルが正しいスキーマを持つ", () => {
    console.log("Testing todos table schema");
    const db = getDatabase();
    const tableInfo = db.prepare("PRAGMA table_info(todos)").all();

    // カラム名の配列を作成
    const columnNames = tableInfo.map((col) => col.name);
    console.log("Column names:", columnNames);

    // 期待するカラムが存在するか確認
    expect(columnNames).toContain("id");
    expect(columnNames).toContain("content");
    expect(columnNames).toContain("created_at");

    // 期待しないカラムが含まれていないことを確認
    expect(columnNames).not.toContain("title");
    expect(columnNames).not.toContain("description");
    expect(columnNames).not.toContain("due_date");
    expect(columnNames).not.toContain("completed");
  });

  test("データベース接続を閉じられる", () => {
    console.log("Testing database connection closing");
    // データベース接続を閉じる
    closeDatabase();

    // 再度初期化できることを確認（接続が正しく閉じられていれば成功するはず）
    setupDatabase(TEST_DB_FILE);
    initializeDatabase();

    // todosテーブルにアクセスできることを確認
    const db = getDatabase();
    const query = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='todos'",
    );
    const result = query.get();

    expect(result).toBeTruthy();
  });
});
