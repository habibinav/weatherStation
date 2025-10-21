// emailHandler.js
require('dotenv').config();
const imaps = require('imap-simple');
const { simpleParser } = require('mailparser');
const QueryLog = require('./models/QueryLog');
const nodemailer = require('nodemailer');

const imapConfig = {
  imap: {
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASS,
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    tls: true,
    authTimeout: 3000
  }
};

async function checkEmailOnce(){
  const connection = await imaps.connect(imapConfig);
  await connection.openBox('INBOX');

  const searchCriteria = ['UNSEEN'];
  const fetchOptions = { bodies: [''], markSeen: true };

  const results = await connection.search(searchCriteria, fetchOptions);
  for(const res of results){
    const raw = res.parts[0].body;
    const parsed = await simpleParser(raw);
    const from = parsed.from.value[0].address;
    const subject = parsed.subject || '';
    const text = parsed.text || '';

    // Basic parse: you should write better rules later
    const parsedParams = parseQueryParamsFromText(text);

    // Save log
    const log = await QueryLog.create({
      requesterEmail: from,
      subject,
      queryText: text,
      parsedParams
    });

    // send auto-ack
    await sendAckEmail(from, log._id);

    console.log('Logged query', log._id);
  }

  connection.end();
}

// minimal parser - update rules to match expected email formats
function parseQueryParamsFromText(text){
  // e.g., look for dates or keywords
  const params = {};
  const dateMatch = text.match(/(\d{4}-\d{2}-\d{2})/g);
  if(dateMatch) params.dates = dateMatch;
  // look for parameter names
  if(/temperature/i.test(text)) params.parameter = 'temperature';
  if(/humidity/i.test(text)) params.parameter = 'humidity';
  return params;
}

async function sendAckEmail(to, logId){
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });

  const body = `Thanks — your request has been received.\nLog ID: ${logId}\nWe will process it shortly.`;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'Query Received - Weather Station',
    text: body
  });
}

// Option A: run periodically from a simple loop
setInterval(()=> {
  checkEmailOnce().catch(err => console.error('email check err', err));
}, 5 * 60 * 1000); // every 5 minutes

// Option B: run this script as a cron job or a process managed by PM2
