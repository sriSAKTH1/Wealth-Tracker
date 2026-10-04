# Security Specification & Test Matrix

## 1. Data Invariants
1. **User Identity & Role Invariance:**
   - A user profile at `/users/{userId}` can only be created with their own `request.auth.uid`.
   - The `role` field on a user document can only be set to `main_admin` or `admin_advisor` by an existing `main_admin`. Users self-registering receive `role: 'user'`.
2. **Advisor 1:10 Capacity Constraint:**
   - An advisor assignment record `/advisor_assignments/{advisorId}` must enforce `assignedUserIds.size() <= 10`.
   - Modifying advisor assignments is restricted to `main_admin` (for cross-reassignment) and the assigned advisor (for status updates).
3. **Feedback Integrity:**
   - Feedback documents at `/feedback/{feedbackId}` can be created by authenticated users where `request.resource.data.userId == request.auth.uid`.
   - Deleting or changing ticket status is restricted to `main_admin` and assigned `admin_advisor`.
4. **Audit & Path Protection:**
   - Single-document target operations enforce alphanumeric ID validation (`isValidId`).

## 2. The "Dirty Dozen" Payloads
1. User attempting to create `/users/other_user_id` with mismatching `request.auth.uid`. (REJECT)
2. User attempting to elevate their own role to `main_admin` on registration. (REJECT)
3. Advisor assignment payload with `assignedUserIds` array exceeding 10 elements. (REJECT)
4. Non-admin attempting to list the `/users` directory. (REJECT)
5. Unauthenticated visitor attempting to read `/feedback` or `/advisor_assignments`. (REJECT)
6. Regular user attempting to modify another user's `assignedAdvisorId`. (REJECT)
7. User attempting to submit feedback with invalid negative rating or rating > 5. (REJECT)
8. User attempting to delete another user's feedback ticket. (REJECT)
9. Attacker injecting 2KB junk string as document ID. (REJECT)
10. Unassigned advisor attempting to modify users outside their roster. (REJECT)
11. Client sending unexpected shadow fields on feedback creation. (REJECT)
12. Malicious user attempting to overwrite existing user's creation timestamp. (REJECT)
