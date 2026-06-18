const apiStatusEl = document.getElementById('api-status');
const tunnelRunningEl = document.getElementById('tunnel-running');
const tunnelUrlEl = document.getElementById('tunnel-url');
const tunnelEndpointEl = document.getElementById('tunnel-endpoint');
const logsEl = document.getElementById('logs');

const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const refreshBtn = document.getElementById('refresh-btn');
const copyBtn = document.getElementById('copy-btn');

async function fetchApiHealth() {
  try {
    const r = await fetch('/health');
    const j = await r.json();
    apiStatusEl.textContent = j.status || JSON.stringify(j);
  } catch (e) {
    apiStatusEl.textContent = 'ERROR';
  }
}

async function fetchTunnelStatus() {
  try {
    const r = await fetch('/api/v1/tunnel/status');
    const j = await r.json();
    if (j && j.tunnel) {
      const t = j.tunnel;
      tunnelRunningEl.textContent = t.running ? 'RUNNING' : 'STOPPED';
      tunnelUrlEl.textContent = t.url || '—';
      tunnelUrlEl.href = t.url || '#';
      tunnelEndpointEl.textContent = t.endpoint || '—';
      logsEl.textContent = (t.logs && t.logs.length) ? t.logs.slice(-50).join('\n') : 'Sin logs';
    } else {
      tunnelRunningEl.textContent = '—';
    }
  } catch (e) {
    tunnelRunningEl.textContent = 'ERROR';
    logsEl.textContent = e.message;
  }
}

async function startTunnel() {
  try {
    await fetch('/api/v1/tunnel/start', { method: 'POST' });
    await refreshAll();
  } catch (e) {
    console.error(e);
  }
}

async function stopTunnel() {
  try {
    await fetch('/api/v1/tunnel/stop', { method: 'POST' });
    await refreshAll();
  } catch (e) {
    console.error(e);
  }
}

async function copyEndpoint() {
  const text = tunnelEndpointEl.textContent || '';
  if (!text || text === '—') return;
  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = 'Copiado';
    setTimeout(() => copyBtn.textContent = 'Copiar endpoint', 1500);
  } catch (e) {
    console.error('Clipboard error', e);
  }
}

async function refreshAll() {
  await fetchApiHealth();
  await fetchTunnelStatus();
}

startBtn.addEventListener('click', startTunnel);
stopBtn.addEventListener('click', stopTunnel);
refreshBtn.addEventListener('click', refreshAll);
copyBtn.addEventListener('click', copyEndpoint);

// auto refresh every 3s
refreshAll();
setInterval(fetchTunnelStatus, 3000);
