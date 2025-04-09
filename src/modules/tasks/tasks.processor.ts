import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument } from '../tasks/tasks.model';
import { Logger } from '@nestjs/common';
import { StatusEnum } from '../../types/status';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { TasksGateway } from './tasks.gateway';

@Processor('task-queue')
export class TaskProcessor {
  private readonly logger = new Logger(TaskProcessor.name);

  constructor(
    @InjectModel(Task.name)
    private readonly taskModel: Model<TaskDocument>,
    private readonly tasksGateway: TasksGateway,
  ) {}

  @Process()
  async processTask(job: Job<{ id: string }>) {
    const { id } = job.data;
    const task = await this.taskModel.findById(id);

    if (!task) {
      this.logger.warn(`Task with ID ${id} not found`);
      return;
    }

    try {
      task.processingStartedAt = new Date();
      task.status = StatusEnum.PROCESSING;
      await task.save();

      this.tasksGateway.sendTaskUpdate(id, {
        status: task.status,
        processingStartedAt: task.processingStartedAt,
      });
      await this.simulateTaskProcessing(task);

      task.completedAt = new Date();
      task.status = StatusEnum.COMPLETED;
      await task.save();

      this.tasksGateway.sendTaskUpdate(id, {
        status: task.status,
        completedAt: task.processingStartedAt,
      });
      this.logger.log(`Task ${id} completed successfully`);
    } catch (error) {
      task.attempts += 1;
      const errorMessage = getErrorMessage(error) || 'Unknown error';

      if (task.attempts < 3) {
        task.status = StatusEnum.PENDING;
      } else {
        task.status = StatusEnum.FAILED;
        task.errorMessage = errorMessage;
      }

      await task.save();
      this.logger.error(`Task ${id} failed: ${errorMessage}`);

      this.tasksGateway.sendTaskUpdate(id, {
        status: task.status,
        attempts: task.attempts,
        ...(task.errorMessage ? { errorMessage } : {}),
      });

      throw error;
    }
  }

  private async simulateTaskProcessing(task: TaskDocument): Promise<void> {
    const min = 5000; // 5 seconds in ms
    const max = 20000; // 20 seconds in ms
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;

    console.log(task.type);
    await new Promise((resolve) => setTimeout(resolve, delay));

    if (Math.random() < 0.65) {
      throw new Error('Simulated task failure');
    }
  }
}
