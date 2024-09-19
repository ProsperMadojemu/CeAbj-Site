import cron from "node-cron"
import messagesModel from "../models/messagesModel.js"
import weeklyUnreadCheck from "./nodeMailer.js";

async function scheduleWebMessages() {
    const now = new Date();
    const fortyFiveSecondsLater = new Date(now.getTime() + 45 * 1000);


    cron.schedule('* * * * *', async()=> {
        try {
            const message = await messagesModel.find({
                isSent: false,
                time: {
                    $gte: now,
                    $lte: fortyFiveSecondsLater
                }
            });
        
            message.forEach(async (message) => {
                if (!message.name) {
                    console.log('Skipping message due to missing name:', message);
                    return;  
                }
                
                console.log('Sending Message', message );
                message.isSent = true;
                await message.save();
            });
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