import * as sql from 'mssql';
import * as vscode from 'vscode';
import { Logger } from '../utils/logger';
import { ConnectionManager } from '../kernel/connectionManager';
import { QueryResult } from './resultFormatter';

export class QueryExecutor {
  private logger: Logger;
  private connectionManager: ConnectionManager;
  private activeRequests: Map<string, sql.Request> = new Map();

  constructor(logger: Logger, connectionManager: ConnectionManager) {
    this.logger = logger;
    this.connectionManager = connectionManager;
  }

  async executeQuery(
    query: string,
    executionId: string,
    token?: vscode.CancellationToken
  ): Promise<QueryResult[]> {
    this.logger.info(`Executing query with ID: ${executionId}`);

    try {
      const config = vscode.workspace.getConfiguration('sqlNotebook');
      const timeout = config.get<number>('queryTimeout', 30000);

      const pool = await this.connectionManager.getConnectionFromSettings();
      const request = pool.request();
      (request as unknown as { timeout: number }).timeout = timeout;

      // Store request for cancellation
      this.activeRequests.set(executionId, request);

      // Handle cancellation
      if (token) {
        token.onCancellationRequested(() => {
          this.logger.info(`Cancelling query: ${executionId}`);
          request.cancel();
          this.activeRequests.delete(executionId);
        });
      }

      // Split by GO statements (batch separator)
      const batches = this.splitBatches(query);
      const results: QueryResult[] = [];

      for (const batch of batches) {
        if (batch.trim()) {
          this.logger.debug(`Executing batch: ${batch.substring(0, 100)}...`);
          const result = await request.query(batch);
          results.push(result as unknown as QueryResult);
        }
      }

      this.activeRequests.delete(executionId);
      this.logger.info(`Query executed successfully: ${executionId}`);

      return results;
    } catch (error) {
      this.activeRequests.delete(executionId);
      this.logger.error(`Query execution failed: ${executionId}`, error as Error);
      throw error;
    }
  }

  cancelQuery(executionId: string): void {
    const request = this.activeRequests.get(executionId);
    if (request) {
      this.logger.info(`Cancelling query: ${executionId}`);
      request.cancel();
      this.activeRequests.delete(executionId);
    }
  }

  private splitBatches(query: string): string[] {
    // Split by GO statements (SQL Server batch separator)
    // GO must be on its own line
    const lines = query.split('\n');
    const batches: string[] = [];
    let currentBatch = '';

    for (const line of lines) {
      const trimmedLine = line.trim().toUpperCase();
      if (trimmedLine === 'GO') {
        if (currentBatch.trim()) {
          batches.push(currentBatch);
          currentBatch = '';
        }
      } else {
        currentBatch += line + '\n';
      }
    }

    if (currentBatch.trim()) {
      batches.push(currentBatch);
    }

    return batches.length > 0 ? batches : [query];
  }
}
