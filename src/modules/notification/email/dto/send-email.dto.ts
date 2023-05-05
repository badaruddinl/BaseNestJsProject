export class SendEmailReq {
  email_recipient: string;
  subject: string;
  template_data: {
    link: string;
    email_title: string;
    email_content: string;
  };
}
