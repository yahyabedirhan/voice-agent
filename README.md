# Voice Agent Platform

A demo platform for browser-based, task-oriented voice agents. Users choose an
agent from a small catalog and have an anonymous, voice-first conversation.

The project is inspired by the operating model of vertical AI-agent companies.
Its initial scope is intentionally narrow: learn how managed voice agents fit
into a product architecture and validate the platform with two substantially
different agents.

Unless a document says otherwise, the requirements and architecture in this
repository describe Version 1.

## Initial agents

- Drive-through ordering agent
- House-painting service agent

These are independent agents. The platform does not introduce shared agent
types, inheritance, or a generic agent builder.

## Product boundary

- Users do not sign in.
- The React application retrieves enabled agent metadata from FastAPI.
- A session starts after the user selects an agent and grants microphone access.
- Users and agents can both end a conversation.
- The post-call screen only reports that the session ended.
- ElevenLabs owns realtime voice transport and provider-side transcripts.
- FastAPI controls which private ElevenLabs agents may start new sessions.
- Supabase stores application session metadata and business events, not audio or
  transcripts.
- No custom administrator interface is included.

## Accepted decisions

- [ADR 0001: Use ElevenLabs as the managed voice runtime](docs/decisions/0001-use-elevenlabs-managed-voice-runtime.md)
- [ADR 0002: Gate private ElevenLabs sessions through FastAPI](docs/decisions/0002-gate-private-elevenlabs-sessions-through-fastapi.md)

## Design checkpoint

- [Product requirements](docs/requirements/v1-product-requirements.md)
- [Platform architecture and session lifecycle](docs/architecture/v1-platform-foundation.md)

## Active research

- [ElevenLabs agent configuration and ownership boundary](docs/research/elevenlabs-agent-configuration-boundary.md)

## Planned stack

- React for the user-facing web application
- Python with FastAPI for the application control plane
- Supabase/PostgreSQL for application-owned records
- ElevenLabs Agents for managed realtime voice infrastructure

No application code has been scaffolded. The project remains in design and
decision recording.
