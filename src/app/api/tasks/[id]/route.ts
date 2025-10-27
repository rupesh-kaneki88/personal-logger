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
    const { title: newTitle, description: newDescription, dueDate, priority, isCompleted } = body;

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