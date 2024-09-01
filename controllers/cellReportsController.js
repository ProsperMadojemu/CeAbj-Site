import usersCellReport from "../models/cellReportsModel.js"
import Users from "../models/usersModel.js";
import getDateRange from "../utils/getRangeFunction.js";

const submitReport = async (req,res) => {
    try {
        const {
            FirstName,
            LastName,
            CellName,
            NameOfPcf,
            ServiceAttendance,
            SundayFirstTimers,
            CellMeetingAttendance,
            CellFirstTimers,
            offering,
            SubmissionDate,
        } = req.body;

        const sessionEmail = req.session.user.email;
        const user = await Users.findOne(
            { Email: sessionEmail },
            { PhoneNumber: 1, _id: 0 }
        );

        const { PhoneNumber } = user;

        const reportField = {
            FirstName,
            LastName,
            CellName,
            NameOfPcf,
            ServiceAttendance,
            SundayFirstTimers,
            CellMeetingAttendance,
            CellFirstTimers,
            PhoneNumber,
            offering,
            SubmissionDate,
        };

        const newCellReport = new usersCellReport(reportField);
        await newCellReport.save();
        res.status(201).json({ message: "Report submitted successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const searchReports = async (req, res) => {
    try {
        const pcfLeader = req.params.id;
        const findPcfLeader = await newCell.findById(pcfLeader);
        const currentDate = new Date();
        const tomorrowDate = new Date(currentDate);
        tomorrowDate.setDate(currentDate.getDate() + 1);
        const yesterdayDate = new Date(currentDate);
        yesterdayDate.setDate(currentDate.getDate() - 1);
        // console.log('today:', tomorrowDate);

        if (!findPcfLeader) {
            return res.status(404).json({ error: "Leader not found" });
        }

        const pcfName = findPcfLeader.NameOfPcf;
        const cellReports = await usersCellReport.find(
            {
                SubmissionDate: {
                    $gte: yesterdayDate,
                    $lt: tomorrowDate,
                },
                NameOfPcf: pcfName,
            },
            {
                FirstName: 1,
                LastName: 1,
                CellName: 1,
                ServiceAttendance: 1,
                SundayFirstTimers: 1,
                CellMeetingAttendance: 1,
                CellFirstTimers: 1,
                PhoneNumber: 1,
                offering: 1,
                NameOfPcf: 1,
                SubmissionDate: 1,
                _id: 1,
            }
        );

        // console.log(cellReports);

        const leadersUnderPcf = await newCell.find(
            { NameOfPcf: pcfName },
            {
                NameOfCell: 1,
                NameOfLeader: 1,
                PhoneNumber: 1,
                _id: 0,
            }
        );

        if (!cellReports) {
            return res.status(404).json({ error: "Report not found" });
        }

        res.json({ cellReports, leadersUnderPcf });
    } catch (error) {
        res.status(500).json({ error: "Error fetching data" });
        console.error("Error fetching data", error);
    }
}

const searchReports2 = async (req,res) => {
    try {
        const searchTerm = req.query.q || "";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const dateRange = req.query.dateRange || ""; // e.g., 'lastSunday', 'pastMonth'

        // Construct regular expression for case-insensitive search
        const regex = new RegExp(searchTerm, "i");

        // Construct search criteria
        const searchCriteria = {
            $or: [
                { FirstName: regex },
                { LastName: regex },
                { CellName: regex },
                { PhoneNumber: regex },
                { ServiceAttendance: regex },
                { SundayFirstTimers: regex },
                { CellMeetingAttendance: regex },
                { NameOfPcf: regex },
                { CellFirstTimers: regex },
                { offering: regex },
            ],
            ...(dateRange && { SubmissionDate: getDateRange(dateRange) }), // Filter by date range if provided
        };

        // Fetch reports from the database with pagination
        const cellReports = await usersCellReport
            .find(searchCriteria, {
                FirstName: 1,
                LastName: 1,
                CellName: 1,
                ServiceAttendance: 1,
                SundayFirstTimers: 1,
                CellMeetingAttendance: 1,
                CellFirstTimers: 1,
                PhoneNumber: 1,
                offering: 1,
                NameOfPcf: 1,
                SubmissionDate: 1,
                _id: 1,
            })
            .sort({ SubmissionDate: -1 }) // Sort by most recent date
            .skip((page - 1) * limit)
            .limit(limit);

        // Count total matching documents for pagination
        const totalReports = await usersCellReport.countDocuments(searchCriteria);

        // Calculate total pages
        const totalPages = Math.ceil(totalReports / limit);

        // Respond with JSON data
        res.json({
            cellReports,
            totalReports,
            currentPage: page,
            totalPages,
        });
    } catch (error) {
        console.error("Error searching data:", error);
        res.status(500).json({ error: "Error searching data" });
    }
}

export { submitReport, searchReports, searchReports2 };