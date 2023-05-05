import { HttpException, HttpStatus } from '@nestjs/common';
import { AdminType, TypeUser } from 'src/models/entities/users.entity';

export const validationRole = (role: any, data: any) => {
  if (role == AdminType.NON_ADMIN) {
    if (
      data.typeuser == TypeUser.EMPLOYEE ||
      data.typeuser == TypeUser.USER ||
      data.typeuser == TypeUser.ADMIN ||
      data.role == AdminType.SUPER_ADMIN ||
      data.role == AdminType.ADMIN ||
      data.role == AdminType.NON_ADMIN
    ) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error_code: 'FORBIDDEN',
          message: 'FORBIDDEN',
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }
  if (role == AdminType.ADMIN) {
    if (
      data.typeuser == TypeUser.ADMIN ||
      data.role == AdminType.ADMIN ||
      data.role == AdminType.SUPER_ADMIN
    ) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error_code: 'FORBIDDEN',
          message: 'FORBIDDEN',
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }
};

export const validationRoleUpdate = (role: any, targetUserRole: string) => {
  if (role == AdminType.NON_ADMIN) {
    if (
      targetUserRole == AdminType.SUPER_ADMIN ||
      targetUserRole == AdminType.ADMIN ||
      targetUserRole == AdminType.NON_ADMIN
    ) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error_code: 'FORBIDDEN',
          message: 'FORBIDDEN',
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }
  if (role == AdminType.ADMIN) {
    if (
      targetUserRole == AdminType.SUPER_ADMIN ||
      targetUserRole == AdminType.ADMIN
    ) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error_code: 'FORBIDDEN',
          message: 'FORBIDDEN',
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }
  if (role == AdminType.SUPER_ADMIN) {
    if (targetUserRole == AdminType.SUPER_ADMIN) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error_code: 'FORBIDDEN',
          message: 'FORBIDDEN',
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }
};
