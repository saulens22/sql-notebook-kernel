import * as vscode from 'vscode';
import { Logger } from './utils/logger';
import { KernelProvider } from './kernel/kernelProvider';

let logger: Logger;
let kernelProvider: KernelProvider;

export function activate(context: vscode.ExtensionContext): void {
  logger = new Logger();
  logger.info('SQL Notebook Kernel extension is activating');

  kernelProvider = new KernelProvider(logger);
  kernelProvider.activate();

  context.subscriptions.push({
    dispose: () => {
      kernelProvider.deactivate();
      logger.dispose();
    }
  });

  logger.info('SQL Notebook Kernel extension activated successfully');
}

export function deactivate(): void {
  if (logger) {
    logger.info('SQL Notebook Kernel extension is deactivating');
  }
}
