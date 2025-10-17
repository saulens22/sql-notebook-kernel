import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('Extension should be present', () => {
    const ext = vscode.extensions.getExtension('saulens22.sql-notebook-kernel');
    assert.ok(ext, 'Extension saulens22.sql-notebook-kernel should be present');
  });

  test('Extension should activate', async () => {
    const ext = vscode.extensions.getExtension('saulens22.sql-notebook-kernel');
    assert.ok(ext, 'Extension should exist before activation');
    await ext!.activate();
    assert.strictEqual(ext!.isActive, true, 'Extension should be active after activation');
  });
});
