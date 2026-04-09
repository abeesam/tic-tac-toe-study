# Tic-Tac-Toe Study — F20PA Dissertation Project

This repository contains the source code for a controlled usability study comparing two interface versions of a mobile-friendly web-based Tic-Tac-Toe game. The study was conducted as part of the F20PA dissertation at Heriot-Watt University.

## Project Overview

Two versions of the same game were developed, identical in game logic but different in UI/UX quality:

- **Version A (High-Fidelity UI/UX):** Clear visual hierarchy, structured layout, explicit feedback cues, turn indicators, and consistent spacing.
- **Version B (Reduced-Fidelity UI/UX):** Intentionally reduced layout structure and feedback, serving as a controlled baseline.

Participants played both versions on their own mobile devices and completed a System Usability Scale (SUS) and Game Experience Questionnaire (GEQ) after each version.

## Repository Structure

```
/
├── good/               # Version A — High-Fidelity UI/UX
│   ├── index.html
│   ├── style.css
│   └── script.js
├── bad/                # Version B — Reduced-Fidelity UI/UX
│   ├── index.html
│   ├── style.css
│   └── script.js
└── index.html          # Study landing page (directs participants to both versions)
```

## Live Deployment

The study is hosted via Cloudflare Pages:

https://tic-tac-toe-study.pages.dev/

## Project Management

All project management materials (weekly logbook, planning documents, evaluation evidence, and dissertation drafts) are maintained in the OneDrive project management folder shared with the supervisor:

Project Management - log Book - Semester 2 - Abdelgadir Mohamed

## Development Note

The game was developed locally in Visual Studio Code. GitHub was used primarily for hosting and deployment via Cloudflare Pages rather than as an active commit log during development, which is why the commit history is limited.

## Author

Abdelgadir Mohamed — H00397428 — Heriot-Watt University, 2026
