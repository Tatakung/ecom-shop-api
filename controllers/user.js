const prisma = require("../config/prisma");

exports.history = async (req, res) => {
  try {
    const { id } = req.user;
    const cart = await prisma.order.findMany({
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
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(cart);
  } catch (error) {
    console.log(error);
  }
};
exports.historyquery = async (req, res) => {
  try {
    const { type } = req.query;
    const { id } = req.user;
    const cart = await prisma.order.findMany({
      where: {
        orderedById: Number(id),
        orderStatus: type === "ทั้งหมด" ? undefined : type,
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
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(cart);
  } catch (error) {
    console.log(error);
  }
};
exports.historydetail = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const cart = await prisma.order.findFirst({
      where: {
        id: Number(id),
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
        order_o_m_status: true,
        order_o_m_slip: true,
        orderedBy: {
          select: {
            name: true,
            address: true,
            phone: true,
            role: true,
          },
        },
      },
    });
    res.json(cart);
  } catch (error) {
    console.log(error);
  }
};
exports.listOrder = async (req, res) => {
  try {
    const order = await prisma.order.findMany({});
    console.log(order);
    res.json(order);
  } catch (error) {}
};
exports.listOrderquery = async (req, res) => {
  try {
    const { type } = req.query;
    
    const order = await prisma.order.findMany({
      where: {
        orderStatus: type === "ทั้งหมด" ? undefined : type,
      },
    });
    
    res.json(order);
  } catch (error) {}
};
exports.updateStatus = async (req, res) => {
  try {
    const { order_id, numberCode } = req.body;
    const order = await prisma.order.findFirst({
      where: {
        id: Number(order_id),
      },
      include: {
        products: true,
      },
    });
    

    let messageReturn = "";

    if (order.orderStatus === "แจ้งชำระเงินแล้ว") {
      const status = await prisma.status.create({
        data: {
          status: "สั่งซื้อสินค้าสำเร็จ",
          orderId: order.id,
        },
      });
      const slip = await prisma.slip.findFirst({
        where: {
          orderId: Number(order.id),
        },
      });

      const update_slip = await prisma.slip.update({
        where: {
          id: Number(slip.id),
        },
        data: {
          status: 1,
        },
      });

      await prisma.order.update({
        where: {
          id: Number(order_id),
        },
        data: {
          orderStatus: "สั่งซื้อสินค้าสำเร็จ",
        },
      });
      messageReturn = "ได้รับการตรวจสอบการชำระเงินแล้ว";
    }
    if (order.orderStatus === "สั่งซื้อสินค้าสำเร็จ") {
      const status = await prisma.status.create({
        data: {
          status: "กำลังเตรียมพัสดุ",
          orderId: order.id,
        },
      });
      for (let i = 0; i < order.products.length; i++) {
        const item = order.products[i];
        const test = await prisma.product.update({
          where: {
            id: Number(item.productId),
          },
          data: {
            sold: item.count,
          },
        });
      }

      await prisma.order.update({
        where: {
          id: Number(order_id),
        },
        data: {
          orderStatus: "กำลังเตรียมพัสดุ",
        },
      });
      messageReturn = "กำลังเตรียมพัสดุ";
    }
    if (order.orderStatus === "กำลังเตรียมพัสดุ") {
      const status = await prisma.status.create({
        data: {
          status: "จัดส่งพัสดุแล้ว",
          orderId: order.id,
        },
      });

      await prisma.order.update({
        where: {
          id: Number(order_id),
        },
        data: {
          orderStatus: "จัดส่งพัสดุแล้ว",
          code: numberCode,
        },
      });

      messageReturn = "จัดส่งพัสดุแล้ว";
    }
    if (order.orderStatus === "จัดส่งพัสดุแล้ว") {
      const status = await prisma.status.create({
        data: {
          status: "ได้รับพัสดุแล้ว",
          orderId: order.id,
        },
      });
      await prisma.order.update({
        where: {
          id: Number(order_id),
        },
        data: {
          orderStatus: "ได้รับพัสดุแล้ว",
        },
      });
      messageReturn = "ได้รับพัสดุแล้ว";
    }

    res.json({
      message: "สำเร็จ",
    });
  } catch (error) {}
};
