const SUPABASE_URL = "https://niynqtpppdzrciozjcvr.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5peW5xdHBwcGR6cmNpb3pqY3ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MTAyODcsImV4cCI6MjA3MjA4NjI4N30.lnlXM9lzfdOaCW6UQ5fBZ_SHd8TOVF0KCgpSsTrMbgs";
window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
