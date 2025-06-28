const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Barberzon Development Servers...');
console.log('============================================');

// Function to spawn a process with proper error handling
function startProcess(command, args, cwd, name, color = '\x1b[36m') {
  const process = spawn(command, args, {
    cwd,
    stdio: 'pipe',
    shell: true
  });

  const reset = '\x1b[0m';
  
  process.stdout.on('data', (data) => {
    console.log(`${color}[${name}]${reset} ${data.toString().trim()}`);
  });

  process.stderr.on('data', (data) => {
    console.error(`${color}[${name}]${reset} ${data.toString().trim()}`);
  });

  process.on('close', (code) => {
    console.log(`${color}[${name}]${reset} Process exited with code ${code}`);
  });

  return process;
}

// Start backend server (port 5000)
console.log('🔧 Starting Backend Server on port 5000...');
const backend = startProcess(
  'npm', 
  ['run', 'dev'], 
  path.join(__dirname, 'backend'),
  'BACKEND',
  '\x1b[32m' // Green
);

// Wait a bit before starting frontend
setTimeout(() => {
  console.log('🎨 Starting Frontend Server on port 5173...');
  const frontend = startProcess(
    'npm', 
    ['run', 'dev'], 
    __dirname,
    'FRONTEND',
    '\x1b[34m' // Blue
  );

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n💀 Shutting down servers...');
    backend.kill();
    frontend.kill();
    process.exit();
  });

  console.log('\n✅ Both servers starting...');
  console.log('📱 Frontend: http://localhost:5173');
  console.log('🔧 Backend:  http://localhost:5000');
  console.log('📡 API Proxy: Frontend /api -> Backend /api');
  console.log('\nPress Ctrl+C to stop all servers');

}, 2000);
