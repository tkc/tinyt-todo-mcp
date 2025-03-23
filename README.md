# Tiny TODO MCP

A Model Context Protocol (MCP) server implementation providing persistent task management capabilities for AI assistants.

## Overview

Tiny TODO MCP is a specialized server that implements the Model Context Protocol (MCP), allowing AI assistants to interact with persistent storage for tasks. This enables AI models to maintain context over time and create and manage tasks beyond their usual context limitations.

## Features

### TODO System

- **Create TODOs**: Store tasks with titles, descriptions, and due dates
- **Update TODOs**: Mark tasks as complete or incomplete
- **Delete TODOs**: Remove tasks from the system
- **Search TODOs**: Find tasks by various criteria including completion status and due dates
- **Task Management**: View upcoming and overdue tasks

### Integration

- Follows the Model Context Protocol standard
- Designed for easy integration with AI assistants
- Provides consistent error handling and responses

## Use Cases

- Extend AI capabilities with persistent task tracking
- Enable AI assistants to track tasks with due dates and completion status
- Support for time-aware task reminders (upcoming and overdue tasks)

## Architecture

Tiny Memory MCP uses a SQLite database for persistent storage, with a clean layered architecture separating:

- Tool interface (MCP protocol implementation)
- Service layer (business logic)
- Repository layer (data access)
- Database layer (storage)

Each tool exposed through the MCP interface provides clear documentation of its capabilities, parameters, and return values.
