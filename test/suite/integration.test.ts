import * as assert from 'assert';
import { Logger } from '../../src/utils/logger';
import { ConnectionManager } from '../../src/kernel/connectionManager';
import { QueryExecutor } from '../../src/execution/queryExecutor';

suite('Integration Test Suite', () => {
  // Only run integration tests if connection string is provided
  const connectionString = process.env.SQL_CONNECTION_STRING;
  
  if (!connectionString) {
    test('Skipping integration tests - no connection string provided', () => {
      console.log('Set SQL_CONNECTION_STRING environment variable to run integration tests');
      assert.ok(true);
    });
    return;
  }

  let logger: Logger;
  let connectionManager: ConnectionManager;
  let queryExecutor: QueryExecutor;

  setup(() => {
    logger = new Logger();
    connectionManager = new ConnectionManager(logger);
    queryExecutor = new QueryExecutor(logger, connectionManager);
  });

  teardown(async () => {
    await connectionManager.closeAll();
    logger.dispose();
  });

  test('Should connect to SQL Server', async () => {
    const pool = await connectionManager.getConnection(connectionString);
    assert.ok(pool);
    assert.ok(pool.connected);
  });

  test('Should execute simple SELECT query', async () => {
    const results = await queryExecutor.executeQuery(
      'SELECT 1 AS TestValue',
      'test-1',
      undefined
    );
    
    assert.ok(results);
    assert.strictEqual(results.length, 1);
    assert.ok(results[0].recordset);
    assert.strictEqual(results[0].recordset!.length, 1);
    assert.strictEqual((results[0].recordset![0] as any).TestValue, 1);
  });

  test('Should execute query with database context', async () => {
    const results = await queryExecutor.executeQuery(
      'SELECT DB_NAME() AS DatabaseName',
      'test-2',
      undefined
    );
    
    assert.ok(results);
    assert.strictEqual(results.length, 1);
    assert.ok(results[0].recordset);
    assert.strictEqual(results[0].recordset!.length, 1);
    const dbName = (results[0].recordset![0] as any).DatabaseName;
    assert.ok(dbName);
  });

  test('Should execute multiple batches with GO', async () => {
    const query = `
      SELECT 1 AS FirstBatch;
      GO
      SELECT 2 AS SecondBatch;
    `;
    
    const results = await queryExecutor.executeQuery(query, 'test-3', undefined);
    
    assert.ok(results);
    assert.strictEqual(results.length, 2);
    assert.strictEqual((results[0].recordset![0] as any).FirstBatch, 1);
    assert.strictEqual((results[1].recordset![0] as any).SecondBatch, 2);
  });

  test('Should handle connection reuse', async () => {
    const pool1 = await connectionManager.getConnection(connectionString);
    const pool2 = await connectionManager.getConnection(connectionString);
    
    // Should return the same pool instance
    assert.strictEqual(pool1, pool2);
  });

  test('Should execute CREATE and SELECT on test table', async function() {
    this.timeout(10000); // Increase timeout for this test
    
    // Create a test table
    await queryExecutor.executeQuery(
      'IF OBJECT_ID(\'TestTable2\', \'U\') IS NOT NULL DROP TABLE TestTable2; CREATE TABLE TestTable2 (Id INT PRIMARY KEY, Name NVARCHAR(100));',
      'test-4-create',
      undefined
    );

    // Insert data
    await queryExecutor.executeQuery(
      'INSERT INTO TestTable2 (Id, Name) VALUES (1, \'Test1\'), (2, \'Test2\');',
      'test-4-insert',
      undefined
    );

    // Query data
    const results = await queryExecutor.executeQuery(
      'SELECT * FROM TestTable2 ORDER BY Id;',
      'test-4-select',
      undefined
    );

    assert.ok(results);
    assert.strictEqual(results.length, 1);
    assert.ok(results[0].recordset);
    assert.strictEqual(results[0].recordset!.length, 2);
    assert.strictEqual((results[0].recordset![0] as any).Id, 1);
    assert.strictEqual((results[0].recordset![0] as any).Name, 'Test1');
    assert.strictEqual((results[0].recordset![1] as any).Id, 2);
    assert.strictEqual((results[0].recordset![1] as any).Name, 'Test2');

    // Clean up
    await queryExecutor.executeQuery(
      'DROP TABLE TestTable2;',
      'test-4-cleanup',
      undefined
    );
  });
});
