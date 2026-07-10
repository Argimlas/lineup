# Lineup

A browser-based festival schedule planner. Import a lineup, mark your interest in each act, and view all stages as a horizontal timeline.

## Usage

### Import

Open the **Import** section, optionally set the festival name, paste your lineup in the format below, and click Import.

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

You can also add or edit acts individually under **Add manually**. To remove a single act, open the **Lineup** section and click ×. To rename the festival or a stage, click ✎ next to its name — the new name applies everywhere it's used. Use **Delete all** to clear everything, or **Copy lineup** to export the current lineup back into the paste format above.

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

Interest selections are saved in your browser's localStorage after you accept the consent prompt. To change your choice later, use the **Privacy settings** link in the footer.

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
