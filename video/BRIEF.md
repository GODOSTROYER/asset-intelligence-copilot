---
workflow: general-video
flow: automation
storyboard: no
message: "Ask your oil field anything and get the answer with its evidence attached; the model plans, code calculates."
destination: hackathon-judges
aspect: 1920x1080
language: en
audience: FlytBase AHC SWE hackathon judges (engineers evaluating agentic system design)
length: 120-135s
angle: problem-solution-proof
voice: gemini-tts-placeholder
---

## Intent

Product pitch plus a short real-UI demo for Asset Intelligence Copilot, the FlytBase AHC SWE Hackathon (17 Oct 2026) submission by Arnav Bule. It must say what problem it solves (scattered oil-field data, so wells stay down and leaks go unreported), show how an operator uses it (asks in plain English and gets an inline visual with citations), and prove why it can be trusted (the model only plans, deterministic tools calculate, corrections cascade across users with provenance, conflicts are surfaced). The user asked for it to be "absolutely impressive and amazing for the judges. Go all out", with high-end motion design, and "not too long".

## Assets

- ../asset-intelligence-copilot/docs/screenshots/*.png are real app screenshots (status card, line chart, cost bar chart, source drawer, mobile).
- assets/ui/* are fresh real-UI captures of the demo flow from the running app with isolated state (produced in this run).
- assets/vo/* is the Gemini TTS voiceover, one WAV per scene (produced in this run).

## Customizations

- Voiceover: Gemini TTS (gemini-3.8-flash-tts) as a placeholder. The user will replace it with their own voice before final submission, so each scene's VO is a separate file for an easy swap.
- Burned-in captions from the script, because judges may watch muted.
- The demo uses the real product UI (captured screenshots/element crops), animated as a reconstructed cursor and typing demo. No invented UI.

## Notes

- The challenge requires the final video to be in the entrant's own voice and to show a question running end to end in the real UI. This pitch is built so the VO can be swapped. The real-UI demo beats are real captures.
- Only claim verified facts: 18 sample scenarios answered correctly; 25/25 acceptance checks; 109/109 domain stress checks; deterministic fallback when the model is unavailable. Make no leaderboard or final-dataset claims.
- Avoid stock-AI clichés: no purple-cyan gradients and no glowing brain icons.
