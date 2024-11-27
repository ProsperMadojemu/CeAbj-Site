import Users from "../models/usersModel.js";
import newCell from "../models/cellsModels.js"
import usersCellReport from "../models/cellReportsModel.js"

const chartItemsData = async (req, res) => {
    try {
        const numberOfUsers = await Users.countDocuments();
        const numberOfLeaders = await newCell.countDocuments();
        const numberOfPcfLeaders = await newCell.countDocuments({
            Designation: "PCF",
        });
        const numberOfSeniorLeaders = await newCell.countDocuments({
            Designation: "SENIOR-CELL",
        });
        const numberOfCellLeaders = await newCell.countDocuments({
            Designation: "CELL",
        });
        const cellReportData = await usersCellReport.aggregate([
            {
                $sort: {
                    SubmissionDate: -1,
                },
            },
            {
                $limit: 5,
            },
        ]);

        const leadersRecentsData = await newCell.aggregate([
            {
                $sort: {
                    SubmissionDate: -1,
                },
            },
            {
                $limit: 10,
            },
        ]);
        res.json({
            usersNumber: numberOfUsers,
            leadersReport: cellReportData,
            totalNumberOfLeaders: numberOfLeaders,
            pcfLeaders: numberOfPcfLeaders,
            seniorCellLeaders: numberOfSeniorLeaders,
            cellLeaders: numberOfCellLeaders,
            leadersData: leadersRecentsData,
        });
        // console.log(numberOfUsers);
    } catch (error) {
        console.error("error:", error);
    }
}

export { chartItemsData }