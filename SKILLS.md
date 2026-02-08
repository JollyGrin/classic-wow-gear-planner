# Gear Journey Skills

## Phase Management

- `/phase-status` - Show current phase, completed items, blockers
- `/next-phase` - Validate current phase complete, proceed to next
- `/validate-phase` - Run tests, check all core items done

## Testing

- `/run-tests` - Run all tests (unit + E2E)
- `/e2e` - Run Playwright E2E tests only
- `/unit` - Run Vitest unit tests only
- `/validate-data` - Run data validation against items.json

## Build/Deploy

- `/build` - Production build
- `/dev` - Start dev server
- `/lint` - Run ESLint + type check

## Project-Specific

- `/add-learning` - Add entry to LEARNINGS.md
- `/slot-map` - Show slot normalization reference
- `/data-stats` - Show item count, category breakdown

## Slot Normalization Reference

| Original Slot | Normalized To |
|--------------|---------------|
| One-Hand | Main Hand OR Off Hand |
| Two-Hand | Main Hand + Off Hand (replaces both) |
| Main Hand | Main Hand |
| Off Hand | Off Hand |
| Held In Off-hand | Off Hand |
| Head | Head |
| Neck | Neck |
| Shoulder | Shoulder |
| Back | Back |
| Chest | Chest |
| Wrist | Wrist |
| Hands | Hands |
| Waist | Waist |
| Legs | Legs |
| Feet | Feet |
| Finger | Finger (x2) |
| Trinket | Trinket (x2) |
| Ranged | Ranged |
