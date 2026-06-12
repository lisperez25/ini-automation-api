function generarINIsPendientes() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Datos");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const endpoint = "https://TU_DOMINIO_O_IP/api/v1/inis/generate";
  const apiKey = "cambiar_esta_clave";

  const col = {};
  headers.forEach((header, index) => {
    if (header) col[String(header).trim()] = index;
  });

  const requiredOutputColumns = [
    "Estado API",
    "Resultado API",
    "Archivo INI",
    "URL INI",
    "Fecha generación INI",
    "Intentos",
    "Último error"
  ];

  // Validación simple: asegurate de tener estas columnas creadas al final de la hoja.
  for (const columnName of requiredOutputColumns) {
    if (col[columnName] === undefined) {
      throw new Error("Falta crear la columna: " + columnName);
    }
  }

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const rowNumber = i + 1;

    const estadoMigracion = getCell(row, col, "Estado Migración");
    const estadoApi = getCell(row, col, "Estado API");

    const debeProcesar =
      estadoMigracion === "Pendiente" ||
      estadoMigracion === "Coordinado-ini pendiente";

    if (!debeProcesar || estadoApi === "INI_GENERADO") {
      continue;
    }

    const intentosActuales = Number(getCell(row, col, "Intentos") || 0);

    const payload = {
      sheet_row: rowNumber,
      razon_social: getCell(row, col, "RAZON SOCIAL"),
      tipo: getCell(row, col, "TIPO"),
      nombre_archivo: getCell(row, col, "Nombre"),
      cabecera: getCell(row, col, "CABECERA"),
      vlan_dde: getCell(row, col, "Vlan DDEIP"),
      ip_dde: getCell(row, col, "IP DENWA DDEIP"),
      cidr_dde: getCell(row, col, "CIDR DDEIP"),
      gateway_dde: getCell(row, col, "Gateway DDEIP"),
      vlan_gestion: getCell(row, col, "VLAN DENOC"),
      ip_gestion: getCell(row, col, "IP DENWA DENOC"),
      cidr_gestion: getCell(row, col, "CIDR DENOC"),
      dns_teco: getCell(row, col, "DNS DENOC"),
      gateway_gestion: getCell(row, col, "Gateway DENOC"),
      ip_sbc: getCell(row, col, "IP SBC"),
      red_sbc: getCell(row, col, "Red SBC"),
      cidr_sbc: getCell(row, col, "CIDR SBC")
    };

    try {
      setCell(sheet, col, rowNumber, "Estado API", "GENERANDO_INI");
      setCell(sheet, col, rowNumber, "Intentos", intentosActuales + 1);

      const response = UrlFetchApp.fetch(endpoint, {
        method: "post",
        contentType: "application/json",
        headers: {
          "x-api-key": apiKey
        },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });

      const bodyText = response.getContentText();
      const body = JSON.parse(bodyText);

      setCell(sheet, col, rowNumber, "Estado API", body.status || "ERROR_GENERACION");
      setCell(sheet, col, rowNumber, "Resultado API", body.message || "Sin mensaje");
      setCell(sheet, col, rowNumber, "Archivo INI", body.filename || "");
      setCell(sheet, col, rowNumber, "URL INI", body.url || body.filepath || "");
      setCell(sheet, col, rowNumber, "Fecha generación INI", new Date());

      if (body.status === "INI_GENERADO") {
        setCell(sheet, col, rowNumber, "Estado Migración", "ini cargado");
        setCell(sheet, col, rowNumber, "Último error", "");
      } else {
        setCell(sheet, col, rowNumber, "Último error", body.message || bodyText);
      }
    } catch (error) {
      setCell(sheet, col, rowNumber, "Estado API", "ERROR_GENERACION");
      setCell(sheet, col, rowNumber, "Resultado API", error.message);
      setCell(sheet, col, rowNumber, "Último error", error.message);
      setCell(sheet, col, rowNumber, "Fecha generación INI", new Date());
    }
  }
}

function getCell(row, col, columnName) {
  if (col[columnName] === undefined) return "";
  return row[col[columnName]];
}

function setCell(sheet, col, rowNumber, columnName, value) {
  if (col[columnName] === undefined) return;
  sheet.getRange(rowNumber, col[columnName] + 1).setValue(value);
}
