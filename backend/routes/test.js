const test = {
  get: (req, res) => {
    res.json({ message: "This is a test API route" });
  },
};

module.exports = test;
