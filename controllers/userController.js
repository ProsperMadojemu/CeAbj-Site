import bcrypt from "bcryptjs"
import UsersChurch from "../models/usersChurchModel.js"
import Users from "../models/usersModel.js"
import transformFormData from "../utils/formTransformer.js"
import Admin from "../models/adminModel.js";

const registerUser = async (req, res) => {
    try {
        const transformedData = transformFormData(req.body);

        // Checking if email or phone number already exists
        const existingUser = await Users.findOne({
            $or: [
                { Email: transformedData.Email },
                { PhoneNumber: transformedData.PhoneNumber },
            ],
        });

        if (existingUser) {
            return res
                .status(400)
                .json({ error: "Email or phone number already in use" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(transformedData.Password, 10);
        transformedData.Password = hashedPassword;

        const userFields = {
            Email: transformedData.Email,
            Title: transformedData.Title,
            FirstName: transformedData.FirstName,
            LastName: transformedData.LastName,
            PhoneNumber: transformedData.PhoneNumber,
            Country: transformedData.Country,
            Church: transformedData.Church,
            LeadershipPosition: transformedData.LeadershipPosition,
            Password: transformedData.Password,
            registrationDate: transformedData.registrationDate,
            userType: transformedData.userType,
        };

        const churchFields = {
            Email: transformedData.Email,
            FirstName: transformedData.FirstName,
            LastName: transformedData.LastName,
            Church: transformedData.Church,
            LeadershipPosition: transformedData.LeadershipPosition,
            NameOfCell: transformedData.NameOfCell,
            NameOfPcf: transformedData.NameOfPcf,
            Department: transformedData.Department,
            Zone: transformedData.Zone,
        };

        const newUser = new Users(userFields);
        const newChurchDetails = new UsersChurch(churchFields);

        await newUser.save();
        await newChurchDetails.save();
        return res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

const loginUser = async (req, res) => {
    try {
        const { usersinput, userspassword } = req.body;

        const admin = await Admin.findOne({ email: usersinput });
        if (admin) {
            const isPasswordValid = await bcrypt.compare(
                userspassword,
                admin.password
            );
            if (isPasswordValid && admin.email === process.env.ADMIN_EMAIL) {
                req.session.cookie = {
                    maxAge: 30 * 24 * 60 * 60 * 1000
                };
                req.session.user = {
                    email: admin.email,
                    isAdmin: true,
                    userType: "admin",
                };
                return res.status(201).json({ message: "Signed in as Admin", redirectUrl: "/admin/" });
            } else {
                return res.status(401).json({ error: "Invalid email or password" });
            }
        }

        const user = await Users.findOne({
            $or: [{ Email: usersinput }, { PhoneNumber: usersinput }],
        });

        if (!user) {
            return res.status(404).json({ error: "Information does not match" });
        }

        const isPasswordValid = await bcrypt.compare(userspassword, user.Password);
        if (isPasswordValid) {
            req.session.user = {
                id: user._id,
                firstName: user.FirstName,
                lastName: user.LastName,
                isAdmin: false,
                email: user.Email,
                phone: user.PhoneNumber,
                userType: user.userType,
            };
            return res.status(201).json({message: "login successful", redirectUrl: "/dashboard/edit-profile" });
        } else {
            return res.status(401).json({ error: "Invalid password" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Login error" });
    }
}

const logoutUser = async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            // return res.status(500).json({ error: "Could not log out" });
            console.error(err);
        }
        return res.status(200).json({ message: "Logout successful" });
    });
}

const updateUser = async (req, res) => {
    try {
        if (!req.session.user || !req.session.user.email) {
            return res.status(401).json({ error: "User not logged in" });
        }

        const email = req.session.user.email; //last email shoudl be spelt {email} not {Email}
        const updateFields = req.body;

        const updatedUser = await Users.findOneAndUpdate(
            { Email: email },
            { $set: updateFields },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        const userChurchDetails = await UsersChurch.findOneAndUpdate(
            { Email: email },
            { $set: updateFields },
            { new: true }
        );

        if (!userChurchDetails) {
            return res.status(404).json({ error: "User church details not found" });
        }

        return res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const getalldata = async (req, res) => {
    try {
        const usersData = await Users.find();
        const usersChurchData = await UsersChurch.find();
        const adminData = await Admin.find();

        res.json({
            users: usersData,
            usersChurch: usersChurchData,
            admin: adminData,
        });
    } catch (error) {
        res.status(500).json({ error: "Error fetching data" });
    }
}

const usersApi = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) === 0 ? 0 : parseInt(req.query.limit) || 10;
        const search = req.query.search || "";
        let sort = req.query.sort || "";
        let leadershipPositionFilter = req.query.leadershipPosition || "All";
        let departmentFilter = req.query.department || "All";
        const leadershipPositions = await Users.distinct("LeadershipPosition");
        const departments = await Users.distinct("Department");
        

        // console.log("req body:", req);
        // console.log("Page:", page);
        // console.log("Limit:", limit);
        // console.log("Search Query:", search);
        // console.log("Sort By:", sort);
        // console.log("Leadership Position Filter:", leadershipPositionFilter);
        // console.log("Department Filter:", departmentFilter);

        const sortParams = sort.split(",");
        let sortBy = {};
        sortBy[sortParams[0]] = sortParams[1] === "desc" ? -1 : 1; // Default to ascending

        const regex = new RegExp(search, "i");
        const searchCriteria = {
            ...(search && {
                $or: [
                    { FirstName: regex },
                    { LastName: regex },
                    { Email: regex },
                    { Church: regex },
                    { NameOfCell: regex },
                    { PhoneNumber: regex },
                    { LeadershipPosition: regex },
                    { Department: regex },
                ],
            }),
            ...(leadershipPositionFilter !== "All" && { LeadershipPosition: leadershipPositionFilter }),
            ...(departmentFilter !== "All" && { Department: departmentFilter }),
        };

        const users = await Users.find(searchCriteria)
        .sort(sortBy)
        .skip((page - 1) * limit)
        .limit(limit);

        const totalDocuments = await Users.countDocuments();
        const total = await Users.countDocuments(searchCriteria);

        const usersChurchData = await UsersChurch.find(
            {},
            {
                Email: 1,
                NameOfCell: 1,
                Department: 1,
            }
        );
        const usersChurchMap = new Map(usersChurchData.map((uc) => [uc.Email, uc]));
        const mergedUsers = users.map((user) => {
            const userChurchInfo = usersChurchMap.get(user.Email) || {};
            return {
                ...user,
                NameOfCell: userChurchInfo.NameOfCell || "N/A",
                Department: userChurchInfo.Department || "N/A",
            };
        });
        
        res.status(200).json({
            error: false,
            total,
            page,
            limit,
            totalDocuments,
            users: mergedUsers,
            leadershipPositions,
            departments,
            totalPages: Math.ceil(total / limit),
        });
    } catch (err) {
        console.error("Error fetching user data:", err);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
};

export {registerUser, loginUser, updateUser, getalldata, logoutUser, usersApi};