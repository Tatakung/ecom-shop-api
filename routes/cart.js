const express = require("express");
const { authChecked } = require("../middlewares/authchecked");
const { create, list, addCountedd, removeCountedd , removeItem, onSubmit, checkPayments } = require("../controllers/cart");
const router = express.Router();
router.post("/cart", authChecked, create);
router.post("/cart/onSubmit", authChecked, onSubmit);
router.get("/cart", authChecked, list);
router.post("/cart/add", authChecked, addCountedd); //เพิ่มลบจำนวนสินค้าในตะกร้า
router.post("/cart/remove", authChecked, removeCountedd); //เพิ่มลบจำนวนสินค้า
router.post("/cart/checkPayments/:id", authChecked, checkPayments); //เพิ่มลบจำนวนสินค้า
router.post("/cart/removeItem", authChecked, removeItem); //ลบitem
module.exports = router;