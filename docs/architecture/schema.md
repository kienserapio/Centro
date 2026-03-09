# Centro — Architecture: Database Schema

## Tables

### `profiles`
Extends Supabase `auth.users`. Created via trigger on signup.
```sql
profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users,
  full_name   text,
  role        text CHECK (role IN ('resident', 'admin', 'guard')),
  unit_number text,
  created_at  timestamptz DEFAULT now()
)
```

### `dues`
See `/docs/prd/dues-system.md`.

### `announcements`
```sql
announcements (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id   uuid REFERENCES profiles(id),
  title      text NOT NULL,
  body       text NOT NULL,
  created_at timestamptz DEFAULT now()
)
```

### `alerts`
```sql
alerts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guard_id    uuid REFERENCES profiles(id),
  category    text CHECK (category IN ('fire','intrusion','medical','other')),
  message     text,
  resolved_at timestamptz,
  created_at  timestamptz DEFAULT now()
)
```

## Row Level Security Notes
- Residents can only SELECT their own `dues` rows.
- Guards can INSERT into `alerts`; admins can UPDATE (resolve).
- Announcements are readable by all authenticated users.
