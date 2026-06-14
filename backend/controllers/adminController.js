import User from "../models/User.js";
import bcrypt from "bcryptjs";

// User Management
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const lockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot lock admin account" });
    }

    user.isLocked = true;
    await user.save();

    res.json({
      message: "User locked successfully",
      user: { _id: user._id, email: user.email, isLocked: user.isLocked },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const unlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isLocked = false;
    await user.save();

    res.json({
      message: "User unlocked successfully",
      user: { _id: user._id, email: user.email, isLocked: user.isLocked },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot delete admin account" });
    }

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Staff Management
export const getAllStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: ["staff", "admin"] } }).select(
      "-password",
    );
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createStaff = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }

    if (role && !["staff", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role for staff" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const staff = await User.create({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      role: role || "staff",
    });

    res.status(201).json({
      _id: staff._id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      phoneNumber: staff.phoneNumber,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStaff = async (req, res) => {
  try {
    const staff = await User.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    if (!["staff", "admin"].includes(staff.role)) {
      return res.status(400).json({ message: "User is not staff" });
    }

    staff.name = req.body.name || staff.name;
    staff.phoneNumber = req.body.phoneNumber || staff.phoneNumber;
    staff.address = req.body.address || staff.address;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      staff.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedStaff = await staff.save();

    res.json({
      _id: updatedStaff._id,
      name: updatedStaff.name,
      email: updatedStaff.email,
      role: updatedStaff.role,
      phoneNumber: updatedStaff.phoneNumber,
      address: updatedStaff.address,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStaffRole = async (req, res) => {
  try {
    const { role } = req.body;
    const staff = await User.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    if (!["staff", "admin", "user"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    staff.role = role;
    await staff.save();

    res.json({
      message: "Role updated successfully",
      user: {
        _id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const lockStaff = async (req, res) => {
  try {
    const staff = await User.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    if (staff.role === "admin") {
      return res.status(403).json({ message: "Cannot lock admin account" });
    }

    staff.isLocked = true;
    await staff.save();

    res.json({ message: "Staff locked successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const unlockStaff = async (req, res) => {
  try {
    const staff = await User.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    staff.isLocked = false;
    await staff.save();

    res.json({ message: "Staff unlocked successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteStaff = async (req, res) => {
  try {
    const staff = await User.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    if (staff.role === "admin") {
      return res.status(403).json({ message: "Cannot delete admin account" });
    }

    await staff.deleteOne();
    res.json({ message: "Staff deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
