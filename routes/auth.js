const express = require("express");
const { register, login, currentUser, show } = require("../controllers/auth");
const { authChecked, adminChecked } = require("../middlewares/authchecked");
const router = express.Router();
// enponit
router.post("/register", register);
router.post("/login", login);
router.post("/currentUser", authChecked, currentUser);
router.post("/currentAdmin", authChecked, adminChecked, currentUser);
router.get("/user-check-user", authChecked);
router.get("/user-check-admin", authChecked, adminChecked);
router.get("/show", authChecked, adminChecked, show);
router.get("/test-token", authChecked, adminChecked);
module.exports = router;
