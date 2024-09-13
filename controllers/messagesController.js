import messagesModel from "../models/messagesModel.js";
import membershipModel from "../models/membershipModel.js";
import fs from 'fs'

const sendMessage = async (req, res) => {
    try {
        // let image_filename = `${req.file.filename}`
        let image_filename = req.file ? req.file.filename : '';
        const {Subject, Content, Recipients, type} = req.body
    
        const message = new messagesModel({
            Subject: Subject,
            Image: image_filename,
            Content: Content,
            Recipients: Recipients,
            type:type
        });


        
        await message.save();
        res.status(201).json({ message: "Message Sent Successfully" });
    } catch (error) {
        // console.error("error send message:", error);
        res.status(400).json({ error: error.message });
    }
}

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
  
  

const listMemberships = async (req,res) => {
    try {
        const memberships = await membershipModel.aggregate([
            {
              $match: { type: 'membership' }
            },
            {
              $sort: { time: -1 }
            }
          ]);
        res.json({memberships: memberships});
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

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

export { sendMessage, viewMessage, deleteMessage, sendMembership, listMemberships, viewAll };