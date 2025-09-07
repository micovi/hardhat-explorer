# Component Reorganization & Polish Plan

## Overview
This document outlines the plan for reorganizing components and polishing the evmscan.org codebase for open-source release.

## Principles
- **Use shadcn/ui patterns**: Leverage battle-tested shadcn components and extend them when needed
- **Feature-based organization**: Group components by feature, not by type
- **Reusability**: Extract common patterns into shared components
- **Consistency**: Maintain consistent patterns across the codebase
- **Developer experience**: Make the codebase easy to understand and contribute to

## Phase 1: Common Components (Current)

### 1.1 data-table Component
Create a reusable data-table that extends shadcn/ui Table with:
- **Props**:
  - `columns`: Column definitions with accessor, header, cell renderer
  - `data`: Array of data items
  - `loading`: Loading state
  - `error`: Error state
  - `emptyMessage`: Custom empty state message
  - `pagination`: Optional pagination config
  - `sorting`: Optional sorting config
  - `filtering`: Optional filtering config
- **Features**:
  - Built-in loading skeleton
  - Built-in error state
  - Built-in empty state
  - Optional pagination using shadcn Pagination
  - Optional sorting
  - Optional filtering
- **Used by**: block-list-page, transaction-list-page, address-page (transactions tab)

### 1.2 loading-state Component
Consistent loading UI using shadcn Skeleton:
- **Variants**:
  - `card`: For card-based content
  - `table`: For table rows
  - `list`: For list items
  - `text`: For text content
- **Props**:
  - `variant`: Type of skeleton
  - `count`: Number of skeleton items
  - `className`: Additional styling

### 1.3 error-state Component
Consistent error handling using shadcn Alert:
- **Props**:
  - `error`: Error object or message
  - `retry`: Optional retry callback
  - `title`: Custom error title
  - `description`: Custom error description
- **Features**:
  - User-friendly error messages
  - Optional retry button
  - Error details in development mode

### 1.4 empty-state Component
When no data is available:
- **Props**:
  - `icon`: Lucide icon component
  - `title`: Main message
  - `description`: Detailed description
  - `action`: Optional CTA button config
- **Features**:
  - Consistent empty state design
  - Optional call-to-action
  - Contextual messages

### 1.5 copy-button Component
Reusable copy-to-clipboard button:
- **Props**:
  - `value`: Text to copy
  - `label`: Optional tooltip label
  - `size`: Button size variant
- **Features**:
  - Visual feedback on copy
  - Tooltip support
  - Consistent styling

## Phase 2: Component Reorganization

### 2.1 Directory Structure
```
src/components/
├── common/
│   ├── data-table/
│   │   ├── index.tsx
│   │   ├── data-table.tsx
│   │   ├── data-table-pagination.tsx
│   │   └── data-table-column-header.tsx
│   ├── loading-state/
│   │   ├── index.tsx
│   │   └── loading-state.tsx
│   ├── error-state/
│   │   ├── index.tsx
│   │   └── error-state.tsx
│   ├── empty-state/
│   │   ├── index.tsx
│   │   └── empty-state.tsx
│   └── copy-button/
│       ├── index.tsx
│       └── copy-button.tsx
├── address/
│   ├── address-display.tsx
│   ├── address-link.tsx
│   ├── address-balance.tsx
│   └── index.ts
├── block/
│   ├── block-item.tsx
│   ├── block-list.tsx
│   ├── block-details.tsx
│   ├── block-stats.tsx
│   └── index.ts
├── transaction/
│   ├── transaction-item.tsx
│   ├── transaction-list.tsx
│   ├── transaction-status.tsx
│   ├── transaction-method.tsx
│   ├── transaction-value.tsx
│   └── index.ts
├── contract/
│   └── (keep existing)
├── dashboard/
│   └── (keep existing)
├── layout/
│   └── (keep existing)
├── tools/
│   └── (keep existing)
└── ui/
    └── (keep existing shadcn components)
```

### 2.2 Migration Strategy
1. Create new directory structure
2. Move components to appropriate folders
3. Create index.ts barrel exports
4. Update all imports
5. Remove old directories

## Phase 3: Polish Existing Features

### 3.1 Home/Dashboard Page
- [ ] Replace loading spinners with skeletons
- [ ] Add error boundaries
- [ ] Improve stats card animations
- [ ] Add data refresh indicators
- [ ] Optimize chart rendering

### 3.2 Block Pages
- [ ] Implement data-table for block list
- [ ] Add block time tooltips
- [ ] Improve gas usage visualization
- [ ] Add block navigation (prev/next)
- [ ] Cache block data

### 3.3 Transaction Pages
- [ ] Implement data-table for transaction list
- [ ] Improve method name detection
- [ ] Add transaction status badges
- [ ] Better gas fee display
- [ ] Add transaction timeline view

### 3.4 Address Pages
- [ ] Implement tabbed data-tables
- [ ] Add ENS resolution (future)
- [ ] Improve contract verification UX
- [ ] Add address QR codes
- [ ] Better token balance display

### 3.5 Contract Interaction
- [ ] Improve function parameter inputs
- [ ] Add input validation
- [ ] Better error messages
- [ ] Add function search/filter
- [ ] Improve response display

## Phase 4: Code Quality

### 4.1 TypeScript Improvements
- [ ] Replace all `any` types
- [ ] Add proper generics
- [ ] Export shared types
- [ ] Add JSDoc comments

### 4.2 Performance
- [ ] Implement React.memo where appropriate
- [ ] Add virtual scrolling for large lists
- [ ] Optimize re-renders
- [ ] Lazy load heavy components

### 4.3 Testing (Future)
- [ ] Add unit tests for utilities
- [ ] Add component tests
- [ ] Add E2E tests for critical paths

## Phase 5: Developer Experience

### 5.1 Documentation
- [ ] Component documentation
- [ ] Storybook setup (future)
- [ ] Contributing guidelines
- [ ] Architecture decisions

### 5.2 Tooling
- [ ] Pre-commit hooks
- [ ] Automated formatting
- [ ] CI/CD pipeline
- [ ] Release automation

## Success Criteria

### For Open Source Release
- ✅ Clean, organized component structure
- ✅ Consistent use of shadcn/ui patterns
- ✅ No duplicate code
- ✅ Proper TypeScript types
- ✅ Responsive and accessible
- ✅ Good performance
- ✅ Clear documentation

### User Experience
- ✅ Fast page loads
- ✅ Smooth interactions
- ✅ Clear error messages
- ✅ Intuitive navigation
- ✅ Mobile-friendly

## Timeline Estimate

- **Phase 1**: Common Components - 2-3 hours
- **Phase 2**: Reorganization - 2-3 hours  
- **Phase 3**: Polish - 4-6 hours
- **Phase 4**: Code Quality - 2-3 hours
- **Phase 5**: Developer Experience - 2-3 hours

**Total**: ~15-20 hours for complete polish

## Notes

- Breaking changes are acceptable until first release
- Focus on code quality over new features
- Maintain shadcn/ui patterns throughout
- Keep components composable and reusable
- Document decisions as we go