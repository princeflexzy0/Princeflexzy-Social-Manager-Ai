# Migration Guide

This document outlines the steps required to migrate between different versions of the Default Automation Frontend.

## Latest Version (15.2.4)

### Breaking Changes

- Upgraded to Next.js 15.2.4 with App Router
- Migrated to React Server Components
- Updated authentication flow with role-based access

### Migration Steps

1. Update Dependencies:
   ```bash
   pnpm up --latest
   ```

2. Update Environment Variables:
   - Add `NEXT_PUBLIC_API_URL`
   - Add `NEXT_PUBLIC_APP_URL`

3. Code Changes:
   - Replace all `pages/` directory components with `app/` directory
   - Update client-side data fetching to use Server Components where possible
   - Add `use client` directive to components that need client-side interactivity

4. Authentication Updates:
   - Update login flow to use role from user object
   - Add role-based route protection
   - Update cookie handling for auth token and user role

5. Component Updates:
   - Add hydration warnings suppression to dynamic components
   - Update form handling to use new React hooks
   - Migrate to new Data Table component

### Database Changes

No database changes required (Frontend only).

## Rollback Procedure

If issues are encountered during migration:

1. Git reset to previous version:
   ```bash
   git reset --hard <previous-version-tag>
   ```

2. Restore previous dependencies:
   ```bash
   pnpm install
   ```

3. Rebuild application:
   ```bash
   pnpm build
   ```

## Version History

### v15.2.4
- Added multi-role support
- Improved analytics dashboard
- Enhanced security features

### v15.2.3
- Initial public release
- Basic dashboard functionality
- Authentication system