# Lineup

A browser-based festival schedule planner. Import a lineup, mark your interest in each act, and view all stages as a horizontal timeline.

## Usage

### Import

Open the **Import** section, optionally set the festival name, paste your lineup in the format below, and click Import.

```
Friday
Main Stage
Band A, 21:00, 23:00
Band B, 23:30, 01:00

Saturday
Main Stage
Band C, 20:00, 22:00
Second Stage
Band D, 21:00, 22:30
```

- One day name per block, followed by one or more stage names, each with acts as `Name, start, end` (HH:mm).
- Separate days with a blank line.
- Acts ending after midnight (e.g. 01:00 on a day with evening acts) are shifted automatically.

You can also add or edit acts individually under **Add manually**. To remove a single act, open the **Lineup** section and click ×. To clear everything, use **Delete all** at the top of that section.

### Timeline

Each act is a clickable cell. Click to cycle through interest levels:

| Color | Level |
|---|---|
| Dark | Not interested |
| Blue | Maybe |
| Yellow | Interested |
| Green | Must see |

Use the day tabs to switch between days. **Filter** hides all unmarked acts.

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
