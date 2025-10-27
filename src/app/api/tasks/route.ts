import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Task from '@/models/Task';
import { encrypt, decrypt } from '@/lib/encryption';

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
      title: encrypt(title),
      description: description ? encrypt(description) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority,
      isCompleted: false,
    });

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
