const sgMail = require('@sendgrid/mail');

const sendgridAPIKey = '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';

sgMail.setApiKey(sendgridAPIKey);

sgMail.send({
    to:"kumarinikki99@gmail.com",
    from:"kumarinikki99@gmail.com",
    subject: 'This is my first creation',
    text: 'I hope this one actually get to you.'
}).catch(e =>{
    console.log(e);
});