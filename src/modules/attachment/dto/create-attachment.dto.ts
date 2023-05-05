import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateAttachmentDto {
  @ApiProperty()
  @IsUUID('all', { message: 'Document ID should be uuid' })
  @IsNotEmpty({ message: 'Document ID should not be empty' })
  document_id: string;

  @ApiProperty()
  @IsNotEmpty()
  document_type: string;
}
