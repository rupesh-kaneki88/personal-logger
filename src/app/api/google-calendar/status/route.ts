import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ isConnected: false, message: 'Not authenticated with Google.' }, { status: 200 });
  }

  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: session.accessToken as string,
    });

    // Make a lightweight call to Google API to check token validity
    await google.oauth2({
      auth: oauth2Client,
      version: 'v2',
    }).userinfo.get();

    return NextResponse.json({ isConnected: true, message: 'Connected to Google Calendar.' }, { status: 200 });
  } catch (error: any) {
    console.error('Error checking Google connection status:', error);
    return NextResponse.json({ isConnected: false, message: 'Google authentication expired. Please reconnect.' }, { status: 200 });
  }
}
