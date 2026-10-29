# Engineer script (human, ~50 minutes)

**Host:** https://eos-pilot.rtbea.com.au  
**Account:** your invited engineer identity (member + EOS seat). Do not use the founder account.  
**Working project:** UAT2-245013 / Gold Coast if listed, or the project your PM names. Ignore WSB-1RC as customer work.  
**Timebox:** stop at 50 minutes; file issues rather than exploring other products.

Use [06-observation-form.md](./06-observation-form.md) as you go. Capture AI answers on [15-ai-trust-evidence.md](./15-ai-trust-evidence.md) and documents on [16-document-usability-evidence.md](./16-document-usability-evidence.md). After the script, answer [07-value-validation.md](./07-value-validation.md).

RTB must not operate the UI for you.

## Auth

| Step | Task | Pass if |
|---|---|---|
| E1 | Open `/login`, password **Sign In** (not SSO) | Command Centre; no seat-gate |
| E2 | Sign out | `/login` |
| E3 | Sign in again | Command Centre again |
| E4 | Confirm tenant / workspace | RTB Engineering / LAUNCH-1 only |

## Project and records

| Step | Task | Pass if |
|---|---|---|
| E5 | Open Projects, open the named project, set header **Project** | Workspace opens (wait if loading persists) |
| E6 | Create or update permitted project information | Saved; reappears on reload |
| E7 | Create a risk | Listed on this project |
| E8 | Create a technical query; respond if permitted | TQ listed; response visible |
| E9 | Create an action | Listed on this project |
| E10 | Open or create an asset | Asset opens; project context matches |

## Documents

| Step | Task | Pass if |
|---|---|---|
| E11 | Register / upload an engineering document (PDF or TXT, under 25 MB) | Source file stores; MIME/size shown; reopen/download works |
| E12 | Review extracted metadata (title, document number, revision, type, review state, number source) | Filename fallback is distinguishable from a confirmed number |
| E13 | Correct metadata if the proposal is wrong | Proposal saves; values match what you typed |
| E14 | Confirm metadata | Review state **confirmed**; canonical number/revision are what you accepted |
| E15 | Observe ingestion / AI-searchable state | State is understandable (processing / ready / partial / failed) without operator translation |
| E16 | If a duplicate warning appears, record it | Duplicate is blocked or explained; do not force a second identity |

## Engineering AI

Known limitation (do not treat as certified): hybrid retrieval and citation deduplication are **not** certified. Extra citations may appear.

| Step | Task | Pass if |
|---|---|---|
| E17 | Ask a **document-specific** question on your authorised document | Generated or clearly degraded with evidence kept. Advisory only |
| E18 | Inspect citations (page, clause/section/figure) | You can say whether they match the answer |
| E19 | Open / verify the source evidence | You can reach the source or say you could not |
| E20 | Ask a question the source cannot support | Abstains; no invented client claim |
| E21 | Use **Current Project** Engineering AI | Answer stays in this project/tenant |
| E22 | View a project report | Page is usable; not a dead end |

## Close

Sign out. Do not invite anyone. Do not use Production. Do not install other products.

## Out of scope

Inspection Intelligence, Digital Twin, Model Interoperability, billing, extra seats.
