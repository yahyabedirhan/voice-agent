# Field Service Voice Agent

A demo platform for browser-based customer-support voice agents across multiple
field-service domains.

The first version prioritizes learning how a voice-agent product is assembled
and shipping a useful end-to-end experience quickly. It does not attempt to
rebuild realtime speech infrastructure.

## Current product boundary

- A user selects a field-service agent and starts a browser voice session.
- The agent asks diagnostic questions and provides safe, actionable guidance.
- Completed conversations are transcribed for administrators.
- End users do not receive a transcript view in v1.
- Audio is not retained by our application.
- Telephone calls, email, WhatsApp, bookings, payments, and CRM automation are
  out of scope.

## Accepted decisions

- [ADR 0001: Use ElevenLabs as the managed voice runtime](docs/decisions/0001-use-elevenlabs-managed-voice-runtime.md)

## Active research

- [ElevenLabs agent configuration and ownership boundary](docs/research/elevenlabs-agent-configuration-boundary.md)

## Planned application stack

- React user and administrator interfaces
- Python with FastAPI for the application control plane
- Supabase/PostgreSQL for application-owned records
- ElevenLabs Agents for realtime voice infrastructure

No application code has been scaffolded yet. The project is currently in the
design and decision-recording phase.
