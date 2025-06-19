const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
exports.authChecked = async (req, res, next) => {
  try {
    const headerToken = req.headers.authorization;
    if (!headerToken) {
      return res.status(400).json({
        message: "Not Have Token!",
      });
    }
    const token = headerToken.split(" ")[1];
    var decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET);
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        message: "Token Not valid",
      });
    }
    req.user = decoded;
    const user = await prisma.user.findFirst({
      where: {
        email: req.user.email,
      },
    });
    if (!user.enabled) {
      return res.status(400).json({ message: "This account cannot access" });
    }
    next();
  } catch (error) {
    console.log(error);
  }
};

exports.adminChecked = async (req, res, next) => {
  try {
    const { email } = req.user;
    const data = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    


    if (!data || data.role !== "admin") {
      console.log("เข้าเงื่อนไขนี้");
      return res.status(400).json({ message: "You Never Not Adminpage!" });
    }
    next();
    console.log("ผ่านเงื่อนไข");
  } catch (error) {
    console.log(error);
    res.json({
      message: "server errror",
    });
  }
};
