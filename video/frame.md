---
name: Asset Intelligence Copilot · Field Evidence
colors:
  bg: "#0A1222"          # deep field-navy (tinted from the product rail #14213D)
  bg-raised: "#111C33"   # panels, cards
  bg-sunken: "#070D19"   # vignette edges
  fg: "#EEF2F8"          # primary text (blue-tinted off-white, never #fff)
  fg-muted: "#9AA8C0"    # secondary text (>= 4.5:1 on bg)
  line: "#22324F"        # hairlines, grid
  accent: "#3D7BFF"      # product blue: the one accent (evidence, links, focus, producing)
  alert: "#F2A33A"       # semantic only: not producing, breach, overdue (product amber)
  ok: "#3FBF8A"          # semantic only: verified / passing checks, used sparingly
typography:
  display: { family: "Montserrat", weights: [800, 900], tracking: "-0.035em", case: "sentence" }
  body: { family: "Montserrat", weights: [400, 500, 600] }
  data: { family: "IBM Plex Mono", weights: [400, 500, 600], use: "record IDs, numbers, readings, citations, code" }
  sizes: { hero: "128-168px", headline: "72-96px", subhead: "40-48px", body: "28-32px", label: "20-24px (min 20px)", caption: "34px" }
spacing:
  safe-margin: "120px left/right, 90px top/bottom"
  grid: "12 columns, 48px gutter"
  radius: { card: "18px", chip: "999px", ui-frame: "22px" }
components:
  evidence-chip: "pill, 1px accent at 45% border, accent at 10% fill, IBM Plex Mono 22px, e.g. INS-0001-0203"
  ui-frame: "real app screenshot in a floating window: 22px radius, 1px line border, soft 60px shadow #000 at 45%, subtle 3D tilt allowed (max 8deg)"
  callout: "hairline leader from a point on the UI to a label card; dot + 1.5px line in accent; label in Montserrat 600 26px"
  caption-bar: "bottom-center, 34px Montserrat 600, fg on bg at 72% with 14px radius plate, max 2 lines, 90px from bottom"
---

## Overview

Concept angle: **"Ground truth, made visible."** The data has always been there, buried in 40,000 inspections, manuals, repair reports and notes. The film makes the evidence visible: record IDs light up, threads connect a number to its source, and a correction ripples through the system. The tone is calm, precise and engineered, like an instrument panel, not a hype reel.

## The Frame

- Dark field-navy stage with a faint 48px engineering grid (line color at 35%) and a slow-breathing accent radial glow behind the focal element.
- The focal element is always one thing: a word, a number, or one UI region. Supporting detail sits on hairlines and in mono labels.
- Real product UI appears inside the `ui-frame` component, floating with depth. Never redraw the product UI; use the captured PNGs.
- Thermal motif for the hook: a wellhead temperature readout and an air temperature readout, with the difference as the hero number.

## Motion Language

- Eases: `power3.out` for entrances, `expo.inOut` for camera moves, `back.out(1.6)` only for chip pops. Entrances run 0.4-0.7s and overlap by about 0.15s.
- Signature move: an **evidence thread**. A thin accent line draws from a claim to its source chip (SVG stroke-dashoffset), and the chip pops in. Reuse it whenever a claim is cited.
- Camera: slow push-ins (scale 1.0→1.06 over a scene) on UI frames, and one decisive zoom per demo beat to the region being discussed.
- Ambient: every scene has 2-4 decoratives (grid, glow, ghost mono IDs drifting at 5% opacity) with slow breathing or drift.
- Transitions between scenes: fast blur-crossfade (0.35s) or a hard cut on a beat. No spins or bounces.

## Composition Rules

- Keep text 20px or larger. Keep headlines short. Keep everything inside the safe margins.
- The accent is for evidence and the product. Amber appears only when something is wrong (not producing, breach, overdue).
- Numbers and IDs are always IBM Plex Mono with tabular figures (`font-variant-numeric: tabular-nums`).

## Do

- Use real numbers from the data: 51.6 °C vs 43.1 °C air, +3.2 °C vs the 15 °C T200 limit, 4.5 → 5.4 bbl, INS-0001-0203, CTX-0001-003, MNT-0151-025.
- Show citations as chips connected by evidence threads.

## Don't

- No gradient text, purple/cyan neon, glowing brains, robots or stock imagery.
- No invented UI and no invented metrics.
- Never use pure #000 or #fff.
