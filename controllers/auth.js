const prisma = require("../config/prisma");
var jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    console.log(email, password);

    if (!email) {
      res.status(400).json({
        message: "กรุณากรอกอีเมล",
      });
    }
    if (!password) {
      res.status(400).json({
        message: "กรุณากรอกรหัสผ่าน",
      });
    }
    const check_user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (check_user) {
      return res.status(400).json({
        message: "อีเมลนี้มีอยู่แล้ว",
      });
    }

    const hash = await bcrypt.hash(password, 10);
    const data = await prisma.user.create({
      data: {
        email: email,
        password: hash,
        name: name,
      },
    });
    res.json({
      message: "สมัครสมาชิกสำเร็จ",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.login = async (req, res) => {
  console.log("sfks");
  try {
    const { email, password } = req.body;
    const check_user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    if (!check_user || !check_user.enabled) {
      return res.status(400).json({
        message: "อีเมลไม่ถูกต้อง",
      });
    }

    const match = await bcrypt.compare(password, check_user.password);
    if (!match) {
      return res.status(400).json({
        message: "รหัสผ่านไม่ถูกต้อง",
      });
    }
    payload = {
      id: check_user.id,
      email: check_user.email,
      role: check_user.role,
    };
    try {
      const token = jwt.sign(payload, process.env.SECRET, { expiresIn: "1d" });
      res.json({
        payload,
        token,
        message: "เข้าสู่ระบบสำเร็จ",
      });
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.currentUser = async (req, res) => {
  try {
    //code
    const user = await prisma.user.findFirst({
      where: {
        email: req.user.email,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
    res.json({ user });
  } catch (err) {
    //err
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.show = async (req, res) => {
  try {
    const { month, year } = req.query;
    console.log(month, year);
    let filterMonth = parseInt(month);
    let filterYear = parseInt(year);

    // Convert 0 to undefined for "all" filter
    if (month === 0) {
      filterMonth = undefined;
    }
    if (year === 0) {
      filterYear = undefined;
    }
    let whereClause = {};

    if (filterMonth || filterYear) {
      const startDate = new Date();
      const endDate = new Date();

      if (filterYear && filterMonth) {
        // Specific month and year
        startDate.setFullYear(filterYear, filterMonth - 1, 1);
        endDate.setFullYear(filterYear, filterMonth, 0);
      } else if (filterYear) {
        // Specific year, all months
        startDate.setFullYear(filterYear, 0, 1);
        endDate.setFullYear(filterYear, 11, 31);
      } else if (filterMonth) {
        // Specific month, current year
        const currentYear = new Date().getFullYear();
        startDate.setFullYear(currentYear, filterMonth - 1, 1);
        endDate.setFullYear(currentYear, filterMonth, 0);
      }
      whereClause.updatedAt = {
        gte: startDate,
        lte: endDate,
      };
    }
    const data = await prisma.order.findMany({
      where: whereClause,
      include: {
        products: {
          include: {
            product: {
              include: {
                category: true,
                images: true,
              },
            },
          },
        },
      },
    });

    //  รายรับรวม
    const Data = data.filter(
      (element, index) => element.orderStatus !== "รอชำระเงิน"
    );
    const total = Data.reduce(
      (accumulator, currentValue) => accumulator + currentValue.cartTotal,
      0
    );
    // คำสั่งซื้อชำระเงินแล้ว
    const count_success = Data.length;
    // คำสั่งซื้อยังไม่ชำระเงิน
    const Data_fail = data.filter(
      (element, index) => element.orderStatus === "รอชำระเงิน"
    );
    const count_fail = Data_fail.length;
    let list = [];
    Data.forEach((element) => {
      element.products.forEach((p) => {
        const categoryId = p.product.category.id;
        const productCount = p.count;
        const categoryName = p.product.category.name;

        // หา index ของรายการที่มีอยู่แล้ว
        const index = list.findIndex((item) => item.id === categoryId);

        if (index !== -1) {
          // ถ้ามีอยู่แล้ว: บวกจำนวนเพิ่มเข้าไป
          list[index].value += productCount;
          // console.log("มี → เพิ่มจำนวน", list[index]);
        } else {
          // ถ้ายังไม่มี: เพิ่มรายการใหม่
          list.push({
            id: categoryId,
            value: productCount,
            label: categoryName,
          });
          // console.log("ไม่มี → เพิ่มใหม่", categoryId, categoryName);
        }
      });
    });

    // สินค้า
    const s = [];
    Data.forEach((element) => {
      element.products.forEach((item) => {
        const index = s.findIndex((items) => items.id === item.productId);
        // console.log(index);
        if (index !== -1) {
          s[index].total += item.count;
          s[index].price += item.price;
        } else {
          s.push({
            id: item.productId,
            Name: item.product.title,
            total: item.count,
            price: item.price * item.count,
            stock: item.product.quantity,
            url: item.product.images[0].url,
          });
        }
      });
    });

    s.sort((a, b) => b.total - a.total);
    s.slice(0, 5);
    res.json({
      s: s,
      // count_success : count_success
      total: total,
      list: list,
      count_fail: count_fail,
      count_success: count_success,
    });
  } catch (error) {
    console.log(error);
  }
};
