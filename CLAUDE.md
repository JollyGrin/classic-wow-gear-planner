# Gear Journey - Claude Collaboration Guide

## Project Overview

Gear Journey is a WoW Classic (1-60) BiS progression planner. Users search/filter/sort items, add them to a personal list, and visualize progression on a timeline.

## Workflow

1. **Before coding any feature:**
   - Read the research doc for that phase (`docs/plan/XX-*.md`)
   - Check LEARNINGS.md for related past issues
   - Write tests first (TDD)

2. **During development:**
   - Log any surprises to LEARNINGS.md immediately

3. **Completion:**
   - All unit tests passing
   - All E2E tests passing
   - LEARNINGS.md updated if needed

## Key Patterns

### Slot Normalization

Always use normalized slots in UI:

- `One-Hand` → `Main Hand` or `Off Hand`
- `Two-Hand` → replaces both `Main Hand` and `Off Hand`

### Data Loading

- Use ItemsService singleton for all item operations
- JSON files in `public/data/` namespaced by WoW version

### State Management

- React Query for server state (item fetching)
- Dexie (IndexedDB) for persistence (user's BiS list)

### Components

- shadcn/ui as base components
- Customize with Tailwind classes
- Components in `app/components/`

## Testing Commands

```bash
bun run test       # Run Vitest unit tests
bun run test:e2e   # Run Playwright E2E tests
bun run test:all   # Run both
```

## Don't

- Skip tests to "save time"
- Ignore LEARNINGS.md entries
- Over-engineer solutions

## Large JSON Handling

- NEVER open large JSON files (e.g. `items.json` at 10mb) directly — it will blow up your context window.
- Use `jq` via Bash to query exactly what you need. Always filter and limit results.
- Do NOT use Python scripts for JSON exploration — jq is lighter and avoids spawning an interpreter.

Examples:
```bash
# Get the structure/keys of the first item
jq '.[0] | keys' public/data/items.json

# Find items by name (case-insensitive, limit 3)
jq '[.[] | select(.name | test("shadowfang"; "i"))] | .[0:3]' public/data/items.json

# Count items by slot
jq 'group_by(.slot) | map({slot: .[0].slot, count: length})' public/data/items.json
```
