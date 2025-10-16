import { google } from 'googleapis';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: session.accessToken as string,
  });

  const calendar = google.calendar({
    version: 'v3',
    auth: oauth2Client,
  });

  const now = new Date();
  const timeMin = new Date(now.getFullYear(), now.getMonth(), 1).toISOString(); // Start of current month
  const timeMax = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString(); // End of current month

  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin,
      timeMax: timeMax,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return NextResponse.json(response.data.items);
  } catch (error: any) {
    console.error('Error fetching Google Calendar events:', error);
    if (error.code === 403) {
      return NextResponse.json({ message: 'Insufficient Google Calendar permissions' }, { status: 403 });
    }
    return NextResponse.json({ message: 'Error fetching events' }, { status: 500 });
  }
}
