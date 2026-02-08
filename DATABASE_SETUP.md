# Database Setup - Supabase

This wedding website uses Supabase to store RSVP submissions and guest messages.

## Database Tables

### 1. `rsvp_submissions`
Stores all RSVP form data including guest information, attendance, dietary restrictions, song requests, and messages.

### 2. `guest_messages`
Stores public messages that guests opt to share on the website's message wall.

## Setup Complete! ✅

The database has been configured with:
- Two tables created with proper schema
- Row Level Security (RLS) enabled
- Public can INSERT RSVPs and messages
- Public can SELECT (read) guest messages for the wall
- Only admin (you) can view all RSVP submissions in Supabase dashboard

## Viewing RSVPs

To see all RSVPs:
1. Go to your Supabase Dashboard
2. Click "Table Editor"
3. Select "rsvp_submissions"
4. View all submissions with full details

You can also export to CSV for easier management.

## Environment Variables

The Supabase credentials are stored in:
- `config.js` - Contains the public URL and anon key (safe for client-side)
- `.env` - Local backup (gitignored, never committed)

The anon key is safe to expose in client-side code because it only works with the Row Level Security policies you've set up.

## Security

- RLS policies prevent unauthorized access
- Guests can only submit data, not read other RSVPs
- Messages are visible to all (by design for the public wall)
- Admin access only through Supabase dashboard
