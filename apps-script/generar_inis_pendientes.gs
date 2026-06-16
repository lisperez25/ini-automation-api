const ENDPOINT = "https://daa5308618afe5.lhr.life/api/v1/inis/generate";
const API_KEY = "cambiar_esta_clave";

function onOpen() {
SpreadsheetApp.getUi()
.createMenu("Generar ini")
.addItem("Generar INI de fila seleccionada", "generarINIFilaSeleccionada")
.addItem("Generar carga colectiva", "generarCargaColectiva")
.addToUi();
}

function generarINIFilaSeleccionada() {
const ss = SpreadsheetApp.getActiveSpreadsheet();
const sheet = ss.getActiveSheet();

if (sheet.getName() !== "Datos") {
SpreadsheetApp.getUi().alert("Tenés que estar parado en la hoja Datos.");
return;
}

const activeRange = sheet.getActiveRange();
const rowNumber = activeRange.getRow();

if (rowNumber === 1) {
SpreadsheetApp.getUi().alert("Seleccioná una fila de datos, no el encabezado.");
return;
}

const col = getColumnMap(sheet);
validarColumnasObligatorias(col);
asegurarColumnasResultado(sheet, col);

procesarFila(sheet, col, rowNumber, true);

SpreadsheetApp.getUi().alert("Proceso finalizado para la fila " + rowNumber);
}

function generarCargaColectiva() {
const ss = SpreadsheetApp.getActiveSpreadsheet();
const sheet = ss.getSheetByName("Datos");

if (!sheet) {
throw new Error("No se encontró la hoja llamada Datos");
}

const col = getColumnMap(sheet);
validarColumnasObligatorias(col);
asegurarColumnasResultado(sheet, col);

const lastRow = sheet.getLastRow();
let procesadas = 0;

for (let rowNumber = 2; rowNumber <= lastRow; rowNumber++) {
const row = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
const estadoMigracion = String(row[col["Estado Migración"]] || "").trim();


if (estadoMigracion !== "Carga colectiva") {
  continue;
}

procesarFila(sheet, col, rowNumber, true);
procesadas++;


}

SpreadsheetApp.getUi().alert(
"Carga colectiva finalizada. Filas procesadas: " + procesadas
);
}

function procesarFila(sheet, col, rowNumber, forzarGeneracion) {
const row = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
const intentosActuales = Number(row[col["Intentos"]] || 0);

const payload = {
sheet_row: rowNumber,


razon_social: getValue(row, col, [
  "RAZON SOCIAL",
  "Razón Social",
  "Razon Social"
]),

tipo: obtenerTipo(row, col),

nombre_archivo: obtenerNombreArchivo(row, col, rowNumber),

cabecera: normalizarNumero(getValue(row, col, [
  "CABECERA",
  "Cabecera"
])),

vlan_dde: normalizarNumero(getValue(row, col, [
  "Vlan DDEIP",
  "VLAN DDEIP",
  "VLAN DDE",
  "Vlan DDE"
])),

ip_dde: normalizarIp(getValue(row, col, [
  "IP DENWA DDEIP",
  "IP DDEIP",
  "IP DDE"
])),

cidr_dde: normalizarNumero(getValue(row, col, [
  "CIDR DDEIP",
  "CIDR DDE",
  "Mascara DDE",
  "Máscara DDE"
])),

gateway_dde: normalizarIp(getValue(row, col, [
  "Gateway DDEIP",
  "GATEWAY DDEIP",
  "Gateway DDE",
  "GW DDE"
])),

vlan_gestion: normalizarNumero(getValue(row, col, [
  "VLAN DENOC",
  "Vlan DENOC",
  "VLAN Gestión",
  "VLAN Gestion"
])),

ip_gestion: normalizarIp(getValue(row, col, [
  "IP DENWA DENOC",
  "IP DENOC",
  "IP Gestión",
  "IP Gestion"
])),

cidr_gestion: normalizarNumero(getValue(row, col, [
  "CIDR DENOC",
  "CIDR Gestión",
  "CIDR Gestion",
  "Mascara DENOC",
  "Máscara DENOC"
])),

dns_teco: normalizarIp(getValue(row, col, [
  "DNS DENOC",
  "DNS TECO",
  "DNS"
])),

gateway_gestion: normalizarIp(getValue(row, col, [
  "Gateway DENOC",
  "GATEWAY DENOC",
  "Gateway Gestión",
  "Gateway Gestion",
  "GW Gestion"
])),

ip_sbc: normalizarIp(getValue(row, col, [
  "IP SBC",
  "SBC"
])),

red_sbc: normalizarIp(getValue(row, col, [
  "Red SBC",
  "RED SBC",
  "Red del SBC"
])),

cidr_sbc: normalizarNumero(getValue(row, col, [
  "CIDR SBC",
  "Mascara SBC",
  "Máscara SBC"
])),

forzar_generacion: forzarGeneracion


};

const payloadNormalizado = normalizarPayloadFinal(payload);

try {
setValue(sheet, col, rowNumber, "Estado API", "GENERANDO_INI");
setValue(sheet, col, rowNumber, "Intentos", intentosActuales + 1);
setValue(sheet, col, rowNumber, "Último error", "");


Logger.log("Payload enviado fila " + rowNumber + ": " + JSON.stringify(payloadNormalizado));

const response = UrlFetchApp.fetch(ENDPOINT, {
  method: "post",
  contentType: "application/json",
  headers: {
    "x-api-key": API_KEY,
    "Bypass-Tunnel-Reminder": "true"
  },
  payload: JSON.stringify(payloadNormalizado),
  muteHttpExceptions: true
});

const responseText = response.getContentText();
const httpCode = response.getResponseCode();

let body;

try {
  body = JSON.parse(responseText);
} catch (parseError) {
  throw new Error("Respuesta no JSON. HTTP " + httpCode + ": " + responseText);
}

setValue(sheet, col, rowNumber, "Estado API", body.status || "ERROR");
setValue(sheet, col, rowNumber, "Resultado API", body.message || "");
setValue(sheet, col, rowNumber, "Archivo INI", body.filename || "");
setValue(sheet, col, rowNumber, "Fecha generación INI", new Date());

if (body.status === "INI_GENERADO") {
  setValue(sheet, col, rowNumber, "Último error", "");
  setValue(sheet, col, rowNumber, "Estado Migración", "ini cargado");
} else {
  setValue(sheet, col, rowNumber, "Último error", body.message || "");
}


} catch (error) {
setValue(sheet, col, rowNumber, "Estado API", "ERROR_GENERACION");
setValue(sheet, col, rowNumber, "Resultado API", error.message);
setValue(sheet, col, rowNumber, "Último error", error.message);
setValue(sheet, col, rowNumber, "Fecha generación INI", new Date());
}
}

function getColumnMap(sheet) {
const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
const col = {};

headers.forEach((h, i) => {
if (h) {
col[h.toString().trim()] = i;
}
});

return col;
}

function validarColumnasObligatorias(col) {
const requiredColumnGroups = [
["Estado Migración", "Estado Migracion"],
["RAZON SOCIAL", "Razón Social", "Razon Social"],
["CABECERA", "Cabecera"],
["Vlan DDEIP", "VLAN DDEIP", "VLAN DDE", "Vlan DDE"],
["IP DENWA DDEIP", "IP DDEIP", "IP DDE"],
["CIDR DDEIP", "CIDR DDE", "Mascara DDE", "Máscara DDE"],
["Gateway DDEIP", "GATEWAY DDEIP", "Gateway DDE", "GW DDE"],
["VLAN DENOC", "Vlan DENOC", "VLAN Gestión", "VLAN Gestion"],
["IP DENWA DENOC", "IP DENOC", "IP Gestión", "IP Gestion"],
["CIDR DENOC", "CIDR Gestión", "CIDR Gestion", "Mascara DENOC", "Máscara DENOC"],
["DNS DENOC", "DNS TECO", "DNS"],
["Gateway DENOC", "GATEWAY DENOC", "Gateway Gestión", "Gateway Gestion", "GW Gestion"],
["IP SBC", "SBC"],
["Red SBC", "RED SBC", "Red del SBC"],
["CIDR SBC", "Mascara SBC", "Máscara SBC"]
];

for (const group of requiredColumnGroups) {
if (!existsAnyColumn(col, group)) {
throw new Error("Falta la columna obligatoria: " + group[0]);
}
}
}

function existsAnyColumn(col, possibleNames) {
return possibleNames.some(name => col[name] !== undefined);
}

function asegurarColumnasResultado(sheet, col) {
ensureColumn(sheet, col, "Estado API");
ensureColumn(sheet, col, "Resultado API");
ensureColumn(sheet, col, "Archivo INI");
ensureColumn(sheet, col, "Fecha generación INI");
ensureColumn(sheet, col, "Intentos");
ensureColumn(sheet, col, "Último error");
}

function ensureColumn(sheet, col, columnName) {
if (col[columnName] !== undefined) {
return;
}

const lastColumn = sheet.getLastColumn();
const newColumn = lastColumn + 1;

sheet.getRange(1, newColumn).setValue(columnName);
col[columnName] = newColumn - 1;
}

function setValue(sheet, col, rowNumber, columnName, value) {
if (col[columnName] !== undefined) {
sheet.getRange(rowNumber, col[columnName] + 1).setValue(value);
}
}

function getValue(row, col, possibleNames) {
for (const name of possibleNames) {
if (col[name] !== undefined) {
const value = row[col[name]];


  if (value !== null && value !== undefined && String(value).trim() !== "") {
    return value;
  }
}


}

return "";
}

function obtenerTipo(row, col) {
const tipo = getValue(row, col, [
"TIPO",
"Tipo"
]);

if (tipo) {
return tipo;
}

return "MFCR2 (DDE)";
}

function obtenerNombreArchivo(row, col, rowNumber) {
let nombre = getValue(row, col, [
"RAZON SOCIAL",
"Razón Social",
"Razon Social"
]);

if (!nombre) {
nombre = "cliente_fila_" + rowNumber;
}

return normalizarNombreArchivo(nombre);
}

function normalizarIp(value) {
if (value === null || value === undefined) {
return "";
}

let clean = String(value)
.trim()
.replace(/\s+/g, "")
.replace(/，/g, ",")
.replace(/;/g, ".")
.replace(/,/g, ".");

if (esIPv4Valida(clean)) {
return clean;
}

if (/^\d{8,12}$/.test(clean)) {
const reconstruida = reconstruirIpDesdeDigitos(clean);


if (esIPv4Valida(reconstruida)) {
  return reconstruida;
}


}

return clean;
}

function reconstruirIpDesdeDigitos(digits) {
const candidates = [];

for (let a = 1; a <= 3; a++) {
for (let b = 1; b <= 3; b++) {
for (let c = 1; c <= 3; c++) {
for (let d = 1; d <= 3; d++) {
if (a + b + c + d !== digits.length) {
continue;
}


      const p1 = digits.slice(0, a);
      const p2 = digits.slice(a, a + b);
      const p3 = digits.slice(a + b, a + b + c);
      const p4 = digits.slice(a + b + c);

      const ip = [p1, p2, p3, p4].join(".");

      if (esIPv4Valida(ip)) {
        candidates.push({
          ip,
          score: calcularScoreIp([p1, p2, p3, p4])
        });
      }
    }
  }
}


}

if (candidates.length === 0) {
return digits;
}

candidates.sort((a, b) => b.score - a.score);

return candidates[0].ip;
}

function calcularScoreIp(parts) {
let score = 0;

const first = parts[0];
const second = parts[1];
const combo = first + "." + second;

const knownCombos = [
"190.224",
"190.225",
"190.255",
"181.15",
"192.168",
"172.20"
];

const knownFirstOctets = [
"10",
"172",
"181",
"190",
"192"
];

if (knownCombos.includes(combo)) {
score += 1000;
}

if (knownFirstOctets.includes(first)) {
score += 100;
}

if (first.length === 3) {
score += 10;
}

if (second.length >= 2) {
score += 5;
}

return score;
}

function esIPv4Valida(value) {
const parts = String(value).split(".");

if (parts.length !== 4) {
return false;
}

return parts.every(part => {
if (!/^\d+$/.test(part)) {
return false;
}


if (part.length > 1 && part.startsWith("0")) {
  return false;
}

const number = Number(part);
return number >= 0 && number <= 255;


});
}

function normalizarNumero(value) {
if (value === null || value === undefined) {
return "";
}

let clean = String(value)
.trim()
.replace(/\s+/g, "")
.replace(",", ".");

if (/^\d+.0$/.test(clean)) {
clean = clean.replace(".0", "");
}

return clean;
}

function normalizarNombreArchivo(value) {
if (value === null || value === undefined) {
return "";
}

return String(value)
.trim()
.toLowerCase()
.normalize("NFD")
.replace(/[\u0300-\u036f]/g, "")
.replace(/\s+/g, "-")
.replace(/[^a-z0-9-_]/g, "");
}

function normalizarPayloadFinal(payload) {
const ipFields = [
"ip_dde",
"gateway_dde",
"ip_gestion",
"dns_teco",
"gateway_gestion",
"ip_sbc",
"red_sbc"
];

const numericFields = [
"cabecera",
"vlan_dde",
"cidr_dde",
"vlan_gestion",
"cidr_gestion",
"cidr_sbc"
];

const clean = {};

for (const key in payload) {
const value = payload[key];


if (value === null || value === undefined) {
  clean[key] = "";
  continue;
}

if (ipFields.includes(key)) {
  clean[key] = normalizarIp(value);
  continue;
}

if (numericFields.includes(key)) {
  clean[key] = normalizarNumero(value);
  continue;
}

if (key === "nombre_archivo") {
  clean[key] = normalizarNombreArchivo(value);
  continue;
}

clean[key] = value;


}

return clean;
}

function testNormalizacionIp() {
const pruebas = [
"190,224,166,136",
"190224166136",
"190,224,166,128",
"190224166128",
"190.255.249.8",
"1902552498",
"172.20.110.253",
"17220110253"
];

pruebas.forEach(value => {
Logger.log(value + " => " + normalizarIp(value));
});
}
