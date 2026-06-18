require("dotenv").config();

const express = require("express");
const path = require("path");
const { validatePayload } = require("./validators");
const { generateIni } = require("./iniService");
const tunnelManager = require("./tunnelManager");

const app = express();
app.use(express.json({ limit: "1mb" }));
// servir archivos estáticos para la UI de administración
const publicDir = path.resolve(__dirname, '..', 'public');
app.use(express.static(publicDir));

function checkApiKey(req, res, next) {
  const expectedApiKey = process.env.API_KEY;

  if (!expectedApiKey) {
    return next();
  }

  const receivedApiKey = req.headers["x-api-key"];

  if (receivedApiKey !== expectedApiKey) {
    return res.status(401).json({
      status: "ERROR_AUTH",
      message: "API key inválida"
    });
  }

  next();
}

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "ini-automation-api"
  });
});

app.post("/api/v1/inis/validate", checkApiKey, (req, res) => {
  const result = validatePayload(req.body);

  if (!result.valid) {
    return res.status(400).json({
      status: "ERROR_VALIDACION",
      message: result.errors.join(" | "),
      errors: result.errors,
      sheet_row: req.body.sheet_row || null
    });
  }

  return res.json({
    status: "VALIDADO",
    message: "Datos válidos",
    sheet_row: req.body.sheet_row || null
  });
});

app.post("/api/v1/inis/generate", checkApiKey, (req, res) => {
  const result = validatePayload(req.body);

  if (!result.valid) {
    return res.status(400).json({
      status: "ERROR_VALIDACION",
      message: result.errors.join(" | "),
      errors: result.errors,
      sheet_row: req.body.sheet_row || null
    });
  }

  try {
    const generated = generateIni(result.payload);

    return res.json({
      status: "INI_GENERADO",
      message: `Archivo ${generated.filename} generado correctamente`,
      filename: generated.filename,
      filepath: generated.filepath,
      sheet_row: req.body.sheet_row || null
    });
  } catch (error) {
    return res.status(500).json({
      status: "ERROR_GENERACION",
      message: error.message,
      sheet_row: req.body.sheet_row || null
    });
  }
});

// Panel de administración
app.get('/admin', (req, res) => {
  return res.sendFile(path.join(publicDir, 'admin.html'));
});

// Tunnel API
app.get('/api/v1/tunnel/status', (req, res) => {
  try {
    const status = tunnelManager.getTunnelStatus();
    return res.json({ status: 'OK', tunnel: status });
  } catch (err) {
    return res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

app.post('/api/v1/tunnel/start', (req, res) => {
  try {
    const status = tunnelManager.startTunnel();
    return res.json({ status: 'OK', tunnel: status });
  } catch (err) {
    return res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

app.post('/api/v1/tunnel/stop', (req, res) => {
  try {
    const status = tunnelManager.stopTunnel();
    return res.json({ status: 'OK', tunnel: status });
  } catch (err) {
    return res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

const port = Number(process.env.PORT || 3001);
app.listen(port, () => {
  console.log(`INI Automation API escuchando en puerto ${port}`);
});
