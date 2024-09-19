import cron from "node-cron"
import messagesModel from "../models/messagesModel.js"
import weeklyUnreadCheck from "./nodeMailer.js";

async function scheduleWebMessages() {
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            const nowUTC = new Date(now.toISOString());  
            const messages = await messagesModel.find({
                isSent: false,
                time: {
                    $lte: nowUTC
                }
            });
            if (messages.length === 0) {
                return
            }
            for (const message of messages) {
                if (!message.name) {
                    console.log('Skipping message due to missing name:', message);
                    return;
                }
                message.isSent = true;
                message.type = 'sent';
                await message.save();
            }
        } catch (error) {
            console.error('ERROR IN CRON JOB:', error);
        }
    });
}


// Sends messages every saturday by 2pm to users that have not checked their emails
async function weeklyEmails(req, res) {
    const emails = await messagesModel.aggregate([
        {
            '$match': {
                'Recipients.isRead': false
            }
        },
        {
            '$unwind': '$Recipients'
        },
        {
            '$match': {
            'Recipients.isRead': false
            }
        },
        {
            '$group': {
                '_id': '$Recipients.Email'
            }
        },
        {
            '$project': {
                'Email': '$_id',
                '_id': 0
            }
        }
    ]);
    cron.schedule('0 14 * * 6', async () => {
        try {
            emails.forEach(async (emailObject) => {
                const email = emailObject.Email;
                await weeklyUnreadCheck(email);
                console.log("email sent to:", email);
                
            });
        } catch (error) {
            console.error(error);
        }
    });
}
export { scheduleWebMessages, weeklyEmails }