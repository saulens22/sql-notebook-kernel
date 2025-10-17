import * as vscode from 'vscode';

export interface QueryResult {
  recordset?: Record<string, unknown>[];
  recordsets?: Record<string, unknown>[][];
  rowsAffected?: number[];
  output?: Record<string, unknown>;
}

export class ResultFormatter {
  formatResults(results: QueryResult | QueryResult[], maxRows: number = 1000): string {
    const resultsArray = Array.isArray(results) ? results : [results];
    let output = '';

    resultsArray.forEach((result, index) => {
      if (resultsArray.length > 1) {
        output += `## Result Set ${index + 1}\n\n`;
      }

      if (result.recordset && result.recordset.length > 0) {
        output += this.formatRecordset(result.recordset, maxRows);
      } else if (result.recordsets && result.recordsets.length > 0) {
        result.recordsets.forEach((recordset, rsIndex) => {
          if (result.recordsets!.length > 1) {
            output += `### Recordset ${rsIndex + 1}\n\n`;
          }
          output += this.formatRecordset(recordset, maxRows);
        });
      }

      if (result.rowsAffected && result.rowsAffected.length > 0) {
        const totalAffected = result.rowsAffected.reduce((sum, count) => sum + count, 0);
        output += `\n*${totalAffected} row(s) affected*\n\n`;
      }
    });

    return output || '*Query executed successfully (no results)*';
  }

  private formatRecordset(recordset: Record<string, unknown>[], maxRows: number): string {
    if (recordset.length === 0) {
      return '*No rows returned*\n\n';
    }

    const columns = Object.keys(recordset[0]);
    const displayRows = recordset.slice(0, maxRows);

    // Create markdown table
    let table = '| ' + columns.join(' | ') + ' |\n';
    table += '| ' + columns.map(() => '---').join(' | ') + ' |\n';

    displayRows.forEach(row => {
      const values = columns.map(col => {
        const value = row[col];
        if (value === null || value === undefined) {
          return 'NULL';
        }
        return String(value);
      });
      table += '| ' + values.join(' | ') + ' |\n';
    });

    if (recordset.length > maxRows) {
      table += `\n*Showing ${maxRows} of ${recordset.length} rows*\n`;
    }

    return table + '\n';
  }

  formatError(error: Error): string {
    return `**Error:** ${error.message}\n\n\`\`\`\n${error.stack || ''}\n\`\`\``;
  }

  formatNotebookCellOutput(results: QueryResult | QueryResult[], maxRows: number = 1000): vscode.NotebookCellOutput {
    const markdown = this.formatResults(results, maxRows);
    return new vscode.NotebookCellOutput([
      vscode.NotebookCellOutputItem.text(markdown, 'text/markdown')
    ]);
  }

  formatNotebookCellError(error: Error): vscode.NotebookCellOutput {
    return new vscode.NotebookCellOutput([
      vscode.NotebookCellOutputItem.error(error)
    ]);
  }
}
