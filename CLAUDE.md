# Gear Journey - Claude Collaboration Guide

## Project Overview

Gear Journey is a WoW Classic (1-60) BiS progression planner. Users search/filter/sort items, add them to a personal list, and visualize progression on a timeline.

## Workflow

1. **Before coding any feature:**
   - Read the research doc for that phase (`docs/plan/XX-*.md`)
   - Check LEARNINGS.md for related past issues
   - Write tests first (TDD)

2. **During development:**
   - Follow phase checklist strictly
   - Check checklist as you progress
   - Core items block next phase
   - Log any surprises to LEARNINGS.md immediately

3. **Phase completion:**
   - All unit tests passing
   - All E2E tests passing
   - Core checklist items done
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
- Start next phase without completing core items
- Ignore LEARNINGS.md entries
- Add features not in current phase scope
- Over-engineer solutions
- NEVER open items.json, as it's 10mb. You MUST use jq to query exactly what you need, limit results, and avoid crashing your context window.

## Phase Checklist

### Phase 0: Foundation ✓

- [x] Project scaffolding
- [x] Tailwind v4 + shadcn/ui
- [x] CLAUDE.md, LEARNINGS.md, SKILLS.md
- [x] Vitest + Playwright setup

### Phase 1: Data Layer ✓

- [x] Item TypeScript interface
- [x] Slot normalization utility
- [x] Items service
- [x] Unit tests

### Phase 2: Items Tab ✓

- [x] Search, filter, sort
- [x] Item list with infinite scroll
- [x] Add to list button
- [x] E2E tests

### Phase 3: Progression Tab ✓

- [x] Timeline component
- [x] Item positioning
- [x] Stacking logic
- [x] E2E tests

### Phase 4: Persistence ✓

- [x] Dexie schema
- [x] CRUD operations
- [x] URL sharing
- [x] E2E tests

### Phase 5: Polish ✓

- [x] Responsive design
- [x] Keyboard shortcuts
- [x] Loading/error states
- [x] Accessibility
