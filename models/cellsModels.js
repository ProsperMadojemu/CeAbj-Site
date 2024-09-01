import mongoose from "mongoose";


const newCellSchema = new mongoose.Schema({
    NameOfLeader: String,
    PhoneNumber: String,
    LeaderPosition: String,
    CellType: String,
    NameOfPcf: String,
    NameOfSeniorCell: String,
    NameOfCell: String,
    SubmissionDate: {
        type: Date,
        default: Date.now,
    },
});

const newCell = mongoose.model("cellsAndLeaders", newCellSchema);

export default newCell;