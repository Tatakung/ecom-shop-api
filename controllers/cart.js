const prisma = require("../config/prisma");
exports.create = async (req, res) => {
  try {
    const { id } = req.user;
    const { product_id, count } = req.body;
    // เช็คว่ามี product_id จริงๆไหม
    const product = await prisma.product.findFirst({
      where: {
        id: Number(product_id),
      },
    });
    if (!product) {
      return res.status(400).json({
        message: "ไม่พบข้อมูล",
      });
    }

    const FindCart = await prisma.cart.findFirst({
      where: {
        orderedById: Number(id),
      },
    });

    // มีตะกร้า
    if (FindCart) {
      // เช็คว่า product_id มีสินค้าอยู่ในตะกร้าหรือยัง
      const check_product_id_on_cart = await prisma.productOnCart.findFirst({
        where: {
          productId: Number(product_id),
          cartId: Number(FindCart.id),
        },
      });

      //   ถ้ามีก็+เข้าไปcount
      if (check_product_id_on_cart) {
        // +count  ยะงไงทีนี้ 5555 ช่วยยหนอยส
        await prisma.productOnCart.update({
          where: {
            id: Number(check_product_id_on_cart.id),
          },
          data: {
            count: {
              increment: count,
            },
          },
        });
      }
      //   ถ้าไม่มีก็เพิ่มเข้าไปใน item เลย
      else {
        const productOnCart = await prisma.productOnCart.create({
          data: {
            cartId: Number(FindCart.id),
            productId: Number(product_id),
            price: parseFloat(product.price),
            count: parseInt(count),
          },
        });
      }

      // cartTotal
      const update_count_cart = await prisma.cart.update({
        where: {
          id: Number(FindCart.id),
        },
        data: {
          cartTotal: {
            increment: product.price * count,
          },
        },
      });

      //   ไม่มีตะกร้า
    } else {
      const cart = await prisma.cart.create({
        data: {
          cartTotal: product.price * count,
          orderedById: Number(id),
        },
      });
      const productOnCart = await prisma.productOnCart.create({
        data: {
          cartId: Number(cart.id),
          productId: Number(product_id),
          price: parseFloat(product.price),
          count: parseInt(count),
        },
      });
    }
    res.json({
      message: "เพิ่มลงตะกร้าแล้ว",
    });
  } catch (error) {
    console.log(error);
  }
};
exports.list = async (req, res) => {
  try {
    const { id } = req.user;
    const cart = await prisma.cart.findFirst({
      where: {
        orderedById: Number(id),
      },
      include: {
        products: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
        orderedBy: {
          select: {
            email: true,
            name: true,
            address: true,
            phone: true,
          },
        },
      },
    });
    res.json(cart);
  } catch (error) {
    console.log(error);
  }
};
exports.addCountedd = async (req, res) => {
  try {
    const { item_id, product_id, cart_id } = req.body;
    const product = await prisma.product.findFirst({
      where: {
        id: Number(product_id),
      },
    });
    if (!product) {
      return res.status(404).json({
        message: " ไม่พบข้อมูล",
      });
    }
    const upd = await prisma.cart.update({
      where: {
        id: Number(cart_id),
      },
      data: {
        cartTotal: {
          increment: product.price,
        },
      },
    });
    const Itemed = await prisma.productOnCart.update({
      where: {
        id: Number(item_id),
      },
      data: {
        count: {
          increment: 1,
        },
      },
    });
    res.json({
      message: " ;sdls;dl",
    });
  } catch (error) {
    console.log(error);
  }
};
exports.removeCountedd = async (req, res) => {
  try {
    const { item_id } = req.body;

    const item = await prisma.productOnCart.findFirst({
      where: {
        id: Number(item_id),
      },
    });
    if (!item) {
      return res.status(404).json({
        message: "ไมพบข้อมูล",
      });
    }
    const product = await prisma.product.findFirst({
      where: {
        id: Number(item.productId),
      },
    });

    const update = await prisma.cart.update({
      where: {
        id: Number(item.cartId),
      },
      data: {
        cartTotal: {
          decrement: product.price,
        },
      },
    });

    const Itemed = await prisma.productOnCart.update({
      where: {
        id: Number(item_id),
      },
      data: {
        count: {
          decrement: 1,
        },
      },
    });
    res.json({
      message: " ;sdls;dl",
    });
  } catch (error) {
    console.log(error);
  }
};
exports.removeItem = async (req, res) => {
  try {
   
    const { item_id, cart_id } = req.body;

    const cart = await prisma.cart.findFirst({
      where: {
        id: Number(cart_id),
      },
      include: {
        products: true, // ต้อง include ความสัมพันธ์
      },
    });
    const good = await prisma.productOnCart.findFirst({
      where: {
        id: Number(item_id),
      },
    });
    const product = await prisma.product.findFirst({
      where: {
        id: Number(good.productId),
      },
    });

    const update = await prisma.cart.update({
      where: {
        id: Number(cart.id),
      },
      data: {
        cartTotal: {
          decrement: good.count * product.price,
        },
      },
    });
    const Item = await prisma.productOnCart.delete({
      where: {
        id: Number(item_id),
      },
    });

    // โหลด cart ใหม่เพื่อเช็คว่ามันว่างหรือไม่
    const updatedCart = await prisma.cart.findFirst({
      where: {
        id: Number(cart_id),
      },
      include: {
        products: true,
      },
    });

    if (updatedCart.products.length == 0) {
      const remove = await prisma.cart.delete({
        where: {
          id: Number(cart_id),
        },
      });
    }
    res.json({
      message: "ds",
    });
  } catch (error) {
    console.log(error);
  }
};

exports.onSubmit = async (req, res) => {
  try {
    
    const { cart_id, address, phone } = req.body;
    const { id } = req.user;

    const item = await prisma.productOnCart.findMany({
      where: {
        cartId: Number(cart_id),
      },
    });
    let checkpass = false;
    let overstockItems = [];
    for (const element of item) {
      const product = await prisma.product.findFirst({
        where: {
          id: Number(element.productId),
        },
      });

      if (parseFloat(element.count) > parseFloat(product.quantity)) {
        overstockItems.push(product.title);
        checkpass = true;
      }
      // console.log(product.quantity);
    }
    
    if (checkpass) {
      
      return res.status(400).json({
        message: "บางรายการมีจำนวนเกินสต๊อก",
        products: overstockItems,
      });
    }

    const itemProduct = item.map((element) => ({
      productId: element.productId,
      count: element.count,
      price: element.price,
    }));

    const cartData = await prisma.cart.findFirst({
      where: {
        id: Number(cart_id),
      },
    });
    const user = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        address: address,
        phone: phone,
      },
    });
    const cart = await prisma.order.create({
      data: {
        cartTotal: cartData.cartTotal + 30, //ค่าจัดส่ง+30
        orderStatus: "รอชำระเงิน",
        amount: item.length,
        orderedById: cartData.orderedById,
        products: {
          create: itemProduct,
        },
      },
    });

    // ตัดสตอก
    // console.log(item);
    const items = await prisma.productOnCart.findMany({
      where: {
        cartId: Number(cart_id),
      },
    });
   

    for (const elements of items) {
      // console.log(elements.productId);
      const product = await prisma.product.update({
        where: {
          id: Number(elements.productId),
        },
        data: {
          quantity: {
            decrement: Number(elements.count),
          },
        },
      });
      // console.log(product);
    }
    const re_cart = await prisma.cart.delete({
      where: {
        id: Number(cart_id),
      },
    });
    return res.json({
      message: "ยืนยันคำสั่งออเดอร์แล้ว กรุณาชำระเงินและแจ้งชำระเงินในภายหลัง",
      lorem: cart.id,
    });
  } catch (error) {}
};
exports.checkPayments = async (req, res) => {
  try {
    const { date, hor, minute } = req.body;

    const { id } = req.params;

    
    const order = await prisma.order.findFirst({
      where: {
        id: Number(id),
      },
    });

    const dateNew = new Date(date); // แปลงจาก "2025-06-12" เป็น Date object
    if (order.orderStatus === "รอชำระเงิน") {
      const slip = await prisma.slip.create({
        data: {
          date: dateNew,
          hour: hor,
          minute: minute,
          orderId: order.id,
          status: 0,
        },
      });
      
    }
    const updat = await prisma.order.update({
      where: {
        id: Number(id),
      },
      data: {
        orderStatus: "แจ้งชำระเงินแล้ว",
      },
    });
    res.json({
      message:
        "แจ้งชำระเงินสำเร็จ รอการตรวจสอบจากทางร้านเพื่อจัดเตรียมพัสดุต่อไป",
    });
  } catch (error) {}
};
