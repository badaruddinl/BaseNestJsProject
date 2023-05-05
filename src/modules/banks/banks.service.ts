import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TypeStatusBanks } from 'src/models/entities/bank.entity';
import { RepositoryService } from 'src/models/repository/repository.service';
import { NewCreateBanksDto } from './dto/new-create-banks.dto';
import { UpdateBanksDto } from './dto/update-banks.dto';

@Injectable()
export class BanksService {
  public constructor(private readonly repoService: RepositoryService) {}

  async myBankOne(id: string) {
    const myBankOme = await this.repoService.bankRepo
      .createQueryBuilder('user_banks')
      .where('user_banks.user_id = :loginUserId', { loginUserId: id })
      .orderBy('user_banks.created_at', 'ASC')
      .select('user_banks.id')
      .addSelect('user_banks.bank_name')
      .addSelect('user_banks.account_name')
      .addSelect('user_banks.account_number')
      .addSelect('user_banks.isDefault')
      .getOne();

    return myBankOme;
  }

  async myAllBanks(id: string) {
    const myAllBanks = await this.repoService.bankRepo
      .createQueryBuilder('user_banks')
      .where('user_banks.user_id = :loginUserId', { loginUserId: id })
      .orderBy('user_banks.created_at', 'ASC')
      .select('user_banks.id')
      .addSelect('user_banks.bank_name')
      .addSelect('user_banks.account_name')
      .addSelect('user_banks.account_number')
      .addSelect('user_banks.isDefault')
      .getMany();

    return myAllBanks;
  }

  async createMyBanks(payload: NewCreateBanksDto) {
    const newBanks = await this.repoService.bankRepo.create({
      user_id: payload.user_id,
      bank_name: payload.bank_name,
      account_name: payload.account_name,
      account_number: payload.account_number.toString(),
      isDefault: false,
      status: TypeStatusBanks.ACTIVE,
    });
    const dataSave = await this.repoService.bankRepo.save(newBanks);
    return {
      message: 'Bank successfully created',
      data: {
        id: dataSave.id,
        bank_name: dataSave.bank_name,
        account_name: dataSave.bank_name,
        account_number: dataSave.account_number,
        isDefault: dataSave.isDefault,
        deleted_at: dataSave.deleted_at,
        created_at: dataSave.created_at,
        updated_at: dataSave.updated_at,
      },
    };
  }

  async update(data: UpdateBanksDto, id: string, user_id: string) {
    try {
      const thisBank = await this.repoService.bankRepo.findOne({
        id: id,
      });

      if (thisBank.user_id != user_id) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error_code: 'FORBIDDEN',
            message: 'Not_your_banks',
          },
          HttpStatus.FORBIDDEN,
        );
      }
      const newData = {
        ...data,
        account_number: data.account_number.toString(),
      };
      const update = await this.repoService.bankRepo.update(
        { id: id },
        newData,
      );

      if (update) {
        return {
          status: true,
          message: 'OK',
        };
      }
      return update;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async setDefault(id: string, user_id: string) {
    try {
      const myBank = await this.repoService.bankRepo.update(
        { user_id: user_id },
        { isDefault: false },
      );

      if (!myBank) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error_code: 'NOT_FOUND',
            message: 'data not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const update = await this.repoService.bankRepo.update(
        { id: id },
        { isDefault: true },
      );

      if (update) {
        return {
          status: true,
          message: 'BANK IS DEFAULT',
        };
      }
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async delete(id: string, user_id: string) {
    try {
      const myBanks = await this.repoService.bankRepo.find({
        user_id: user_id,
      });

      if (!myBanks) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error_code: 'NOT_FOUND',
            message: 'data not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const myBankData = await myBanks.map((data) => data.id);
      if (myBankData.includes(id)) {
        const isDefault = await this.repoService.bankRepo.findOne({
          id,
        });
        if (isDefault.isDefault != true) {
          const remove = await this.repoService.bankRepo.softDelete({
            id: id,
          });
          if (remove) {
            return {
              message: 'BANK DELETED',
            };
          }
        } else {
          throw new HttpException('BANK IS DEFAULT', HttpStatus.NOT_ACCEPTABLE);
        }
      }
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
