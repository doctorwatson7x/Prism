# Prism

Prism is a single-page, alien-sleek web app featuring:

- Identity (pen name + mask) with optional reservation
- Stories feed with comments and emoji reactions
- Infinite Gallery with uploads via Supabase Storage
- Sticky Jukebox player with upload support
- Fun toys (eyes follow, cursor trail, quotes, blob, dice)

## Tech Stack

- Vanilla HTML/CSS/JavaScript
- Supabase (Postgres, Auth-less tables, Storage, JS client)
- Modern CSS (glassmorphism, gradients, responsive)

## Structure

```
Prism/
  index.html              # HTML shell; links external CSS/JS
  styles/
    app.css               # All styles
  scripts/
    supabaseClient.js     # Supabase client initialization
    app.js                # App logic (router, pages, UI, DB ops)
```

## Local Development

- Open `index.html` in a browser. No build step required.
- Ensure network access to the Supabase CDN and your project URL.

## Environment / Config

Supabase configuration is defined in `scripts/supabaseClient.js` with the URL and anon key. Replace with your project credentials as needed.

## Data Model (Summary)

- `users(pen primary unique, mask, password_hash)`
- `stories(id, pen, text, created_at)`
- `comments(id, story_id, pen, text, created_at)`
- `reactions(id, story_id, pen, emoji)`
- `gallery_posts(id, pen, mask, summary, url, mime, created_at)`
- `tracks(id, pen, mask, path, created_at)`
- Storage buckets: `gallery` (public), `tracks` (public)

## Notes

- The app uses hash-based routing and simple DOM helpers.
- All functionality is preserved when splitting CSS/JS into external files.
- No frameworks, no bundlers.
