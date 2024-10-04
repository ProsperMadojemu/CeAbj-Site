import bcrypt from "bcryptjs"
import UsersChurch from "../models/usersChurchModel.js"
import Users from "../models/usersModel.js"
import transformFormData from "../utils/formTransformer.js"
import session from "express-session";
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
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
        console.error(error);
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
                return res.status(201).json({ message: "Welcome Admin", redirectUrl: "/admin/" });
            } else {
                return res.status(401).json({ error: "Invalid email or password" });
            }
        }

        const user = await Users.findOne({
            $or: [{ Email: usersinput }, { PhoneNumber: usersinput }],
        });

        if (!user) {
            console.log(`Failed login attempt with email: ${usersinput}`);
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
        res.status(200).json({ message: "Logout successful" });
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

        res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
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

const searchForUser = async (req,res) => {
    try {
        const searchTerm = req.query.q || "";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const regex = new RegExp(searchTerm, "i");

        const searchCriteria = searchTerm
            ? {
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
            }
            : {};

        // Fetch users from the database with pagination
        const users = await Users.find(searchCriteria, {
            _id: 0,
            Email: 1,
            FirstName: 1,
            LastName: 1,
            PhoneNumber: 1,
            Church: 1,
            LeadershipPosition: 1,
            Department: 1,
            registrationDate: 1,
        })
            .skip((page - 1) * limit)
            .limit(limit);

        // Count total matching documents for pagination
        const totalUsers = await Users.countDocuments(searchCriteria);

        // Fetch usersChurch data and create a map
        const usersChurchData = await UsersChurch.find(
            {},
            {
                Email: 1,
                NameOfCell: 1,
                Department: 1,
            }
        );

        const usersChurchMap = new Map(usersChurchData.map((uc) => [uc.Email, uc]));

        // Merge users with usersChurch data
        const mergedUsers = users.map((user) => {
            const userChurchInfo = usersChurchMap.get(user.Email) || {};
            return {
                ...user,
                NameOfCell: userChurchInfo.NameOfCell || "N/A",
                Department: userChurchInfo.Department || "N/A",
            };
        });
        // console.log('Merged Users:', mergedUsers);
        res.json({
            users: mergedUsers,
            totalUsers,
            currentPage: page,
            totalPages: Math.ceil(totalUsers / limit), // Calculate total pages
        });
    } catch (error) {
        console.error("Error searching data:", error);
        res.status(500).json({ error: "Error searching data" });
    }
}

export {registerUser, loginUser, updateUser, getalldata, logoutUser, searchForUser};