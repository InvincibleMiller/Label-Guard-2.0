const compileReport = async (req, res, next) => {
  try {
    // expects start and end date from query params
    const { from, to } = req.query;

    console.log("REPORT BUILDING API ENDPOINT");
    res.status(200).json({ from, to });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = compileReport;
