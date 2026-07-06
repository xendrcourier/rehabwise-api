import { IsNotEmpty, IsUUID } from 'class-validator';

export class ReassignPatientDto {
  @IsUUID(undefined, { message: 'therapist_id must be a valid id' })
  @IsNotEmpty({ message: 'therapist_id is required' })
  therapist_id!: string;
}
