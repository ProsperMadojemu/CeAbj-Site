import newCell from "../models/cellsModels.js";

const submitCell = async (req, res) => {
    try {
        const {
            NameOfLeader,
            PhoneNumber,
            Designation,
            CellType,
            NameOfPcf,
            NameOfSeniorCell,
            NameOfCell,
            SubmissionDate,
        } = req.body;

        const newCellsField = {
            NameOfLeader,
            PhoneNumber,
            Designation,
            CellType,
            NameOfPcf,
            NameOfSeniorCell,
            NameOfCell,
            SubmissionDate,
        };

        const existingCell = await newCell.findOne({
            $or: [
                { NameOfLeader: NameOfLeader },
                { NameOfCell: NameOfCell },
                { PhoneNumber: PhoneNumber },
            ],
        });

        if (existingCell) {
            return res.status(400).json({ error: "Cell Already Exists" });
        }

        const submittedCells = new newCell(newCellsField);
        await submittedCells.save();
        res.status(201).json({ message: "Cell Saved successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const getAllLeadersData = async (req, res) => {
    try {
        const usersCellData = await newCell.find({});

        res.json({ cellsAndLeaders: usersCellData });
    } catch (error) {
        res.status(500).json({ error: "Error fetching data" });
    }
}

const getPcfLeaders = async (req, res) => {
    try {
        const pcfLeadersData = await newCell.aggregate([
            {
                $group: {
                    _id: "$NameOfPcf",
                },
            },
            {
                $project: {
                    _id: 0,
                    NameOfPcf: "$_id",
                },
            },
        ]);
        res.json({ cells: pcfLeadersData });
    } catch (error) {
        res.status(500).json({ error: "Error fetching data" });
    }
}

const getSeniorLeaders = async (req, res) => {
    try {
        const seniorCellLeadersData = await newCell.aggregate([
            {
                $match: {
                    NameOfSeniorCell: { $nin: ["", " "] },
                },
            },
            {
                $group: {
                    _id: "$NameOfSeniorCell",
                    NameOfPcf: { $first: "$NameOfPcf" },
                },
            },
            {
                $project: {
                    _id: 0,
                    NameOfSeniorCell: "$_id",
                    NameOfPcf: 1,
                },
            },
        ]);
        res.json({ cells: seniorCellLeadersData });
    } catch (error) {
        res.status(500).json({ error: "Error fetching data" });
    }
}

const getCellLeaders = async (req, res) => {
    try {
        const CellLeadersData = await newCell.aggregate([
            {
                $match: {
                    NameOfCell: { $nin: ["", " "] },
                },
            },
            {
                $group: {
                    _id: "$NameOfCell",
                    NameOfPcf: { $first: "$NameOfPcf" },
                },
            },
            {
                $project: {
                    _id: 0,
                    NameOfCell: "$_id",
                    NameOfPcf: 1,
                },
            },
        ]);

        res.json({ cells: CellLeadersData });
    } catch (error) {
        res.status(500).json({ error: "Error fetching data" });
    }
}

const searchAndUpdateLeaderById = async (req, res) => {
    try {
        const leaderId = req.params.id;
        const updateFields = req.body;
        const updatedUser = await newCell.findByIdAndUpdate(
            leaderId,
            { $set: updateFields },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ message: `User updated successfully` });
    } catch (error) {
        res.status(500).json({ error: "Error fetching data" });
    }
}

const leadersApi = async (req,res) => {
    try {
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) === 0 ? 0 : parseInt(req.query.limit) || 10;
        const search = req.query.search || "";
        let sort = req.query.sort || "";
        let DesignationFilter = req.query.Designation || "All";
        let cellFilter = req.query.cell || "All";
        const pcfs = await newCell.distinct("NameOfPcf");

        // console.log("req body:", req);
        // console.log("Page:", page);
        // console.log("Limit:", limit);
        // console.log("Search Query:", search);
        // console.log("Sort By:", sort);
        // console.log("Designation Filter:", DesignationFilter);
        // console.log("Cell Filter:", cellFilter);

        const sortParams = sort.split(",");
        let sortBy = {};
        sortBy[sortParams[0]] = sortParams[1] === "desc" ? -1 : 1; // Default to ascending

        const regex = new RegExp(search, "i");
        const searchCriteria = {
            ...(search && {
                $or: [
                    { NameOfLeader: regex },
                    { CellType: regex },
                    { NameOfPcf: regex },
                    { NameOfSeniorCell: regex },
                    { NameOfCell: regex },
                    { Designation: regex },
                    { PhoneNumber: regex },
                ],
            }),
            ...(DesignationFilter !== "All" && { CellType: DesignationFilter }),
            ...(cellFilter !== "All" && { NameOfPcf: cellFilter }),
        };

        const leadersPipeline = await newCell.aggregate(  [
            {
              $group: {
                _id: '$CellType',
                count: { $sum: 1 }
              }
            },
            {
                $sort: {count: -1}
            }
        ],)
        const leaders = await newCell.find(searchCriteria)
        .sort(sortBy)
        .skip((page - 1) * limit)
        .limit(limit);

        const totalDocuments = await newCell.countDocuments();
        const total = await newCell.countDocuments(searchCriteria);

        res.status(200).json({
            error: false,
            total,
            page,
            limit,
            totalDocuments,
            leadersPipeline,
            leaders,
            pcfs,
            totalPages: Math.ceil(total / limit),
        });
    } catch (err) {
        console.error("Error fetching user data:", err);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
}
const deleteCell = async (req, res) => {
    try {
        const leaderId = req.params.id;

        const result = await newCell.findByIdAndDelete(leaderId);

        if (!result) {
            return res.status(404).json({ error: "Leader not found" });
        }

        res.json({ message: "Leader deleted successfully" });
    } catch (error) {
        console.error("Error deleting leader:", error);
        res.status(500).json({ error: "Error deleting leader" });
    }
}

export {
  submitCell,
  getAllLeadersData,
  getPcfLeaders,
  getSeniorLeaders,
  getCellLeaders,
  searchAndUpdateLeaderById,
  deleteCell,
  leadersApi,
};