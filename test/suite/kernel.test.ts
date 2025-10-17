import * as assert from 'assert';
import { Logger } from '../../src/utils/logger';
import { ConnectionManager } from '../../src/kernel/connectionManager';

suite('Kernel Test Suite', () => {
  let logger: Logger;

  setup(() => {
    logger = new Logger();
  });

  teardown(() => {
    if (logger) {
      logger.dispose();
    }
  });

  test('Logger should be instantiable', () => {
    assert.ok(logger);
  });

  test('ConnectionManager should be instantiable', () => {
    const connectionManager = new ConnectionManager(logger);
    assert.ok(connectionManager);
  });
});
