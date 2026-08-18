import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../config/db.js";

// Get all users
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ status: "success", data: users });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch users" });
  }
};

// Get single user by ID
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const paramId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(paramId || "", 10);
    if (isNaN(id)) {
      res.status(400).json({ status: "error", message: "Invalid user ID" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ status: "error", message: "User not found" });
      return;
    }

    res.status(200).json({ status: "success", data: user });
  } catch (error: any) {
    console.error("Error fetching user:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch user" });
  }
};

// Create a new user
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ status: "error", message: "Name, email, and password are required" });
      return;
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ status: "error", message: "Email is already registered" });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "USER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json({ status: "success", data: newUser, message: "User created successfully" });
  } catch (error: any) {
    console.error("Error creating user:", error);
    res.status(500).json({ status: "error", message: "Failed to create user" });
  }
};

// Update an existing user
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const paramId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(paramId || "", 10);
    if (isNaN(id)) {
      res.status(400).json({ status: "error", message: "Invalid user ID" });
      return;
    }

    const { name, email, password, role } = req.body;
    const requesterRole = (req as any).user?.role;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      res.status(404).json({ status: "error", message: "User not found" });
      return;
    }

    // Protection: Non-Super Admin cannot modify a Super Admin account
    if (existingUser.role === "SUPER_ADMIN" && requesterRole !== "SUPER_ADMIN") {
      res.status(403).json({ status: "error", message: "Access denied: Only a Super Admin can modify a Super Admin account" });
      return;
    }

    // Check if new email conflicts with another user
    if (email && email !== existingUser.email) {
      const emailUser = await prisma.user.findUnique({ where: { email } });
      if (emailUser) {
        res.status(400).json({ status: "error", message: "Email is already taken" });
        return;
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({ status: "success", data: updatedUser, message: "User updated successfully" });
  } catch (error: any) {
    console.error("Error updating user:", error);
    res.status(500).json({ status: "error", message: "Failed to update user" });
  }
};

// Delete a user
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const paramId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(paramId || "", 10);
    if (isNaN(id)) {
      res.status(400).json({ status: "error", message: "Invalid user ID" });
      return;
    }

    const requesterRole = (req as any).user?.role;
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      res.status(404).json({ status: "error", message: "User not found" });
      return;
    }

    // Protection: Non-Super Admin cannot delete a Super Admin account
    if (existingUser.role === "SUPER_ADMIN" && requesterRole !== "SUPER_ADMIN") {
      res.status(403).json({ status: "error", message: "Access denied: Only a Super Admin can delete a Super Admin account" });
      return;
    }

    await prisma.user.delete({ where: { id } });

    res.status(200).json({ status: "success", message: "User deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    res.status(500).json({ status: "error", message: "Failed to delete user" });
  }
};
