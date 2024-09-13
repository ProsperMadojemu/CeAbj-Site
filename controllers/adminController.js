import Admin from "../models/adminModel.js";
import path from "path"
import bcrypt from "bcryptjs"
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const hashPassword = async (plainTextPassword) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(plainTextPassword, salt);
};

(async () => {
    const adminPassword = process.env.ADMIN_PASSWORD;
    const hashedPassword = await hashPassword(adminPassword);
    // console.log('Hashed Admin Password:', hashedPassword);
})();

const adminCheck = (req, res, next) => {
    if (req.session.user && req.session.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ error: "Access denied. Admins only" });
    }
};

const unauthorizedAccess = (req, res, next) => {
    if (!req.session.user || !req.session.user.isAdmin) {
        return res.status(401).json({ error: "Unauthorized access" });
    }
    next();
};

const checkAndCreateAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            throw new Error(
                "ADMIN_EMAIL or ADMIN_PASSWORD is not set in environment variables."
            );
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const admin = await Admin.findOne({ email: adminEmail });

        if (!admin) {
            // If no admin exists, create one
            const newAdmin = new Admin({
                email: adminEmail,
                password: hashedPassword,
            });

            await newAdmin.save();
            console.log("Admin user created.");
        }
    } catch (error) {
        console.error(
            "An error occurred while checking or creating the admin:",
            error
        );
    }
};

const redirect = async (req,res) => {
    return res.sendFile(path.join(__dirname, "../public/admin/overview/overview.html"));
}

export {unauthorizedAccess, adminCheck, redirect}