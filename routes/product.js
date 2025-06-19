const express = require("express");
const {
  create,
  list,
  listDetail,
  editdetail,
  remove,
  filter,
  listquery,
  listhome,
} = require("../controllers/product");
const router = express.Router();
router.post("/product", create);
router.get("/products", list);
router.get("/productshome", listhome);
router.get("/productsquery", listquery);
router.post("/products-filter", filter);
router.delete("/products/:id", remove);
router.get("/products/detail/:id", listDetail);
router.put("/products/detail/:id", editdetail);
module.exports = router;
