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

---

## Storage (guest wedding photos)

The Photos page uploads files to **Supabase Storage** and loads the gallery from the same bucket.

### 1. Create the bucket

1. In the Supabase Dashboard, open **Storage**.
2. Click **New bucket**.
3. Set **Name** to exactly: `guest-photos` (must match `SUPABASE_PHOTOS_BUCKET` in `config.js`).
4. Turn **Public bucket** **ON** so images get a public URL for the website gallery. (Uploads still rely on policies below.)
5. Create the bucket.

### 2. Storage policies (SQL Editor)

Open **SQL** → **New query**, run:

```sql
-- Anyone can read/list objects (needed for public URLs + gallery)
CREATE POLICY "Guest photos public read"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'guest-photos');

-- Anyone can upload only under the guest/ folder
CREATE POLICY "Guest photos upload to guest folder"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'guest-photos'
  AND name LIKE 'guest/%'
);
```

Do **not** add a policy that lets anonymous users **DELETE** or **UPDATE** objects (unless you use signed URLs and a custom flow). Guests should not be able to remove others’ photos.

### 3. Optional: file size limit

Under **Project Settings** → **Storage**, check global upload limits. The site limits each file to **12 MB** in the browser; raise the project limit if uploads fail for large phone photos.

### 4. Managing photos

- View or delete files in **Storage** → `guest-photos` → folder `guest`.
- To change the bucket name, update `SUPABASE_PHOTOS_BUCKET` in `config.js` and use the same name in Supabase.
