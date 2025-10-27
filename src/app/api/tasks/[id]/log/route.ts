
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Task from '@/models/Task';
import Log from '@/models/Log';
import { Session } from 'next-auth';

export async function POST(request: NextRequest, context: { params: Promise<{id: string }> }) {
  const {id} = await context.params;
  const session: Session | null = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await dbConnect();

  try {
    const body = await request.json();
    const { duration, category } = body;

    const task = await Task.findById(id);

    if (!task) {
      return new NextResponse(JSON.stringify({ message: 'Task not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (task.userId.toString() !== session.user.id) {
      return new NextResponse(JSON.stringify({ message: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const newLog = new Log({
      userId: session.user.id,
      title: task.title,
      content: task.description || '',
      category,
      duration,
      timestamp: new Date(),
    });

    await newLog.save();

    await Task.findByIdAndDelete(id);

    return new NextResponse(null, { status: 204 });

  } catch (error: any) {
    console.error('Error completing and logging task:', error);
    return new NextResponse(JSON.stringify({ message: error.message || 'Something went wrong' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
