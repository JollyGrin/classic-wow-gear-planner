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
bun test           # Run Vitest unit tests
bun test:e2e       # Run Playwright E2E tests
bun test:all       # Run both
```

## Don't

- Skip tests to "save time"
- Start next phase without completing core items
- Ignore LEARNINGS.md entries
- Add features not in current phase scope
- Over-engineer solutions

## Phase Checklist

### Phase 0: Foundation ✓

- [x] Project scaffolding
- [x] Tailwind v4 + shadcn/ui
- [x] CLAUDE.md, LEARNINGS.md, SKILLS.md
- [x] Vitest + Playwright setup

### Phase 1: Data Layer

- [ ] Item TypeScript interface
- [ ] Slot normalization utility
- [ ] Items service
- [ ] Unit tests

### Phase 2: Items Tab

- [ ] Search, filter, sort
- [ ] Item list with infinite scroll
- [ ] Add to list button
- [ ] E2E tests

### Phase 3: Progression Tab

- [ ] Timeline component
- [ ] Item positioning
- [ ] Stacking logic
- [ ] E2E tests

### Phase 4: Persistence

- [ ] Dexie schema
- [ ] CRUD operations
- [ ] URL sharing
- [ ] E2E tests

### Phase 5: Polish

- [ ] Responsive design
- [ ] Keyboard shortcuts
- [ ] Loading/error states
- [ ] Accessibility
