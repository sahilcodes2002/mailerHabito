const express = require('express');
const nodemailer = require('nodemailer');
const app = express();
const util = require('util')
const cors = require("cors");
const bodyParser = require('body-parser');
require('dotenv').config();

app.use(cors(
    {
      origin: "*"
    }
  ));
  app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host:'smtp.gmail.com',
    port:587,
    secure:false,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    }
    // auth: {
    //     user: 'womensafetyalert11@gmail.com',
    //     pass: 'htpk vxik neog ewbs',
    // },
});


function textbodyofemail(email, tasks) {
    const current_date = new Date();
    const dateString = current_date.toLocaleDateString();
    const timeString = current_date.toLocaleTimeString();
    
    let taskList = tasks.map(task => `- ${task.title}: ${task.description}\nProject Link: https://sahilcodes2002.github.io/Habito/#/project/${task.project_id}`).join('\n\n');
    
    return `
    Hello ${email},

    This is a reminder to complete your pending tasks. Below is a list of tasks you need to complete:

    ${taskList}

    Please make sure to finish them in a timely manner.

    Best regards,
    Habito Team
        `;
}




function htmlbodyofemailnotif(email, tasks) {

    

      
    return `
        <p>Hello ${email},</p>
        <p>You have a new invitation on Habito, check it out on: <a href="https://sahilcodes2002.github.io/Habito/#/notifications">View Task</a></p>
        
    
        <p>Best regards,<br>Habito Team</p>
    `;
}





function htmlbodyofemail(email, tasks) {
    const current_date = new Date();
    const dateString = current_date.toLocaleDateString();
    const timeString = current_date.toLocaleTimeString();
    
    //let taskList = tasks.map(task => `<li><strong>${task.title}</strong>: ${task.description} <br> Project Link: <a href="https://sahilcodes2002.github.io/Habito/#/project/${task.project_id}">View Task</a></li>`).join('');
    let taskList = tasks.map(task => 
        `<li>
          <strong style="font-size: 1.5em; color: #FF7F50;">${task.title}</strong>: ${task.description} 
          <br> 
          Project Link: 
          <a href="https://sahilcodes2002.github.io/Habito/#/project/${task.project_id}">View Task</a>
        </li>`
      ).join('');
      
    return `
        <p>Hello ${email},</p>
        <p>This is a reminder to complete your pending tasks as of <strong>${dateString}</strong> at <strong>${timeString}</strong>.</p>
        <p>Below is a list of tasks you need to complete:</p>
        <ul>
            ${taskList}
        </ul>
        <p>Please make sure to finish them in a timely manner.</p>
        <p>Best regards,<br>Habito Team</p>
    `;
}





const sendMail = util.promisify(transporter.sendMail).bind(transporter);






app.post('/sendmail', async (req, res) => {
  const body = req.body;

  // Validate the incoming request body
  if (!body || !body.success || !body.result) {
      return res.status(400).json({
          message: "Invalid data"
      });
  }

  try {
      // Loop over each user and send emails
      for (const user of body.result) {
          const mailOptions = {
              from: {
                  name: 'Habito',
                  address: process.env.GMAIL_USER,
              },
              to: user.email,
              subject: 'Task Reminder from Habito',
              text: textbodyofemail(user.email, user.items),
              html: htmlbodyofemail(user.email, user.items),
          };

          // Send the email using the promisified sendMail
          await sendMail(mailOptions);
          console.log(`Email sent to ${user.email}`);
      }

      // Respond with success if all emails were sent
      res.status(200).json({
          message: "Emails sent"
      });

  } catch (err) {
      console.error("Error sending emails:", err);
      res.status(500).json({
          message: "Error sending emails",
          error: err.message
      });
  }
});




app.post('/sendnotif', async (req, res) => {
    var body = req.body;
  
    // Helper function for plain text email content
    function textbodyofemailv(code) {
        return `
    Hello ${email},

    You have a new invitation on Habito, check it out on : https://sahilcodes2002.github.io/Habito/#/notifications

    Best regards,
    Habito Team
        `;
    }
    
    // Helper function for HTML email content
    function htmlbodyofemailv(code) {
        return `
        <p>Hello ${email},</p>
        <p>You have a new invitation on Habito, check it out on: <a href="https://sahilcodes2002.github.io/Habito/#/notifications">View Notifications</a></p>
        
    
        <p>Best regards,<br>Habito Team</p>
    `;
    }
  
    // Validate the incoming request body
    if (!body || !body.username) {
        return res.status(400).json({
            message: "Invalid email"
        });
    }
  
    const email = body.username;
    // const code = body.code;
  
    try {
        // Prepare mail options
        const mailOptions = {
            from: {
                name: 'Habito',
                address: process.env.GMAIL_USER,
            },
            to: email,
            subject: 'New invitation',
            text: textbodyofemailv(),
            html: htmlbodyofemailv(),
        };
  
        // Send the email using the promisified sendMail
        await sendMail(mailOptions);
        console.log(`Notif email sent to ${email}`);
  
        // Respond with success message
        return res.status(200).json({
            message: 'Notif email sent',
        });
  
    } catch (error) {
        console.error(`Error sending Notif email to ${email}:`, error);
        return res.status(500).json({
            message: 'Error sending email',
            error: error.message,
        });
    }
  });




  app.post('/sendcode', async (req, res) => {
    var body = req.body;
  
    // Helper function for plain text email content
    function textbodyofemailv(code) {
        const current_date = new Date();
        const dateString = current_date.toLocaleDateString();
        const timeString = current_date.toLocaleTimeString();
    
        return `
    Hello,
    
    Email verification was initiated at ${timeString} on ${dateString}.
    If you did not initiate this, please ignore this message.
    
    Your verification code is: ${code}
    
    Please complete the verification process promptly.
    
    Best regards,
    Habito Team
        `;
    }
    
    // Helper function for HTML email content
    function htmlbodyofemailv(code) {
        const current_date = new Date();
        const dateString = current_date.toLocaleDateString();
        const timeString = current_date.toLocaleTimeString();
        
        return `
        <p>Hello,</p>
        <p><strong>Email Verification</strong> was initiated at <strong>${timeString}</strong> on <strong>${dateString}</strong>.</p>
        <p><strong>Ignore this</strong> if you didn't initiate the process.</p>
        <br/>
        <p>Your verification code is: <strong>${code}</strong></p>
        <p>Please complete the verification process promptly.</p>
        <p>Best regards,<br>Habito Team</p>
        `;
    }
  
    // Validate the incoming request body
    if (!body || !body.email) {
        return res.status(400).json({
            message: "Invalid email"
        });
    }
  
    const email = body.email;
    const code = body.code;
  
    try {
        // Prepare mail options
        const mailOptions = {
            from: {
                name: 'Habito',
                address: process.env.GMAIL_USER,
            },
            to: email,
            subject: 'Your Habito Verification Code',
            text: textbodyofemailv(code),
            html: htmlbodyofemailv(code),
        };
  
        // Send the email using the promisified sendMail
        await sendMail(mailOptions);
        console.log(`Verification email sent to ${email}`);
  
        // Respond with success message
        return res.status(200).json({
            message: 'Verification email sent',
        });
  
    } catch (error) {
        console.error(`Error sending verification email to ${email}:`, error);
        return res.status(500).json({
            message: 'Error sending email',
            error: error.message,
        });
    }
  });



const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
  
    //console.log(`Server running on port ${PORT}`);
});