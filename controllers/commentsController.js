let comments = [];

const pushComments = async (req, res) => {
    const comment = req.body;
    comment.timestamp = new Date().toISOString();
    comments.push(comment);
    res.status(201).json(comment);
}

const pullComments = async (req) => {
    res.json(comments);
}

export {pushComments, pullComments};