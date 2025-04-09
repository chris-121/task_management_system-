import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { StatusEnum, StatusTypes } from '../../types/status';

export type TaskDocument = Task & Document;

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true })
  type: string;

  @Prop({
    default: StatusEnum.PENDING,
    enum: Object.values(StatusEnum),
  })
  status: StatusTypes;

  @Prop({ default: 0 })
  attempts: number;

  @Prop({ default: 1 })
  priority: number;

  @Prop()
  errorMessage?: string;

  @Prop()
  scheduleAt?: Date;

  @Prop()
  processingStartedAt?: Date;

  @Prop()
  completedAt?: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
