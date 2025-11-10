import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const access = req.cookies.get('google_access_token')?.value;
  if (!access) return NextResponse.json({ error: 'not_connected' }, { status: 401 });
  const messageId = req.nextUrl.searchParams.get('messageId');
  const attachmentId = req.nextUrl.searchParams.get('attachmentId');
  if (!messageId || !attachmentId) return NextResponse.json({ error: 'missing_params' }, { status: 400 });
  try {
    const r = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentId}`, {
      headers: { Authorization: `Bearer ${access}` },
      cache: 'no-store',
    });
    if (!r.ok) return NextResponse.json({ error: 'fetch_failed' }, { status: r.status });
    const data = await r.json(); // { data: base64url, size }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'fetch_failed' }, { status: 500 });
  }
}


