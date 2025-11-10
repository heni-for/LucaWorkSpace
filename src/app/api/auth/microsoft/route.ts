import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const clientId = process.env.MS_CLIENT_ID;
  const tenantId = process.env.MS_TENANT_ID || 'common';
  const origin = req.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/microsoft/callback`;
  const scope = encodeURIComponent('offline_access Mail.Read openid profile email');

  if (!clientId) {
    return NextResponse.json({ error: 'Missing MS_CLIENT_ID env var' }, { status: 500 });
  }

  const authUrl =
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?` +
    `client_id=${encodeURIComponent(clientId)}&` +
    `response_type=code&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_mode=query&` +
    `scope=${scope}`;

  return NextResponse.redirect(authUrl);
}


