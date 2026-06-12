# INI Automation MVP

MVP para automatizar generación de archivos `.ini` desde Google Sheets / Omuni.

## Flujo

Omuni → Google Sheets → Apps Script → API → archivo `.ini` → actualización de estado en Sheets.

## 1. Instalar

```bash
npm install
cp .env.example .env
nano .env
```

## 2. Levantar API

```bash
npm run dev
```

o

```bash
npm start
```

## 3. Probar health

```bash
curl http://127.0.0.1:3001/health
```

## 4. Generar INI de prueba

```bash
curl -X POST http://127.0.0.1:3001/api/v1/inis/generate \
  -H "Content-Type: application/json" \
  -H "x-api-key: cambiar_esta_clave" \
  --data @samples/payload.json
```

El archivo se genera en:

```text
./generated-inis/
```

## 5. Adaptar template real

Modificar:

```text
templates/teco_ddeip.ini.tpl
```

Reemplazar el contenido de ejemplo por el `.ini` real, usando variables como:

```text
{{cabecera}}
{{vlan_dde}}
{{ip_dde}}
{{cidr_dde}}
{{gateway_dde}}
{{vlan_gestion}}
{{ip_gestion}}
{{cidr_gestion}}
{{dns_teco}}
{{gateway_gestion}}
{{ip_sbc}}
{{red_sbc}}
{{cidr_sbc}}
```

## 6. Google Sheets

En la hoja `Datos`, agregar estas columnas al final:

```text
Estado API
Resultado API
Archivo INI
URL INI
Fecha generación INI
Intentos
Último error
```

Después copiar el contenido de:

```text
apps-script/generar_inis_pendientes.gs
```

en Apps Script de Google Sheets.

## 7. Estados procesados

El script procesa filas con:

```text
Estado Migración = Pendiente
Estado Migración = Coordinado-ini pendiente
```

Si la API responde `INI_GENERADO`, actualiza:

```text
Estado Migración = ini cargado
```

## Nota importante

El template incluido es de ejemplo. No usarlo en producción sin reemplazarlo por el `.ini` real del equipo/proveedor.
