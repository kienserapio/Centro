# Centro — PRD: Emergency Alert System

## Overview
Allows security guards to broadcast emergency alerts in real-time to all residents and admins within the subdivision.

## Features
- [ ] Guard can trigger an alert with a category (fire, intrusion, medical, other).
- [ ] Alert appears as a modal overlay on resident and admin dashboards.
- [ ] Alert feed logs all historical incidents with timestamps.
- [ ] Admin can resolve / archive an alert.

## Alert Categories
| Code | Label |
|------|-------|
| `fire` | Fire Emergency |
| `intrusion` | Security Breach |
| `medical` | Medical Emergency |
| `other` | General Alert |

## Real-Time Strategy
- Supabase Realtime (Postgres broadcast) on the `alerts` table.

## Open Questions
- Push notifications for residents not currently on the app?
- SMS broadcast via Semaphore API?
