# HelixA Product Context

## One-Liner

HelixA is a women-focused biohacking app that turns cycle phase, HRV, sleep, and recovery inputs into a daily optimization score and practical guidance.

## Audience

Primary users are women who want a simple, high-trust way to understand how their hormonal cycle and recovery signals should affect training, work intensity, nutrition, and rest.

## Core Promise

HelixA should answer: "What state is my body in today, and what should I do differently because of it?"

## MVP Experience

The first useful version should have:

- Onboarding that captures cycle basics and user preferences.
- A main daily score view with a clear 0-100 readiness/optimization score.
- Cycle phase context.
- HRV and sleep inputs.
- Daily guidance text.
- Settings/profile area.
- Beta signup and lead capture.

## Planned Score Logic

The planned `calculate-score` flow:

1. Read the user's cycle phase.
2. Read HRV and sleep/recovery data.
3. Compute a 0-100 optimization score.
4. Call Claude API for daily guidance text.
5. Store or return the score and guidance for the frontend.

## Product Positioning

HelixA should feel calm, premium, trustworthy, and health-aware. Avoid exaggerated medical claims. Use language that supports user agency and encourages listening to the body.

## Out Of Scope For MVP

- HealthKit integration.
- Oura integration.
- Complex wearable sync.
- Advanced clinician dashboards.
- Social/community features.

HealthKit and Oura are planned for v1.1.

