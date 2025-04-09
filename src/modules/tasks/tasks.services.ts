import mongoose, { Model } from 'mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Task, TaskDocument } from './tasks.model';
import { CreateTaskDto, GetTaskByIdDto } from './dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { StatusEnum } from '../../types/status';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectQueue('task-queue') private taskQueue: Queue,
  ) {}

  async createTask(createTask: CreateTaskDto) {
    const task = await this.taskModel.create(createTask);
    const taskId = task._id?.toString();
    const delay = task.scheduleAt
      ? Math.max(task.scheduleAt.getTime() - Date.now(), 0)
      : 0;

    await this.taskQueue.add(
      { id: taskId },
      {
        delay,
        priority: task.priority,
        attempts: 3,
        backoff: { type: 'fixed', delay: 2000 },
      },
    );

    return { id: taskId, message: 'Task created successfully' };
  }

  async getTaskStatusSummary() {
    const tasks = await this.taskModel.find({});
    const tasksGroupedByStatus = tasks.reduce(
      (acc: Record<string, number>, task) => {
        const status = task.status;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {},
    );
    return tasksGroupedByStatus;
  }

  async getTaskById(id: string) {
    if (!mongoose.isValidObjectId(id))
      throw new BadRequestException('Please provide valid Id');
    return this.taskModel.findById(id);
  }

  async getMetrics() {
    const ONE_MINUTE_IN_MS = 60 * 1000;
    const tasks = await this.taskModel.find();

    const totalTasks = tasks.length;
    const failedTasks = tasks.filter(
      (task) => task.status === StatusEnum.FAILED,
    );

    const failureRate = totalTasks
      ? (failedTasks.length / totalTasks) * 100
      : 0;

    const completedTasks = tasks.filter(
      ({ status, processingStartedAt, completedAt }) =>
        status === StatusEnum.COMPLETED && processingStartedAt && completedAt,
    );

    const totalProcessingTime = completedTasks.reduce(
      (sum, { processingStartedAt, completedAt }) => {
        const processingStartedAtInMS = processingStartedAt!.getTime();
        const completedAtInMS = completedAt!.getTime();

        const duration =
          (completedAtInMS - processingStartedAtInMS) / ONE_MINUTE_IN_MS;

        return sum + duration;
      },
      0,
    );

    const avgProcessingTimeMs = completedTasks.length
      ? totalProcessingTime / completedTasks.length
      : 0;

    return {
      failureRate: failureRate.toFixed(2) + '%',
      avgProcessingTime: avgProcessingTimeMs.toFixed(2) + ' Minutes',
    };
  }

  // async updateTask(id: string, updates: Partial<Task>) {
  //   return this.taskModel.findByIdAndUpdate(id, updates, { new: true });
  // }
}
