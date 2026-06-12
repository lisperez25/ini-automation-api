const fs = require("fs");
const path = require("path");
const { renderTemplate } = require("./template");

function safeFilename(name) {
  const clean = String(name || "")
    .trim()
    .replace(/\.ini$/i, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_");

  return `${clean}.ini`;
}

function generateIni(payload) {
  const templatePath = path.resolve(__dirname, "../templates/teco_ddeip.ini.tpl");
  const outputDir = path.resolve(process.env.OUTPUT_DIR || "./generated-inis");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const template = fs.readFileSync(templatePath, "utf8");
  const content = renderTemplate(template, payload);
  const filename = safeFilename(payload.nombre_archivo);
  const filepath = path.join(outputDir, filename);

  if (fs.existsSync(filepath)) {
    const stamp = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
    const versionedFilename = filename.replace(/\.ini$/i, `_${stamp}.ini`);
    const versionedPath = path.join(outputDir, versionedFilename);
    fs.writeFileSync(versionedPath, content, "utf8");

    return {
      filename: versionedFilename,
      filepath: versionedPath
    };
  }

  fs.writeFileSync(filepath, content, "utf8");

  return {
    filename,
    filepath
  };
}

module.exports = {
  generateIni
};
