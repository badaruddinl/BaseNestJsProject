import { HttpException, Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common/enums';
import { TypeStatusAddress } from 'src/models/entities/users-address.entity';
import { RepositoryService } from 'src/models/repository/repository.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { NewCreateAddressDto } from './dto/new-create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {
  public constructor(private readonly repoService: RepositoryService) {}

  async myAddress(id: string) {
    // const myCurrentAddress = await this.repoService.userRepo
    //   .createQueryBuilder('users')
    //   .leftJoinAndSelect('users.address', 'addressjoin')
    //   .where('users.id = :id', { id })
    //   .orderBy('addressjoin.created_at', 'ASC')
    //   .getOne();
    const myCurrentAddress = await this.repoService.userAddressRepo
      .createQueryBuilder('users_address')
      .where('users_address.user_id = :loginUserId', { loginUserId: id })
      .orderBy('users_address.created_at', 'ASC')
      .getMany();
    const address = myCurrentAddress[0];
    if (address) {
      return {
        id: address.id,
        phone: address.phone,
        address: address.address,
        zipcode: address.zipcode,
        city: address.city,
        province: address.province,
        country: address.country,
      };
    } else {
      return null;
    }
  }

  async getAddressById(id: string) {
    const dataAddres = await this.repoService.userAddressRepo.findOne({
      id,
      deleted_at: null,
    });

    if (dataAddres && dataAddres.deleted_at == null) {
      return dataAddres;
    }

    throw new HttpException(
      {
        status: HttpStatus.NOT_FOUND,
        error_code: 'NOT_FOUND',
        message: 'Data not found',
      },
      HttpStatus.NOT_FOUND,
    );
  }

  async getAddressAll() {
    const dataAddress = await this.repoService.userAddressRepo
      .createQueryBuilder('users_address')
      .getMany();

    if (dataAddress) {
      return dataAddress;
    }

    throw new HttpException(
      {
        status: HttpStatus.NOT_FOUND,
        error_code: 'NOT_FOUND',
        message: 'Data not found',
      },
      HttpStatus.NOT_FOUND,
    );
  }

  async myAllAddress(id: string) {
    const myAllAddress = await this.repoService.userAddressRepo
      .createQueryBuilder('users_address')
      .where('users_address.user_id = :loginUserId', { loginUserId: id })
      .orderBy('users_address.created_at', 'ASC')
      .select('users_address.id')
      .addSelect('users_address.city')
      .addSelect('users_address.address')
      .addSelect('users_address.zipcode')
      .addSelect('users_address.phone')
      .addSelect('users_address.province')
      .addSelect('users_address.country')
      .addSelect('users_address.isDefault')
      .getMany();

    return myAllAddress;
  }

  async createMyAddress(data: NewCreateAddressDto) {
    const newAddress = await this.repoService.userAddressRepo.create({
      user_id: data.user_id,
      address: data.address,
      city: data.city,
      province: data.province,
      country: data.country,
      zipcode: data.zipcode,
      phone: data.phone,
      isDefault: false,
      status: TypeStatusAddress.ACTIVE,
    });
    const dataSave = await this.repoService.userAddressRepo.save(newAddress);
    return {
      message: 'Address is created',
      data: {
        id: dataSave.id,
        address: dataSave.address,
        city: dataSave.city,
        province: dataSave.province,
        country: dataSave.country,
        zipcode: dataSave.zipcode,
        phone: dataSave.phone,
        isDefault: dataSave.isDefault,
        deleted_at: dataSave.deleted_at,
        created_at: dataSave.created_at,
        updated_at: dataSave.updated_at,
      },
    };
  }

  async update(data: UpdateAddressDto, id: string, user_id: string) {
    try {
      const thisAddress = await this.repoService.userAddressRepo.findOne({
        id: id,
      });

      if (thisAddress.user_id != user_id) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error_code: 'FORBIDDEN',
            message: 'Not_your_address',
          },
          HttpStatus.FORBIDDEN,
        );
      }
      const newData = {
        ...data,
        status: TypeStatusAddress.ACTIVE,
      };
      const update = await this.repoService.userAddressRepo.update(
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
      const myAddress = await this.repoService.userAddressRepo.update(
        { user_id: user_id },
        { isDefault: false },
      );

      if (!myAddress) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error_code: 'NOT_FOUND',
            message: 'data not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const update = await this.repoService.userAddressRepo.update(
        { id: id },
        { isDefault: true },
      );

      if (update) {
        return {
          status: true,
          message: 'ADDRESS IS DEFAULT',
        };
      }
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async delete(id: string, user_id: string) {
    try {
      const myAddress = await this.repoService.userAddressRepo.find({
        user_id: user_id,
      });

      if (!myAddress) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error_code: 'NOT_FOUND',
            message: 'data not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const addressFirst = await this.myAddress(user_id);
      const myAddData = await myAddress.map((data) => data.id);
      if (myAddData.includes(id)) {
        const isDefault = await this.repoService.userAddressRepo.findOne({
          id,
        });
        if (isDefault.isDefault != true && addressFirst.id != id) {
          const remove = await this.repoService.userAddressRepo.softDelete({
            id: id,
          });
          if (remove) {
            return {
              message: 'ADDRESS DELETED',
            };
          }
        } else {
          throw new HttpException(
            'ADDRESS IS DEFAULT',
            HttpStatus.NOT_ACCEPTABLE,
          );
        }
      }
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
