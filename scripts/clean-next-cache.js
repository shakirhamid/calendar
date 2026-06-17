const fs = require('fs');
const path = require('path');

const nextDirectory = path.join(process.cwd(), '.next');

try {
  fs.rmSync(nextDirectory, { recursive: true, force: true });
  console.log('Cleared stale .next cache.');
} catch (error) {
  console.warn('Skipping .next cache cleanup:', error.message);
}
