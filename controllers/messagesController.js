import multer from "multer"
import messagesModel from "../models/messagesModel.js";

// const addFood = async (req,res) => {

//     let image_filename = `${req.file.filename}`

//     const food  = new foodModel({
//         name:req.body.name,
//         description:req.body.description,
//         price:req.body.price,
//         category:req.body.category,
//         image:image_filename
//     })

//     try {
//         await food.save();
//         res.json({success:true,message:"Food Added"})
//     } catch (error) {
//         console.log(error)
//             res.json({success:false,message:"Error"})
//     }

// }

// Subject: {type: String, required: true},
// Content: {type: String, required: true},
// Recipients: {type: String, required: true}

const sendMessage = async (req, res) => {
    try {
        let image_filename = `${req.file.filename}`
        const {Subject, Content, Recipients} = req.body
    
        const message = new messagesModel({
            Subject: Subject,
            Image: image_filename,
            Content: Content,
            Recipients: Recipients,
        });


        
        await message.save();
        res.status(201).json({ message: "Message Sent Successfully" });
    } catch (error) {
        // console.error("error send message:", error);
        res.status(400).json({ error: error.message });
    }
}

const viewMessage = async (req,res) => {
    try {
        const message = await messagesModel.find({},
            {
              Content: 1,
              Image: 1,
              Recipients: 1,
              Subject: 1,
              _id: 0
            });
        res.json({message: message})
    } catch (error) {
        console.error("error getting message:", error);
        // res.status(400).json({ error: error.message });
    }
}

export {sendMessage, viewMessage};