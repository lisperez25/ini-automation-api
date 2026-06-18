const { spawn } = require('child_process');

let child = null;
const state = {
  running: false,
  url: null,
  endpoint: null,
  startedAt: null,
  logs: []
};

const URL_REGEX = /https:\/\/[a-zA-Z0-9.-]+\.lhr\.life/;

function pushLog(line) {
  if (!line) return;
  state.logs.push(line);
  // keep last 200 entries
  if (state.logs.length > 200) state.logs.shift();
}

function createStatusCopy() {
  return {
    running: state.running,
    url: state.url,
    endpoint: state.endpoint,
    startedAt: state.startedAt ? state.startedAt.toISOString() : null,
    logs: [...state.logs]
  };
}

function startTunnel() {
  if (child && state.running) {
    return createStatusCopy();
  }

  // spawn ssh process
  try {
    child = spawn('ssh', ['-R', '80:localhost:3001', 'nokey@localhost.run'], { stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (err) {
    pushLog(`[ERROR] spawn failed: ${err.message}`);
    state.running = false;
    child = null;
    return createStatusCopy();
  }

  state.running = true;
  state.startedAt = new Date();
  state.url = null;
  state.endpoint = null;
  state.logs = [];

  if (child.stdout) {
    child.stdout.on('data', (data) => {
      const text = data.toString();
      text.split(/\r?\n/).forEach((line) => {
        if (!line) return;
        pushLog(`[OUT] ${line}`);
        const m = line.match(URL_REGEX);
        if (m) {
          state.url = m[0];
          state.endpoint = state.url + '/api/v1/inis/generate';
        }
      });
    });
  }

  if (child.stderr) {
    child.stderr.on('data', (data) => {
      const text = data.toString();
      text.split(/\r?\n/).forEach((line) => {
        if (!line) return;
        pushLog(`[ERR] ${line}`);
      });
    });
  }

  child.on('close', (code, signal) => {
    pushLog(`[EXIT] code=${code} signal=${signal}`);
    state.running = false;
    child = null;
  });

  child.on('error', (err) => {
    pushLog(`[ERROR] ${err.message}`);
    state.running = false;
    child = null;
  });

  return createStatusCopy();
}

function stopTunnel() {
  if (!child) {
    state.running = false;
    return createStatusCopy();
  }

  try {
    // attempt graceful kill
    child.kill();
    pushLog('[ACTION] Sent kill to tunnel process');
  } catch (err) {
    pushLog(`[ERROR] stopping process: ${err.message}`);
    try { process.kill(child.pid); } catch (_) {}
  }

  state.running = false;
  child = null;
  return createStatusCopy();
}

function getTunnelStatus() {
  return createStatusCopy();
}

module.exports = { startTunnel, stopTunnel, getTunnelStatus };
