# ADR 0002: Gate Private ElevenLabs Sessions Through the Backend

- Status: Accepted
- Date: 2026-08-12
- Scope: Version 1

## Context

The web application is anonymous, but ElevenLabs usage consumes limited paid
minutes. If agents are public, a browser can start them directly with an agent
ID and bypass application-level controls. The platform also needs a quick way
to allow or block new sessions for an individual agent.

## Decision

Deploy both ElevenLabs agents as private agents. Backend will be the
admission-control layer for every new voice session.

Backend will own a flat, code-defined registry containing each stable
application agent ID, public catalog metadata, enabled state, and private
ElevenLabs agent mapping.

Client-side will retrieve enabled public metadata through `GET /agents`. To
prepare a call, it will send the selected stable agent ID to the conceptual
`POST /sessions` endpoint. Backend will validate the enabled state, create an
anonymous application session, request a short-lived ElevenLabs conversation
token, and return that token to Client-side.

Client-side then connects directly to ElevenLabs. Backend does not proxy audio.

## Consequences

### Benefits

- The ElevenLabs API key remains server-side.
- Users cannot connect using the public catalog response alone.
- An agent can be removed from the catalog and blocked from new sessions with a
  code-level enabled switch.
- Future rate limiting, CAPTCHA, maintenance mode, or other admission controls
  have a clear enforcement point in the Backend.
- The application creates its own session before paid provider usage begins.

### Costs and limitations

- Starting a call requires an extra request to Backend.
- Token issuance adds another external request and possible failure mode.
- Anonymous access means the token endpoint still needs abuse protection if the
  demo is exposed broadly.
- Disabling an agent prevents new sessions but does not terminate calls already
  in progress.

## Alternatives considered

### Public ElevenLabs agents

Client-side could start a session directly with an ElevenLabs agent ID. This is
simpler, but it permits callers to bypass Backend and removes the application's
quick admission-control switch.

### Proxy realtime audio through the Backend

This would provide deeper control but would reintroduce realtime transport,
buffering, scaling, and latency concerns that selecting ElevenLabs was intended
to avoid.

## References

- https://elevenlabs.io/docs/eleven-agents/libraries/react
- https://elevenlabs.io/docs/eleven-agents/libraries/java-script
