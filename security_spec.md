# Security Specification (`security_spec.md`)

## 1. Data Invariants
1. **Default Deny**: Any path not explicitly matched (`/workspaces/{workspaceId}` and `/admins/{adminId}`) is unconditionally denied (`allow read, write: if false;`).
2. **Authentication & Verified Email**: All reads require authentication (`request.auth != null`). All writes (`create`, `update`, `delete`) require a verified email (`request.auth.token.email_verified == true`).
3. **Path ID Hardening**: Document IDs (`workspaceId`, `adminId`) must match `^[a-zA-Z0-9_\-]+$` and be at most 128 characters.
4. **Workspace Ownership & Immutability**: A workspace document can only be created with `ownerId == request.auth.uid`, and `ownerId` is strictly immutable during updates (`incoming().ownerId == existing().ownerId`).
5. **Strict Key & Size Blueprint**: `isValidWorkspace` enforces `hasAll` and `hasOnly` on the 8 allowed keys (`ownerId`, `schoolName`, `sesiAktifId`, `penggunaAktifId`, `sekolah`, `pengguna`, `sesi`, `updatedAt`), bounds string lengths (`ownerId <= 128`, `schoolName <= 200`, `sesiAktifId <= 64`, `penggunaAktifId <= 64`), bounds map/list sizes (`sekolah.size() <= 20`, `pengguna.size() <= 50`, `sesi.size() <= 20`), and requires `updatedAt == request.time`.
6. **Query Enforcement**: `allow list` on `/workspaces/{workspaceId}` strictly verifies `resource.data.ownerId == request.auth.uid || isAdmin()`.

## 2. The "Dirty Dozen" Payloads
1. **Unauthenticated Write**: `auth = null` attempting `create` on `/workspaces/w1` -> `PERMISSION_DENIED`.
2. **Unverified Email Write**: `auth = { uid: 'u1', token: { email_verified: false } }` attempting `create` on `/workspaces/w1` -> `PERMISSION_DENIED`.
3. **Identity Spoofing on Create**: `auth.uid = 'u1'` creating `/workspaces/w1` with `ownerId: 'u2'` -> `PERMISSION_DENIED`.
4. **Shadow/Ghost Field Injection**: Creating or updating `/workspaces/w1` with an extra key `isSuperAdmin: true` -> `PERMISSION_DENIED`.
5. **Owner Mutation on Update**: Updating `/workspaces/w1` to change `ownerId` from `'u1'` to `'u2'` -> `PERMISSION_DENIED`.
6. **Client Timestamp Forgery**: Creating or updating `/workspaces/w1` with a forged past/future `updatedAt` instead of `request.time` -> `PERMISSION_DENIED`.
7. **Oversized School Name**: Setting `schoolName` to a 500-character string (`> 200`) -> `PERMISSION_DENIED`.
8. **Invalid Path ID Poisoning**: Creating a document with invalid characters in `workspaceId` (`w1$bad!id`) -> `PERMISSION_DENIED`.
9. **Unbounded Array Poisoning**: Passing 100 items in `pengguna` (`> 50`) -> `PERMISSION_DENIED`.
10. **Cross-Tenant Read (PII/Workspace Leak)**: `auth.uid = 'u2'` attempting `get` on `/workspaces/u1` owned by `'u1'` -> `PERMISSION_DENIED`.
11. **Unfiltered List Scraping**: `auth.uid = 'u2'` attempting an unfiltered `list` across `/workspaces` -> `PERMISSION_DENIED`.
12. **Self-Assigned Admin Escalation**: `auth.uid = 'u1'` attempting `create` on `/admins/u1` -> `PERMISSION_DENIED`.
