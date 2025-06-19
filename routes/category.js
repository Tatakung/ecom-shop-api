const express = require("express");
const router = express.Router();
const { list, create, edit, createImages, removeimage, remove } = require("../controllers/category");

// @ENDPOINT https://store-api-dusky.vercel.app/api/category
router.get("/category", list);
router.post("/category", create);
router.post("/createImages", createImages);
router.post("/removeimage", removeimage);

router.delete("/category/:id", remove);
router.put("/category/:id", edit);
module.exports = router;
