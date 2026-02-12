# External Data Files

These files are gitignored because they are large and sourced from third-party repos. Download them before running data pipeline scripts.

## Required Files

### ItemDisplayInfo.json (9.9 MB)

Maps `displayId` → model name, texture, icon.

- **Source**: [Turtle-WOW-DBC](https://github.com/oplancelot/Turtle-WOW-DBC)
- **Records**: 23,852

```bash
curl -L -o data/external/ItemDisplayInfo.json \
  "https://raw.githubusercontent.com/oplancelot/Turtle-WOW-DBC/main/dbc.MPQ/DBFilesClient/ItemDisplayInfo.json"
```

### item_template.sql (8.4 MB)

Maps `itemId` → `displayId` (the bridge between our items and display info).

- **Source**: [thatsmybis/classic-wow-item-db](https://github.com/thatsmybis/classic-wow-item-db)
- **Items**: ~19,679

```bash
curl -L -o data/external/item_template.sql \
  "https://raw.githubusercontent.com/thatsmybis/classic-wow-item-db/master/db/unmodified.sql"
```

## Quick Start

```bash
# Download both files
cd data/external
curl -L -o ItemDisplayInfo.json "https://raw.githubusercontent.com/oplancelot/Turtle-WOW-DBC/main/dbc.MPQ/DBFilesClient/ItemDisplayInfo.json"
curl -L -o item_template.sql "https://raw.githubusercontent.com/thatsmybis/classic-wow-item-db/master/db/unmodified.sql"
```

## Mapping Chain

```
items.json (itemId) → item_template.sql (display_id) → ItemDisplayInfo.json (model/texture)
```
