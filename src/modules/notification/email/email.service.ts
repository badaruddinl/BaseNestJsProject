import { Injectable } from '@nestjs/common';
import { MailtrapClient } from 'mailtrap';
import * as dotenv from 'dotenv';
import { EmailTemplate } from './template.enum';
import { SendEmailReq } from './dto/send-email.dto';
import {
  style_buttonBgColor,
  style_linkColor,
  style_textButtonColor,
} from './styleMail';
dotenv.config();

@Injectable()
export class EmailService {
  async sendEmail(data: SendEmailReq, templateId: EmailTemplate) {
    const ENDPOINT = 'https://send.api.mailtrap.io/';

    const client = new MailtrapClient({
      endpoint: ENDPOINT,
      token: process.env.MAILTRAP_TOKEN,
    });

    const sender = {
      email: 'no-replay' + '@' + process.env.MAILTRAP_DOMAIN,
      name: 'Company Name',
    };
    const recipients = [
      {
        email: data.email_recipient,
      },
    ];

    const button_name =
      data.subject.toLocaleLowerCase().charAt(0).toLocaleUpperCase() +
      data.subject.toLocaleLowerCase().slice(1);

    const button_title = button_name.toLowerCase().replace(' ', '_');

    client
      .send({
        from: sender,
        to: recipients,
        template_uuid: templateId,
        template_variables: {
          subject: data.subject,
          email_title: data.template_data.email_title,
          email_description: button_name,
          text_section_first_before_button: 'Hi ' + data.email_recipient,
          text_section_second_before_button: data.template_data.email_content,
          link: data.template_data.link,
          button_title: button_title,
          button_name: button_name,
          text_section_first_after_button: 'this_content',
          best_regards: 'Dengan Hormat',
          company_name: process.env.COMPANY_NAME,
          company_address: '_____________',
          provide_mail: 'provide_mail',
          style_buttonBgColor: style_buttonBgColor,
          style_textButtonColor: style_textButtonColor,
          style_linkColor: style_linkColor,
          user_name: 'Test_User_name',
          next_step_link: 'Test_Next_step_link',
          get_started_link: 'Test_Get_started_link',
          onboarding_video_link: 'Test_Onboarding_video_link',
        },
      })
      .then(console.log, console.error);
  }
}
