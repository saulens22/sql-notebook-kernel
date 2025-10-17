import * as assert from 'assert';
import { ResultFormatter } from '../../src/execution/resultFormatter';

suite('Execution Test Suite', () => {
  let formatter: ResultFormatter;

  setup(() => {
    formatter = new ResultFormatter();
  });

  test('ResultFormatter should format empty results', () => {
    const result = formatter.formatResults({ recordset: [] }, 1000);
    assert.ok(result.includes('No rows returned'), `Result should include 'No rows returned' but got: ${result}`);
  });

  test('ResultFormatter should format recordset', () => {
    const result = formatter.formatResults({
      recordset: [
        { id: 1, name: 'Test' },
        { id: 2, name: 'Example' }
      ]
    }, 1000);
    assert.ok(result.includes('id'));
    assert.ok(result.includes('name'));
    assert.ok(result.includes('Test'));
  });

  test('ResultFormatter should limit rows', () => {
    const records = Array.from({ length: 50 }, (_, i) => ({ id: i, name: `Row ${i}` }));
    const result = formatter.formatResults({ recordset: records }, 10);
    assert.ok(result.includes('Showing 10 of 50'));
  });
});
