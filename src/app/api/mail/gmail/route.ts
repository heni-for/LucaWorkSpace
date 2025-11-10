import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const access = req.cookies.get('google_access_token')?.value;
  if (!access) return NextResponse.json({ error: 'not_connected' }, { status: 401 });
  try {
    const list = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10', {
      headers: { Authorization: `Bearer ${access}` },
      cache: 'no-store',
    });
    const data = await list.json();
    const messages = Array.isArray(data.messages) ? data.messages : [];
    const details = await Promise.all(messages.slice(0, 10).map(async (m: any) => {
      // Fetch full payload to detect attachments
      const r = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=full`, {
        headers: { Authorization: `Bearer ${access}` },
        cache: 'no-store',
      });
      const d = await r.json();
      const headers: Record<string,string> = {};
      (d.payload?.headers || []).forEach((h: any) => { headers[h.name] = h.value; });
      // Walk parts to find attachments
      const attachments: Array<{ filename: string; mimeType: string; size: number; attachmentId: string; messageId: string; }> = [];
      const walk = (part: any) => {
        if (!part) return;
        if (part.filename && part.body?.attachmentId) {
          attachments.push({
            filename: part.filename,
            mimeType: part.mimeType || 'application/octet-stream',
            size: part.body?.size || 0,
            attachmentId: part.body.attachmentId,
            messageId: d.id,
          });
        }
        if (Array.isArray(part.parts)) part.parts.forEach(walk);
      };
      walk(d.payload);
      const dateHeader = headers['Date'] || '';
      let formattedDate = dateHeader;
      try {
        if (dateHeader) {
          const parsed = new Date(dateHeader);
          const now = new Date();
          const diffMs = now.getTime() - parsed.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          if (diffMins < 60) formattedDate = `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
          else if (diffMins < 1440) formattedDate = `${Math.floor(diffMins / 60)} hour${Math.floor(diffMins / 60) !== 1 ? 's' : ''} ago`;
          else formattedDate = parsed.toLocaleDateString();
        }
      } catch {}
      return {
        id: d.id,
        sender: headers['From'] || 'Unknown',
        subject: headers['Subject'] || '(no subject)',
        date: formattedDate,
        snippet: d.snippet || '',
        attachments,
      };
    }));
    return NextResponse.json({ messages: details });
  } catch (e) {
    return NextResponse.json({ error: 'fetch_failed' }, { status: 500 });
  }
}


