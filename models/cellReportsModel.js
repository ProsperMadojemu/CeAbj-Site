import mongoose from "mongoose";

const cellReportSchema = new mongoose.Schema({
    FirstName: String,
    LastName: String,
    CellName: String,
    NameOfPcf: String,
    ServiceAttendance: String,
    SundayFirstTimers: String,
    CellMeetingAttendance: String,
    CellFirstTimers: String,
    PhoneNumber: String,
    offering: String,
    SubmissionDate: {
        type: Date,
        default: Date.now,
    },
});

const usersCellReport = mongoose.model("cellreports", cellReportSchema);

export default usersCellReport;