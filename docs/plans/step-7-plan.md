# Step 7 Plan: Plan Input Component

## Objective
Create input component with database tabs, textarea, drag-drop, and error display.

## Tasks
- [ ] Create DatabaseTabs component for selecting database type
- [ ] Create PlanInput component with:
  - Textarea for pasting plans
  - Drag-and-drop file support
  - Error display
  - Parse button
- [ ] Wire up parsers and auto-detection

## Success Criteria
- [ ] Can select database type via tabs
- [ ] Can paste plan text
- [ ] Can drag-drop .sqlplan files
- [ ] Shows error messages on parse failure
- [ ] `bun run typecheck` passes
