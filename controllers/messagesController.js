import messagesModel from "../models/messagesModel.js";
import membershipModel from "../models/membershipModel.js";
import fs from 'fs'
import Users from "../models/usersModel.js";

const sendMessage = async (req, res) => {
    try {
        let image_filename = req.file ? req.file.filename : '';
        let { Subject, Content, Recipients, type, time, isSent } = req.body;
        const newValue = Recipients;
        if (!Array.isArray(Recipients)) {
            Recipients = [Recipients];
            Recipients = Recipients[0].split(' ')[0]; 
            Recipients = Recipients.split(' ');
        }
        let allRecipients = [];
        if (!time) {
            time = Date.now();
            isSent = true;
        } else {
            isSent = false;
        }
        for (let recipient of Recipients) {
            const group = await Users.find({ LeadershipPosition: recipient });
            if (group.length > 0) {
                allRecipients = allRecipients.concat(group);
            } else {
                const user = await Users.findOne({
                    $or: [
                        { FirstName: recipient },
                        { LastName: recipient },
                        { Email: recipient },
                        { PhoneNumber: recipient },
                        { Church: recipient }
                    ]
                });
                if (user) {
                    allRecipients.push(user);
                } else {
                    return 'USER NOT FOUND'
                }
            }
        }
        const message = new messagesModel({
            name: newValue,
            Subject: Subject,
            Image: image_filename,
            Content: Content,
            Recipients: allRecipients.map(user => ({
                name: `${user.FirstName} ${user.LastName}`, 
                Email: user.Email, 
                phone: user.PhoneNumber, 
                isRead: false
            })),
            type: type,
            time: time,
            isSent: isSent
        });
        console.log(message);
        await message.save();
        res.status(201).json({ message: "Message Sent Successfully" });
        
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
const sendMembership = async (req, res) => {
    const { name, email, phone, address, type, consent } = req.body;
    const memberships = new membershipModel({ name, email, phone, address, type, consent });
  
    try {
      await memberships.save();
      res.status(201).json({ message: "Form Sent Successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
};
const viewMessage = async (req,res) => {
    const {type} = req.body
    try {
        const message = await messagesModel.aggregate([
            {
                $match: { type: type }
            },
            {
                $sort: {Time: -1,}
            }
        ]);
        res.json({message: message})
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}
const viewAll = async (req,res) => {
    try {
        const message = await messagesModel.find({});
        res.json({message: message})
    } catch (error) {
        console.error("error getting message:", error);
        // res.status(400).json({ error: error.message });
    }
}
const deleteMessage = async (req, res) => {
    const { id } = req.body;
    try {
        const message = await messagesModel.findById(id);
        
        if (!message) {
            return res.status(404).json({ success: false, message: "Message not found" });
        }

        if (message.Image) {
            fs.unlink(`uploads/${message.Image}`, (err) => {
                if (err) {
                    console.error(`Failed to delete image file: ${err.message}`);
                }
            });
        }

        await messagesModel.findByIdAndDelete(id);

        res.json({ success: true, message: "Message deleted successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error deleting message" });
    }
};

export { sendMessage, viewMessage, deleteMessage, sendMembership, viewAll };