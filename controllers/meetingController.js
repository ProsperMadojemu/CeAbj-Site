import meetingModel from "../models/meetingModel.js";
import UsersChurch from "../models/usersChurchModel.js";

const createMeeting = async(req,res) => {
    const {
        title,
        outline,
        participantLimit,
        allowedParticipants,
        startDate,
        endDate
    } = req.body;
    try {
        const meeting = new meetingModel({title, outline, participantLimit, allowedParticipants, startDate, endDate});
        await meeting.save();
        res.status(201).json({ message: "Meeting Created Successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const viewMeetings = async (req,res) => {
    try {
        const meetingsList = await meetingModel.aggregate([
            {
                $sort: {startDate: -1}
            }
        ])
        res.status(201).json({ meetingsList });
    } catch(error){
        res.status(400).json({ error: error.message });
    }
}

const viewOneMeeting = async (req,res) => {
    const {id} = req.body;
    try {
        const meeting = await meetingModel.findById(id)

        res.status(201).json({ meeting });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const deleteMeeting = async (req,res) => {
    const {id} = req.body;
    console.log(id);
    try {
        const meeting = await meetingModel.findById(id);
        
        if (!meeting) {
            return res.status(404).json({ success: false, message: "Meeting not found" });
        } 
        await meetingModel.findByIdAndDelete(id);
        res.status(201).json({ success: true, message: "Meeting deleted successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

function allowMeetingAccess (id) {
    const user = UsersChurch.findById(id);
    const position = user.Designation;
    const meeting = meetingModel.find({ status: "live" });
    const allowed = meeting.allowedParticipants;

    if (position === allowed) {
        return true;
    } else {return false}
}

const updateStatus = async (req, res) => {
    const id = req.params.id;
    const {status} = req.body;
    try {
        const meeting = await meetingModel.findById(id);
        
        if (!meeting) {
            return res.status(404).json({ success: false, message: "Meeting not found" });
        } 
        await meetingModel.findByIdAndUpdate(id, { status: status });
        const newMeeting = await meetingModel.findById(id);
        res.status(201).json({ success: true, message: newMeeting.status });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const updateMetting = async (req,res) => {
    const id = req.params.id;
    const {fields} = req.body
    try {
        const meeting = await meetingModel.findById(id);
        if (!meeting){
            return res.status(404).json({ success: false, message: "Meeting not found" });
        }
        await meetingModel.findByIdAndUpdate(id, 
            { $set: fields },
            { new: true }
        )
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export {createMeeting, viewMeetings, deleteMeeting, viewOneMeeting, allowMeetingAccess, updateStatus, updateMetting};