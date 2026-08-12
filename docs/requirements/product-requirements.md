# Product Requirements

- Status: Approved checkpoint
- Date: 2026-08-12
- Scope: Version 1

This document records the product requirements agreed so far. Detailed agent
behavior and tool architecture are a separate, subsequent design phase.
All requirements, exclusions, and success criteria below apply to the stated
scope unless a section explicitly says otherwise.

## Goal

Build a small platform where anonymous users select a specialized agent and
complete a task through a browser-based voice conversation. Validate the
platform boundary with two agents whose workflows and capabilities differ
substantially.

## Required agents

The release must include at least two fully functional, independently defined
agents:

1. A drive-through ordering agent.
2. A house-painting service agent.

Each agent is a flat entry in the catalog. Even when agents share concepts, the
design will not introduce agent types, inheritance, or reusable domain
workflows.
Shared behavior may be extracted later only after concrete duplication makes
the correct abstraction visible.

The detailed prompts, knowledge, tools, structured outcomes, and completion
criteria for both agents are intentionally outside this platform-foundation
checkpoint. They will be designed after the overall architecture is approved.

## User requirements

- Users can view a catalog of enabled agents.
- Users can select one agent and begin a voice conversation.
- No account or sign-in is required.
- The browser asks for microphone permission before starting a call.
- After permission is granted, the experience is voice-first; there is no
  pre-call intake form.
- During a call, the interface communicates connection state and whether the
  agent is listening or speaking.
- The interface provides mute or unmute and end-session controls.
- The user may end a session at any time.
- The agent may end a session after it determines the conversation is complete.
- After a call, the UI only indicates that the session ended. It does not show a
  transcript, task summary, or agent-specific result.

## Agent capability requirements

- Each agent can have its own instructions, knowledge, tools, and completion
  behavior.
- An agent can retrieve additional information during a conversation.
- An agent can call tools that perform actions or trigger other services.
- Tool results can influence the next conversational step.
- Agents can communicate actual tool outcomes, including success or failure.
- The exact tool transport, execution environment, schemas, persistence, and
  external integrations are deferred to the agent/tool design phase.

## Administrator and developer requirements

- A custom administrator interface is not required.
- Developers can enable or disable catalog agents in Backend.
- Developers inspect transcripts and conversation history in ElevenLabs.
- Developers inspect application sessions and business events in Database.
- Disabling an agent blocks new sessions only; calls already in progress
  continue normally.
- The system retains enough provider and application identifiers to correlate
  an application session with its ElevenLabs conversation.

## Data requirements

### ElevenLabs owns

- Provider conversation history
- Transcripts
- Provider-side analysis and operational metadata
- Any provider-retained audio, governed by configured ElevenLabs retention
  settings

### The application owns

- Anonymous application session ID
- Selected stable application agent ID
- ElevenLabs conversation ID after connection
- Session timestamps and lifecycle status
- Application-specific business events and structured outcomes produced by
  agent capabilities

The application does not copy transcripts or audio into Database. A post-call
webhook may contain transcript data in transit, but the application extracts
only required identifiers and metadata and does not persist that transcript.

## Out of scope

- User accounts and authentication
- Telephone-number calling
- Email, WhatsApp, CRM, and payment workflows
- A custom admin panel
- A visual or generic agent builder
- User-facing transcripts or call summaries
- Application-owned audio storage
- Application-owned transcript storage
- Production-scale infrastructure
- Automatically terminating active calls when an agent is disabled
- Premature-hang-up safeguards beyond the basic user and agent end controls
- Concrete third-party fulfillment, POS, or appointment integrations until the
  corresponding agent capability is designed

## Success criteria

- Both agents appear as independent catalog entries.
- An anonymous user can start and end a browser voice session with either
  enabled agent.
- Backend can prevent new sessions for a disabled agent.
- Voice media does not pass through Backend.
- Each completed connection can be correlated between the application and
  ElevenLabs.
- ElevenLabs provides the transcript inspection surface.
- Database retains session metadata and any application-owned business events
  without storing transcripts or audio.
