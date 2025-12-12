import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import { decrypt, encrypt } from '@/lib/encryption';
import Task from '@/models/Task';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, description, dueDate, time, priority, createGoogleEvent } = await req.json();

    if (!title) {
      return NextResponse.json({ message: 'Title is required' }, { status: 400 });
    }

    const newTask = new Task({
      userId: session.user.id,
      title: encrypt(title),
      description: description ? encrypt(description) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      time: time,
      priority,
      isCompleted: false,
    });

    if (createGoogleEvent && session.accessToken) {
      try {
        // console.log("Session is active");
        const { google } = require('googleapis');
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({
          access_token: session.accessToken,
        });

        const calendar = google.calendar({
          version: 'v3',
          auth: oauth2Client,
        });

        const event: any = {
          summary: title,
          description: description,
        };

        if (time) {
          // Timed event. dueDate is an ISO string from the client.
          const eventStart = new Date(dueDate);
          const eventEnd = new Date(eventStart.getTime() + 60 * 60 * 1000); // 1-hour duration
          event.start = { dateTime: eventStart.toISOString(), timeZone: 'UTC' };
          event.end = { dateTime: eventEnd.toISOString(), timeZone: 'UTC' };
        } else if (dueDate) {
          // All-day event. dueDate is a 'YYYY-MM-DD' string from the client.
          event.start = { date: dueDate };
          event.end = { date: dueDate };
        }

        const createdEvent = await calendar.events.insert({
          calendarId: 'primary',
          resource: event,
        });

        // console.log("Event created successfully");

        if (createdEvent.data.id) {
          // console.log("Google event created: ",createdEvent.data.id);
          newTask.googleCalendarEventId = createdEvent.data.id;
        }
      } catch (error: any) {
        console.error('Error creating Google Calendar event:', error);
        // Do not block task creation if calendar event fails
      }
    }

    await newTask.save();

    const decryptedTask = {
      ...newTask.toObject(),
      title: decrypt(newTask.title),
      description: newTask.description ? decrypt(newTask.description) : undefined,
    };

    return NextResponse.json(decryptedTask, { status: 201 });
  } catch (error: any) {
    console.error('Error creating task:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const tasks = await Task.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean();

    const decryptedTasks = tasks.map(task => ({
      ...task,
      title: decrypt(task.title),
      description: task.description ? decrypt(task.description) : undefined,
    }));

    return NextResponse.json(decryptedTasks, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
