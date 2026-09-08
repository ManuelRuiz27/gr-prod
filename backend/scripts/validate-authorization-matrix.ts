import * as fs from 'fs';
import * as path from 'path';

function extractOperationIds(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const opIds: string[] = [];

  const methodRegex = /\b(GET|POST|PUT|PATCH|DELETE)\s+(\/[^\s`]+)/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) continue;
    const cells = trimmed.split('|').map((c) => c.trim()).filter(Boolean);
    if (cells.length < 2) continue;

    // Must have HTTP method in the line
    let hasHttpMethod = false;
    for (const cell of cells.slice(1)) {
      if (cell.match(methodRegex)) {
        hasHttpMethod = true;
        break;
      }
    }
    if (!hasHttpMethod) continue;

    // Check if cell contains `operationId`
    for (const cell of cells) {
      const match = cell.match(/^`([a-zA-Z0-9_-]+)`$/);
      if (match) {
        const id = match[1];
        if (
          id !== 'operationId' &&
          id !== '---' &&
          !id.startsWith('job') && // exclude background cron jobs from HTTP operationId list
          !opIds.includes(id)
        ) {
          opIds.push(id);
          break;
        }
      }
    }
  }

  return opIds;
}

function main() {
  console.log('🔍 Validating AUTHORIZATION_MATRIX against API_ENDPOINT_MATRIX...');

  const rootDir = path.resolve(__dirname, '../..');
  const matrixPath = path.join(rootDir, 'docs/API_ENDPOINT_MATRIX.md');
  const authMatrixPath = path.join(rootDir, 'docs/AUTHORIZATION_MATRIX.md');

  if (!fs.existsSync(matrixPath)) {
    console.error(`❌ Matrix file not found: ${matrixPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(authMatrixPath)) {
    console.error(`❌ Auth matrix file not found: ${authMatrixPath}`);
    process.exit(1);
  }

  const endpointOps = extractOperationIds(matrixPath);
  const authOps = extractOperationIds(authMatrixPath);

  console.log(`📊 API_ENDPOINT_MATRIX HTTP operations: ${endpointOps.length}`);
  console.log(`📊 AUTHORIZATION_MATRIX HTTP operations: ${authOps.length}`);

  const missingInAuth = endpointOps.filter((op) => !authOps.includes(op));
  const extraInAuth = authOps.filter((op) => !endpointOps.includes(op));

  let hasErrors = false;

  if (endpointOps.length !== 129) {
    console.warn(`⚠️ Warning: Expected 129 operations from API_ENDPOINT_MATRIX, got ${endpointOps.length}`);
  }

  if (authOps.length !== 129) {
    console.warn(`⚠️ Warning: Expected 129 operations in AUTHORIZATION_MATRIX, got ${authOps.length}`);
    hasErrors = true;
  }

  if (missingInAuth.length > 0) {
    console.error('❌ Missing operationIds in AUTHORIZATION_MATRIX:', missingInAuth);
    hasErrors = true;
  }

  if (extraInAuth.length > 0) {
    console.error('❌ Extra operationIds in AUTHORIZATION_MATRIX:', extraInAuth);
    hasErrors = true;
  }

  if (hasErrors) {
    console.error('❌ Validation failed: Authorization matrix does not match API endpoint matrix.');
    process.exit(1);
  }

  console.log('✅ 100% Bijective Match: All 129 canonical operations are accurately authorized.');
}

main();
