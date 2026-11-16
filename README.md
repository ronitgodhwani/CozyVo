# CozyVo storefront
Static page (index.html) + two Vercel functions (api/order.js, api/verify.js). Database: Supabase project pzwlpqhryuydvxyvldlk (ap-south-1).
Set these in Vercel > Project > Settings > Environment Variables (never commit them):
- SUPABASE_URL = https://pzwlpqhryuydvxyvldlk.supabase.co
- SUPABASE_SERVICE_ROLE_KEY = (Supabase > Project Settings > API keys, secret key)
- RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET = (Razorpay dashboard; use test keys first)
Without them, /api/order returns 503 and checkout shows "not activated yet".
