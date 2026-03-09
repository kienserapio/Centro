# Centro — PRD: Dues System

## Overview
The dues system handles monthly HOA fee tracking, payment recording, and automated reminders for residents with outstanding balances.

## Features
- [ ] Monthly dues generation per unit/household.
- [ ] Admin can mark dues as paid (manual entry, v1).
- [ ] Resident can view their payment history and current balance.
- [ ] Overdue badge displayed on resident dashboard.
- [ ] Dues chart (bar/line) visible to admin.

## Data Model (Draft)
```
dues {
  id: uuid
  resident_id: uuid (FK → users)
  amount: numeric
  due_date: date
  paid_at: timestamp | null
  created_at: timestamp
}
```

## Open Questions
- Will residents pay via GCash / Maya? (v2 scope)
- Who generates monthly dues — cron job or manual admin trigger?
