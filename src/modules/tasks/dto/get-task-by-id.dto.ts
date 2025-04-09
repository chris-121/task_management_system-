import { IsMongoId } from 'class-validator';

export class GetTaskByIdDto {
  @IsMongoId()
  id: string;
}
