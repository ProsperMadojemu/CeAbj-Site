import Users from "../models/usersModel.js";

const autoComplete = async (req,res) => {
    try {
        const query = req.query.query;
        const groups = await Users.find({Designation: { $regex: query, $options: 'i'}}).select('Designation');

        const users = Users.find({
            $or: [
                {FirstName: { $regex: query, $options: 'i'}},
                {LastName: { $regex: query, $options: 'i'}},
                {PhoneNumber: { $regex: query, $options: 'i'}},
                {Email: { $regex: query, $options: 'i'}},
                {Church: { $regex: query, $options: 'i'}},
            ]
        }, {Title: 1, FirstName: 1,LastName: 1,PhoneNumber: 1,Email: 1,Church: 1, _id: 0})

        const suggestions = [...groups.map(g => g.Designation), ...await users]
        res.status(201).json({suggestions});
        
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export default autoComplete;