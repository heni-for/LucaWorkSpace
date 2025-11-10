import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?auth=google_error`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const origin = req.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?auth=google_missing_env`);
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?auth=google_token_error`);
    }

    const tokens = await tokenRes.json();

    // Store access token in httpOnly cookie (demo; consider DB for prod)
    const uiRedirect = new URL(origin);
    uiRedirect.searchParams.set('auth', 'google_connected');
    const res = NextResponse.redirect(uiRedirect.toString());
    res.cookies.set('google_access_token', tokens.access_token, { httpOnly: true, secure: false, path: '/', maxAge: 60 * 60 });
    if (tokens.refresh_token) {
      res.cookies.set('google_refresh_token', tokens.refresh_token, { httpOnly: true, secure: false, path: '/', maxAge: 30 * 24 * 60 * 60 });
    }
    return res;
  } catch (e) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?auth=google_unknown_error`);
  }
}


