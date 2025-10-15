import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Task from '@/models/Task';
import Log from '@/models/Log';

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, description, dueDate, priority, isCompleted } = await req.json();

    const task = await Task.findOne({ _id: id, userId: session.user.id });

    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.dueDate = dueDate ? new Date(dueDate) : task.dueDate;
    task.priority = priority || task.priority;

    if (isCompleted !== undefined && isCompleted !== task.isCompleted) {
      task.isCompleted = isCompleted;
      if (isCompleted) {
        task.completedAt = new Date();
        // Create a log entry when a task is marked as complete
        const newLog = new Log({
          userId: session.user.id,
          title: `Completed Task: ${task.title}`,
          content: task.description || `Task: ${task.title} marked as complete.`,
          category: 'Task Completion',
          timestamp: task.completedAt,
        });
        await newLog.save();
      } else {
        task.completedAt = undefined;
      }
    }

    await task.save();
    return NextResponse.json(task, { status: 200 });
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
    const result = await Task.deleteOne({ _id: id, userId: session.user.id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Task deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}