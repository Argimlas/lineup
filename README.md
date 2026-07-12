# Lineup

A browser-based festival schedule planner. Import a lineup, mark your interest in each act, and view all stages as a horizontal timeline.

## Usage

### Festivals

Use the tabs next to the title (a dropdown on mobile) to switch between up to 4 festivals. On load, the festival currently running is selected automatically, or the next upcoming one if none are running. Each festival keeps its own lineup, interest picks, and seen marks. Click **+** next to the picker to add another (up to 4 total); remove one from the **Import/Edit** section (see below).

### Import

Open the **Import/Edit** section. To try it out without your own data, click one of the **Lineup presets** (capped to 4, sourced from `public/lineups/manifest.json`) to load it into the current festival in one click — add a `.txt` file plus a matching manifest entry to publish more. Or set a festival name, paste your own lineup in the format below, and click Import.

```
10.07.2026
Main Stage
Band A, 21:00, 23:00
Band B, 23:30, 01:00

2026-07-11
Main Stage
Band C, 20:00, 22:00
Band E, 01:15, 02:00
Second Stage
Band D, 21:00, 22:30
```

- One date per block (`DD.MM.YYYY` or `YYYY-MM-DD`), followed by one or more stage names, each with acts as `Name, start, end` (HH:mm).
- Separate days with a blank line.
- Acts keep the exact date header they are entered under, including after-midnight times.

You can also add or edit acts individually under **Add manually** — it adds to whichever festival tab is currently selected. To remove a single act, open the **Import/Edit** section and click ×. To rename the festival or a stage, click ✎ next to its name — the new name applies everywhere it's used. Use **Delete festival** to remove the whole festival (including its tab), or **Copy lineup** to export the current lineup back into the paste format above.

### Timeline

Each act is a clickable cell. Click to cycle through interest levels:

| Color | Level |
|---|---|
| Dark | Not interested |
| Blue | Maybe |
| Yellow | Interested |
| Green | Must see |

Click the ✓ badge on an act to mark it seen, independent of its interest level.

Use the day tabs to switch between days — on load, the app jumps to the current day and time if the festival is running now. **Filter** toggles which interest levels are shown; select one or more to show only matching acts.

### Privacy

Interest selections are saved in your browser's localStorage after you accept the consent prompt. To change your choice later, use the **Privacy settings** link in the footer — confirming there permanently deletes every saved festival, lineup, and preference from this browser and reloads the app to a fresh state.

## Quick start

```bash
bun install   # or npm install
bun dev       # or npm run dev
```

Requires Node 18+ or Bun.

## Stack

React 19 · TypeScript · Vite · no runtime dependencies

## Note

This project was mainly coded by an AI agent (Claude by Anthropic).
