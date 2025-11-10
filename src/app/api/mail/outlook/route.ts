import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const access = req.cookies.get('ms_access_token')?.value;
  if (!access) return NextResponse.json({ error: 'not_connected' }, { status: 401 });
  try {
    const list = await fetch('https://graph.microsoft.com/v1.0/me/messages?$top=10', {
      headers: { Authorization: `Bearer ${access}` },
      cache: 'no-store',
    });
    const data = await list.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'fetch_failed' }, { status: 500 });
  }
}


