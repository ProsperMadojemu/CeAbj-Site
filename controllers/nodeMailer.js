import nodemailer from 'nodemailer';
import 'dotenv/config';

// Create the transporter using Gmail's SMTP service
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'prospermadojemu00@gmail.com', // Your Gmail account
        pass: process.env.APP_PASS // App password from .env file
    }
});

async function main(email) {
    try {
        // Send mail with the defined transport object
        const info = await transporter.sendMail({
            from: '"Prosper Madojemu" <prospermadojemu00@gmail.com>', // Sender address
            to: email, // Receiver address
            subject: "View your messages!", // Subject line
            text: "You Have Unread Messages", // Plain text body
            html: "<h1>hey</h1>", // HTML body
        });
  
        console.log("Message sent: %s", info.messageId); // Log message ID
    } catch (error) {
        console.error("Error sending email:", error); // Catch and log any errors
    }
}

async function weeklyUnreadCheck(email) {
    try {
        // Send mail with the defined transport object
        const info = await transporter.sendMail({
            from: '"Prosper Madojemu" <prospermadojemu00@gmail.com>', // Sender address
            to: email, // Receiver address
            subject: "View your messages!", // Subject line
            text: "You Have Unread Messages", // Plain text body
            html: "<h1><b>You have unread messages from Admin on Christ Embassy Abaranje(Admin)</b></h1> <h4>view your unread messages @<a href=google.com>ChristEmbassyAbaranje</a></h4>", // HTML body
        });
  
        console.log("Message sent: %s", info.messageId); // Log message ID
    } catch (error) {
        console.error("Error sending email:", error); // Catch and log any errors
    }
}

export default weeklyUnreadCheck;