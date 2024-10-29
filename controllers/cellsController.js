import newCell from "../models/cellsModels.js";

const submitCell = async (req, res) => {
    try {
        const {
            NameOfLeader,
            PhoneNumber,
            LeaderPosition,
            CellType,
            NameOfPcf,
            NameOfSeniorCell,
            NameOfCell,
            SubmissionDate,
        } = req.body;

        const newCellsField = {
            NameOfLeader,
            PhoneNumber,
            LeaderPosition,
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

        res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error fetching data" });
    }
}

const leadersApi = async (req,res) => {
    
}

const searchForLeader = async (req, res) => {
    try {
        const searchTerm = req.query.q || "";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const regex = new RegExp(searchTerm, "i");

        const searchCriteria = searchTerm
            ? {
                $or: [
                    { NameOfLeader: regex },
                    { PhoneNumber: regex },
                    { LeaderPosition: regex },
                    { CellType: regex },
                    { NameOfCell: regex },
                    { NameOfPcf: regex },
                    { NameOfSeniorCell: regex },
                ],
            }
            : {};

        // Fetch leaders from the database with pagination
        const cellsAndLeaders = await newCell
            .find(searchCriteria, {
                NameOfLeader: 1,
                PhoneNumber: 1,
                LeaderPosition: 1,
                CellType: 1,
                NameOfCell: 1,
                NameOfPcf: 1,
                NameOfSeniorCell: 1,
                _id: 1,
            })
            .skip((page - 1) * limit)
            .limit(limit);

        // Count total matching documents for pagination
        const totalUsers = await newCell.countDocuments(searchCriteria);

        res.json({
            cells: cellsAndLeaders,
            totalUsers,
            currentPage: page,
            totalPages: Math.ceil(totalUsers / limit), // Calculate total pages
        });
    } catch (error) {
        console.error("Error searching data:", error);
        res.status(500).json({ error: "Error searching data" });
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

export { submitCell, getAllLeadersData, getPcfLeaders, getSeniorLeaders, getCellLeaders, searchAndUpdateLeaderById, searchForLeader, deleteCell };