import * as assert from 'assert';
import { Logger } from '../../src/utils/logger';
import { ConnectionManager } from '../../src/kernel/connectionManager';

suite('Kernel Test Suite', () => {
  test('Logger should be instantiable', () => {
    const logger = new Logger();
    assert.ok(logger);
    logger.dispose();
  });

  test('ConnectionManager should be instantiable', () => {
    const logger = new Logger();
    const connectionManager = new ConnectionManager(logger);
    assert.ok(connectionManager);
    logger.dispose();
  });
});
