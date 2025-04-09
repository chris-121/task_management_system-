import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TasksService } from './tasks.services';
import { CreateTaskDto } from './dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Tasks')
@Controller('api/v1/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('')
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created' })
  async createTask(@Body() task: CreateTaskDto) {
    return this.tasksService.createTask(task);
  }

  @Get('/status')
  @ApiOperation({ summary: 'Get summary of task statuses' })
  async getStatus() {
    return this.tasksService.getTaskStatusSummary();
  }

  @Get('/metrics')
  @ApiOperation({ summary: 'Get task processing metrics' })
  async getMetrics() {
    return this.tasksService.getMetrics();
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get a task by ID' })
  async getById(@Param('id') id: string) {
    return this.tasksService.getTaskById(id);
  }
}
