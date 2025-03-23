import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import {
  setupDatabase,
  initializeDatabase,
  closeDatabase,
} from "../src/database";
import * as todoRepo from "../src/repositories/todoRepository";
import * as todoService from "../src/services/todoService";
import * as fs from "fs";

// テスト用の一時データベースファイル
const TEST_DB_FILE = "test-todo.sqlite";

describe("TODO機能テスト", () => {
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

  test("TODOを作成できる", () => {
    console.log("Testing TODO creation");
    const todoInput = {
      content: "テストTODOの内容です。重要度:高 期限:2025/4/1",
    };

    const todoId = todoRepo.createTodo(todoInput);
    console.log(`Created TODO with ID: ${todoId}`);

    // IDが数値であることを確認
    expect(typeof todoId).toBe("number");
    expect(todoId).toBeGreaterThan(0);

    // 作成したTODOを取得して内容を確認
    const todo = todoRepo.getTodoById(todoId);
    console.log("Retrieved TODO:", todo);
    expect(todo).not.toBeNull();
    expect(todo.content).toBe("テストTODOの内容です。重要度:高 期限:2025/4/1");
  });

  test("TODOリビジョンを追加できる", () => {
    console.log("Testing TODO revision addition");

    // まず初期TODOを作成
    const initialTodo = {
      content: "初期TODOの内容です。",
    };
    const initialId = todoRepo.createTodo(initialTodo);

    // 次にリビジョンを追加
    const updatedContent = "更新されたTODOの内容です。重要度:高";
    const newRevisionId = todoRepo.updateTodoList({ content: updatedContent });

    // 新しいIDが生成されたことを確認
    expect(newRevisionId).not.toBe(initialId);
    expect(newRevisionId).toBeGreaterThan(initialId);

    // 更新されたTODOを取得して確認
    const todo = todoRepo.getTodoById(newRevisionId);
    expect(todo).not.toBeNull();
    // 新しい内容と古い内容が結合されているか確認
    expect(todo.content).toContain(updatedContent);
    expect(todo.content).toContain(initialTodo.content);
  });

  test("TODOが存在しない場合は新規リビジョンとして作成される", () => {
    console.log("Testing revision with no existing TODO");

    // 最新のTODOを取得して存在しないことを確認
    const noTodo = todoRepo.getLatestTodo();
    expect(noTodo).toBeNull();

    // updateTodoListを呼び出す
    const content = "新しいTODOリビジョンの内容です。";
    const todoId = todoRepo.updateTodoList({ content });

    // IDが数値であることを確認
    expect(typeof todoId).toBe("number");
    expect(todoId).toBeGreaterThan(0);

    // 作成されたTODOを取得して確認
    const todo = todoRepo.getLatestTodo();
    expect(todo).not.toBeNull();
    expect(todo.content).toBe(content);
  });

  test("単一のTODOアイテムを追加できる", () => {
    console.log("Testing adding a single TODO item");

    // まず初期TODOを作成
    const initialTodo = {
      content: "初期TODOの内容です。",
    };
    todoRepo.createTodo(initialTodo);

    // 単一アイテムを追加
    const newItem = "新しいタスク";
    const newItemId = todoRepo.addSingleTodo({ content: newItem });

    // 新しいIDが生成されたことを確認
    expect(typeof newItemId).toBe("number");
    expect(newItemId).toBeGreaterThan(0);

    // 追加されたTODOを取得して確認
    const todo = todoRepo.getLatestTodo();
    expect(todo).not.toBeNull();
    // 新しいアイテムが追加されているか確認
    expect(todo.content).toContain(newItem);
    expect(todo.content).toContain(initialTodo.content);
  });

  test("複数のTODOを作成して最新のものを取得できる", () => {
    console.log("Testing getting latest TODO");

    // 複数のTODOを作成
    todoRepo.createTodo({ content: "1つ目のTODO" });
    todoRepo.createTodo({ content: "2つ目のTODO" });
    const latestId = todoRepo.createTodo({ content: "3つ目のTODO" });

    // 最新のTODOを取得
    const latestTodo = todoRepo.getLatestTodo();

    // 最新のTODOが3つ目であることを確認
    expect(latestTodo).not.toBeNull();
    expect(latestTodo.id).toBe(latestId);
    expect(latestTodo.content).toBe("3つ目のTODO");
  });

  test("キーワードでTODOを検索できる", () => {
    console.log("Testing searching TODOs by text");

    // 複数のTODOを作成
    todoRepo.createTodo({ content: "プロジェクトAのタスク1" });
    todoRepo.createTodo({ content: "プロジェクトBのタスク" });
    todoRepo.createTodo({ content: "プロジェクトAのタスク2" });

    // プロジェクトAのTODOを検索
    const projectATodos = todoRepo.searchTodosByText("プロジェクトA");
    expect(projectATodos.length).toBe(2);

    // 存在しないキーワードでの検索
    const nonExistingTodos = todoRepo.searchTodosByText("存在しない単語");
    expect(nonExistingTodos.length).toBe(0);
  });

  test("サービス層でリビジョンのTODOリストを更新できる", () => {
    console.log("Testing service layer's TODO list update");

    // 初期TODOを作成
    const initialContent = "初期TODOの内容です。";
    todoRepo.createTodo({ content: initialContent });

    // サービスを使ってTODOリストを更新
    const newContent = "- [ ] 新しいTODOリスト\n- [ ] タスク2";
    const todoId = todoService.updateTodoList(newContent);

    // IDが数値であることを確認
    expect(typeof todoId).toBe("number");
    
    // 取得して内容を確認
    const { todo } = todoService.getLatestTodoWithPrompt();
    expect(todo).not.toBeNull();
    expect(todo.content).toContain(newContent);
    expect(todo.content).toContain(initialContent);
  });

  test("サービス層で単一のTODOアイテムを追加できる", () => {
    console.log("Testing service layer's single TODO item addition");

    // 初期TODOを作成
    const initialContent = "- [ ] 既存のタスク";
    todoRepo.createTodo({ content: initialContent });

    // サービスを使って単一アイテムを追加
    const newItem = "新しいタスク";
    const todoId = todoService.addSingleTodo(newItem);

    // IDが数値であることを確認
    expect(typeof todoId).toBe("number");
    
    // 取得して内容を確認
    const { todo } = todoService.getLatestTodoWithPrompt();
    expect(todo).not.toBeNull();
    expect(todo.content).toContain(newItem);
    expect(todo.content).toContain(initialContent);
  });

  test("検索結果とフォーマットプロンプトを取得できる", () => {
    console.log("Testing searching TODOs with format prompt");

    // 複数のTODOを作成
    todoRepo.createTodo({
      content: "プロジェクトAのミーティング 期限:2025/4/1",
    });
    todoRepo.createTodo({ content: "プロジェクトBの資料作成 期限:2025/4/2" });

    // サービスを使ってプロンプト付きで検索
    const { todos, prompt } = todoService.searchTodoWithPrompt("ミーティング");

    // 検索結果が取得できていることを確認
    expect(todos.length).toBe(1);
    expect(todos[0].content).toContain("ミーティング");

    // プロンプトが存在していることを確認
    expect(prompt).toBeDefined();
    expect(prompt.length).toBeGreaterThan(100);
  });
});
