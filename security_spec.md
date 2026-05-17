# KCX Security Specification

## Data Invariants
1. A user MUST have a `@proton.me` or `@protonmail.com` email address (validated at application level, and checked in rules if possible).
2. A transaction MUST NOT occur if the sender's balance is insufficient.
3. Every transaction MUST have a valid status and timestamp.
4. Users can only modify their own profile data (except for certain system fields like balance which are updated via transactions).
5. KCCC tasks can only be completed by the assigned worker, and rewards must match the task amount.

## The "Dirty Dozen" Payloads (Deny Cases)
1. **Identity Theft**: User A tries to update User B's `balance`.
2. **Ghost Field**: User A tries to add a `isVerified: true` field to their profile.
3. **Negative Payment**: User A tries to send -100 KCX to User B.
4. **Insufficient Funds**: User A tries to send 1000 KCX with only 10 KCX balance (Relational sync check).
5. **Unauthorized Admin**: User A tries to create an entry in an `/admins/` collection.
6. **Bypassing KYC**: User A updates their `kycStatus` to `VERIFIED` without admin approval.
7. **Task Hijack**: User B tries to mark User A's task as COMPLETED.
8. **Invalid Email**: Signup with `gmail.com`.
9. **Balance Spoof**: User A updates their own `balance` field directly.
10. **Merchant Impersonation**: User A tries to edit User B's merchant listing.
11. **ID Poisoning**: Creating a user with a 2MB string as `kcxId`.
12. **Future Timestamp**: Creating a transaction with a timestamp 1 year in the future.

## Test Runner (firestore.rules.test.ts placeholder)
(To be implemented once rules are drafted)
