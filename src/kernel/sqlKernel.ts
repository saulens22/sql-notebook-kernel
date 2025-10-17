import * as vscode from 'vscode';
import { Logger } from '../utils/logger';
import { ConnectionManager } from './connectionManager';
import { QueryExecutor } from '../execution/queryExecutor';
import { ResultFormatter } from '../execution/resultFormatter';

export class SqlKernel {
  private readonly id = 'sql-kernel';
  private readonly notebookType = 'jupyter-notebook';
  private readonly label = 'SQL Kernel';
  private readonly supportedLanguages = ['sql'];

  private controller: vscode.NotebookController;
  private logger: Logger;
  private connectionManager: ConnectionManager;
  private queryExecutor: QueryExecutor;
  private resultFormatter: ResultFormatter;
  private executionOrder = 0;

  constructor(logger: Logger) {
    this.logger = logger;
    this.connectionManager = new ConnectionManager(logger);
    this.queryExecutor = new QueryExecutor(logger, this.connectionManager);
    this.resultFormatter = new ResultFormatter();

    this.controller = vscode.notebooks.createNotebookController(
      this.id,
      this.notebookType,
      this.label
    );

    this.controller.supportedLanguages = this.supportedLanguages;
    this.controller.supportsExecutionOrder = true;
    this.controller.description = 'Execute SQL queries against SQL Server';
    this.controller.executeHandler = this.executeCell.bind(this);

    this.logger.info('SQL Kernel initialized');
  }

  private async executeCell(
    cells: vscode.NotebookCell[],
    notebook: vscode.NotebookDocument,
    controller: vscode.NotebookController
  ): Promise<void> {
    for (const cell of cells) {
      await this.executeSingleCell(cell, controller);
    }
  }

  private async executeSingleCell(
    cell: vscode.NotebookCell,
    controller: vscode.NotebookController
  ): Promise<void> {
    const execution = controller.createNotebookCellExecution(cell);
    execution.executionOrder = ++this.executionOrder;
    execution.start(Date.now());

    const query = cell.document.getText();

    if (!query.trim()) {
      execution.end(true, Date.now());
      return;
    }

    this.logger.info(`Executing cell with query: ${query.substring(0, 50)}...`);

    try {
      const config = vscode.workspace.getConfiguration('sqlNotebook');
      const maxRows = config.get<number>('maxRows', 1000);

      const executionId = `${cell.notebook.uri.toString()}-${cell.index}`;
      const results = await this.queryExecutor.executeQuery(
        query,
        executionId,
        execution.token
      );

      const output = this.resultFormatter.formatNotebookCellOutput(results, maxRows);
      execution.replaceOutput([output]);
      execution.end(true, Date.now());

      this.logger.info('Cell execution completed successfully');
    } catch (error) {
      this.logger.error('Cell execution failed', error as Error);
      const errorOutput = this.resultFormatter.formatNotebookCellError(error as Error);
      execution.replaceOutput([errorOutput]);
      execution.end(false, Date.now());
    }
  }

  dispose(): void {
    this.logger.info('Disposing SQL Kernel');
    this.connectionManager.closeAll();
    this.controller.dispose();
  }
}
