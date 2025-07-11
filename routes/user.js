const express = require("express");
const {} = require("../controllers/product");
const { history, historydetail, listOrder, updateStatus, listOrderquery, historyquery } = require("../controllers/user");
const { authChecked } = require("../middlewares/authchecked");
const router = express.Router();
router.get("/history", authChecked, history);
router.get("/historyquery", authChecked, historyquery);
router.get("/historydetail/:id", authChecked, historydetail);
router.get("/listOrder", authChecked, listOrder);
router.get("/listOrderquery", authChecked, listOrderquery);
router.post("/updateStatus", authChecked, updateStatus);
module.exports = router;
