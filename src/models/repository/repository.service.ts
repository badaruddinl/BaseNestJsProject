import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from '../entities/users.entity';
import { MagicCode } from '../entities/magic-code.entity';
import { Banks } from '../entities/bank.entity';
import { UsersAddress } from '../entities/users-address.entity';
import { Attachment } from '../entities/attachment.entity';

@Injectable()
export class RepositoryService {
  @InjectRepository(Users)
  public readonly userRepo: Repository<Users>;

  @InjectRepository(MagicCode)
  public readonly magicCodeRepo: Repository<MagicCode>;

  @InjectRepository(Banks)
  public readonly bankRepo: Repository<Banks>;

  @InjectRepository(UsersAddress)
  public readonly userAddressRepo: Repository<UsersAddress>;

  @InjectRepository(Attachment)
  public readonly attachmentRepo: Repository<Attachment>;
}
