const prisma = require("../config/prisma");
exports.create = async (req, res) => {
  try {
    const { title, description, price, quantity, images, categoryId } =
      req.body;
    const product = await prisma.product.create({
      data: {
        title: title,
        description: description,
        price: parseFloat(price),
        quantity: parseFloat(quantity),
        categoryId: parseInt(categoryId),
        images: {
          create: images.map((element) => ({
            asset_id: element.asset_id,
            public_id: element.public_id,
            url: element.url,
            secure_url: element.secure_url,
          })),
        },
      },
    });
    res.json({
      message: "บันทึกข้อมูลสำเร็จ",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.list = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        category: true,
        images: true,
      },
    });
    res.json(products);
  } catch (error) {
    // console.log("dfldflk");
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.listhome = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        category: true,
        images: true,
      },
    });
    const startOfMonth = new Date();
    startOfMonth.setDate(1); // วันแรกของเดือน
    startOfMonth.setHours(0, 0, 0, 0); // เวลา 00:00:00

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1); // เดือนถัดไป
    endOfMonth.setDate(0); // วันสุดท้ายของเดือนปัจจุบัน
    endOfMonth.setHours(23, 59, 59, 999); // เวลา 23:59:59

    const products_month = await prisma.product.findMany({
      where: {
        updatedAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      orderBy: {
        sold: "desc", // เรียงตามสินค้าที่ขายดีที่สุดในเดือนนี้
      },
      take: 5,
      include: {
        category: true,
        images: true,
      },
    });
    const list_new = products.slice(0, 5);
    res.json({
      list_new: list_new,
      products_month: products_month,
    });
  } catch (error) {
    // console.log("dfldflk");
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.listquery = async (req, res) => {
  try {
    const { setype, seel, stock } = req.query;
    const orderBy = [];
    if (seel !== "0") orderBy.push({ sold: seel === "1" ? "desc" : "asc" });
    if (stock !== "0")
      orderBy.push({ quantity: stock === "1" ? "desc" : "asc" });
    const products = await prisma.product.findMany({
      where: {
        categoryId: setype === "0" ? undefined : Number(setype),
      },
      orderBy,
      include: {
        category: true,
        images: true,
      },
    });
    res.json(products);
  } catch (error) {
    // console.log("dfldflk");
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.filter = async (req, res) => {
  try {
    const { type, price } = req.body;
    const products = await prisma.product.findMany({
      where: {
        ...(type &&
          type.length > 0 && {
            categoryId: {
              in: type,
            },
          }),
        price: {
          gte: price[0],
          lte: price[1],
        },
      },
      include: {
        category: true,
        images: true,
      },
    });
    // console.log(products);
    res.json(products);
  } catch (error) {
    console.log(error);
  }
};

const cloudinary = require("cloudinary").v2;
// ตั้งค่า Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findFirst({
      where: {
        id: Number(id),
      },
    });
    let p = true;
    let m = "";
    if (product.isuse) {
      p = false;
      m = "ยกเลิกการขายสำเร็จ";
    } else {
      p = true;
      m = "เปิดอีกครั้ง";
    }
    const products = await prisma.product.update({
      where: {
        id: Number(id),
      },
      data: {
        isuse: p,
      },
    });
    // if (!products.images) {
    //   return res.status(404).json({
    //     message: "ไม่มีข้อมูล",
    //   });
    // }

    // products.images.forEach((element) => {
    //   cloudinary.uploader.destroy(element.public_id, (result) => {
    //   });
    // });
    // await prisma.product.delete({
    //   where: {
    //     id: Number(id),
    //   },
    // });

    res.json({
      message: m,
    });
  } catch (error) {
    console.log(error);
  }
};
exports.listDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const products = await prisma.product.findFirst({
      where: {
        id: Number(id),
      },
      include: {
        category: true,
        images: true,
      },
    });
    if (!products) {
      return res.status(404).json({
        message: "ไม่พบข้อมูล",
      });
    }
    res.json(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.editdetail = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, quantity, images } = req.body;
    const product = await prisma.product.update({
      where: {
        id: Number(id),
      },
      data: {
        title: title,
        description: description,
        price: parseFloat(price),
        quantity: parseFloat(quantity),
        images: {
          create: images
            .filter((element) => !element.id)
            .map((element) => ({
              asset_id: element.asset_id,
              public_id: element.public_id,
              url: element.url,
              secure_url: element.secure_url,
            })),
        },
      },
    });
    // ในตะกร้า
    const check_Cart = await prisma.productOnCart.findMany({
      where: {
        productId: Number(product.id),
      },
    });
    // console.log(check_Cart);
    for (const carted of check_Cart) {
      // console.log(carted);
      const dataCart = await prisma.cart.findFirst({
        where: {
          id: Number(carted.cartId),
        },
      });
      // ส่งผลต่อ count ในสตอก->สินค้าในตะกร้าจะต้องถูกปรับลดลง (คำนวนณผลรวมใหม่)
      
      if (carted.count > product.quantity) {
      
        // ส่วนitem
        const dataitem = await prisma.productOnCart.update({
          where: {
            id: Number(carted.id),
          },
          data: {
            count: product.quantity,
            price: product.price,
          },
        });
        // ส่วน cartคำนวณผลรวมใหใม่
        const dcart = await prisma.cart.findFirst({
          where: {
            id: Number(carted.cartId),
          },
          include: {
            products: true,
          },
        });
        const total = dcart.products.reduce(
          (sum, item) => sum + item.price * item.count,
          0
        );
        const dataCart = await prisma.cart.update({
          where: {
            id: Number(carted.cartId),
          },
          data: {
            cartTotal: total,
          },
        });
      }
      // ไม่ส่งผลต่อ count ในสตอก->สินค้าในตะกร้าจะไม่ถูกปรับลดลง (คำนวณผลรวมใหม่)
      else {
        // ส่วนitem
        const dataitem = await prisma.productOnCart.update({
          where: {
            id: Number(carted.id),
          },
          data: {
            price: product.price,
          },
        });
        // ส่วน cart คำนวณผลรวมใหม่
        const dcart = await prisma.cart.findFirst({
          where: {
            id: Number(carted.cartId),
          },
          include: {
            products: true,
          },
        });
        const total = dcart.products.reduce(
          (sum, item) => sum + item.price * item.count,
          0
        );

        const dataCart = await prisma.cart.update({
          where: {
            id: Number(carted.cartId),
          },
          data: {
            cartTotal: total,
          },
        });
      }
    }

    // console.log(check_Cart);
    // เช็คว่าจำนวนในสต๊อกกับ ในตะกร้า มันสมกันไหม
    // if (check_Cart) {
    //   for (const carted of check_Cart) {
    //     if (carted.count > product.quantity) {
    //       const update_cart = await prisma.cart.update({
    //         where: {
    //           id: Number(carted.cartId),
    //         },
    //         data: {
    //           cartTotal: {
    //             decrement: product.quantity * product.price,
    //           },
    //         },
    //       });
    //       console.log(update_cart);
    //       await prisma.productOnCart.update({
    //         where: {
    //           id: Number(carted.id),
    //         },
    //         data: {
    //           price: product.price,
    //           count: product.count,
    //         },
    //       });
    //     }
    //   }
    // }

    res.json({
      message: "แก้ไขข้อมูลสำเร็จ",
    });
  } catch (error) {
    console.log(error);
  }
};
