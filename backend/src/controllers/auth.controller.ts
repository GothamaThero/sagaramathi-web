import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_change_in_prod";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, address, phone, whatsapp } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ status: "error", message: "Name, email, and password are required" });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ status: "error", message: "Email is already registered" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Default role is USER
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        address: address || null,
        phone: phone || null,
        whatsapp: whatsapp || null,
        role: "USER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        phone: true,
        whatsapp: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json({ status: "success", data: newUser, message: "Registered successfully. Awaiting approval." });
  } catch (error: any) {
    console.error("Error registering user:", error);
    res.status(500).json({ status: "error", message: "Registration failed" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ status: "error", message: "Email and password are required" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ status: "error", message: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ status: "error", message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      status: "success",
      message: "Logged in successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error: any) {
    console.error("Error logging in:", error);
    res.status(500).json({ status: "error", message: "Login failed" });
  }
};

export const getMe = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.userId || req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        whatsapp: true,
        address: true,
        city: true,
        designation: true,
        bio: true,
        avatar: true,
        coverImage: true,
        role: true,
        createdAt: true
      }
    });
    if (!user) {
      res.status(404).json({ status: "error", message: "User not found" });
      return;
    }
    res.status(200).json({ status: "success", data: user });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to fetch user" });
  }
};

export const updateProfile = async (req: any, res: Response): Promise<void> => {
  try {
    const { name, phone, whatsapp, address, city, designation, bio, avatar, coverImage, currentPassword, newPassword } = req.body;
    const userId = req.user.userId || req.user.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ status: "error", message: "User not found" });
      return;
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (designation !== undefined) updateData.designation = designation;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (coverImage !== undefined) updateData.coverImage = coverImage;

    if (newPassword) {
      if (!currentPassword) {
        res.status(400).json({ status: "error", message: "Current password is required to set a new password" });
        return;
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        res.status(401).json({ status: "error", message: "Incorrect current password" });
        return;
      }
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        whatsapp: true,
        address: true,
        city: true,
        designation: true,
        bio: true,
        avatar: true,
        coverImage: true,
        role: true
      }
    });

    // Sync updated authorName across posts
    if (name && name !== user.name) {
      await prisma.post.updateMany({
        where: { userId },
        data: { authorName: name }
      });
      await prisma.postComment.updateMany({
        where: { userId },
        data: { userName: name }
      });
    }

    res.status(200).json({ status: "success", data: updatedUser, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ status: "error", message: "Failed to update profile" });
  }
};

// GET /api/auth/profile/:id - Fetch public profile of any user
export const getUserPublicProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const targetUserId = parseInt(rawId || "0", 10);
    if (isNaN(targetUserId)) {
      res.status(400).json({ status: "error", message: "Invalid user ID" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        whatsapp: true,
        address: true,
        city: true,
        designation: true,
        bio: true,
        avatar: true,
        coverImage: true,
        role: true,
        createdAt: true,
        posts: {
          orderBy: { createdAt: "desc" },
          include: {
            likes: true,
            comments: true
          }
        }
      }
    });

    if (!user) {
      res.status(404).json({ status: "error", message: "User profile not found" });
      return;
    }

    res.status(200).json({ status: "success", data: user });
  } catch (error) {
    console.error("Error fetching public profile:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch user profile" });
  }
};

export const adminResetPassword = async (req: any, res: Response): Promise<void> => {
  try {
    const { userId, newPassword } = req.body;
    const requesterRole = req.user?.role;

    if (!userId || !newPassword) {
      res.status(400).json({ status: "error", message: "User ID and new password are required" });
      return;
    }

    const targetUser = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!targetUser) {
      res.status(404).json({ status: "error", message: "Target user not found" });
      return;
    }

    if (targetUser.role === "SUPER_ADMIN" && requesterRole !== "SUPER_ADMIN") {
      res.status(403).json({ status: "error", message: "Access denied: Only a Super Admin can reset a Super Admin's password" });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: Number(userId) },
      data: { password: hashedPassword }
    });

    res.status(200).json({ status: "success", message: "Password reset successfully by admin" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ status: "error", message: "Failed to reset password" });
  }
};
