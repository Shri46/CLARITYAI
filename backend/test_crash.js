const { spawn } = require('child_process');
const server = spawn('node', ['server.js'], { stdio: 'pipe' });

server.stdout.on('data', d => console.log('STDOUT:', d.toString()));
server.stderr.on('data', d => console.error('STDERR:', d.toString()));
server.on('close', code => console.log('Server Exited with code:', code));

setTimeout(async () => {
  try {
    const res = await fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'test', email: 'test_' + Date.now() + '@test.com', password: '123' })
    });
    console.log('API RESPONSE STATUS:', res.status);
    const text = await res.text();
    console.log('API RESPONSE BODY:', text);
  } catch (err) {
    console.error('FETCH ERROR:', err);
  } finally {
    setTimeout(() => server.kill(), 1000);
  }
}, 4000);
