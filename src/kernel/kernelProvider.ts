import { SqlKernel } from './sqlKernel';
import { Logger } from '../utils/logger';

export class KernelProvider {
  private kernel: SqlKernel | undefined;
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  activate(): void {
    this.logger.info('Activating SQL Kernel Provider');
    this.kernel = new SqlKernel(this.logger);
  }

  deactivate(): void {
    this.logger.info('Deactivating SQL Kernel Provider');
    if (this.kernel) {
      this.kernel.dispose();
      this.kernel = undefined;
    }
  }
}
