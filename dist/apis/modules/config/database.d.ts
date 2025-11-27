import { QueryResult } from "pg";
interface DatabaseConnection {
    query(query: string, params?: any[]): Promise<QueryResult>;
    beginTransaction(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
    release(): void;
}
declare const db: {
    query(query: string, params?: any[]): Promise<QueryResult>;
    getConnection(): Promise<DatabaseConnection>;
};
export default db;
//# sourceMappingURL=database.d.ts.map