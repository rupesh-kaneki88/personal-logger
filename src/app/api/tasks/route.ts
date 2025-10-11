import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Task from '@/models/Task';

export async function POST(req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, description, dueDate, priority } = await req.json();

    if (!title) {
      return NextResponse.json({ message: 'Title is required' }, { status: 400 });
    }

    const newTask = new Task({
      userId: session.user.id,
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority,
      isCompleted: false,
    });

    await newTask.save();
    return NextResponse.json(newTask, { status: 201 });
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
    const tasks = await Task.find({ userId: session.user.id }).sort({ createdAt: -1 });
    return NextResponse.json(tasks, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
