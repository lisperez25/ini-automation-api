const net = require("net");
const { REQUIRED_FIELDS, NUMERIC_FIELDS, IP_FIELDS } = require("./fields");

function normalizePayload(payload) {
  const clean = {};

  for (const [key, value] of Object.entries(payload || {})) {
    if (value === null || value === undefined) {
      clean[key] = "";
      continue;
    }

    let normalizedValue = String(value).trim();

    // Corrige IPs cargadas con coma en vez de punto.
    // Ejemplo: 190,224,166,135 -> 190.224.166.135
    if (IP_FIELDS.includes(key)) {
      normalizedValue = normalizedValue
        .replace(/\s+/g, "")
        .replace(/,/g, ".");
    }

    // Corrige numéricos que puedan venir desde Sheets como 210,0 o 210.0
    if (NUMERIC_FIELDS.includes(key)) {
      normalizedValue = normalizedValue.replace(",", ".");

      if (/^\d+\.0$/.test(normalizedValue)) {
        normalizedValue = normalizedValue.replace(".0", "");
      }
    }

    clean[key] = normalizedValue;
  }

  return clean;
}
function isIntegerString(value) {
  return /^\d+$/.test(String(value || ""));
}

function ipToLong(ip) {
  return ip
    .split(".")
    .map(Number)
    .reduce((acc, octet) => ((acc << 8) + octet) >>> 0, 0);
}

function networkAddress(ip, cidr) {
  const bits = Number(cidr);
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return (ipToLong(ip) & mask) >>> 0;
}

function sameNetwork(ipA, ipB, cidr) {
  return networkAddress(ipA, cidr) === networkAddress(ipB, cidr);
}

function validatePayload(rawPayload) {
  const payload = normalizePayload(rawPayload);
  const errors = [];

  for (const field of REQUIRED_FIELDS) {
    if (!payload[field]) {
      errors.push(`Falta el campo obligatorio: ${field}`);
    }
  }

  for (const field of NUMERIC_FIELDS) {
    if (payload[field] && !isIntegerString(payload[field])) {
      errors.push(`El campo ${field} debe ser numérico`);
    }
  }

  for (const field of IP_FIELDS) {
    if (payload[field] && net.isIP(payload[field]) !== 4) {
      errors.push(`El campo ${field} debe ser una IPv4 válida`);
    }
  }

  for (const field of ["cidr_dde", "cidr_gestion", "cidr_sbc"]) {
    if (payload[field]) {
      const cidr = Number(payload[field]);
      if (cidr < 1 || cidr > 32) {
        errors.push(`El campo ${field} debe estar entre 1 y 32`);
      }
    }
  }

  if (payload.ip_dde && payload.gateway_dde && payload.cidr_dde) {
    if (!sameNetwork(payload.ip_dde, payload.gateway_dde, payload.cidr_dde)) {
      errors.push("IP DDE y Gateway DDE no pertenecen a la misma red");
    }
  }

  if (payload.ip_gestion && payload.gateway_gestion && payload.cidr_gestion) {
    if (!sameNetwork(payload.ip_gestion, payload.gateway_gestion, payload.cidr_gestion)) {
      errors.push("IP de gestión y Gateway de gestión no pertenecen a la misma red");
    }
  }

  if (payload.ip_sbc && payload.red_sbc && payload.cidr_sbc) {
    if (!sameNetwork(payload.ip_sbc, payload.red_sbc, payload.cidr_sbc)) {
      errors.push("IP SBC no pertenece a la red SBC indicada");
    }
  }

  if (payload.nombre_archivo && !/^[a-zA-Z0-9._-]+$/.test(payload.nombre_archivo)) {
    errors.push("El nombre del archivo solo puede contener letras, números, punto, guion y guion bajo");
  }

  return {
    valid: errors.length === 0,
    errors,
    payload
  };
}

module.exports = {
  validatePayload
};
