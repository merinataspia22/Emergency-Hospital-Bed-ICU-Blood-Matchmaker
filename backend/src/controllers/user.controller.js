import User from "../models/User.js";
import bcrypt from "bcryptjs";

// Get all users from MongoDB Atlas
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users }); // response-er key "data" hote hobe
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create / Add a new user and save to MongoDB Atlas
export const createUser = async (req, res) => {
  try {
    const { name, email, password, type, location, phone, bloodGroup, role } = req.body;

    // Check if email already exists (if email is provided)
    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: "User already exists with this email" });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = password ? await bcrypt.hash(password, salt) : await bcrypt.hash("123456", salt);

    const newUser = await User.create({
      name,
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@example.com`,
      phone: phone || "01700000000",
      passwordHash,
      type: type || "Donor",
      role: role || (type ? type.toLowerCase() : "donor"),
      bloodGroup: bloodGroup || "",
      location: location || "Chattogram",
      loc: location || "Chattogram",
      joined: new Date().toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })
    });

    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update an existing user in MongoDB Atlas
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If password is provided, hash it before updating
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(updateData.password, salt);
      delete updateData.password;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a user from MongoDB Atlas
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};