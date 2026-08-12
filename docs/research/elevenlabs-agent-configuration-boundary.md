# ElevenLabs Agent Configuration and Ownership Boundary

- Status: Active research
- Date: 2026-08-12

## Short answer

ElevenLabs agents can be created and managed in the dashboard, through its API
and SDKs, or as version-controlled configuration through the ElevenLabs CLI.
The dashboard is not a hard limitation; it is one editing surface over the same
managed agent configuration.

For this project, the recommended workflow is dashboard-first for discovery,
then configuration-as-code once the first agent behaves correctly.

## What defines an ElevenLabs agent

An agent configuration can include:

- name and language;
- system prompt and first spoken message;
- LLM provider, model, temperature, and token limits;
- voice and speech settings;
- turn-taking, interruption, timeout, and conversation limits;
- system, client, webhook, and MCP tools;
- knowledge-base documents and RAG settings;
- dynamic variables and allowed per-conversation overrides;
- workflows, specialist nodes, conditions, and transfers;
- authentication and permitted origins;
- evaluation criteria, extracted data, and tests;
- deployment environment and environment-specific values.

ElevenLabs runs this configuration using four managed runtime components:
speech recognition, the selected LLM, speech synthesis, and its turn-taking
model.

## Configuration surfaces

### Dashboard

Best for initial exploration and manual iteration:

- write and test the prompt;
- choose the LLM and voice;
- tune conversational behavior;
- attach a knowledge base;
- define tools and workflows visually;
- test with a live microphone;
- inspect conversation history and analytics;
- define success evaluations and data extraction;
- create simulation, next-reply, and tool-call tests;
- configure security, secrets, and provider retention.

The dashboard is the easiest place to learn the ElevenLabs mental model and
build the first working task-oriented agent.

### CLI and repository configuration

Best for repeatability and review. The ElevenLabs CLI can initialize a local
agent project, pull remote agents, store agent/tool/test configuration as JSON,
preview changes, and push configuration to ElevenLabs.

A CLI-managed structure includes registries and separate configuration files:

```text
agents.json
tools.json
tests.json
agent_configs/
tool_configs/
test_configs/
```

This makes prompts, model choices, tool schemas, and tests reviewable in Git and
deployable through CI. It also introduces a source-of-truth question: dashboard
edits must be pulled before local changes are pushed, or they may be overwritten.

### API and SDKs

Best for automation and product-driven configuration:

- create or update agents programmatically;
- request protected WebRTC conversation tokens;
- select branches or deployment environments;
- pass dynamic variables at session start;
- apply explicitly permitted per-conversation overrides;
- retrieve conversations and traces;
- run tests and simulations;
- integrate configuration deployment into CI/CD.

The API means we are not restricted to workflows exposed by the dashboard UI.

### Per-conversation configuration

Use dynamic variables for values such as a user's name, selected equipment
model, service region, or account tier. ElevenLabs recommends this structured
approach for routine personalization.

Overrides can replace the prompt, first message, language, LLM, tools, knowledge
base, or voice for one conversation. They are disabled by default and must be
enabled field by field. Because overrides can replace the agent's core behavior,
they should be used sparingly and never accepted directly from untrusted browser
input.

## Recommended boundary for this project

### ElevenLabs owns

- realtime browser voice transport;
- STT, LLM, TTS, and turn-taking coordination;
- the executable agent prompt and voice configuration;
- attached knowledge and provider-level tools;
- managed conversation history, testing, analysis, and trace export.

### Our application owns

- the flat public catalog of independently configured agents;
- stable internal agent IDs and their ElevenLabs ID mapping;
- access control and conversation authorization;
- the user-facing interface;
- durable application sessions and business events;
- domain APIs and business rules behind tools;
- privacy, retention, auditing, and application-level observability.

The application should not duplicate realtime audio orchestration. ElevenLabs
should not become the only database for product identity, authorization, or
business records.

## Recommended configuration workflow

1. Build the first narrow agent in the ElevenLabs dashboard.
2. Test it manually and define a small behavioral test suite.
3. Decide the configuration source-of-truth workflow after the two agent
   designs make the required configuration surface concrete.
4. Use dynamic variables for session-specific context.
5. Keep domain actions behind controlled application boundaries.
6. Use the API for private-agent runtime conversation tokens.

We should not run `elevenlabs agents init` until both agent designs and their
minimum behavior are selected; otherwise the generated configuration would
encode decisions that have not yet been made.

## Open decisions

- What are the detailed flows for the drive-through and house-painting agents?
- Which tools and knowledge does each independent agent require?
- Which OpenAI model should ElevenLabs invoke initially?
- What knowledge is safe and sufficient for each agent?
- Which situations require refusal or escalation rather than instructions?
- Which evaluation criteria define a successful conversation?
- What provider-side transcript and audio retention settings meet the product's
  privacy expectations?

## Learning agenda

Investigate these ElevenLabs components in order:

1. Agent prompt, first message, voice, and LLM configuration.
2. React SDK session lifecycle and protected WebRTC tokens.
3. Turn-taking, interruptions, timeouts, and safety boundaries.
4. Dynamic variables versus overrides.
5. Knowledge bases and RAG.
6. Webhook and client tools.
7. Conversation history and signed post-call webhooks.
8. Success evaluation, data extraction, and automated agent tests.
9. CLI pull/push workflow and configuration drift.
10. OpenTelemetry export and optional Langfuse integration.

## References

- https://elevenlabs.io/docs/eleven-agents/overview
- https://elevenlabs.io/docs/eleven-agents/quickstart
- https://elevenlabs.io/docs/eleven-agents/operate/cli
- https://elevenlabs.io/docs/eleven-agents/customization/personalization
- https://elevenlabs.io/docs/eleven-agents/customization/personalization/overrides
- https://elevenlabs.io/docs/eleven-agents/customization/agent-testing
- https://elevenlabs.io/docs/eleven-agents/integrate/environment-variables
