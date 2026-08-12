# ADR 0001: Use ElevenLabs as the Managed Voice Runtime

- Status: Accepted
- Date: 2026-08-12
- Scope: Version 1

## Context

The project needs a browser-based platform for multiple task-oriented voice
agents. A user selects an agent and completes a domain-specific task through a
voice-first conversation. Developers need provider-side transcripts and enough
application metadata to correlate conversations and business events. Our
application does not need to retain audio or transcripts.

The project is a demo and learning exercise. Simplicity and speed of delivery
matter more than scale or owning every layer of the voice stack.

We compared three approaches:

1. OpenAI Realtime with a direct browser WebRTC integration.
2. ElevenLabs Agents as a managed voice-agent platform.
3. A custom speech-to-text, LLM, and text-to-speech pipeline managed by Python.

## Decision

Use ElevenLabs Agents as the managed voice runtime.

The browser will connect to ElevenLabs using its React SDK and WebRTC support.
FastAPI will act as the application control plane: it will expose the enabled
catalog, select the configured private agent, issue protected conversation
credentials, receive post-conversation webhooks, and persist application
records.

The agent catalog will be code-defined in FastAPI. Supabase/PostgreSQL
will store application session metadata and business events. ElevenLabs will be
the source of truth for provider-side conversation history and transcripts,
subject to retention settings that must be reviewed before deployment.

## Why

ElevenLabs provides the infrastructure that is expensive and time-consuming to
build correctly:

- browser microphone capture and realtime WebRTC transport;
- speech-to-text;
- low-latency text-to-speech and voice selection;
- turn detection, conversational timing, and interruption handling;
- LLM selection and invocation;
- agent configuration, prompts, knowledge bases, and tools;
- conversation history and transcripts;
- post-conversation analysis and evaluation;
- testing, analytics, and OpenTelemetry trace export.

Purchasing a managed service lets us spend time on product and domain behavior:
selecting an agent, defining two different task-oriented
conversations, connecting business capabilities, and learning how voice agents
are configured and evaluated.

## What we do not need to build

- A browser-to-FastAPI audio streaming protocol.
- A FastAPI-to-model realtime audio connection.
- WebRTC signaling and media transport.
- Audio codecs, buffering, playback, and jitter handling.
- Voice activity detection and end-of-turn detection.
- Barge-in and interruption coordination.
- A streaming speech-to-text service.
- A streaming text-to-speech service.
- Coordination between STT, LLM, and TTS stages.
- A provider-specific realtime event state machine.
- A basic provider dashboard for call history and transcripts.
- A first implementation of conversation simulation and outcome evaluation.

Avoiding these components is the main value purchased from ElevenLabs.

## What remains our responsibility

- The product experience and code-defined agent catalog.
- Admission control for anonymous voice sessions.
- Deciding which agent a user may start.
- Prompt, safety, escalation, and domain-knowledge quality.
- FastAPI endpoints for protected conversation credentials.
- Webhook authentication, idempotency, and error handling.
- The application-owned session and business-event model.
- Business tools and integrations exposed through FastAPI.
- Privacy disclosures and retention configuration.
- Tests for product logic and critical agent behavior.
- Deployment, monitoring, and cost controls for our own services.

## Trade-offs and consequences

### Benefits

- Faster path to a polished voice experience.
- Less realtime and audio infrastructure to operate.
- Strong voice selection and configurable conversational behavior.
- Built-in history, analysis, testing, and observability surfaces.
- The LLM can still be selected or replaced without rebuilding the audio layer.
- FastAPI remains useful for business logic without carrying realtime audio.

### Costs and limitations

- Recurring platform cost plus separately metered LLM usage.
- Vendor lock-in to ElevenLabs agent configuration, event formats, and runtime.
- Less hands-on learning about low-level realtime audio infrastructure.
- Some configuration can drift between the dashboard and repository unless we
  establish a clear source-of-truth workflow.
- Provider-side storage and retention must be configured even though our
  application does not store audio.
- Platform outages or behavioral changes affect the voice experience directly.

## Reversibility

Keep our application boundary provider-neutral:

- Store our own stable agent IDs and map them to ElevenLabs agent IDs.
- Persist normalized application sessions and business events rather than
  exposing raw ElevenLabs payloads throughout the application.
- Put business actions behind FastAPI APIs instead of provider-only logic.
- Isolate conversation creation and webhook translation behind a voice-provider
  adapter.

This will allow a later OpenAI Realtime adapter or custom voice pipeline without
rewriting the user and administrator applications.

## Pricing assumption

The current ElevenAgents Creator tier is suitable for development, but its call
minutes and LLM charges must be treated separately from the general ElevenLabs
Creator credit pool. Pricing is an operating assumption, not an architectural
guarantee, and should be checked again before deployment.

## References

- https://elevenlabs.io/docs/eleven-agents/overview
- https://elevenlabs.io/docs/eleven-agents/libraries/react
- https://elevenlabs.io/docs/eleven-agents/customization/agent-analysis
- https://elevenlabs.io/docs/eleven-agents/customization/opentelemetry-traces
- https://elevenlabs.io/pricing/agents
