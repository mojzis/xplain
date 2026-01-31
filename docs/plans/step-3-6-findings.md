# Step 3-6 Findings: Database Parsers

## Date: 2026-01-31

## What Worked

All parsers implemented and tested:
- SQL Server XML parser (7 tests)
- PostgreSQL JSON parser (9 tests)
- Oracle text parser (6 tests)
- Auto-detection and unified interface (13 tests)

## SQL Server Parser (Step 3)
- Uses browser's DOMParser for XML parsing
- Handles nested RelOp elements in various container types (Hash, NestedLoops, etc.)
- Extracts table and index names from Object elements
- Detects warnings: missing index, implicit conversion, TempDb spill, table scan

## PostgreSQL Parser (Step 4)
- Parses JSON array format from EXPLAIN (FORMAT JSON)
- Handles nested Plans arrays
- Extracts actual values when ANALYZE is used
- Detects sequential scans and row estimate mismatches

## Oracle Parser (Step 5)
- Parses text table output from DBMS_XPLAN
- Builds tree from depth based on leading spaces (1 space = 1 level)
- Handles Cost column with (%CPU) suffix
- Detects full table scans

## Parser Index (Step 6)
- Auto-detection based on:
  - SQL Server: XML declaration or ShowPlanXML element
  - PostgreSQL: JSON array with Plan property
  - Oracle: "Plan hash value" or "| Id |" markers
- parsePlan() function accepts optional type override

## Technical Decisions
- Vitest with jsdom environment for DOMParser support
- Each parser records parseTime in milliseconds
- Warnings use union type for severity: 'info' | 'warning' | 'critical'
- Oracle depth calculation uses direct space count (not divided by 2)

## Test Coverage
- 35 tests total, all passing
- Tests cover: valid input, invalid input, nested structures, warnings

## Notes for Next Steps
- Ready to implement UI components (Step 7+)
- Parsers export both individual functions and unified parsePlan()
