# WS-16A — External Reality Minimum: Appointment First

**Baseline:** `origin/main` @ `1c92acc`  
**Pré-requisito:** WS-14A Etapas 1–3 ✅ — Appointment runtime-backed  
**Classificação:** camada externa mínima / densidade operacional — **não** feature de produto  
**Status:** 📋 Charter proposto — **sem implementação até GO explícito**  
**Relação:** antecede WS-09 (DB) e WS-15 (publication); **não substitui** nenhum dos dois

---

## Pergunta gate

```txt
isso aumenta realidade contextual
ou transforma presença em informação?
```

**Resposta do charter:** aumenta realidade contextual **somente se** dados externos forem **normalizados para a gramática existente** (WS-09 → WS-13) e **injetados no runtime** como sinais derivados — não como painel, embed de Maps, ou bloco de metadados Google.

**Anti-padrão explícito:**

```txt
presença → informação = NO-GO perceptivo
lugar como linguagem → realidade ancorada = GO
```

Referências: [`PERCEPTUAL_LANGUAGE_SYSTEM.md`](../os/PERCEPTUAL_LANGUAGE_SYSTEM.md) (AR-02, HP-07, linha operacional), [`WS-09D1_CONTEXTUAL_ARRIVAL_INTEGRATION.md`](WS-09D1_CONTEXTUAL_ARRIVAL_INTEGRATION.md), [`WS-14A_LIVING_RUNTIME_FOUNDATION.md`](WS-14A_LIVING_RUNTIME_FOUNDATION.md).

---

## Objetivo

Conectar o **Appointment Runtime** a sinais externos mínimos de realidade — sem transformar a Social Landing em dashboard, Google clone ou sistema operacional pesado.

```txt
runtime seed estático  →  runtime ancorado em sinais externos mínimos
```

Depois deste WS (se gate cumplido):

- `barba-negra` deixa de depender **apenas** de copy mock para horários, endereço e prova social
- sinais Google Places alimentam **campos já projetados** (`operational`, `arrival`, `establishment`, `feed.reviews`)
- UI **permanece gramaticalmente idêntica** — enrichment invisível na superfície Tier 1
- falha de API externa → fallback silencioso para seed atual (zero ruptura)

---

## Estado atual (pós WS-14A)

| Camada | Status |
|--------|--------|
| `AppointmentRuntimeBundle` v1 | ✅ seed JSON + mock adapter |
| `appointment-feed-data.ts` | ✅ `loadAppointmentRuntime()` + projection |
| `operational` / `arrival` | Mock editorial (Barba Negra / Augusta) |
| `feed.sections.reviews` | Mock editorial (`appointmentContent`) |
| Google Maps link | Já existe — `mapsQuery` → URL fallback no drawer |
| API externa | ❌ nenhuma |

**Oportunidade:** ancorar copy operacional e prova social sem redesenhar surfaces.

---

## Escopo

### Incluído

1. **Entidades externas mínimas** — snapshot normalizado (não schema enterprise)
2. **Google Place / business metadata** — `placeId`, nome verificado, endereço formatado, coordenadas opcionais
3. **Opening hours** — `openNow` + derivação de `liveState` / `hoursHint` (não tabela na UI)
4. **Address / place data** — alimentar `establishment.contact`, `arrival.addressLine`, `mapsQuery`
5. **Reviews summary + reviews selecionáveis** — rating agregado interno; até **3** reviews mapeáveis para `FeedItem.kind=review`
6. **Normalização → `AppointmentRuntimeBundle`** — merge layer, não UI nova
7. **Ingestão server-side** — script ou API route isolada; **sem** key no client bundle
8. **Fallback dev** — sem API key = seed atual intacto
9. **Gates técnicos** — `pnpm qa:appointment-runtime`, `qa:appointment`, `qa:events` verdes

### Fora de escopo (inviolável neste WS)

| Fora | Motivo |
|------|--------|
| Editor (WS-17) | Camada acima de runtime |
| IA operacional (WS-18) | Requer entidades + histórico |
| DB / Drizzle (WS-09) | Persistência write — ciclo separado |
| Publication pipeline (WS-15) | draft/live |
| Agenda real / booking sync | Transacional — não presença |
| CRM · analytics · social graph | Dashboard / growth |
| Recommendation · algoritmo feed | Engajamento |
| Multi-vertical | Appointment pilot only |
| Maps embed / iframe / UI Google | Anti-padrão perceptivo |
| Alteração JSX Tier 1 | Só se enrichment exigir zero diff (default: **proibido**) |
| Composer · motion · morph · smoke-fume | Produto perceptivo congelado @ `39c7b12` |

---

## Entidades externas mínimas

Não criar modelo universal. Criar **1 snapshot + 1 bridge** suficientes para Appointment:

### `ExternalRealitySnapshot` (proposto)

```ts
interface ExternalRealitySnapshot {
  provider: "google-places"
  placeId: string
  fetchedAt: string              // ISO

  place: {
    displayName: string
    formattedAddress: string
    googleMapsUri?: string
    location?: { lat: number; lng: number }
  }

  hours: {
    openNow?: boolean
    weekdayDescriptions?: string[]   // uso interno — derivar hints, não renderizar lista
  }

  rating: {
    average?: number
    total?: number
  }

  reviews: ExternalReviewCandidate[]  // max 3 após filtro editorial
}

interface ExternalReviewCandidate {
  id: string
  author: string
  rating: number
  text: string
  relativeTime?: string
}
```

### `RuntimeExternalMeta` (embutido no bundle)

```ts
interface RuntimeExternalMeta {
  provider: "google-places"
  placeId: string
  syncedAt: string
  status: "live" | "fallback" | "stale"
}
```

**Versão bundle:** incrementar para `APPOINTMENT_RUNTIME_VERSION = 2` **somente** se merge exigir; preferir sub-objeto `external` em v1 compatível.

---

## Campos que ENTRAM no runtime

Dados externos **normalizados** alimentam campos **já existentes** — não novas surfaces.

| Origem externa | Campo runtime destino | Uso UI atual |
|----------------|----------------------|--------------|
| `place.displayName` | validação `establishment.name` | hero brand (silencioso) |
| `place.formattedAddress` | `establishment.contact.address` | contact CTA |
| `place.formattedAddress` | `arrival.addressLine` | drawer subtitle |
| `place.googleMapsUri` ou query | `arrival.mapsQuery` | link Maps fallback |
| `hours.openNow` | `operational.liveState` | "Aberto agora" / "Fechado" |
| `hours` derivado | `operational.hoursHint` | hint compacto ("até 20h") |
| `hours` derivado | `establishment.hours` | string legível contact |
| `rating.average/total` | metadata interna / profissional aggregate opcional | **não** badge no hero |
| `reviews[]` (≤3) | `feed.sections[id=reviews].items[]` | secao "O Que Dizem" |
| snapshot meta | `meta.external` | observabilidade / debug |

### Regras de derivação perceptiva (obrigatórias)

| Regra | Exemplo |
|-------|---------|
| `placeHint` permanece **linguagem**, não endereço completo | `"na Augusta"` — **não** substituir por `"Rua Augusta, 1500"` no hero |
| `drawerTitle` permanece gramática WS-09D | `"Chegar na Augusta"` — **não** `"Como chegar"` |
| `liveState` = frase humana curta | `"Aberto agora"` — **não** `"OPEN"` / ícone status |
| Reviews externas passam por **filtro editorial** | max 3; texto curto; tom compatível |
| Copy editorial mock **prevalece** onde richer | `referenceHint`, `routeHint`, `parkingHint`, `arrivalMood` — **não sobrescrever** com Google |

---

## Campos que NÃO entram

| Dado externo | Por quê |
|--------------|---------|
| Lista completa `weekdayDescriptions` na UI | Ficha técnica — WS-09C.1 revertido |
| Histograma de estrelas | Dashboard |
| Place photos gallery | Showcase / Google clone |
| Maps embed / Street View | Utilitário protagonista |
| `priceLevel`, `paymentOptions`, `wheelchairAccessibleEntrance` | Metadado empresarial |
| Reviews ilimitados / paginação | Feed infinito Google |
| Competitors / nearby places | Não é discovery app |
| Real-time ETA / directions API | Fora presença contínua |
| Business attributes JSON bruto | Dump operacional |
| Place ID exposto na UI | Implementação, não linguagem |

---

## Riscos perceptivos

| Risco | Severidade | Mitigação |
|-------|------------|-----------|
| Hero vira ficha Google | **Alta** | Enrichment só em hints derivados; hero copy editorial preservada |
| Drawer chegada vira app de mapas | **Alta** | Manter copy WS-09D; Maps = fallback outline (já spec AR) |
| Reviews externas destoam do tom editorial | **Média** | Max 3; filtro comprimento; fallback mock se gate falhar |
| `liveState` incorreto (timezone/API) | **Média** | Fallback mock; status `stale` no meta |
| Badge ★★★★ no hero | **Alta** | **Proibido** neste WS |
| Regressão Tier 1 por JSX “pequeno” | **Alta** | Default: **zero JSX**; enrichment via projection only |
| API key no client | **Crítica** | Server/script only; env `GOOGLE_PLACES_API_KEY` |
| Dependência runtime-only de rede | **Média** | Snapshot file commitado ou cache local; build-time sync |

---

## Estratégia de ingestão (sem dashboardização)

```txt
Google Places API (server)
  └─ sync script / API route isolada
       └─ ExternalRealitySnapshot JSON
            └─ mergeExternalRealityIntoBundle(seed, snapshot)
                 └─ barba-negra.v2.json  (ou overlay .external.json)
                      └─ loadAppointmentRuntime()  (inalterado para UI)
                           └─ legacy-projection  (inalterado)
                                └─ appointment-feed-data  (inalterado)
```

### Princípios

1. **Snapshot, não live fetch na UI** — runtime lê arquivo; sync é operação separada
2. **Merge, não replace** — editorial mock prevalece onde gramática exige
3. **Invisible enrichment** — participante não vê "Google"; vê lugar mais vivo
4. **Opt-in pilot** — `APPOINTMENT_EXTERNAL_PLACE_ID` + API key; sem key = noop
5. **Não painel admin** — script CLI `pnpm runtime:appointment:sync-external`

### Arquivos candidatos (propostos — não implementados)

| Path | Papel |
|------|-------|
| `lib/runtime/appointment/external/types.ts` | Snapshot types |
| `lib/runtime/appointment/external/google-places-client.ts` | Fetch server-only |
| `lib/runtime/appointment/external/normalize.ts` | Places → snapshot |
| `lib/runtime/appointment/external/merge.ts` | Snapshot → bundle |
| `lib/runtime/appointment/external/editorial-gate.ts` | Filtro reviews / copy |
| `data/runtime/appointment/barba-negra.external.json` | Snapshot cache |
| `scripts/runtime/sync-appointment-external-reality.ts` | Sync CLI |
| `scripts/runtime/appointment-external-smoke.ts` | Parity + merge gate |

### Intocados (default)

- `components/business/appointment/appointment-feed.tsx`
- `appointment-operational-hero.tsx`
- `appointment-arrival-drawer.tsx`
- `lib/ui/*`, `lib/surfaces/*`

---

## Micro-etapas de implementação

### Etapa 0 — Charter ✅ (este documento)

- [x] Entidades externas mínimas
- [x] Campos in/out
- [x] Riscos perceptivos
- [x] Estratégia ingestão
- [ ] **GO humano explícito para código**

### Etapa 1 — Types + snapshot schema

- `ExternalRealitySnapshot`, `RuntimeExternalMeta`
- Validators; zero fetch

### Etapa 2 — Google Places client (server-only)

- Place Details API (fields mínimos)
- Env: `GOOGLE_PLACES_API_KEY`, `APPOINTMENT_EXTERNAL_PLACE_ID`
- Pilot: Barba Negra placeId configurável

### Etapa 3 — Normalize + merge

- `mergeExternalRealityIntoBundle()`
- Regras: editorial prevalece; derivar `liveState` / `hoursHint`
- Output: `barba-negra.v2.json` ou overlay merge at load

### Etapa 4 — Sync CLI + cache file

- `pnpm runtime:appointment:sync-external`
- Commit snapshot cache (opcional) ou gitignored local
- Fallback: merge noop sem key

### Etapa 5 — Load path integration

- `loadAppointmentRuntimeFromRuntimeStore()` aplica overlay se presente
- `meta.external.status` = live | fallback | stale
- **Zero JSX**

### Etapa 6 — Gates

- `pnpm qa:appointment-runtime` estendido (merge parity)
- `pnpm qa:appointment` mock + runtime
- `pnpm qa:events`
- Checklist perceptivo manual: hero / chegada / reviews (proxy)

### Etapa 7 — Documentação operacional

- Atualizar baseline; registrar placeId pilot

**Estimativa:** 2 PRs — (1) types + merge + fallback, (2) Google client + sync CLI.

---

## Gate de saída WS-16A

| # | Critério | Verificação |
|---|----------|-------------|
| G1 | Snapshot externo normalizado | schema validate |
| G2 | Merge alimenta bundle sem UI nova | grep: zero JSX diff default |
| G3 | Fallback sem API key | seed v1/v2 idêntico em projeção |
| G4 | `operational.liveState` derivado quando live | smoke |
| G5 | `arrival.mapsQuery` ancorado em place real | smoke |
| G6 | Reviews externas ≤3 ou fallback mock | smoke |
| G7 | Copy editorial WS-09D preservada | manual / proxy |
| G8 | `qa:appointment` + `qa:events` PASS | CI/local |
| G9 | API key nunca no client bundle | audit grep |
| G10 | Zero dashboard / embed Maps | review perceptivo |

---

## GO / NO-GO — começar código

### GO ✅ (recomendado — charter)

| Condição | Estado |
|----------|--------|
| WS-14A runtime wired @ `1c92acc` | ✅ |
| Produto perceptivo congelado | ✅ @ `39c7b12` |
| Gramática WS-09/13 documentada | ✅ |
| Escopo Appointment-only definido | ✅ |
| Estratégia snapshot (não live UI) | ✅ |
| Riscos perceptivos mapeados | ✅ |

**Veredicto:** **GO para implementação WS-16A** após aprovação explícita deste charter.

**Condicionantes:**

1. Place ID pilot definido (Barba Negra real ou equivalente demo)
2. `GOOGLE_PLACES_API_KEY` disponível em ambiente server/CI
3. Etapa 5 default **zero JSX** — enrichment invisível

### NO-GO ❌ (se)

- Maps embed, hero badge, ou tabela de horários na UI
- Fetch Places no client / key exposta
- Substituir copy editorial WS-09D por dump Google
- Abrir DB, editor, IA, ou multi-vertical no mesmo PR
- Qualquer alteração composer/motion/morph

---

## Decisão estratégica adjacente (fora deste WS)

```txt
WS-16A external reality mínima  →  (este charter)
WS-09 persistência DB           →  ciclo separado, pós-16A ou paralelo isolado
WS-15 publication               →  não antecipar
```

**Ordem recomendada:** WS-16A antes de DB — ancorar realidade **sem** schema migrations; provar valor perceptivo com snapshot.

---

## Registro

| Campo | Valor |
|-------|-------|
| Charter autor | proposta @ `1c92acc` |
| Implementação | **aguardando GO explícito** |
| UI wiring | WS-14A Etapa 3 ✅ — enrichment via merge only |
| Perceptivo | Sessão B humana pendente — não bloqueia 16A técnico |

*External Reality Minimum — realidade contextual, não informação empilhada.*
