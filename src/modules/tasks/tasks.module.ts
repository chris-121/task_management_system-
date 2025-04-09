import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './tasks.model';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.services';
import { BullModule } from '@nestjs/bull';
import { TaskProcessor } from './tasks.processor';
import { TasksGateway } from './tasks.gateway';

const ONE_MINUTE_IN_MS = 60 * 1000;

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    BullModule.registerQueue({
      name: 'task-queue',
      limiter: {
        max: 5,
        duration: ONE_MINUTE_IN_MS,
      },
    }),
  ],

  controllers: [TasksController],
  providers: [TasksService, TaskProcessor, TasksGateway],
})
export class TasksModule {}
