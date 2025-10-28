import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Task from '@/models/Task';
import Log from '@/models/Log';
import { encrypt, decrypt } from '@/lib/encryption';

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title: newTitle, description: newDescription, dueDate, time, priority, isCompleted, createGoogleEvent } = body;

    const task = await Task.findOne({ _id: id, userId: session.user.id });

    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    // Decrypt current values for internal use
    const currentTitle = decrypt(task.title);
    const currentDescription = task.description ? decrypt(task.description) : '';

    // Determine final plaintext values
    const finalTitle = newTitle || currentTitle;
    const finalDescription = newDescription || currentDescription;

    // Assign encrypted values back to the task
    task.title = encrypt(finalTitle);
    if (finalDescription) {
        task.description = encrypt(finalDescription);
    }
    task.dueDate = dueDate ? new Date(dueDate) : task.dueDate;
    task.time = time || task.time;
    task.priority = priority || task.priority;

    if (isCompleted !== undefined && isCompleted !== task.isCompleted) {
      task.isCompleted = isCompleted;
      if (isCompleted) {
        task.completedAt = new Date();
        // Create a log entry with encrypted data
        const logTitle = `Completed Task: ${finalTitle}`;
        const logContent = finalDescription || `Task: ${finalTitle} marked as complete.`;
        
        const newLog = new Log({
          userId: session.user.id,
          title: encrypt(logTitle),
          content: encrypt(logContent),
          category: 'Task Completion',
          timestamp: task.completedAt,
        });
        await newLog.save();
      } else {
        task.completedAt = undefined;
      }
    }

    if (createGoogleEvent && task.googleCalendarEventId && session.accessToken) {
      try {
        const { google } = require('googleapis');
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({
          access_token: session.accessToken,
        });

        const calendar = google.calendar({
          version: 'v3',
          auth: oauth2Client,
        });

        const eventStart = new Date(task.dueDate);
        if (task.time) {
          const [hours, minutes] = task.time.split(':').map(Number);
          eventStart.setHours(hours);
          eventStart.setMinutes(minutes);
        }

        const eventEnd = new Date(eventStart.getTime() + 60 * 60 * 1000);

        const event = {
          summary: finalTitle,
          description: finalDescription,
          start: {
            dateTime: eventStart.toISOString(),
            timeZone: 'UTC',
          },
          end: {
            dateTime: eventEnd.toISOString(),
            timeZone: 'UTC',
          },
        };

        await calendar.events.update({
          calendarId: 'primary',
          eventId: task.googleCalendarEventId,
          resource: event,
        });
      } catch (error: any) {
        console.error('Error updating Google Calendar event:', error);
        // Do not block task update if calendar event update fails
      }
    }

    await task.save();

    // Decrypt the final object for the response
    const decryptedTask = {
        ...task.toObject(),
        title: finalTitle,
        description: finalDescription,
    };

    return NextResponse.json(decryptedTask, { status: 200 });
  } catch (error: any) {
    console.error('Error updating task:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const task = await Task.findOne({ _id: id, userId: session.user.id });

    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    // Get createGoogleEvent from query parameters or body if needed for delete
    const { createGoogleEvent } = await req.json(); // Assuming createGoogleEvent can be sent with DELETE

    if (createGoogleEvent && task.googleCalendarEventId && session.accessToken) {
      try {
        const { google } = require('googleapis');
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({
          access_token: session.accessToken,
        });

        const calendar = google.calendar({
          version: 'v3',
          auth: oauth2Client,
        });

        await calendar.events.delete({
          calendarId: 'primary',
          eventId: task.googleCalendarEventId,
        });
      } catch (error: any) {
        console.error('Error deleting Google Calendar event:', error);
        // Do not block task deletion if calendar event deletion fails
      }
    }

    await Task.deleteOne({ _id: id, userId: session.user.id });

    return NextResponse.json({ message: 'Task deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}