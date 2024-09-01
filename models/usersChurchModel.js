import mongoose from "mongoose";

const userChurchSchema = new mongoose.Schema({
    Email: String,
    FirstName: String,
    LastName: String,
    Church: String,
    NameOfPcf: String,
    LeadershipPosition: String,
    NameOfCell: String,
    Department: String,
    Zone: String,
});


const UsersChurch = mongoose.model("usersChurchDetails", userChurchSchema);

export default UsersChurch;