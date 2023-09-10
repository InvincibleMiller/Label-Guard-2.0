const registerLocation = {
  post: async (req, res) => {
    const { description, name } = req.body;
    const { userDocumentId } = req;

    res.status(200).send("register location route");
    return;
  },
};

module.exports = registerLocation;
