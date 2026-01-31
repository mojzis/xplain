# Step 3-6 Plan: Database Parsers

## Objective
Implement parsers for SQL Server XML, PostgreSQL JSON, and Oracle text formats.

## Tasks
- [ ] Step 3: SQL Server XML parser with tests
- [ ] Step 4: PostgreSQL JSON parser with tests
- [ ] Step 5: Oracle text parser with tests
- [ ] Step 6: Parser index with auto-detection and tests

## Success Criteria
- [ ] All parsers correctly parse valid input
- [ ] All parsers throw descriptive errors on invalid input
- [ ] Auto-detection correctly identifies plan format
- [ ] `bun test` passes for all parser tests
- [ ] `bun run typecheck` passes

## Decisions
- SQL Server: Parse XML using DOMParser
- PostgreSQL: Parse JSON directly
- Oracle: Line-based text parsing
- Auto-detection uses heuristics (XML markers, JSON array, text patterns)
