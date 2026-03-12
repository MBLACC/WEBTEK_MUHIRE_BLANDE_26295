const cp = require('child_process');
console.log('Running npm install...');
try {
  cp.execSync('npm install --no-audit --no-fund', { stdio: 'inherit' });
  console.log('Success');
} catch (e) {
  console.error('Failed', e.message);
}
