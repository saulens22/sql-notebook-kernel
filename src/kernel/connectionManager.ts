import * as sql from 'mssql';
import * as vscode from 'vscode';
import { Logger } from '../utils/logger';

export interface ConnectionConfig {
  server: string;
  database: string;
  user?: string;
  password?: string;
  options?: {
    encrypt?: boolean;
    trustServerCertificate?: boolean;
  };
}

export class ConnectionManager {
  private pools: Map<string, sql.ConnectionPool> = new Map();
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  async getConnection(config: ConnectionConfig | string): Promise<sql.ConnectionPool> {
    const connectionKey = typeof config === 'string' ? config : JSON.stringify(config);

    // Return existing pool if available
    if (this.pools.has(connectionKey)) {
      const pool = this.pools.get(connectionKey)!;
      if (pool.connected) {
        return pool;
      }
    }

    // Create new pool
    this.logger.info('Creating new connection pool');
    const pool = typeof config === 'string'
      ? new sql.ConnectionPool(config)
      : new sql.ConnectionPool(config);

    try {
      await pool.connect();
      this.pools.set(connectionKey, pool);
      this.logger.info('Connection pool created successfully');
      return pool;
    } catch (error) {
      this.logger.error('Failed to create connection pool', error as Error);
      throw error;
    }
  }

  async closeConnection(config: ConnectionConfig | string): Promise<void> {
    const connectionKey = typeof config === 'string' ? config : JSON.stringify(config);
    const pool = this.pools.get(connectionKey);

    if (pool) {
      await pool.close();
      this.pools.delete(connectionKey);
      this.logger.info('Connection pool closed');
    }
  }

  async closeAll(): Promise<void> {
    this.logger.info('Closing all connection pools');
    const closePromises = Array.from(this.pools.values()).map(pool => pool.close());
    await Promise.all(closePromises);
    this.pools.clear();
  }

  async getConnectionFromSettings(): Promise<sql.ConnectionPool> {
    const config = vscode.workspace.getConfiguration('sqlNotebook');
    const connectionString = config.get<string>('defaultConnectionString');

    if (!connectionString) {
      throw new Error('No default connection string configured. Please set sqlNotebook.defaultConnectionString in settings.');
    }

    return this.getConnection(connectionString);
  }
}
