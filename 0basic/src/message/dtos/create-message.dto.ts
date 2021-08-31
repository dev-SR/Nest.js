import { IsString, Min, minLength } from 'class-validator';

export class CreateMessageDto {
  content: string;
}
