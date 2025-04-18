/**
 * Tiny TODO MCP - Model Context Protocol (MCP) Server Implementation
 *
 * A specialized MCP server that provides TODO management functionality
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Database initialization
import { setupDatabase, initializeDatabase, closeDatabase } from "./database";
import * as todoRepo from "./repositories/todoRepository";
import * as todoService from "./services/todoService";
import { HOLIDAYS_2025 } from "./services/todoService";

// Process command line arguments
const args = process.argv.slice(2);
let dbPath = "tiny-todo.db"; // Default path

// Display current directory and default path
console.error(`[INFO] Current working directory: ${process.cwd()}`);
console.error(`[INFO] Default database path: ${process.cwd()}/tiny-todo.db`);

// Use the first argument as database path if provided
if (args.length > 0) {
  dbPath = args[0];
  console.error(`[INFO] Setting database path: ${dbPath}`);
}

// Exports
export { initializeDatabase, closeDatabase, todoRepo, todoService };

// Initialize database
setupDatabase(dbPath);
initializeDatabase();

// Logger utility
function log(level: string, ...args: any[]) {
  console.error(`[${level.toUpperCase()}]`, ...args);
}

// Schema definitions
const TodoCreateSchema = z.object({
  content: z.string().describe("The content of the TODO"),
});

const TodoItemSchema = z.object({
  content: z.string().describe("A single TODO item to add to the list"),
});

const TodoSearchSchema = z.object({
  search_text: z.string().describe("Search text in TODO content"),
});

// Initialize MCP server
const server = new McpServer({
  name: "tiny-todo-mcp-server",
  version: "1.0.0",
  description:
    "A specialized Model Context Protocol server that provides TODO management functionality.",
});

// TODO tools
server.tool(
  "update_todo",
  "COMPLETE REPLACEMENT: Replaces the entire TODO list with new content. Use this when you want to send a completely formatted TODO list. Previous versions are preserved as history. Input should be a full, formatted TODO list with all items.",
  TodoCreateSchema.shape,
  async (args) => {
    try {
      // TODO全体を新しいリビジョンとして更新
      todoService.updateTodoList(args.content);

      // 最新のTODOを取得
      const { todo, prompt } = todoService.getLatestTodoWithPrompt();

      if (!todo) {
        return {
          content: [
            {
              type: "text",
              text: `No TODOs found.\n\n${HOLIDAYS_2025}`,
            },
          ],
          isError: false,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `TODO list updated with new revision:\n${todo.content}\n\nPrompt for formatting:\n${prompt}\n\n${HOLIDAYS_2025}`,
          },
        ],
        isError: false,
      };
    } catch (error) {
      log("error", "Update TODO list error:", error);
      return {
        content: [
          {
            type: "text",
            text: `An error occurred: ${error instanceof Error ? error.message : String(error)}\n\n${HOLIDAYS_2025}`,
          },
        ],
        isError: true,
      };
    }
  },
);

server.tool(
  "add_todo_item",
  "SINGLE ITEM ADDITION: Adds just one new TODO item to the existing list. Use this when you want to add a specific task without modifying the rest of the list. Input should be just the task text without any formatting.",
  TodoItemSchema.shape,
  async (args) => {
    try {
      // 単一のTODOアイテムを追加
      todoService.addSingleTodo(args.content);

      // 最新のTODOを取得
      const { todo, prompt } = todoService.getLatestTodoWithPrompt();

      if (!todo) {
        return {
          content: [
            {
              type: "text",
              text: `TODO item added, but no TODOs found in database.\n\n${HOLIDAYS_2025}`,
            },
          ],
          isError: false,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `TODO item added:\n${todo.content}\n\nPrompt for formatting:\n${prompt}\n\n${HOLIDAYS_2025}`,
          },
        ],
        isError: false,
      };
    } catch (error) {
      log("error", "Add TODO item error:", error);
      return {
        content: [
          {
            type: "text",
            text: `An error occurred: ${error instanceof Error ? error.message : String(error)}\n\n${HOLIDAYS_2025}`,
          },
        ],
        isError: true,
      };
    }
  },
);

server.tool(
  "get_latest_todo",
  "Retrieves the latest TODO task with formatting prompt.",
  z.object({}).shape,
  async () => {
    try {
      const { todo, prompt } = todoService.getLatestTodoWithPrompt();

      if (!todo) {
        return {
          content: [
            {
              type: "text",
              text: `No TODOs found.\n\n${HOLIDAYS_2025}`,
            },
          ],
          isError: false,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `TODO:\n${todo.content}\n\nPrompt for formatting:\n${prompt}\n\n${HOLIDAYS_2025}`,
          },
        ],
        isError: false,
      };
    } catch (error) {
      log("error", "Get latest TODO error:", error);
      return {
        content: [
          {
            type: "text",
            text: `An error occurred: ${error instanceof Error ? error.message : String(error)}\n\n${HOLIDAYS_2025}`,
          },
        ],
        isError: true,
      };
    }
  },
);

server.tool(
  "search_todo",
  "Searches for a TODO by text and returns it with formatting prompt.",
  TodoSearchSchema.shape,
  async (args) => {
    try {
      const { todos, prompt } = todoService.searchTodoWithPrompt(
        args.search_text,
      );

      if (todos.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No TODOs found matching "${args.search_text}".\n\n${HOLIDAYS_2025}`,
            },
          ],
          isError: false,
        };
      }

      // 検索結果をテキストに結合
      const todoTexts = todos
        .map((todo) => `ID: ${todo.id}\nContent: ${todo.content}`)
        .join("\n\n");

      return {
        content: [
          {
            type: "text",
            text: `Found ${todos.length} TODOs matching "${args.search_text}":\n\n${todoTexts}\n\nPrompt for formatting:\n${prompt}\n\n${HOLIDAYS_2025}`,
          },
        ],
        isError: false,
      };
    } catch (error) {
      log("error", "Search TODO error:", error);
      return {
        content: [
          {
            type: "text",
            text: `An error occurred: ${error instanceof Error ? error.message : String(error)}\n\n${HOLIDAYS_2025}`,
          },
        ],
        isError: true,
      };
    }
  },
);

// Server start function
async function main() {
  try {
    log("info", "Starting Tiny TODO MCP server...");

    // Configure transport
    const transport = new StdioServerTransport();

    // Connect server to transport
    await server.connect(transport);

    // Display startup messages
    log("info", "Tiny TODO MCP Server started");
    log("info", "Available tools:");
    log(
      "info",
      " - update_todo: COMPLETE REPLACEMENT - Send a full formatted TODO list",
    );
    log(
      "info",
      " - add_todo_item: SINGLE ITEM ADDITION - Add one task without changing the rest",
    );
    log("info", " - get_latest_todo: Get the latest TODO");
    log("info", " - search_todo: Search TODOs by text");
    log("info", "Listening for requests...");
  } catch (error) {
    log("error", "Failed to start Tiny TODO MCP Server:", error);
    process.exit(1);
  }
}

// Process termination handler
process.on("SIGINT", () => {
  log("info", "Server shutting down...");
  closeDatabase();
  process.exit(0);
});

// Error handler
process.on("uncaughtException", (error) => {
  log("error", "Uncaught exception:", error);
  closeDatabase();
});

// Run the server
main().catch((error) => {
  log("error", "Unexpected error:", error);
  closeDatabase();
  process.exit(1);
});
