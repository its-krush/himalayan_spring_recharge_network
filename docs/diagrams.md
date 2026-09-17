# Architecture, ER, and data-flow diagrams

## Architecture

```mermaid
flowchart LR
  Browser[React / TypeScript command center] --> T[tRPC typed API]
  Browser --> R[REST aliases + OpenAPI]
  T --> A[Built-in local session + role middleware]
  T --> E[Risk and water engines]
  T --> D[(PostgreSQL + Drizzle)]
  I[Public data adapters] --> C[Cache and provenance records]
  C --> E
```

## Database entity overview

```mermaid
erDiagram
  USERS ||--o{ AUDIT_LOGS : creates
  USERS ||--o{ MODEL_CONFIGS : publishes
  REGIONS ||--o{ PREDICTIONS : receives
  REGIONS ||--o{ WATER_RESOURCES : has
  REGIONS ||--o{ DISASTER_EVENTS : contains
  USERS { int id string role }
  REGIONS { string id string country string state string basin float latitude float longitude }
  DATA_SOURCES { string id string organization string status string dataType }
  MODEL_CONFIGS { int id string version json weights json thresholds json tankerConfig }
  PREDICTIONS { int id string regionId string hazardType float riskScore string riskCategory json contributions }
  HOSPITALS { string id string name float latitude float longitude int totalBeds int availableBeds boolean syntheticCapacity }
  WATER_RESOURCES { string id string regionId float availableMld float demandMld float groundwaterIndex }
  DISASTER_EVENTS { int id string regionId string hazardType float severity boolean synthetic }
  AUDIT_LOGS { int id int userId string action string entity json previousValue json newValue }
```

## Data flow

```mermaid
sequenceDiagram
  participant U as Operator
  participant UI as Dashboard
  participant API as API layer
  participant M as Weighted engine
  participant DB as Database
  participant SRC as Public source adapter
  U->>UI: Select region / scenario
  UI->>API: Request region + risk + water context
  API->>DB: Read active model config when configured
  API->>M: Clamp features and normalize weights
  M-->>API: Score, category, contributions, model version
  API-->>UI: Explainable result + provenance status
  UI->>SRC: Optional refresh request
  SRC-->>UI: live / cached / unavailable; never fabricated
  U->>UI: Save config or capacity
  UI->>API: Protected mutation
  API->>DB: Persist change + audit log
```
