# Technology Stack

- Status: Current decision
- Date: 2026-08-12
- Scope: Version 1

This document maps the logical components in the requirements and architecture
documents to their selected implementation technologies. Architectural
documents use logical names so their responsibilities do not depend on a
particular framework.

| Logical component | Selected technology | Purpose |
| --- | --- | --- |
| Client-side | React with Vite | Browser UI, microphone permission, call controls, and ElevenLabs client integration |
| Backend | Python with FastAPI | Agent catalog, session admission, provider credentials, lifecycle handling, and future business-tool boundaries |
| Database | Supabase-hosted PostgreSQL | Application session metadata and business events |
| ElevenLabs | ElevenLabs Agents | Realtime voice transport, speech recognition, agent runtime, speech synthesis, transcripts, and provider history |

## Terminology rule

Requirements, platform diagrams, lifecycle descriptions, and component
responsibilities use logical component names:

- Client-side
- Backend
- Database
- ElevenLabs

Technology names appear when a statement is specifically about implementation,
configuration, SDK behavior, deployment, or a technology decision. ADRs and
technology research may therefore mention both the logical role and the chosen
technology.

## Current implementation choices

### Client-side: React with Vite

React is the selected UI library and Vite is the application build and
development tool. The application will use the ElevenLabs React client library
for browser voice sessions.

### Backend: Python with FastAPI

Python matches the learning goals for this project. FastAPI provides the HTTP
API boundary for the catalog, session admission, lifecycle reconciliation, and
future business integrations.

### Database: Supabase-hosted PostgreSQL

PostgreSQL stores application-owned records. Supabase provides the hosted
database and its administration surface. Supabase is not the source of truth
for the code-defined agent catalog or ElevenLabs transcripts.

### ElevenLabs: ElevenLabs Agents

ElevenLabs is both a selected technology and an external system boundary. It is
named directly in architecture documents where the design relies on its
provider-specific responsibilities, identifiers, tokens, dashboards, or
webhooks.

## Deployment choices

Deployment remains undecided. Candidate hosting platforms do not change the
logical component boundaries described above.
