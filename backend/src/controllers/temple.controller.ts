import { Request, Response } from "express";
import prisma from "../config/db.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "temple-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const parseParamId = (param: any): number => {
  const str = Array.isArray(param) ? param[0] : param;
  return parseInt(str || "0", 10);
};

export const uploadMonkPhoto = multer({ storage }).single("photo");
export const uploadBranchPhoto = multer({ storage }).single("photo");

const DEFAULT_TEMPLE_INFO = {
  name: "Sāgaramati Pirivena & Dhananjaya Rajamaha Viharaya",
  address: "Kandegama, Aralaganwila, Polonnaruwa",
  phone1: "027-3272215",
  phone2: "076-3272215",
  whatsapp: "076-3272215",
  email: "psagaramathi@yahoo.com",
  history: `Historical Dhananjaya Rajamaha Viharaya in Kandegama is a sacred sanctuary tracing back to Anuradhapura and Polonnaruwa eras. Sāgaramati Pirivena was established to preserve the Buddha Sasana and provide higher Dhamma education for the Venerable Sangha.`,
  bank_name: "People's Bank - Aralaganwila Branch",
  bank_acc_number: "253200150044402",
  bank_acc_name: "Sāgaramati Piriven Development Society",
  map_link: "https://maps.google.com/?q=Sagaramati+Pirivena+Kandegama"
};

// GET /api/temple - Fetch temple info, resident monks & temple branches list
export const getTempleData = async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: [
            "temple_name",
            "temple_address",
            "temple_phone1",
            "temple_phone2",
            "temple_whatsapp",
            "temple_email",
            "temple_history",
            "bank_name",
            "bank_acc_number",
            "bank_acc_name",
            "map_link"
          ]
        }
      }
    });

    const infoMap: Record<string, string> = {
      name: DEFAULT_TEMPLE_INFO.name,
      address: DEFAULT_TEMPLE_INFO.address,
      phone1: DEFAULT_TEMPLE_INFO.phone1,
      phone2: DEFAULT_TEMPLE_INFO.phone2,
      whatsapp: DEFAULT_TEMPLE_INFO.whatsapp,
      email: DEFAULT_TEMPLE_INFO.email,
      history: DEFAULT_TEMPLE_INFO.history,
      bank_name: DEFAULT_TEMPLE_INFO.bank_name,
      bank_acc_number: DEFAULT_TEMPLE_INFO.bank_acc_number,
      bank_acc_name: DEFAULT_TEMPLE_INFO.bank_acc_name,
      map_link: DEFAULT_TEMPLE_INFO.map_link
    };

    settings.forEach((s) => {
      const keyName = s.key.startsWith("temple_") ? s.key.replace("temple_", "") : s.key;
      infoMap[keyName] = s.value;
    });

    const monks = await prisma.residentMonk.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }]
    });

    let branches = await prisma.templeBranch.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }]
    });

    // Auto seed main temple branch if table is empty
    if (branches.length === 0) {
      const defaultMainBranch = await prisma.templeBranch.create({
        data: {
          name: infoMap.name,
          category: "MAIN",
          address: infoMap.address,
          phone1: infoMap.phone1,
          phone2: infoMap.phone2,
          whatsapp: infoMap.whatsapp,
          email: infoMap.email,
          history: infoMap.history,
          order: 0
        }
      });
      branches = [defaultMainBranch];
    }

    res.status(200).json({
      status: "success",
      info: infoMap,
      monks,
      branches
    });
  } catch (error) {
    console.error("Error fetching temple data:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch temple data" });
  }
};

// GET /api/temple/branches - Get all temple branches
export const getBranches = async (req: Request, res: Response): Promise<void> => {
  try {
    const branches = await prisma.templeBranch.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }]
    });
    res.status(200).json({ status: "success", data: branches });
  } catch (error) {
    console.error("Error fetching temple branches:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch temple branches" });
  }
};

// POST /api/temple/branches - Create new temple branch (Super Admin / Admin)
export const createBranch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, category, address, phone1, phone2, whatsapp, email, history, order } = req.body;
    const file = req.file;

    if (!name || !name.trim() || !address || !address.trim()) {
      res.status(400).json({ status: "error", message: "Temple name and address are required" });
      return;
    }

    const imageUrl = file ? `/uploads/${file.filename}` : null;

    const branch = await prisma.templeBranch.create({
      data: {
        name: name.trim(),
        category: category || "BRANCH",
        address: address.trim(),
        phone1: phone1 || "",
        phone2: phone2 || "",
        whatsapp: whatsapp || "",
        email: email || "",
        history: history || "",
        order: parseInt(order || "0", 10),
        imageUrl
      }
    });

    res.status(201).json({ status: "success", data: branch, message: "Temple branch added successfully" });
  } catch (error) {
    console.error("Error creating temple branch:", error);
    res.status(500).json({ status: "error", message: "Failed to add temple branch" });
  }
};

// PUT /api/temple/branches/:id - Update temple branch (Super Admin / Admin)
export const updateBranch = async (req: Request, res: Response): Promise<void> => {
  try {
    const branchId = parseParamId(req.params.id);
    if (isNaN(branchId) || branchId === 0) {
      res.status(400).json({ status: "error", message: "Invalid branch ID" });
      return;
    }

    const existing = await prisma.templeBranch.findUnique({ where: { id: branchId } });
    if (!existing) {
      res.status(404).json({ status: "error", message: "Temple branch not found" });
      return;
    }

    const { name, category, address, phone1, phone2, whatsapp, email, history, order } = req.body;
    const file = req.file;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (category !== undefined) updateData.category = category;
    if (address !== undefined) updateData.address = address.trim();
    if (phone1 !== undefined) updateData.phone1 = phone1;
    if (phone2 !== undefined) updateData.phone2 = phone2;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
    if (email !== undefined) updateData.email = email;
    if (history !== undefined) updateData.history = history;
    if (order !== undefined) updateData.order = parseInt(order, 10);
    if (file) updateData.imageUrl = `/uploads/${file.filename}`;

    const updatedBranch = await prisma.templeBranch.update({
      where: { id: branchId },
      data: updateData
    });

    res.status(200).json({ status: "success", data: updatedBranch, message: "Temple branch updated" });
  } catch (error) {
    console.error("Error updating temple branch:", error);
    res.status(500).json({ status: "error", message: "Failed to update temple branch" });
  }
};

// DELETE /api/temple/branches/:id - Delete temple branch (Super Admin / Admin)
export const deleteBranch = async (req: Request, res: Response): Promise<void> => {
  try {
    const branchId = parseParamId(req.params.id);
    if (isNaN(branchId) || branchId === 0) {
      res.status(400).json({ status: "error", message: "Invalid branch ID" });
      return;
    }

    const existing = await prisma.templeBranch.findUnique({ where: { id: branchId } });
    if (!existing) {
      res.status(404).json({ status: "error", message: "Temple branch not found" });
      return;
    }

    await prisma.templeBranch.delete({ where: { id: branchId } });
    res.status(200).json({ status: "success", message: "Temple branch removed" });
  } catch (error) {
    console.error("Error deleting temple branch:", error);
    res.status(500).json({ status: "error", message: "Failed to delete temple branch" });
  }
};

// PUT /api/temple/info - Update temple info & bank/map details (Super Admin / Admin)
export const updateTempleInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, address, phone1, phone2, whatsapp, email, history, bank_name, bank_acc_number, bank_acc_name, map_link } = req.body;

    const updates: Record<string, string> = {};
    if (name !== undefined) updates["temple_name"] = name;
    if (address !== undefined) updates["temple_address"] = address;
    if (phone1 !== undefined) updates["temple_phone1"] = phone1;
    if (phone2 !== undefined) updates["temple_phone2"] = phone2;
    if (whatsapp !== undefined) updates["temple_whatsapp"] = whatsapp;
    if (email !== undefined) updates["temple_email"] = email;
    if (history !== undefined) updates["temple_history"] = history;
    if (bank_name !== undefined) updates["bank_name"] = bank_name;
    if (bank_acc_number !== undefined) updates["bank_acc_number"] = bank_acc_number;
    if (bank_acc_name !== undefined) updates["bank_acc_name"] = bank_acc_name;
    if (map_link !== undefined) updates["map_link"] = map_link;

    const promises = Object.entries(updates).map(([k, v]) =>
      prisma.siteSetting.upsert({
        where: { key: k },
        update: { value: v },
        create: { key: k, value: v }
      })
    );

    await Promise.all(promises);

    res.status(200).json({ status: "success", message: "Temple information updated successfully" });
  } catch (error) {
    console.error("Error updating temple info:", error);
    res.status(500).json({ status: "error", message: "Failed to update temple info" });
  }
};

// POST /api/temple/monks - Add resident monk (Super Admin / Admin)
export const createMonk = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, designation, templeName, phone, bio, category, order } = req.body;
    const file = req.file;

    if (!name || !name.trim()) {
      res.status(400).json({ status: "error", message: "Monk name is required" });
      return;
    }

    const photoUrl = file ? `/uploads/${file.filename}` : null;

    const monk = await prisma.residentMonk.create({
      data: {
        name: name.trim(),
        designation: designation || "",
        templeName: templeName || "",
        phone: phone || "",
        bio: bio || "",
        category: category || "RESIDENT",
        order: parseInt(order || "0", 10),
        photoUrl
      }
    });

    res.status(201).json({ status: "success", data: monk, message: "Resident monk added successfully" });
  } catch (error) {
    console.error("Error creating resident monk:", error);
    res.status(500).json({ status: "error", message: "Failed to add resident monk" });
  }
};

// PUT /api/temple/monks/:id - Update resident monk (Super Admin / Admin)
export const updateMonk = async (req: Request, res: Response): Promise<void> => {
  try {
    const monkId = parseParamId(req.params.id);
    if (isNaN(monkId) || monkId === 0) {
      res.status(400).json({ status: "error", message: "Invalid monk ID" });
      return;
    }

    const existing = await prisma.residentMonk.findUnique({ where: { id: monkId } });
    if (!existing) {
      res.status(404).json({ status: "error", message: "Resident monk not found" });
      return;
    }

    const { name, designation, templeName, phone, bio, category, order } = req.body;
    const file = req.file;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (designation !== undefined) updateData.designation = designation;
    if (templeName !== undefined) updateData.templeName = templeName;
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;
    if (category !== undefined) updateData.category = category;
    if (order !== undefined) updateData.order = parseInt(order, 10);
    if (file) updateData.photoUrl = `/uploads/${file.filename}`;

    const updatedMonk = await prisma.residentMonk.update({
      where: { id: monkId },
      data: updateData
    });

    res.status(200).json({ status: "success", data: updatedMonk, message: "Monk details updated" });
  } catch (error) {
    console.error("Error updating resident monk:", error);
    res.status(500).json({ status: "error", message: "Failed to update monk" });
  }
};

// DELETE /api/temple/monks/:id - Delete resident monk (Super Admin / Admin)
export const deleteMonk = async (req: Request, res: Response): Promise<void> => {
  try {
    const monkId = parseParamId(req.params.id);
    if (isNaN(monkId) || monkId === 0) {
      res.status(400).json({ status: "error", message: "Invalid monk ID" });
      return;
    }

    const existing = await prisma.residentMonk.findUnique({ where: { id: monkId } });
    if (!existing) {
      res.status(404).json({ status: "error", message: "Resident monk not found" });
      return;
    }

    await prisma.residentMonk.delete({ where: { id: monkId } });
    res.status(200).json({ status: "success", message: "Monk removed successfully" });
  } catch (error) {
    console.error("Error deleting resident monk:", error);
    res.status(500).json({ status: "error", message: "Failed to delete monk" });
  }
};
