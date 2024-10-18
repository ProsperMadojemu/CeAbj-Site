import messagesModel from "../models/messagesModel.js";
import membershipModel from "../models/membershipModel.js";
import fs from 'fs'
import mongoose from "mongoose";
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
            type = 'scheduled'
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
                isRead: false,
                isVisible: true
            })),
            type: type,
            time: time,
            isSent: isSent
        });
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
const getFullMessage = async (req,res) => {
    const {id} = req.body;
    try {
        const message = await messagesModel.findById(id);
        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }
        const recipients = message.Recipients;
    res.json({message, recipients});
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}
const viewAll = async (req,res) => {
    try {
        const message = await messagesModel.find({});
        res.json({message: message})
    } catch (error) {
        res.status(400).json({ error: error.message});
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

const userMessage = async (req, res) => {
    if (!req.session.user || !req.session.user.email) {
        return res.status(401).json({ error: "User not logged in" });
    }

    const email = req.session.user.email;

    try {
        const message = await messagesModel.aggregate([
            {
                $match: {
                    'Recipients.Email': email,
                    isSent: true
                }
            },
            {
                $project: {
                    _id: 1,
                    Subject: 1,
                    time: 1,
                    Content: 1,
                    Recipients: {
                        $filter: {
                            input: '$Recipients',
                            as: 'recipient',
                            cond: { $eq: ['$$recipient.Email', email] }
                        }
                    }
                }
            }
        ]);

        res.json({ message: message });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};




const fieldUpdate = async(req, res) => {
    const { id, isVisible, isRead } = req.body;
    const email = req.session.user.email;
    const ObjectId = mongoose.Types.ObjectId;

    try {
        const updatedMessage = await messagesModel.findOneAndUpdate(
            {
                _id: new ObjectId(id),    
                'Recipients.Email': email 
            },
            {
                $set: {
                    'Recipients.$.isVisible': isVisible,
                    'Recipients.$.isRead': isRead       
                }
            },
            {
                new: true
            }
        );

        if (!updatedMessage) {
            return res.status(404).json({ error: 'Message or recipient not found' });
        }

        return res.status(200).json({
            message: 'Update successful',
            updatedMessage: updatedMessage
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while updating the message' });
    }
};


export { sendMessage, viewMessage, deleteMessage, sendMembership, viewAll, getFullMessage, userMessage, fieldUpdate };