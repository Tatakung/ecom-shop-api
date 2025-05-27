const express = require("express");
const router = express.Router();
const { list } = require("../controllers/category");

// @ENDPOINT https://store-api-dusky.vercel.app/api/category
router.get("/category", list);
module.exports = router;
