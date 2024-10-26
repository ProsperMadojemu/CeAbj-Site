import path from "path";
import { fileURLToPath } from "url";
import express from "express";

const pageRouter = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the path to the root 'public' folder
const publicPath = path.resolve(__dirname, "../public");

pageRouter.get("/", (req, res) => {
    res.sendFile(path.join(publicPath, "pages", "home", "index.html"));
});
pageRouter.get("/watch", (req, res) => {
    res.sendFile(path.join(publicPath, "pages", "watch", "watch.html"));
});
pageRouter.get("/login", (req, res) => {
    res.sendFile(path.join(publicPath, "pages", "login", "login.html"));
});
pageRouter.get("/register", (req, res) => {
    res.sendFile(path.join(publicPath, "pages", "register", "register.html"));
});
pageRouter.get("/dashboard/edit-profile", (req, res) => {
    res.sendFile(path.join(publicPath, "dashboard", "edit-profile", "edit-profile.html"));
});
pageRouter.get("/dashboard/submit-report", (req, res) => {
    res.sendFile(path.join(publicPath, "dashboard", "submit-report", "submit-report.html"));
});
pageRouter.get("/dashboard/messages", (req, res) => {
    res.sendFile(path.join(publicPath, "dashboard", "messages", "messages.html"));
});
pageRouter.get("/admin/overview", (req, res) => {
    res.sendFile(path.join(publicPath, "admin", "overview", "overview.html"));
});
pageRouter.get("/admin/live-service", (req, res) => {
    res.sendFile(path.join(publicPath, "admin", "schedule-service", "schedule-service.html"));
});
pageRouter.get("/admin/messages", (req, res) => {
    res.sendFile(path.join(publicPath, "admin", "messages", "messages.html"));
});
pageRouter.get("/admin/souls-won", (req, res) => {
    res.sendFile(path.join(publicPath, "admin", "souls-won", "souls-won.html"));
});
pageRouter.get("/admin/view-users", (req, res) => {
    res.sendFile(path.join(publicPath, "admin", "view-users", "view-users.html"));
});
pageRouter.get("/admin/view-cells-leaders", (req, res) => {
    res.sendFile(path.join(publicPath, "admin", "view-cell-leaders", "view-cells-leaders.html"));
});
pageRouter.get("/admin/view-cell-reports", (req, res) => {
    res.sendFile(path.join(publicPath, "admin", "view-cell-reports", "view-cell-reports.html"));
});
pageRouter.get("/admin/addacell", (req, res) => {
    res.sendFile(path.join(publicPath, "admin", "addacell", "addacell.html"));
});
pageRouter.get("/admin/watch", (req, res) => {
    res.sendFile(path.join(publicPath, "admin", "templates", "watch.html"));
});

export default pageRouter;
