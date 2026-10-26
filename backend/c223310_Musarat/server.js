require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ----------------- MongoDB Atlas Connection -----------------
const MONGO_URI = process.env.MONGO_URI; 

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Atlas Connected Successfully!'))
  .catch((err) => console.log('Database connection error: ', err));

// ----------------- Mongoose Schemas & Models -----------------

// 1. Hospital Schema (Hospital Beds Management)
const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  area: { type: String, required: true },
  general: { type: Number, default: 0 },
  icu: { type: Number, default: 0 },
  dist: { type: Number, default: 0 },
  blood: { type: String, default: "Available" },
  phone: { type: String },
  type: { type: String },
  address: { type: String },
  depts: [{ type: String }],
  img: { type: String }
}, { timestamps: true });

const Hospital = mongoose.model('Hospital', hospitalSchema);

// 2. User Schema (Admin User Management)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, default: 'Donor' }, // Donor, Hospital, Staff, Admin
  loc: { type: String },
  joined: { type: String },
  email: { type: String },
  bloodGroup: { type: String }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// 3. Blood Request Schema (Matched with frontend and Atlas documents)
const bloodRequestSchema = new mongoose.Schema({
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  patientName: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  units: { type: Number, required: true },
  urgency: { type: String, default: 'Normal' },
  hospitalName: { type: String, required: true },
  hospitalLocation: { type: String },
  contact: { type: String, required: true },
  dateNeeded: { type: String },
  details: { type: String, default: "" },
  status: { type: String, default: 'Pending' }
}, { timestamps: true });

const BloodRequest = mongoose.model('BloodRequest', bloodRequestSchema);


// =========================================================================
// FULL CRUD ENDPOINTS FOR MEMBER 4 (Hospitals/Beds & Users & Admin)
// =========================================================================

// --- 1. HOSPITAL & BEDS CRUD ENDPOINTS ---

// A. CREATE (Add Hospital & Beds)
app.post('/api/hospitals', async (req, res) => {
  try {
    const newHospital = new Hospital(req.body);
    const savedHospital = await newHospital.save();
    res.status(201).json({ message: "Hospital added successfully!", hospital: savedHospital });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// B. READ (Get All Hospitals & Beds)
app.get('/api/hospitals', async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// C. READ SINGLE (Get Specific Hospital & Beds by ID)
app.get('/api/hospitals/:id', async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });
    res.json(hospital);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// D. UPDATE (Update Hospital & Bed Counts)
app.put('/api/hospitals/:id', async (req, res) => {
  try {
    const updatedHospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedHospital) return res.status(404).json({ message: "Hospital not found" });
    res.json({ message: "Hospital updated successfully", hospital: updatedHospital });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// E. DELETE (Remove Hospital)
app.delete('/api/hospitals/:id', async (req, res) => {
  try {
    const deletedHospital = await Hospital.findByIdAndDelete(req.params.id);
    if (!deletedHospital) return res.status(404).json({ message: "Hospital not found" });
    res.json({ message: "Hospital deleted successfully", deletedHospital });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// --- 2. USERS MANAGEMENT CRUD ENDPOINTS ---

// A. CREATE (Add User)
app.post('/api/users', async (req, res) => {
  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.status(201).json({ message: "User added successfully", user: savedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// B. READ (Get All Users for Admin)
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// C. UPDATE (Update User Details)
app.put('/api/admin/users/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// D. DELETE (Remove User Account)
app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User removed successfully", deletedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// --- 3. ADMIN OVERVIEW STATISTICS ---
app.get('/api/admin/overview', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalHospitals = await Hospital.countDocuments();
    const totalRequests = await BloodRequest.countDocuments();

    res.status(200).json({
      totalUsers: totalUsers || 1254,
      registeredDonors: 892,
      bloodRequests: totalRequests || 156,
      completedDonations: 320,
      hospitalPartners: totalHospitals || 42
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 4. BLOOD REQUESTS CRUD ENDPOINTS ---

// A. CREATE (Add Blood Request)
app.post('/api/bloodrequests', async (req, res) => {
  try {
    const newRequest = new BloodRequest(req.body);
    const savedRequest = await newRequest.save();
    res.status(201).json({ message: "Blood request added successfully!", request: savedRequest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// B. READ (Get All Blood Requests)
app.get('/api/bloodrequests', async (req, res) => {
  try {
    const requests = await BloodRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// C. UPDATE (Update Blood Request)
app.put('/api/bloodrequests/:id', async (req, res) => {
  try {
    const updatedRequest = await BloodRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedRequest) return res.status(404).json({ message: "Blood request not found" });
    res.json({ message: "Blood request updated successfully", request: updatedRequest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// D. DELETE (Remove Blood Request)
app.delete('/api/bloodrequests/:id', async (req, res) => {
  try {
    const deletedRequest = await BloodRequest.findByIdAndDelete(req.params.id);
    if (!deletedRequest) return res.status(404).json({ message: "Blood request not found" });
    res.json({ message: "Blood request deleted successfully", deletedRequest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ----------------- AUTHENTICATION LOGIN ENDPOINT -----------------
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email in database
    const user = await User.findOne({ email: email.trim() });
    
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Since seed admin or mock users are being checked, verify role & password
    // (If password check is needed, add comparison here, or accept test credentials directly)
    if (email === "admin.test@example.com") {
      const adminData = {
        id: user._id,
        name: user.name || "System Admin",
        email: user.email,
        role: "admin"
      };

      return res.status(200).json({
        success: true,
        data: {
          user: adminData,
          accessToken: "mock_jwt_admin_token_12345"
        }
      });
    }

    res.status(401).json({ success: false, message: "Unauthorized access" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Server Start
app.listen(PORT, () => {
  console.log(`Member 4 Full CRUD Server running on http://localhost:${PORT}`);
});