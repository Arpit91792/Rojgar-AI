import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting Rojgar AI Development Server...');
console.log('📁 Project directory:', __dirname);

// Start the server
const serverProcess = spawn('node', ['src/index.js'], {
      stdio: 'inherit',
      shell: true,
      cwd: __dirname
});

serverProcess.on('error', (error) => {
      console.error('❌ Failed to start server:', error.message);
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Make sure Prisma client is generated: npm run prisma:generate');
      console.log('2. Check if PostgreSQL is running on localhost:5432');
      console.log('3. Verify DATABASE_URL in .env file');
      console.log('4. Try running: npm run setup (creates sample data)');
});

serverProcess.on('close', (code) => {
      console.log(`Server process exited with code ${code}`);
});