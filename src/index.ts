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
  "Updates the TODO with new content. If a TODO already exists, it overwrites the latest one. If not, it creates a new one.",
  TodoCreateSchema.shape,
  async (args) => {
    try {
      // TODOを更新
      todoService.updateTodo(args.content);

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

      // get_latest_todoと同じレスポンス形式を返す
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
      log("error", "Update TODO error:", error);
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
    log("info", " - update_todo: Update the latest TODO");
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
