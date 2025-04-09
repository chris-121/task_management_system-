import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.services';
import { getModelToken } from '@nestjs/mongoose';
import { Task } from './tasks.model';
import { Queue } from 'bull';
import { StatusEnum } from '../../types/status';
import mongoose, { Model } from 'mongoose';
import { BadRequestException } from '@nestjs/common';
import { CreateTaskDto } from './dto';

describe('TasksService', () => {
  let tasksService: TasksService;
  let model: Model<Task>;
  let queue: Queue;

  const mockTask = {
    _id: '67f3fcc3f17dc83b5e8d587d',
    type: 'Send an email',
    status: StatusEnum.PENDING,
    attempts: 0,
    priority: 1,
    createdAt: '2025-04-07T16:26:43.408Z',
    updatedAt: '2025-04-07T16:26:43.408Z',
  };

  const mockTaskModel: Partial<Record<keyof Model<Task>, any>> = {
    findById: jest.fn(),
  };

  const mockQueue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getModelToken(Task.name), useValue: mockTaskModel },
        { provide: 'BullQueue_task-queue', useValue: mockQueue },
      ],
    }).compile();

    tasksService = module.get<TasksService>(TasksService);
    model = module.get<Model<Task>>(getModelToken(Task.name));
    queue = module.get<Queue>('BullQueue_task-queue');
  });

  describe('getTaskById', () => {
    it('should return task details when given a valid ID', async () => {
      // Use spy to correctly bind context
      jest.spyOn(model, 'findById').mockResolvedValue(mockTask);

      const result = await tasksService.getTaskById(mockTask._id);

      expect(model.findById).toHaveBeenCalledWith(mockTask._id);
      expect(result).toEqual(mockTask);
    });
  });

  describe('getTaskById', () => {
    it('should throw error when given a invalid ID', async () => {
      const taskId = 'invalid-id';

      const isValidObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(tasksService.getTaskById(taskId)).rejects.toThrow(
        BadRequestException,
      );
      expect(isValidObjectIdMock).toHaveBeenCalledWith(taskId);
    });
  });
});
