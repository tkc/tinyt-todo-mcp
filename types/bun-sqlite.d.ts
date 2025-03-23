declare module "bun:sqlite" {
  export class Database {
    constructor(path: string);
    close(): void;
    exec(sql: string): void;
    prepare(sql: string): Statement;
    transaction<T>(fn: () => T): T;
    run(sql: string): RunResult;
  }

  export interface Statement {
    get(...params: any[]): any;
    all(...params: any[]): any[];
    run(...params: any[]): RunResult;
  }

  export interface RunResult {
    lastInsertRowid: number | bigint;
    changes: number;
  }
}
