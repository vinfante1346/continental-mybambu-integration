# Continental Assist API - Technical Documentation
**Version: 2.1.0**

---

## Table of Contents

1. [Overview](#overview)
2. [Environment URLs](#environment-urls)
3. [Authentication](#authentication)
4. [Security Considerations](#security-considerations)
5. [API Integration Flow](#api-integration-flow)
6. [API Endpoints Reference](#api-endpoints-reference)
7. [Common Response Patterns](#common-response-patterns)
8. [Error Handling](#error-handling)
9. [Implementation Examples](#implementation-examples)
10. [Appendix](#appendix)

---

## Overview

Continental Assist provides a comprehensive REST API suite for travel assistance plan integration. This document describes the web services available to clients for commercial data exchange.

### Key Points

- **Purpose**: Integration for obtaining travel assistance data per commercial agreements
- **Responsibility**: Continental Assist is responsible only for the data exposed through these APIs
- **Standards**: Country data based on ISO© international standards
- **Client Responsibility**: Implementation of information systems and applications
- **Contractual**: All usage must comply with commercial contracts between parties

### Scope

This API enables clients to:
- Query available plan categories
- Search origin and destination countries
- Retrieve plan prices and details
- Purchase vouchers programmatically
- Query voucher information and benefits
- Validate discount coupons

---

## Environment URLs

| Environment | Base URL |
|------------|----------|
| **Testing** | `https://testapiseva.testingcontinentalassist.tech/api` |
| **Production** | `https://api-eva.continentalassist.com/api` |

---

## Authentication

### Token Structure

Continental Assist uses header-based authentication with two token structures based on onboarding date:

| Header Key | Token Type | Usage |
|-----------|------------|-------|
| `PHP-AUTH-USER` | Legacy token | Clients onboarded **before** January 13, 2025 |
| `EVA-AUTH-USER` | EVA token | Clients onboarded **on or after** January 13, 2025 |

### Obtaining Tokens

**Contact**: Software Development Department
**Email**: sistemas@continentalassist.com

**Important**: Existing clients should continue using their current token.

### Authentication Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ 1. Request with token in header
       │    PHP-AUTH-USER: {legacy_token}
       │    or
       │    EVA-AUTH-USER: {eva_token}
       ▼
┌─────────────────┐
│  Continental    │
│  Assist API     │
└─────────┬───────┘
          │ 2. Validate token
          │
          ▼
    ┌─────────┐
    │ Valid?  │
    └────┬────┘
         │
    ┌────┴────┐
    │         │
   Yes       No
    │         │
    │         └──► 401 Unauthorized
    │
    └──► Return requested data
```

---

## Security Considerations

### Transport Security
- **Protocol**: HTTPS only
- **TLS Version**: TLS 1.2 minimum required
- **HTTP Method**: All APIs use POST method

### Best Practices
1. Store tokens securely (environment variables, secret managers)
2. Never expose tokens in client-side code
3. Implement request rate limiting
4. Log all API interactions for audit purposes
5. Use IP whitelisting when possible

---

## API Integration Flow

### Complete Purchase Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    Client Application                         │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
        ┌─────────────────────────────────────┐
        │  1. GET CATEGORIES                  │
        │  consulta_categorias                │
        │  Returns: Available plan categories │
        └─────────────┬───────────────────────┘
                      │
                      ▼
        ┌─────────────────────────────────────┐
        │  2. GET ORIGINS                     │
        │  consulta_origenes /                │
        │  consulta_origenes_x_iso            │
        │  Returns: Origin countries          │
        └─────────────┬───────────────────────┘
                      │
                      ▼
        ┌─────────────────────────────────────┐
        │  3. GET DESTINATIONS                │
        │  consulta_destinos                  │
        │  Returns: Destination countries     │
        └─────────────┬───────────────────────┘
                      │
                      ▼
        ┌─────────────────────────────────────┐
        │  4. GET PLANS & PRICES              │
        │  consulta_planes_grupal             │
        │  Input: category, destination,      │
        │         days, ages                  │
        │  Returns: Available plans & prices  │
        └─────────────┬───────────────────────┘
                      │
                      ▼
        ┌─────────────────────────────────────┐
        │  5. GET BENEFITS (Optional)         │
        │  consulta_beneficios_adicionales    │
        │  consulta_beneficios_planes_costos  │
        │  Returns: Plan benefits & add-ons   │
        └─────────────┬───────────────────────┘
                      │
                      ▼
        ┌─────────────────────────────────────┐
        │  6. VALIDATE COUPON (Optional)      │
        │  consulta_cupon                     │
        │  Returns: Discount percentage       │
        └─────────────┬───────────────────────┘
                      │
                      ▼
        ┌─────────────────────────────────────┐
        │  7. PURCHASE                        │
        │  comprar                            │
        │  Input: All travel & traveler data  │
        │  Returns: Voucher code & details    │
        └─────────────┬───────────────────────┘
                      │
                      ▼
        ┌─────────────────────────────────────┐
        │  8. RETRIEVE VOUCHER                │
        │  consulta_voucher                   │
        │  consulta_beneficios_voucher        │
        │  Returns: Complete voucher info     │
        └─────────────────────────────────────┘
```

### Query Flow

```
User Interaction Flow:
═══════════════════════

User Input
    │
    ├─► Select Origin Country
    │        ↓
    │   [consulta_origenes]
    │        ↓
    ├─► Select Destination
    │        ↓
    │   [consulta_destinos]
    │        ↓
    ├─► Select Travel Dates
    │   (Calculate days)
    │        ↓
    ├─► Enter Traveler Ages
    │        ↓
    │   [consulta_planes_grupal]
    │        ↓
    ├─► View Plans & Prices
    │        ↓
    ├─► Select Plan
    │        ↓
    │   [consulta_beneficios_adicionales]
    │        ↓
    ├─► Review Benefits
    │        ↓
    ├─► Enter Coupon (Optional)
    │        ↓
    │   [consulta_cupon]
    │        ↓
    ├─► Enter Traveler Details
    │        ↓
    └─► Complete Purchase
             ↓
        [comprar]
             ↓
        Voucher Issued
```

---

## API Endpoints Reference

### 1. consulta_categorias

**Purpose**: Query plan categories assigned to the agency

**Endpoint**: `/consulta_categorias`

**Method**: `POST`

**Request Headers**:
```http
Content-Type: application/json
PHP-AUTH-USER: {legacy_token}
# OR
EVA-AUTH-USER: {eva_token}
```

**Request Body**:
```json
{
  "ps": "agency_identifier",  // Required for pre-2025 clients
  "language_id": "spa"         // Required: "spa" for Spanish
}
```

**Response** (Success):
```json
{
  "resultado": [
    {
      "id_categoria": 28,
      "categoria": "Planes de Inclusión"
    },
    {
      "id_categoria": 37,
      "categoria": "Planes Especiales"
    }
  ],
  "cantidad": 2,
  "error": false
}
```

**Response** (Unauthorized):
```json
{
  "resultado": "Unauthorized",
  "cantidad": 0,
  "error": 401
}
```

**Response** (Agency Not Configured):
```json
{
  "resultado": "No está configurada la agencia!",
  "cantidad": 0,
  "error": true,
  "mensaje_error": ""
}
```

**Notes**:
- English language support will be available in the current semester
- `ps` parameter is optional for clients onboarded after January 13, 2025

---

### 2. consulta_origenes

**Purpose**: Query countries enabled as travel origins

**Endpoint**: `/consulta_origenes`

**Method**: `POST`

**Request Body**:
```json
{
  "ps": "agency_identifier"  // Required for pre-2025 clients
}
```

**Response** (Success):
```json
{
  "resultado": [
    {
      "iso_country": "AF",
      "description": "Afganistán",
      "id_destino": 134
    },
    {
      "iso_country": "CO",
      "description": "Colombia",
      "id_destino": 45
    }
  ],
  "cantidad": 224,
  "error": false
}
```

**Notes**:
- Returns all countries enabled by Continental Assist as origins
- ISO country codes follow ISO 3166-1 alpha-2 standard

---

### 3. consulta_origenes_x_iso

**Purpose**: Query specific origin country by ISO code

**Endpoint**: `/consulta_origenes_x_iso`

**Method**: `POST`

**Request Body**:
```json
{
  "ps": "agency_identifier",  // Required for pre-2025 clients
  "iso_country": "CO"          // Required: 2-character ISO code
}
```

**Response** (Success):
```json
{
  "resultado": [
    {
      "iso_country": "CO",
      "description": "Colombia"
    }
  ],
  "cantidad": 1,
  "error": false
}
```

**Use Case**: Individual country lookup when you need specific country details

---

### 4. consulta_destinos

**Purpose**: Query countries or denominations that serve as destinations

**Endpoint**: `/consulta_destinos`

**Method**: `POST`

**Request Body**:
```json
{
  "ps": "agency_identifier"  // Required for pre-2025 clients
}
```

**Response** (Success):
```json
{
  "resultado": [
    {
      "iso_country": "CO",
      "description": "Colombia"
    }
  ],
  "cantidad": 1,
  "error": false
}
```

**Important Notes**:
- **Pre-2025 clients**: Response contains 3 destinations:
  1. Europa (Europe)
  2. Mundial (Worldwide)
  3. Nacional (National)
- **Post-2025 clients**: Returns complete country list similar to origins API

---

### 5. consulta_paises

**Purpose**: Query all countries

**Endpoint**: `/consulta_paises`

**Method**: `POST`

**Request Body**:
```json
{
  "ps": "agency_identifier"  // Required for pre-2025 clients
}
```

**Response** (Success):
```json
{
  "resultado": [
    {
      "codigopais": "DE",
      "nombrepais": "Alemania",
      "iddestino": 80
    },
    {
      "codigopais": "A1",
      "nombrepais": "Americas",
      "iddestino": 259
    }
  ],
  "cantidad": 155,
  "error": false
}
```

**Note**: `consulta_pais` is **DEPRECATED**

---

### 6. consulta_planes_grupal

**Purpose**: Query available plans with pricing for group travel

**Endpoint**: `/consulta_planes_grupal`

**Method**: `POST`

**Request Body**:
```json
{
  "ps": "agency_identifier",     // Required for pre-2025 clients
  "dias": 7,                     // Required: Trip duration in days
  "edades": [25, 30, 5],         // Required: Array of traveler ages
  "id_categoria": 28,            // Required: Category ID from consulta_categorias
  "id_destino": 134,             // Required: Destination ID from consulta_destinos
  "familiar": true               // Optional/Required: For family plans
}
```

**Request Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ps` | string | Conditional | Required for pre-2025 clients |
| `dias` | integer | Yes | Trip duration including start day |
| `edades` | array | Yes | Array of traveler ages |
| `id_categoria` | integer | Yes | Category ID |
| `id_destino` | integer | Yes | Destination ID |
| `familiar` | boolean | Conditional | Required for clients wanting family plans |

**Response** (Success):
```json
{
  "resultado": [
    {
      "id": 2391,
      "valor": "11.60",
      "nombre": "Plan 15 Rural",
      "moneda": "USD",
      "edad_maxima_sin_incremento": 75,
      "acepta_pago_tdc": "SI",
      "overage_factor": "2.0",
      "acepta_plan_familiar": "NO",
      "precio_adulto_mayor": "2.37",
      "precio": "11.60",
      "precio_grupal": "11.60"
    }
  ],
  "cantidad": 12,
  "error": false
}
```

**Response Fields Explained**:

| Field | Description |
|-------|-------------|
| `precio` | Unit price per day for the plan |
| `precio_adulto_mayor` | Price per day × overage factor for seniors |
| `precio_grupal` | Total price: unit price × days × travelers (includes senior surcharges if applicable) |
| `edad_maxima_sin_incremento` | Maximum age without surcharge |
| `overage_factor` | Multiplier for travelers exceeding max age |

**Response** (No Pricing):
```json
{
  "precio": "error",
  "error": "El plan no tiene actualmente un precio configurado para este País"
}
```

**Response** (Family Plan Mismatch):
```json
{
  "resultado": [
    {
      "mensaje_error": "NO EXISTEN PLANES PARA ESTA AGENCIA"
    }
  ],
  "cantidad": 0,
  "error": true,
  "mensaje_error": ""
}
```

**Important Notes**:
- Number of plans returned depends on EVA system configuration
- Values depend on EVA parameters and commercial agreements
- Family plan logic applies specific rules based on agency configuration
- Reference structure only - actual data varies per commercial agreement

---

### 7. consulta_beneficios_voucher

**Purpose**: Query benefits assigned to an issued voucher

**Endpoint**: `/consulta_beneficios_voucher`

**Method**: `POST`

**Request Body**:
```json
{
  "ps": "agency_identifier",     // Required for pre-2025 clients
  "language_id": "spa",          // Required: "spa" or "eng"
  "codigo": "CA-XXXXXX-XX"       // Required: Voucher code
}
```

**Response** (Success - Spanish):
```json
{
  "resultado": [
    {
      "id_beneficio": 254,
      "nombre": "Asistencia médica por Accidente",
      "valor": "$85,000 MXN"
    },
    {
      "id_beneficio": 537,
      "nombre": "Asistencia medica por enfermedad no preexistente (incluido COVID 19)",
      "valor": "$85,000 MXN"
    }
  ],
  "cantidad": 13,
  "error": false
}
```

**Response** (Success - English):
```json
{
  "resultado": [
    {
      "id_beneficio": 254,
      "nombre": "Medical assistance for accidents",
      "valor": "$85,000 MXN"
    },
    {
      "id_beneficio": 537,
      "nombre": "Medical assistance for non-preexisting illness (including COVID 19)",
      "valor": "$85,000 MXN"
    }
  ],
  "cantidad": 13,
  "error": false
}
```

**Response** (Voucher Not Found):
```json
{
  "resultado": [
    {
      "mensaje_error": "EL VOUCHER NO EXISTE"
    }
  ],
  "cantidad": 0,
  "error": true,
  "mensaje_error": ""
}
```

**Notes**:
- Works for vouchers in any state
- Benefit count and coverage values depend on EVA configuration

---

### 8. consulta_beneficios_adicionales

**Purpose**: Query additional benefits available for a specific plan

**Endpoint**: `/consulta_beneficios_adicionales`

**Method**: `POST`

**Request Body**:
```json
{
  "ps": "agency_identifier",     // Required for pre-2025 clients
  "id_plan": 2391,               // Required: Plan ID from consulta_planes_grupal
  "id_categoria": 28,            // Required: Category ID
  "dias": 7                      // Required: Number of days for price calculation
}
```

**Response** (Success):
```json
{
  "resultado": [
    {
      "plan": "Plan A",
      "beneficio": "Preexistencias médicas",
      "precioaddon": "5.50"
    },
    {
      "plan": "Plan A",
      "beneficio": "Práctica deportiva",
      "precioaddon": "10.99"
    }
  ],
  "cantidad": 2,
  "error": false
}
```

**Response** (No Additional Benefits):
```json
{
  "resultado": [
    {
      "mensaje_error": "EL PLAN NO EXISTE O NO TIENE BENEFICIOS ADICIONALES"
    }
  ],
  "cantidad": 0,
  "error": true,
  "mensaje_error": ""
}
```

**Notes**:
- New parameter: `dias` (required as of this version)
- Price calculated based on number of days
- Additional benefits are optional add-ons to base plan

---

### 9. consulta_beneficios_planes_costos

**Purpose**: Query plan benefits with prices and coverage details

**Endpoint**: `/consulta_beneficios_planes_costos`

**Method**: `POST`

**Request Body**:
```json
{
  "ps": "agency_identifier",     // Required for pre-2025 clients
  "id_planes": [3420, 3421, 3423], // Required: Array of plan IDs
  "id_categoria": 28             // Required: Category ID
}
```

**Response** (Success):
```json
{
  "resultado": [
    {
      "id_beneficio": 240,
      "nombre_beneficio": "Demora equipaje",
      "planes": [
        {
          "id_plan": 3420,
          "nombre_plan": "PLATA BP",
          "valor": "USD 50"
        },
        {
          "id_plan": 3421,
          "nombre_plan": "ORO BP",
          "valor": "N/A"
        },
        {
          "id_plan": 3423,
          "nombre_plan": "PLATINO BP",
          "valor": "N/A"
        }
      ]
    }
  ],
  "cantidad": 28,
  "error": false
}
```

**Response** (No Benefits):
```json
{
  "resultado": [
    {
      "mensaje_error": "EL PLAN NO EXISTE O NO TIENE BENEFICIOS CONFIGURADOS"
    }
  ],
  "cantidad": 0,
  "error": true,
  "mensaje_error": ""
}
```

**Use Case**: Compare benefits across multiple plans simultaneously

---

### 10. consulta_cupon

**Purpose**: Validate a discount coupon assigned to the agency

**Endpoint**: `/consulta_cupon`

**Method**: `POST`

**Request Body**:
```json
{
  "ps": "agency_identifier",     // Required for pre-2025 clients
  "cupon": "PMKIM5XEEE"          // Required: Coupon code
  // OR
  "codigo_cupon": "PMKIM5XEEE"   // Alternative parameter name
}
```

**Response** (Valid Coupon):
```json
{
  "resultado": {
    "mensaje": "Cupón válido",
    "id_cupon": 48014,
    "codigo": "PMKIM5XEEE",
    "porcentaje": 50,
    "id_status": 1
  },
  "cantidad": 1,
  "error": false
}
```

**Response** (Invalid Coupon):
```json
{
  "resultado": {
    "mensaje": "Cupón no válido",
    "porcentaje": 0
  },
  "cantidad": 0,
  "error": true,
  "mensaje_error": ""
}
```

**Notes**:
- Returns discount percentage if valid
- Coupon must be assigned to the requesting agency

---

### 11. comprar

**Purpose**: Purchase/issue a voucher with provided parameters

**Endpoint**: `/comprar`

**Method**: `POST`

**Request Body**:
```json
{
  "ps": "agency_identifier",
  "origen": "CO",
  "destino": 134,
  "desde": "03/02/2025",
  "hasta": "07/02/2025",
  "id_categoria": 28,
  "id_plan": 2391,
  "contacto": {
    "nombre": "John Doe",
    "telefono": "+1234567890",
    "email": "contact@example.com"
  },
  "beneficiarios": [
    {
      "nombre": "Jane",
      "apellido": "Smith",
      "fecha_nac": "15/03/1990",
      "edad": 35,
      "documento": "AB123456",
      "pasaporte": "P98765432",
      "email": "jane.smith@example.com",
      "telefono": "+1234567890"
    }
  ],
  "ip": "192.168.1.1",
  "forma_pago": 1,
  "familiar": false,
  "totalgeneral": "116.75",
  "beneficios_adicionales": []
}
```

**Request Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ps` | string | Conditional | Required for pre-2025 clients |
| `origen` | string | Yes | ISO country code of origin |
| `destino` | integer | Yes | Destination ID from consulta_destinos |
| `desde` | string | Yes | Start date (dd/mm/YYYY) |
| `hasta` | string | Yes | End date (dd/mm/YYYY) |
| `id_categoria` | integer | Yes | Category ID |
| `id_plan` | integer | Yes | Plan ID |
| `contacto` | object | Yes | Emergency contact information |
| `contacto.nombre` | string | Yes | Contact name (or "ND" if unavailable) |
| `contacto.telefono` | string | Yes | Contact phone (or "1" if unavailable) |
| `contacto.email` | email | Yes | Contact email (or "correo@correo.com") |
| `beneficiarios` | array | Yes | Traveler details (min 1) |
| `beneficiarios[].nombre` | string | Yes | Traveler first name |
| `beneficiarios[].apellido` | string | Yes | Traveler last name |
| `beneficiarios[].fecha_nac` | string | Yes | Birth date (dd/mm/YYYY) |
| `beneficiarios[].edad` | integer | Yes | Age |
| `beneficiarios[].documento` | string | Yes | ID document (max 20 chars) |
| `beneficiarios[].pasaporte` | string | Optional | Passport number (max 20 chars) |
| `beneficiarios[].email` | email | Yes | Traveler email |
| `beneficiarios[].telefono` | string | Yes | Traveler phone (max 15 chars) |
| `ip` | string | Yes | Client IP address |
| `forma_pago` | integer | Yes | Payment method (1 = Cash) |
| `familiar` | boolean | Conditional | Required for family plans |
| `totalgeneral` | string | Conditional | Total price (not required for net rate clients) |
| `beneficios_adicionales` | array | Optional | Additional benefits to include |

**Response** (Success):
```json
{
  "resultado": [
    {
      "codigo": "CA-O9U6IL-CR",
      "link_voucher": "http://localhost:9000/consulta-voucher/CA-O9U6IL-CR",
      "vouchers": [
        {
          "codigo": "CA-O9U6IL-CR",
          "nombre": "JOSE",
          "apellido": "XXXXX",
          "link_voucher": "http://localhost:9000/consulta-voucher/CA-O9U6IL-CR",
          "voucher": "http://localhost:9000/consulta-voucher/CA-O9U6IL-CR"
        }
      ],
      "precio_total": "116.75"
    }
  ],
  "cantidad": 1,
  "error": false
}
```

**Response** (Start Date Error):
```json
{
  "resultado": [
    {
      "mensaje_error": "LA FECHA DE INICIO DEBE SER MAYOR O IGUAL A LA FECHA ACTUAL"
    }
  ],
  "cantidad": 0,
  "error": true,
  "mensaje_error": ""
}
```

**Response** (Plan Not Found):
```json
{
  "resultado": [
    {
      "mensaje_error": "NO EXISTE EL PLAN ENVÍADO"
    }
  ],
  "cantidad": 0,
  "error": true,
  "mensaje_error": ""
}
```

**Response** (Category Not Found):
```json
{
  "resultado": [
    {
      "mensaje_error": "NO EXISTE CATEGORÍA ENVÍADA"
    }
  ],
  "cantidad": 0,
  "error": true,
  "mensaje_error": ""
}
```

**Response** (Validation Error):
```json
{
  "resultado": [
    "The contacto.telefono contacto must be a number.",
    "The contacto.telefono contacto must be between 1 and 15 digits."
  ],
  "cantidad": 0,
  "error": true,
  "mensaje_error": ""
}
```

**Important Notes**:
- **Payment Method**: Only `1` (Cash) is accepted for API transactions
- **Contact Warning**: Emergency contact is used by assistance center for notifications
- **Date Format**: Strictly dd/mm/YYYY
- **Start Date**: Must be greater than or equal to current date
- **Family Plans**: Beneficiaries must match family group rules for the agency
- **Net Rate Clients**: `totalgeneral` is not required if net rate is configured

---

### 12. consulta_voucher

**Purpose**: Query complete voucher details

**Endpoint**: `/consulta_voucher`

**Method**: `POST`

**Request Body**:
```json
{
  "ps": "agency_identifier",     // Required for pre-2025 clients
  "language_id": "spa",          // Required: "spa" or "eng"
  "codigo": "CA-XXXXXX-MX"       // Required: Voucher code
}
```

**Response** (Success):
```json
{
  "resultado": [
    {
      "voucher": "CA-XXXXXX-MX",
      "id_voucher": 123456,
      "url_voucher": "http://localhost:9000/consulta-voucher/CA-XXXXXX-MX/es",
      "origen": "México",
      "destino": "Mundial",
      "salida": "2025-02-03",
      "retorno": "2025-02-07",
      "categoria": "Planes Especiales",
      "plan": "Plan Premium",
      "id_forma_pago": "1",
      "forma_pago": "CONTADO",
      "agencia": "Agency Name",
      "agencia_consulta": "Query Agency Name",
      "nombre_contacto": "John Doe",
      "telefono_contacto": "1234567890",
      "email_contacto": "contact@example.com",
      "status": "Activo",
      "id_status": 1,
      "total": "10.00",
      "paises_iso": "",
      "paises": ["Mundial"],
      "cantidad_beneficiarios": 1,
      "beneficiarios": [
        {
          "nombre": "Jane",
          "apellido": "Smith",
          "fecha_nacimiento": "2006-09-04",
          "documento": "AB123456",
          "telefono": "0987654321",
          "email": "jane.smith@example.com",
          "voucher": "CA-XXXXXX-MX",
          "url_voucher": "http://localhost:9000/consulta-voucher/CA-XXXXXX-MX/es",
          "beneficiosadicionales": []
        }
      ],
      "beneficios": [
        {
          "id_beneficio": 254,
          "nombre": "Asistencia médica por Accidente",
          "cobertura": "$85,000 MXN"
        }
      ]
    }
  ],
  "cantidad": 1,
  "error": false
}
```

**Response** (Voucher Not Found):
```json
{
  "resultado": [
    {
      "mensaje_error": "EL VOUCHER NO EXISTE"
    }
  ],
  "cantidad": 0,
  "error": true,
  "mensaje_error": ""
}
```

**Voucher Status Values**:

| Status | Description |
|--------|-------------|
| `Activo` | Active - ready for use |
| `Cancelado` | Cancelled |
| `Vencido` | Expired |
| `Utilizado` | Used |

**Language Selection in URL**:
- Spanish: `.../consulta-voucher/CA-XXXXXX-MX/es`
- English: `.../consulta-voucher/CA-XXXXXX-MX/en`

**Notes**:
- If status is not "Activo", contact customer service
- Complete beneficiary and benefit information included

---

## Common Response Patterns

### Success Response Structure

```json
{
  "resultado": [...],    // Array or object with data
  "cantidad": N,         // Number of results
  "error": false         // Boolean indicating no error
}
```

### Error Response Structure

```json
{
  "resultado": [...],    // Error details or message
  "cantidad": 0,         // Zero results
  "error": true,         // Boolean indicating error
  "mensaje_error": ""    // Additional error message
}
```

### Authorization Error (HTTP 401)

```json
{
  "resultado": "Unauthorized",
  "cantidad": 0,
  "error": 401
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Process response data |
| 401 | Unauthorized | Check token validity, contact support |
| 500 | Server Error | Retry with exponential backoff, contact support if persists |

### Common Error Scenarios

#### 1. Invalid Token
**Response**: 401 Unauthorized
**Solution**: Verify token is correct and not expired, ensure correct header key

#### 2. Agency Not Configured
**Message**: "No está configurada la agencia!"
**Solution**: Contact Continental Assist to configure agency settings

#### 3. Voucher Not Found
**Message**: "EL VOUCHER NO EXISTE"
**Solution**: Verify voucher code format and existence

#### 4. No Plans Available
**Message**: "NO EXISTEN PLANES PARA ESTA AGENCIA"
**Solution**: Check parameters or contact commercial representative

#### 5. Invalid Date
**Message**: "LA FECHA DE INICIO DEBE SER MAYOR O IGUAL A LA FECHA ACTUAL"
**Solution**: Ensure start date is today or in the future

#### 6. Validation Errors
**Format**: Array of validation messages
**Solution**: Fix field formats according to specifications

### Best Practices for Error Handling

```javascript
// Example error handling pattern
async function callAPI(endpoint, payload) {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'EVA-AUTH-USER': process.env.CA_TOKEN
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    // Check for HTTP errors
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed - check token');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Check for application errors
    if (data.error === true || data.error === 401) {
      throw new Error(data.resultado || data.mensaje_error || 'API Error');
    }

    return data;

  } catch (error) {
    console.error('API Call Failed:', error.message);
    // Implement retry logic, logging, alerting
    throw error;
  }
}
```

---

## Implementation Examples

### Example 1: Complete Purchase Flow

```javascript
const BASE_URL = 'https://api-eva.continentalassist.com/api';
const TOKEN = process.env.CA_TOKEN;

async function purchaseVoucher() {
  // Step 1: Get categories
  const categories = await fetch(`${BASE_URL}/consulta_categorias`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'EVA-AUTH-USER': TOKEN
    },
    body: JSON.stringify({ language_id: 'spa' })
  }).then(r => r.json());

  console.log('Available categories:', categories.resultado);

  // Step 2: Get origins
  const origins = await fetch(`${BASE_URL}/consulta_origenes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'EVA-AUTH-USER': TOKEN
    },
    body: JSON.stringify({})
  }).then(r => r.json());

  console.log('Available origins:', origins.resultado.length);

  // Step 3: Get destinations
  const destinations = await fetch(`${BASE_URL}/consulta_destinos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'EVA-AUTH-USER': TOKEN
    },
    body: JSON.stringify({})
  }).then(r => r.json());

  console.log('Available destinations:', destinations.resultado);

  // Step 4: Get plans
  const plans = await fetch(`${BASE_URL}/consulta_planes_grupal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'EVA-AUTH-USER': TOKEN
    },
    body: JSON.stringify({
      dias: 7,
      edades: [30, 35],
      id_categoria: categories.resultado[0].id_categoria,
      id_destino: destinations.resultado[0].id_destino
    })
  }).then(r => r.json());

  console.log('Available plans:', plans.resultado);

  // Step 5: Purchase
  const purchase = await fetch(`${BASE_URL}/comprar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'EVA-AUTH-USER': TOKEN
    },
    body: JSON.stringify({
      origen: 'CO',
      destino: destinations.resultado[0].id_destino,
      desde: '01/03/2025',
      hasta: '08/03/2025',
      id_categoria: categories.resultado[0].id_categoria,
      id_plan: plans.resultado[0].id,
      contacto: {
        nombre: 'Emergency Contact',
        telefono: '+573001234567',
        email: 'emergency@example.com'
      },
      beneficiarios: [
        {
          nombre: 'John',
          apellido: 'Doe',
          fecha_nac: '15/05/1990',
          edad: 34,
          documento: 'CC123456789',
          email: 'john.doe@example.com',
          telefono: '+573001234567'
        }
      ],
      ip: '192.168.1.1',
      forma_pago: 1,
      familiar: false,
      totalgeneral: plans.resultado[0].precio_grupal,
      beneficios_adicionales: []
    })
  }).then(r => r.json());

  console.log('Purchase result:', purchase.resultado);

  return purchase.resultado[0].codigo;
}
```

### Example 2: Query Voucher Details

```python
import requests
import os

BASE_URL = 'https://api-eva.continentalassist.com/api'
TOKEN = os.getenv('CA_TOKEN')

def get_voucher_details(voucher_code, language='spa'):
    """
    Retrieve complete voucher information

    Args:
        voucher_code (str): Voucher code (e.g., 'CA-XXXXXX-MX')
        language (str): 'spa' for Spanish, 'eng' for English

    Returns:
        dict: Voucher details
    """
    headers = {
        'Content-Type': 'application/json',
        'EVA-AUTH-USER': TOKEN
    }

    # Get voucher details
    voucher_response = requests.post(
        f'{BASE_URL}/consulta_voucher',
        json={
            'language_id': language,
            'codigo': voucher_code
        },
        headers=headers
    )

    voucher_data = voucher_response.json()

    if voucher_data.get('error'):
        raise Exception(f"Error retrieving voucher: {voucher_data.get('resultado')}")

    # Get voucher benefits
    benefits_response = requests.post(
        f'{BASE_URL}/consulta_beneficios_voucher',
        json={
            'language_id': language,
            'codigo': voucher_code
        },
        headers=headers
    )

    benefits_data = benefits_response.json()

    return {
        'voucher': voucher_data['resultado'][0],
        'benefits': benefits_data['resultado']
    }

# Usage
voucher_info = get_voucher_details('CA-O9U6IL-CR', 'eng')
print(f"Voucher: {voucher_info['voucher']['voucher']}")
print(f"Status: {voucher_info['voucher']['status']}")
print(f"Benefits: {len(voucher_info['benefits'])}")
```

### Example 3: Validate and Apply Coupon

```typescript
interface CouponValidationResult {
  valid: boolean;
  discount: number;
  message: string;
}

async function validateCoupon(
  couponCode: string
): Promise<CouponValidationResult> {
  const response = await fetch(
    `${process.env.CA_BASE_URL}/consulta_cupon`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'EVA-AUTH-USER': process.env.CA_TOKEN!
      },
      body: JSON.stringify({
        cupon: couponCode
      })
    }
  );

  const data = await response.json();

  if (data.error) {
    return {
      valid: false,
      discount: 0,
      message: data.resultado?.mensaje || 'Invalid coupon'
    };
  }

  return {
    valid: true,
    discount: data.resultado.porcentaje,
    message: data.resultado.mensaje
  };
}

function calculatePriceWithCoupon(
  originalPrice: number,
  discountPercentage: number
): number {
  return originalPrice * (1 - discountPercentage / 100);
}

// Usage
const coupon = await validateCoupon('PMKIM5XEEE');
if (coupon.valid) {
  const finalPrice = calculatePriceWithCoupon(100, coupon.discount);
  console.log(`Original: $100, Discount: ${coupon.discount}%, Final: $${finalPrice}`);
}
```

---

## Appendix

### A. Data Validation Rules

#### Date Formats
- **Format**: dd/mm/YYYY
- **Example**: "15/03/2025"
- **Validation**: Must be valid calendar date

#### Email Validation
- **Format**: Standard email format
- **Example**: "user@example.com"
- **Required**: For beneficiaries and contact

#### Phone Validation
- **Max Length**: 15 characters
- **Format**: String or numeric
- **Example**: "+573001234567"

#### Document Validation
- **Max Length**: 20 characters
- **Type**: String
- **Example**: "CC123456789"

### B. ISO Country Codes

Continental Assist uses ISO 3166-1 alpha-2 codes:

| Code | Country |
|------|---------|
| CO | Colombia |
| MX | Mexico |
| US | United States |
| AR | Argentina |
| BR | Brazil |
| DE | Germany |
| ES | Spain |
| FR | France |

[See full list at consulta_origenes endpoint]

### C. Commercial Considerations

1. **Categories**: Depend on commercial agreements with Continental Assist
2. **Pricing**: Based on EVA system configuration and contracts
3. **Family Plans**: Rules vary by agency configuration
4. **Payment Methods**: Currently only cash (forma_pago: 1) via API
5. **Net Rate Clients**: May have different parameter requirements

### D. Glossary

| Term | Definition |
|------|------------|
| **Voucher** | Travel assistance certificate/policy |
| **Beneficiary** | Traveler covered by the plan |
| **Category** | Plan classification (e.g., Special Plans, Inclusion Plans) |
| **EVA** | Continental Assist's internal system |
| **Overage Factor** | Multiplier for travelers exceeding maximum age |
| **Family Plan** | Plan with special pricing for family groups |
| **Additional Benefits** | Optional add-ons to base plan coverage |
| **Coverage** | Maximum benefit amount for specific service |

### E. Support Contacts

**General Inquiries**:
- Email: sistemas@continentalassist.com

**Commercial Agreements**:
- Contact: Deborah Rosenfeld
- Email: drosenfeld@continentalassist.com

**API Token Requests**:
- Department: Software Development
- Email: sistemas@continentalassist.com

### F. Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.1.0 | 2025 | Current version documented |
| 2.0 | 2025 | EVA token structure introduced |
| - | Pre-2025 | Legacy token structure |

### G. Migration Guide (Legacy to EVA)

**For Pre-2025 Clients**:
1. Continue using existing tokens with `PHP-AUTH-USER` header
2. `ps` parameter remains required
3. No immediate action required

**For New Clients (Post Jan 13, 2025)**:
1. Request EVA token from sistemas@continentalassist.com
2. Use `EVA-AUTH-USER` header
3. `ps` parameter is optional
4. Destinations API returns full country list (not just 3 options)

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│                   CONTINENTAL ASSIST API                     │
│                     Quick Reference                          │
├─────────────────────────────────────────────────────────────┤
│ Base URLs:                                                   │
│   Test: testapiseva.testingcontinentalassist.tech/api      │
│   Prod: api-eva.continentalassist.com/api                   │
├─────────────────────────────────────────────────────────────┤
│ Authentication:                                              │
│   Header: EVA-AUTH-USER (post-2025)                         │
│   Header: PHP-AUTH-USER (pre-2025)                          │
├─────────────────────────────────────────────────────────────┤
│ All Endpoints:                                               │
│   • Method: POST                                             │
│   • Content-Type: application/json                           │
│   • Protocol: HTTPS (TLS 1.2+)                              │
├─────────────────────────────────────────────────────────────┤
│ Purchase Flow:                                               │
│   1. consulta_categorias     → Get categories               │
│   2. consulta_origenes       → Get origins                  │
│   3. consulta_destinos       → Get destinations             │
│   4. consulta_planes_grupal  → Get plans & prices           │
│   5. consulta_cupon          → Validate coupon (optional)   │
│   6. comprar                 → Purchase voucher             │
│   7. consulta_voucher        → Retrieve voucher             │
├─────────────────────────────────────────────────────────────┤
│ Error Codes:                                                 │
│   200: Success                                               │
│   401: Unauthorized (invalid token)                          │
│   error: true (application error)                            │
├─────────────────────────────────────────────────────────────┤
│ Support: sistemas@continentalassist.com                      │
└─────────────────────────────────────────────────────────────┘
```

---

**Document Version**: 2.1.0
**Last Updated**: 2025
**Prepared for**: Continental Assist API Integration Partners

---
