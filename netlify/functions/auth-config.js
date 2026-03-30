exports.handler = async function handler() {
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
  const body =
    "window.STUDY_BUDDY_AUTH = {" +
    `supabaseUrl: ${JSON.stringify(supabaseUrl)},` +
    `supabaseAnonKey: ${JSON.stringify(supabaseAnonKey)}` +
    "};";

  return {
    statusCode: 200,
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "no-store",
    },
    body,
  };
};
