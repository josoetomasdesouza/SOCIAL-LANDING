# WS-16A — External Reality Minimum: Appointment First

**Baseline produto perceptivo:** `1c92acc` (inalterado)  
**Baseline técnico WS-16A:** `origin/main` @ `d9c4f3e`  
**Pré-requisito:** WS-14A Etapas 1–3 ✅ — Appointment runtime-backed  
**Classificação:** camada externa mínima / densidade operacional — **não** feature de produto  
**Status:** ✅ **WS-16A concluído (Etapas 0–6)** — overlay **default OFF** · promoção perceptiva **não autorizada**  
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
- [x] GO humano explícito para código

### Etapa 1 — Types + snapshot schema ✅ @ `8d71c48`

- [x] `ExternalRealitySnapshot`, `RuntimeExternalMeta`
- [x] Validators; zero fetch

### Etapa 2 — Google Places client (server-only) ✅ @ `e8cf4eb`

- [x] Place Details API (fields mínimos)
- [x] Env: `GOOGLE_PLACES_API_KEY`, `APPOINTMENT_EXTERNAL_PLACE_ID`

### Etapa 3 — Normalize + merge ✅ @ `5ef3fda`

- [x] `mergeExternalRealityIntoBundle()`
- [x] Regras: editorial prevalece; derivar `liveState` / `hoursHint`

### Etapa 4 — Sync CLI + cache file ✅ @ `ff15b93`

- [x] `pnpm runtime:appointment:sync-external`
- [x] Fallback: merge noop sem key

### Etapa 5 — Load path integration ✅ @ `d9c4f3e`

- [x] `loadAppointmentRuntimeFromRuntimeStore()` aplica overlay se presente
- [x] `meta.external.status` = live | fallback | stale
- [x] Zero JSX

### Etapa 6 — Gates perceptivos + consolidação operacional ✅

- Gates técnicos verdes (typecheck, qa:appointment-runtime, qa:appointment, qa:events)
- Build runtime + overlay (`pnpm qa:appointment-runtime-overlay-build`)
- Checklist perceptivo proxy registrado (§Checklist perceptivo Etapa 6)
- Documentação operacional (§Runbook operacional)
- **Decisão:** manter overlay **opt-in** — sem default-on

### Etapa 7 — Documentação operacional

- [x] Absorvida na Etapa 6 (runbook + gate de saída abaixo)

**Estimativa original:** 2 PRs — concluído em 6 etapas incrementais @ `d9c4f3e`.

---

## Gate de saída WS-16A

| # | Critério | Verificação | Etapa 6 |
|---|----------|-------------|---------|
| G1 | Snapshot externo normalizado | schema validate | ✅ smoke |
| G2 | Merge alimenta bundle sem UI nova | zero JSX diff default | ✅ grep / parity |
| G3 | Fallback sem API key | seed idêntico em projeção default | ✅ sync parity |
| G4 | `operational.liveState` derivado quando live | merge smoke | ✅ merge parity |
| G5 | `arrival.mapsQuery` ancorado em place real | merge smoke | ✅ merge parity |
| G6 | Reviews externas ≤3 ou fallback mock | cap + gate editorial | ✅ merge/sync parity |
| G7 | Copy editorial WS-09D preservada | `placeHint`, `drawerTitle`, hints | ✅ overlay parity |
| G8 | `qa:appointment` + `qa:events` PASS | CI/local | ✅ 8/8 |
| G9 | API key nunca no client bundle | audit grep | ✅ server/scripts only |
| G10 | Zero dashboard / embed Maps | review perceptivo | ✅ proxy GO (§Checklist) |

---

## Runbook operacional

### Variáveis de ambiente

| Variável | Onde | Default | Função |
|----------|------|---------|--------|
| `GOOGLE_PLACES_API_KEY` | server / sync CLI | — | Fetch Place Details (nunca client) |
| `APPOINTMENT_EXTERNAL_PLACE_ID` | server / sync CLI | — | Place ID pilot (Barba Negra) |
| `NEXT_PUBLIC_APPOINTMENT_RUNTIME` | build/runtime | `mock` | `runtime` = seed JSON |
| `NEXT_PUBLIC_APPOINTMENT_EXTERNAL_REALITY` | build/runtime | **OFF** | `1` ou `true` = overlay opt-in |

### Place ID pilot

- Configurar `APPOINTMENT_EXTERNAL_PLACE_ID` com Place ID real do estabelecimento pilot
- Dev/smoke sem key: `pnpm runtime:appointment:sync-external -- --fixture`
- Place ID fixture smoke: `ChIJ-fixture-barba-negra`

### Sync workflow

```bash
# 1. Materializar snapshot (server-only)
GOOGLE_PLACES_API_KEY=... APPOINTMENT_EXTERNAL_PLACE_ID=... \
  pnpm runtime:appointment:sync-external

# 2. Inspecionar merge sem alterar seed (opcional)
pnpm runtime:appointment:sync-external -- --merge-preview

# 3. Validar gates
pnpm qa:appointment-runtime
pnpm qa:appointment-runtime-overlay-build
```

**Artefatos gerados** (gitignored por default):

| Arquivo | Conteúdo |
|---------|----------|
| `data/runtime/appointment/external/{slug}.snapshot.json` | `ExternalRealitySnapshot` |
| `data/runtime/appointment/external/{slug}.sync-report.json` | status/reason/syncedAt |
| `data/runtime/appointment/external/{slug}.merged-preview.json` | bundle enriquecido (inspeção) |

### Overlay no load path

Overlay aplica **somente** quando **todas** as condições:

1. `NEXT_PUBLIC_APPOINTMENT_EXTERNAL_REALITY=1`
2. Server-side (SSR/build — não browser bundle)
3. Snapshot cache válido
4. `sync-report.json` com `status: live`
5. Snapshot não stale (< 7 dias desde `fetchedAt`)

Implementação: `loadAppointmentRuntimeFromRuntimeStore()` → `apply-runtime-overlay.server.ts`

### Fallback behavior

| Condição | Efeito |
|----------|--------|
| Env overlay OFF | Seed v1 intacto — **comportamento produto default** |
| Sem snapshot | noop total |
| Snapshot inválido | noop total |
| Sync report `fallback` | noop campos; `meta.external.status=fallback` |
| Snapshot stale (>7d) | noop campos; `meta.external.status=stale` |
| API/sync fail | noop; report registra reason |
| Erro runtime | noop silencioso → seed |

### Rollback

```txt
1. Remover NEXT_PUBLIC_APPOINTMENT_EXTERNAL_REALITY (ou ≠ 1)
2. Rebuild / restart
3. Opcional: apagar data/runtime/appointment/external/*.snapshot.json
→ runtime volta ao seed barba-negra.v1.json sem diff perceptivo
```

### Quando usar overlay

- Piloto operacional com Place ID real validado
- Snapshot `live` recente via sync
- Revisão perceptiva aprovada (hero/chegada/reviews permanecem gramática)
- Ambiente staging/demo controlado — **não** produção default

### Quando NÃO usar overlay

- Sem Sessão B / gate perceptivo humano
- Snapshot stale ou sync report `fallback`
- Qualquer sensação de ficha Google / dashboard / painel reviews
- Antes de validar copy editorial WS-09D preservada
- Como default-on em produção (**proibido neste ciclo**)

---

## Checklist perceptivo — Etapa 6

**Data:** 2026-06-01 · **Baseline:** `d9c4f3e` · **Modo default:** overlay OFF  
**Facilitador:** gates automatizados + proxy Playwright (`qa:events`, `qa:appointment`)

### Pergunta gate

```txt
external reality está reforçando presença contextual
ou começando a transformar a experiência em informação operacional?
```

**Resposta proxy Etapa 6:** reforça presença contextual **somente via enrichment invisível** — default OFF garante zero mudança perceptiva em produção.

| Superfície | Verificação | Proxy Etapa 6 | Humano |
|------------|-------------|---------------|--------|
| Hero | `placeHint` editorial preservado (`"na Augusta"`) | ✅ overlay parity | ☐ pendente |
| Hero | Sem badge rating / ficha Google | ✅ zero JSX | ☐ pendente |
| Chegada | `drawerTitle` WS-09D (`"Chegar na Augusta"`) | ✅ overlay parity | ☐ pendente |
| Chegada | `referenceHint` / `routeHint` / `parkingHint` intactos | ✅ merge rules | ☐ pendente |
| Chegada | Maps = fallback link, não embed | ✅ AR-02; no embed | ☐ pendente |
| Reviews | ≤3; tom editorial; sem feed infinito | ✅ cap + gate | ☐ pendente |
| Composer | Sem regressão smoke-fume / events | ✅ qa:events 8/8 | ☐ pendente |
| Feed continuity | morph/drawer/events intactos | ✅ qa:events 8/8 | ☐ pendente |

**Veredicto proxy:** ✅ GO técnico-perceptivo condicional — **manter opt-in**  
**Veredicto humano:** ☐ pendente (Sessão B) antes de qualquer promoção default-on

---

## Decisão WS-16A — pós Etapa 6

| Opção | Decisão |
|-------|---------|
| **Manter opt-in (default OFF)** | ✅ **Adotado** @ `d9c4f3e` |
| Promover overlay default-on | ❌ **Não autorizado** — requer Sessão B + gate humano |
| Bloquear overlay | ❌ Não — pipeline operacional válido para pilot controlado |

**Recomendação:** external reality permanece **infraestrutura silenciosa**. Próximo passo opcional: pilot real com Place ID + sessão humana WS-13/16A — **não** antecipar WS-09/15/17/18.

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
| Implementação | ✅ Etapas 1–6 @ `d9c4f3e` |
| UI wiring | WS-14A Etapa 3 ✅ — enrichment via merge only |
| Overlay | opt-in @ `d9c4f3e` — **default OFF** |
| Perceptivo | Proxy GO condicional · Sessão B humana pendente |
| Decisão | **Manter opt-in** — sem default-on |

*External Reality Minimum — realidade contextual, não informação empilhada.*
