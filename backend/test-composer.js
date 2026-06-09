import MailComposer from 'nodemailer/lib/mail-composer/index.js';
const composer = new MailComposer({
  from: 'test@test.com',
  to: 'test@test.com',
  subject: 'Test',
  text: 'Test body'
});
const msg = await composer.compile().build();
console.log(msg.toString('base64'));
