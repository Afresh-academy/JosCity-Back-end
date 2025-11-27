import { Request, Response } from 'express';
/**
 * Get database statistics and overview
 */
export declare const getDatabaseStats: (_req: Request, res: Response) => Promise<void>;
/**
 * Get all users from database with pagination and filters
 */
export declare const getAllUsers: (req: Request, res: Response) => Promise<void>;
/**
 * Get all tables in the database
 */
export declare const getDatabaseTables: (_req: Request, res: Response) => Promise<void>;
/**
 * Get table structure/schema
 */
export declare const getTableSchema: (req: Request, res: Response) => Promise<void>;
/**
 * Get table data with pagination
 */
export declare const getTableData: (req: Request, res: Response) => Promise<void>;
/**
 * Execute custom query (read-only operations)
 */
export declare const executeQuery: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=dataController.d.ts.map