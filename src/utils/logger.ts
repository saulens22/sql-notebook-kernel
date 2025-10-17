import * as vscode from 'vscode';

export class Logger {
  private outputChannel: vscode.OutputChannel | undefined;
  private isDisposed = false;

  constructor() {
    this.outputChannel = vscode.window.createOutputChannel('SQL Notebook');
  }

  info(message: string): void {
    this.log('INFO', message);
  }

  error(message: string, error?: Error): void {
    const errorMessage = error ? `${message}: ${error.message}` : message;
    this.log('ERROR', errorMessage);
    if (error?.stack && this.outputChannel) {
      this.outputChannel.appendLine(error.stack);
    }
  }

  warn(message: string): void {
    this.log('WARN', message);
  }

  debug(message: string): void {
    this.log('DEBUG', message);
  }

  private log(level: string, message: string): void {
    if (this.isDisposed || !this.outputChannel) {
      return;
    }
    const timestamp = new Date().toISOString();
    this.outputChannel.appendLine(`[${timestamp}] [${level}] ${message}`);
  }

  show(): void {
    if (!this.isDisposed && this.outputChannel) {
      this.outputChannel.show();
    }
  }

  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this.isDisposed = true;
    if (this.outputChannel) {
      try {
        this.outputChannel.dispose();
      } catch (error) {
        // Ignore disposal errors in tests
      }
      this.outputChannel = undefined;
    }
  }
}
