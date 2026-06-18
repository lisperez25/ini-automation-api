function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Generador INI')
    .addItem('Generar INI fila seleccionada', 'generarINIFilaSeleccionada')
    .addItem('Generar carga colectiva', 'generarCargaColectiva')
    .addToUi();
}

function generarINIFilaSeleccionada() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();

  if (sheet.getName() !== 'Datos') {
    SpreadsheetApp.getUi().alert('Tenés que estar parado en la hoja Datos.');
    return;
  }

  const rowNumber = sheet.getActiveRange().getRow();
  if (rowNumber < 2) {
    SpreadsheetApp.getUi().alert('Seleccioná una fila de datos, no el encabezado.');
    return;
  }

  try {
    procesarFila(sheet, rowNumber);
    SpreadsheetApp.getUi().alert('Proceso finalizado para la fila ' + rowNumber);
  } catch (error) {
    SpreadsheetApp.getUi().alert(error.message || 'Error inesperado');
  }
}

function generarCargaColectiva() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Datos');

  if (!sheet) {
    throw new Error('No se encontró la hoja llamada Datos');
  }

  const lastRow = sheet.getLastRow();
  let procesadas = 0;

  for (let rowNumber = 2; rowNumber <= lastRow; rowNumber++) {
    const row = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
    const estadoMigracion = String(row[getColumnMap(sheet)['Estado Migración']] || '').trim();

    if (estadoMigracion !== 'Carga colectiva') {
      continue;
    }

    procesarFila(sheet, rowNumber);
    procesadas += 1;
  }

  SpreadsheetApp.getUi().alert('Carga colectiva finalizada. Filas procesadas: ' + procesadas);
}

function procesarFila(sheet, rowNumber) {
  const row = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  const col = getColumnMap(sheet);
  validarColumnasObligatorias(col);
  asegurarColumnasResultado(sheet, col);

  const payload = {
    razon_social: getValue(row, col, ['RAZON SOCIAL', 'Razón Social', 'Razon Social']),
    tipo: obtenerTipo(row, col),
    nombre_archivo: obtenerNombreArchivo(row, col, rowNumber),
    cabecera: normalizarNumero(getValue(row, col, ['CABECERA', 'Cabecera'])),
    vlan_dde: normalizarNumero(getValue(row, col, ['Vlan DDEIP', 'VLAN DDEIP', 'VLAN DDE', 'Vlan DDE'])),
    ip_dde: normalizarIp(getValue(row, col, ['IP DENWA DDEIP', 'IP DDEIP', 'IP DDE'])),
    cidr_dde: normalizarNumero(getValue(row, col, ['CIDR DDEIP', 'CIDR DDE', 'Mascara DDE', 'Máscara DDE'])),
    gateway_dde: normalizarIp(getValue(row, col, ['Gateway DDEIP', 'GATEWAY DDEIP', 'Gateway DDE', 'GW DDE'])),
    vlan_gestion: normalizarNumero(getValue(row, col, ['VLAN DENOC', 'Vlan DENOC', 'VLAN Gestión', 'VLAN Gestion'])),
    ip_gestion: normalizarIp(getValue(row, col, ['IP DENWA DENOC', 'IP DENOC', 'IP Gestión', 'IP Gestion'])),
    cidr_gestion: normalizarNumero(getValue(row, col, ['CIDR DENOC', 'CIDR Gestión', 'CIDR Gestion', 'Mascara DENOC', 'Máscara DENOC'])),
    dns_teco: normalizarIp(getValue(row, col, ['DNS DENOC', 'DNS TECO', 'DNS'])),
    gateway_gestion: normalizarIp(getValue(row, col, ['Gateway DENOC', 'GATEWAY DENOC', 'Gateway Gestión', 'Gateway Gestion', 'GW Gestion'])),
    ip_sbc: normalizarIp(getValue(row, col, ['IP SBC', 'SBC'])),
    red_sbc: normalizarIp(getValue(row, col, ['Red SBC', 'RED SBC', 'Red del SBC'])),
    cidr_sbc: normalizarNumero(getValue(row, col, ['CIDR SBC', 'Mascara SBC', 'Máscara SBC']))
  };

  const payloadNormalizado = normalizarPayloadFinal(payload);

  setValue(sheet, col, rowNumber, 'Estado API', 'GENERANDO_INI');
  setValue(sheet, col, rowNumber, 'Intentos', Number(String(row[col['Intentos']] || '0').trim() || 0) + 1);
  setValue(sheet, col, rowNumber, 'Último error', '');

  try {
    const template = leerTemplateIni();
    const generated = renderTemplate(template, payloadNormalizado);

    validarPlaceholders(generated);
    validarCaracteresControl(generated);

    const generatedSheetName = 'INI - ' + (payloadNormalizado.nombre_archivo || 'cliente_fila_' + rowNumber);
    escribirIniEnHoja(generatedSheetName, generated);

    setValue(sheet, col, rowNumber, 'Estado API', 'INI_GENERADO');
    setValue(sheet, col, rowNumber, 'Resultado API', 'INI generado en hoja local');
    setValue(sheet, col, rowNumber, 'Archivo INI', generatedSheetName);
    setValue(sheet, col, rowNumber, 'Fecha generación INI', new Date());
    setValue(sheet, col, rowNumber, 'Último error', '');
    setValue(sheet, col, rowNumber, 'Estado Migración', 'ini cargado');
  } catch (error) {
    setValue(sheet, col, rowNumber, 'Estado API', 'ERROR_GENERACION');
    setValue(sheet, col, rowNumber, 'Resultado API', error.message || String(error));
    setValue(sheet, col, rowNumber, 'Último error', error.message || String(error));
    setValue(sheet, col, rowNumber, 'Fecha generación INI', new Date());
    throw error;
  }
}

function leerTemplateIni() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const templateSheet = ss.getSheetByName('TEMPLATE_INI');

  if (!templateSheet) {
    throw new Error('No se encontró la hoja TEMPLATE_INI');
  }

  const values = templateSheet.getRange(1, 1, templateSheet.getLastRow(), 1).getDisplayValues();
  return values.map(row => row[0] || '').join('\n');
}

function renderTemplate(templateText, data) {
  return templateText.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, function (_, key) {
    return data[key] !== undefined && data[key] !== null ? String(data[key]) : '';
  });
}

function validarPlaceholders(content) {
  if (/\{\{[^{}]+\}\}/.test(content)) {
    throw new Error('Quedaron placeholders sin reemplazar en el INI');
  }
}

function validarCaracteresControl(content) {
  const controlPattern = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
  if (controlPattern.test(content)) {
    throw new Error('El INI generado contiene caracteres de control');
  }
}

function escribirIniEnHoja(sheetName, content) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let target = ss.getSheetByName(sheetName);

  if (!target) {
    target = ss.insertSheet(sheetName);
  } else {
    target.clear();
  }

  const lines = String(content || '').split('\n');
  const data = [['Linea', 'Contenido INI']].concat(lines.map(line => [String(lines.indexOf(line) + 2), line]));

  target.getRange(1, 1, data.length, 2).setValues(data);
  target.setFrozenRows(1);
  target.getRange(1, 1, 1, 2).setFontWeight('bold');
  target.getRange(1, 1, data.length, 2).setFontFamily('Courier New');
  target.autoResizeColumns(1, 2);
}

function getColumnMap(sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  const col = {};
  headers.forEach(function (h, i) {
    if (h) {
      col[String(h).trim()] = i;
    }
  });
  return col;
}

function validarColumnasObligatorias(col) {
  const required = [
    ['Estado Migración', 'Estado Migracion'],
    ['RAZON SOCIAL', 'Razón Social', 'Razon Social'],
    ['CABECERA', 'Cabecera'],
    ['Vlan DDEIP', 'VLAN DDEIP', 'VLAN DDE', 'Vlan DDE'],
    ['IP DENWA DDEIP', 'IP DDEIP', 'IP DDE'],
    ['CIDR DDEIP', 'CIDR DDE', 'Mascara DDE', 'Máscara DDE'],
    ['Gateway DDEIP', 'GATEWAY DDEIP', 'Gateway DDE', 'GW DDE'],
    ['VLAN DENOC', 'Vlan DENOC', 'VLAN Gestión', 'VLAN Gestion'],
    ['IP DENWA DENOC', 'IP DENOC', 'IP Gestión', 'IP Gestion'],
    ['CIDR DENOC', 'CIDR Gestión', 'CIDR Gestion', 'Mascara DENOC', 'Máscara DENOC'],
    ['DNS DENOC', 'DNS TECO', 'DNS'],
    ['Gateway DENOC', 'GATEWAY DENOC', 'Gateway Gestión', 'Gateway Gestion', 'GW Gestion'],
    ['IP SBC', 'SBC'],
    ['Red SBC', 'RED SBC', 'Red del SBC'],
    ['CIDR SBC', 'Mascara SBC', 'Máscara SBC']
  ];

  required.forEach(function (group) {
    if (!existsAnyColumn(col, group)) {
      throw new Error('Falta la columna obligatoria: ' + group[0]);
    }
  });
}

function existsAnyColumn(col, possibleNames) {
  return possibleNames.some(function (name) {
    return col[name] !== undefined;
  });
}

function asegurarColumnasResultado(sheet, col) {
  ensureColumn(sheet, col, 'Estado API');
  ensureColumn(sheet, col, 'Resultado API');
  ensureColumn(sheet, col, 'Archivo INI');
  ensureColumn(sheet, col, 'Fecha generación INI');
  ensureColumn(sheet, col, 'Intentos');
  ensureColumn(sheet, col, 'Último error');
}

function ensureColumn(sheet, col, columnName) {
  if (col[columnName] !== undefined) {
    return;
  }
  const newColumn = sheet.getLastColumn() + 1;
  sheet.getRange(1, newColumn).setValue(columnName);
  col[columnName] = newColumn - 1;
}

function setValue(sheet, col, rowNumber, columnName, value) {
  if (col[columnName] !== undefined) {
    sheet.getRange(rowNumber, col[columnName] + 1).setValue(value);
  }
}

function getValue(row, col, possibleNames) {
  for (let i = 0; i < possibleNames.length; i++) {
    const name = possibleNames[i];
    if (col[name] !== undefined) {
      const value = row[col[name]];
      if (value !== null && value !== undefined && String(value).trim() !== '') {
        return value;
      }
    }
  }
  return '';
}

function obtenerTipo(row, col) {
  const tipo = getValue(row, col, ['TIPO', 'Tipo']);
  return tipo || 'MFCR2 (DDE)';
}

function obtenerNombreArchivo(row, col, rowNumber) {
  let nombre = getValue(row, col, ['RAZON SOCIAL', 'Razón Social', 'Razon Social']);
  if (!nombre) {
    nombre = 'cliente_fila_' + rowNumber;
  }
  return normalizarNombreArchivo(nombre);
}

function normalizarNombreArchivo(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '');
}

function limpiarTexto(value) {
  return String(value || '')
    .replace(/\u001b\[[0-?]*[ -\/]*[@-~]/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\r/g, '')
    .trim();
}

function normalizarIp(value) {
  const clean = limpiarTexto(value).replace(/[,;]+/g, '.');

  if (esIPv4Valida(clean)) {
    return clean;
  }

  if (/^\d{8,12}$/.test(clean.replace(/\./g, ''))) {
    const reconstructed = reconstruirIpDesdeDigitos(clean.replace(/\./g, ''));
    if (esIPv4Valida(reconstructed)) {
      return reconstructed;
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
          if (a + b + c + d !== digits.length) continue;
          const p1 = digits.slice(0, a);
          const p2 = digits.slice(a, a + b);
          const p3 = digits.slice(a + b, a + b + c);
          const p4 = digits.slice(a + b + c);
          const ip = [p1, p2, p3, p4].join('.');
          if (esIPv4Valida(ip)) {
            candidates.push({ ip: ip, score: calcularScoreIp([p1, p2, p3, p4]) });
          }
        }
      }
    }
  }

  if (!candidates.length) return digits;
  candidates.sort(function (a, b) { return b.score - a.score; });
  return candidates[0].ip;
}

function calcularScoreIp(parts) {
  let score = 0;
  const first = parts[0] || '';
  const second = parts[1] || '';
  const combo = first + '.' + second;
  if (['190.224', '190.225', '190.255', '181.15', '192.168', '172.20'].indexOf(combo) !== -1) score += 1000;
  if (['10', '172', '181', '190', '192'].indexOf(first) !== -1) score += 100;
  if (first.length === 3) score += 10;
  if (second.length >= 2) score += 5;
  return score;
}

function esIPv4Valida(value) {
  const parts = String(value || '').split('.');
  if (parts.length !== 4) return false;
  return parts.every(function (part) {
    if (!/^\d+$/.test(part)) return false;
    const number = Number(part);
    return number >= 0 && number <= 255;
  });
}

function normalizarNumero(value) {
  const clean = limpiarTexto(value).replace(',', '.');
  if (/^\d+\.0$/.test(clean)) {
    return clean.replace('.0', '');
  }
  return clean;
}

function normalizarPayloadFinal(payload) {
  const ipFields = ['ip_dde', 'gateway_dde', 'ip_gestion', 'dns_teco', 'gateway_gestion', 'ip_sbc', 'red_sbc'];
  const numericFields = ['cabecera', 'vlan_dde', 'cidr_dde', 'vlan_gestion', 'cidr_gestion', 'cidr_sbc'];
  const clean = {};

  Object.keys(payload).forEach(function (key) {
    const value = payload[key];
    if (value === null || value === undefined) {
      clean[key] = '';
      return;
    }
    if (ipFields.indexOf(key) !== -1) {
      clean[key] = normalizarIp(value);
      return;
    }
    if (numericFields.indexOf(key) !== -1) {
      clean[key] = normalizarNumero(value);
      return;
    }
    if (key === 'nombre_archivo') {
      clean[key] = normalizarNombreArchivo(value);
      return;
    }
    clean[key] = limpiarTexto(value);
  });

  return clean;
}
