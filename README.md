# xplain

A browser-based query execution plan visualizer for SQL Server, PostgreSQL, and Oracle databases.

**[Try it live on GitHub Pages](https://mojzis.github.io/xplain/)**

## Why xplain?

- **Privacy first** - All parsing and rendering happens in your browser. Your query plans never leave your machine.
- **Multi-database** - Supports SQL Server XML plans, PostgreSQL JSON plans, and Oracle text plans.
- **Zero setup** - No installation, no accounts, no servers. Just paste your plan and visualize.

## Supported Formats

| Database   | Format | How to generate |
|------------|--------|-----------------|
| SQL Server | XML    | `SET STATISTICS XML ON` or save as `.sqlplan` |
| PostgreSQL | JSON   | `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` |
| Oracle     | Text   | `DBMS_XPLAN.DISPLAY_CURSOR` |

## Run Locally

```bash
# Clone the repository
git clone https://github.com/mojzis/xplain.git
cd xplain

# Install dependencies
bun install

# Start development server
bun dev
```

Then open http://localhost:5173 in your browser.

## Build for Production

```bash
bun run build
```

Static files are output to `dist/` and can be deployed anywhere.

## Tech Stack

- React 18 + TypeScript
- Tailwind CSS
- Vite

## License

MIT
