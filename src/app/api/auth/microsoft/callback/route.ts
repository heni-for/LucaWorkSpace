import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?auth=ms_error`);
  }

  const clientId = process.env.MS_CLIENT_ID;
  const clientSecret = process.env.MS_CLIENT_SECRET;
  const tenantId = process.env.MS_TENANT_ID || 'common';
  const origin = req.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/microsoft/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?auth=ms_missing_env`);
  }

  try {
    const tokenRes = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        scope: 'offline_access Mail.Read openid profile email',
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        client_secret: clientSecret,
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?auth=ms_token_error`);
    }

    const tokens = await tokenRes.json();

    const uiRedirect = new URL(origin);
    uiRedirect.searchParams.set('auth', 'ms_connected');
    const res = NextResponse.redirect(uiRedirect.toString());
    res.cookies.set('ms_access_token', tokens.access_token, { httpOnly: true, secure: false, path: '/', maxAge: 60 * 60 });
    if (tokens.refresh_token) {
      res.cookies.set('ms_refresh_token', tokens.refresh_token, { httpOnly: true, secure: false, path: '/', maxAge: 30 * 24 * 60 * 60 });
    }
    return res;
  } catch (e) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?auth=ms_unknown_error`);
  }
}


