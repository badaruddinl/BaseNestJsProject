import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();

const MainURL = process.env.FRONT_END_URL
  ? process.env.FRONT_END_URL
  : 'https://domain.com/';

@Injectable()
export class NotificationService {
  public async createURL(type, code, document_id) {
    let url = MainURL;
    switch (type) {
      case 'reset_password':
        url += 'reset-password/' + code;
        break;
      case 'verification_email':
        url += 'verif_mail/' + code;
        break;
      case 'notification':
        url += 'auth' + '/code/' + code + '/notification/' + document_id;
        break;
    }
    return url;
  }
}
