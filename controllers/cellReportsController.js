import usersCellReport from "../models/cellReportsModel.js"
import Users from "../models/usersModel.js";
import getDateRange from "../utils/getRangeFunction.js";
import newCell from "../models/cellsModels.js";

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
        res.status(201).json({ message: "Report submitted successfully"});
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const listReports = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1); 
        const limit = parseInt(req.query.limit) === 0 ? 0 : parseInt(req.query.limit) || 10;
        const search = req.query.search || "";
        const sort = req.query.sort || "";
        const pcfFilter = req.query.pcf || "All";
        const statusFilter = req.query.status || "All";
        const dateFilter = req.query.date || "all";

        const pcfs = await newCell.distinct("NameOfPcf");

        const [sortField, sortOrder] = sort.split(",");
        const sortBy = { [sortField || "createdAt"]: sortOrder === "desc" ? -1 : 1 }; 

        const regex = new RegExp(search, "i");
        const searchCriteria = {
            ...(search && {
                $or: [
                    { FirstName: regex },
                    { LastName: regex },
                    { CellName: regex },
                    { NameOfPcf: regex },
                    { ServiceAttendance: regex },
                    { SundayFirstTimers: regex },
                    { CellMeetingAttendance: regex },
                    { CellFirstTimers: regex },
                    { PhoneNumber: regex },
                ],
            }),
            ...(pcfFilter !== "All" && { NameOfPcf: pcfFilter }),
            ...(statusFilter !== "All" && { status: statusFilter })
        };

        // Define date ranges for date filters
        const today = new Date();
        let startDate;
        let endDate = new Date();

        switch (dateFilter) {
            case "presentDay":
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);
                startDate = new Date(yesterday.setHours(0, 0, 0, 0)); 
            break;
            case "presentWeek":
                startDate = new Date(today.setDate(today.getDate() - today.getDay()));
                startDate.setHours(0, 0, 0, 0);
            break;
            case "lastWeek":
                const lastSunday = new Date(today.setDate(today.getDate() - today.getDay() - 7));
                lastSunday.setHours(0, 0, 0, 0);
                startDate = lastSunday;
                endDate = new Date(lastSunday.getTime() + 6 * 24 * 60 * 60 * 1000);
                endDate.setHours(23, 59, 59, 999);
            break;
            case "lastMonth":
                startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                endDate = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
            break;
        }

        if (startDate) {
            searchCriteria.SubmissionDate = { $gte: startDate, $lte: endDate };
            // console.log('met',startDate, endDate);
        }

        const reports = await usersCellReport.find(searchCriteria)
            .sort(sortBy)
            .skip((page - 1) * limit)
            .limit(limit);

        const totalDocuments = await usersCellReport.countDocuments();
        const total = await usersCellReport.countDocuments(searchCriteria);

        res.status(200).json({
            error: false,
            total,
            page,
            limit,
            totalDocuments,
            reports,
            pcfs,
            totalPages: Math.ceil(total / limit),
        });
    } catch (err) {
        console.error("Error fetching user data:", err);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
};

const updateStatus = async (req, res) => {
    const id = req.params.id;
    const {status} = req.body;
    try {
        const cellReport = await usersCellReport.findById(id);
        
        if (!cellReport) {
            return res.status(404).json({ success: false, message: "Report not found" });
        } 
        await usersCellReport.findByIdAndUpdate(id, { status: status });
        res.status(201).json({ success: true, message: 'Status changed' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}


export { submitReport, listReports, updateStatus };