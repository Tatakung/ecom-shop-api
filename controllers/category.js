const prisma = require("../config/prisma");

exports.create = async (req, res) => {
  try {
    const { name } = req.body;

    $check = await prisma.category.findFirst({
      where: {
        name: name,
      },
    });
    if ($check) {
      return res.status(400).json({
        message: "รายการนี้มีข้อมูลอยู่แล้ว!",
      });
    }
    const category = await prisma.category.create({
      data: {
        name: name,
      },
    });

    res.json({
      message: "เพิ่มรายการประเภทชุดสำเร็จ",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.list = async (req, res) => {
  try {
    // code
    const category = await prisma.category.findMany();
    res.json(category);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.remove = async (req, res) => {
  try {
    // code
    const { id } = req.params;
    const category = await prisma.category.delete({
      where: {
        id: Number(id),
      },
    });
    res.json({
      message: "ลบข้อมูลสำเร็จ",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.edit = async (req, res) => {
  try {
    // code
    const { id } = req.params;
    const { name } = req.body;
    const category = await prisma.category.findFirst({
      where: {
        id: Number(id),
      },
    });

    if (!category) {
      return res.status(400).json({
        message: "ไม่พบข้อมูลที่ต้องการลบ",
      });
    }
    const update = await prisma.category.update({
      where: {
        id: Number(id),
      },
      data: {
        name: name,
      },
    });
    res.json({
      message: "แก้ไขข้อมูลสำเร็จ",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};
const cloudinary = require("cloudinary").v2;
// ตั้งค่า Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
exports.createImages = async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ message: "No image provided" });
    }

    // อัปโหลดไปยัง Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      folder: "products", // จะจัดกลุ่มรูปภาพไว้ในโฟลเดอร์นี้บน Cloudinary
    });

    // ส่ง URL กลับไปให้ frontend
    return res.json({
      asset_id: result.asset_id,
      public_id: result.public_id,
      url: result.url,
      secure_url: result.secure_url,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return res.status(500).json({ message: "Image upload failed", error });
  }
};
exports.removeimage = async (req, res) => {
  try {
    //code
    const { public_id, productId } = req.body;
    
    cloudinary.uploader.destroy(public_id, (result) => {
      // res.send("Remove Image Success!!!");
    });
    const remove = await prisma.image.deleteMany({
      where: {
        public_id: public_id,
      },
    });
    res.json({
      message: "ลบข้อมูลสำเร็จแล้วน๊า",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};
