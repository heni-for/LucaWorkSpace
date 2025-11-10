import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const origin = req.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/google/callback`;
  const scope = encodeURIComponent('https://www.googleapis.com/auth/gmail.readonly openid email profile');

  if (!clientId) {
    return NextResponse.json({ error: 'Missing GOOGLE_CLIENT_ID env var' }, { status: 500 });
  }

  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(clientId)}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `access_type=offline&` +
    `prompt=consent&` +
    `scope=${scope}`;

  return NextResponse.redirect(authUrl);
}


