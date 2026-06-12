const ENDPOINT = "https://4e46277d233842.lhr.life/api/v1/inis/generate";
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
    const row = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).getValues()[0];
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
  const row = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).getValues()[0];
  const intentosActuales = Number(row[col["Intentos"]] || 0);

  const payload = {
    sheet_row: rowNumber,

    razon_social: getValue(row, col, [
      "RAZON SOCIAL",
      "Razón Social",
      "Razon Social"
    ]),

    tipo: getValue(row, col, [
      "TIPO",
      "Tipo"
    ]),

    nombre_archivo: normalizarNombreArchivo(getValue(row, col, [
      "Nombre",
      "NOMBRE"
    ])),

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

  try {
    setValue(sheet, col, rowNumber, "Estado API", "GENERANDO_INI");
    setValue(sheet, col, rowNumber, "Intentos", intentosActuales + 1);
    setValue(sheet, col, rowNumber, "Último error", "");

    Logger.log("Payload enviado fila " + rowNumber + ": " + JSON.stringify(payload));

    const response = UrlFetchApp.fetch(ENDPOINT, {
      method: "post",
      contentType: "application/json",
      headers: {
        "x-api-key": API_KEY,
        "Bypass-Tunnel-Reminder": "true"
      },
      payload: JSON.stringify(payload),
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
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const col = {};

  headers.forEach((h, i) => {
    if (h) {
      col[h.toString().trim()] = i;
    }
  });

  return col;
}

function validarColumnasObligatorias(col) {
  const requiredColumns = [
    "Estado Migración",
    "RAZON SOCIAL",
    "TIPO",
    "Nombre",
    "CABECERA",
    "Vlan DDEIP",
    "IP DENWA DDEIP",
    "CIDR DDEIP",
    "Gateway DDEIP",
    "VLAN DENOC",
    "IP DENWA DENOC",
    "CIDR DENOC",
    "DNS DENOC",
    "Gateway DENOC",
    "IP SBC",
    "Red SBC",
    "CIDR SBC"
  ];

  for (const columnName of requiredColumns) {
    if (col[columnName] === undefined) {
      throw new Error("Falta la columna obligatoria: " + columnName);
    }
  }
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

function normalizarIp(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .trim()
    .replace(/\s+/g, "")
    .replace(/,/g, ".");
}

function normalizarNumero(value) {
  if (value === null || value === undefined) {
    return "";
  }

  let clean = String(value)
    .trim()
    .replace(/\s+/g, "")
    .replace(",", ".");

  if (/^\d+\.0$/.test(clean)) {
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
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");
}