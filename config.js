// ============================================================
// PITCH CLUTCH '26 — Supabase configuration
// ------------------------------------------------------------
// Replace the two placeholder values below with the values from
// your Supabase project: Project Settings → API.
// ============================================================

const SUPABASE_URL = "https://fdfszveltpkyeedqwiju.supabase.co/rest/v1/";
const SUPABASE_ANON_KEY = "sb_publishable_e4sHix27-Z7ZHBbJsUnLtg_MNbA5_u1";

// Shared Supabase client used across every page.
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
