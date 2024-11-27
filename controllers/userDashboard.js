import usersCellReport from "../models/cellReportsModel.js";
import newCell from "../models/cellsModels.js";
import Users from "../models/usersModel.js";
import meetingModel from "../models/meetingModel.js";
import messagesModel from "../models/messagesModel.js";

const userOverview = async (req, res) => {
    try {
        const email = req.session.user.email;
        const user = await Users.findOne({ Email: email });
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const currentDate = new Date(); 
        const daysAgo = 28; 
        const date28DaysAgo = new Date(currentDate.setDate(currentDate.getDate() - daysAgo));
        console.log(date28DaysAgo);
        
        let leadersCount = null;
        // console.log(user);

        if (!user) {
            return res.status(404).json("User  not found");
        }

        const { PhoneNumber, isVerified } = user;
        const userCell = isVerified ? await newCell.findOne({ PhoneNumber }) : null;
        // const userLeaders = isVerified ? await newCell.countDocuments({NameOfCell})
        if (isVerified) {
            // leadersCount= 0;
            const { NameOfPcf, NameOfSeniorCell, CellType } = userCell;
            if (CellType === "PCF") {
                leadersCount = await newCell.countDocuments({ NameOfPcf: NameOfPcf });
            } if (CellType === "SENIOR-CELL") {
                leadersCount = await newCell.countDocuments({ NameOfSeniorCell: NameOfSeniorCell });
            }
            leadersCount = leadersCount - 1;
        }
        const reports = await usersCellReport.find({ PhoneNumber }).sort({ SubmissionDate: -1 }).limit(10) || [];
        const meeting = await meetingModel.find(
            {
                $and: [
                    {
                        startDate: {
                            $gte: new Date(date28DaysAgo)
                        }
                    },
                    {
                        'viewers.email': email
                    }
                ]
            },
            { 'viewers.$': 1, _id: 0 }
        ) || [];
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
            },
            {
                $limit: 8
            }
        ]) || [];

        const monthlyReports = reports.filter(report => {
            const reportDate = new Date(report.SubmissionDate);
            return reportDate.getMonth() === currentMonth && reportDate.getFullYear() === currentYear;
        });


        const attendanceValues = monthlyReports.map(report => BigInt(report.ServiceAttendance));
        const totalAttendance = attendanceValues.reduce((acc, val) => acc + val, BigInt(0));
        const averageAttendance = monthlyReports.length ? Math.ceil(Number(totalAttendance) / monthlyReports.length) : 0;

        res.status(200).json({
            reports,
            meeting,
            message,
            userCell,
            isVerified,
            leadersCount,
            averageAttendance
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
};

export default userOverview