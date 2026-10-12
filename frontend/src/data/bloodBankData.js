/* MOCK DATA -> backend ready hole ei gulo API theke ashbe */

export const currentUser = {
  name: "Dr. Ayesha Rahman",
  role: "Blood Bank Officer",
  photo: "",
};

export const inventory = [
  { group: "A+", units: 128 },
  { group: "A-", units: 42 },
  { group: "B+", units: 96 },
  { group: "B-", units: 28 },
  { group: "O+", units: 186 },
  { group: "O-", units: 55 },
  { group: "AB+", units: 38 },
  { group: "AB-", units: 16 },
];

export const incomingRequests = [
  { id: 1, name: "Rahim Uddin", group: "O+", hospital: "Chattogram Medical College", units: 3, reason: "Surgery (Emergency)", urgency: "Urgent", time: "10 minutes ago", approved: false },
  { id: 2, name: "Shabana Khatun", group: "A+", hospital: "Aga Khan Hospital", units: 2, reason: "Postpartum Hemorrhage", urgency: "High", time: "28 minutes ago", approved: false },
  { id: 3, name: "Imran Hossain", group: "B-", hospital: "Parkview Hospital", units: 1, reason: "Accident Case", urgency: "Normal", time: "1 hour ago", approved: false },
  { id: 4, name: "Farhana Islam", group: "AB+", hospital: "City Hospital", units: 3, reason: "Cancer Treatment", urgency: "Normal", time: "2 hours ago", approved: false },
];

export const crossMatch = [
  { id: 1, patient: "Nasir Ahmed", group: "A+", units: 2, status: "Pending" },
  { id: 2, patient: "Lamia Akter", group: "O-", units: 1, status: "Pending" },
  { id: 3, patient: "Sajid Khan", group: "B+", units: 3, status: "In Progress" },
  { id: 4, patient: "Ruksana Begum", group: "O+", units: 2, status: "Pending" },
  { id: 5, patient: "Tanvir Hasan", group: "AB-", units: 1, status: "In Progress" },
  { id: 6, patient: "Mst. Salma", group: "A-", units: 2, status: "Pending" },
];

export const appointments = [
  { id: 1, name: "Nafisa Alam", group: "A+", when: "12 Jun 2025, 10:00 AM", contact: "0171XXXXXXX", status: "Confirmed" },
  { id: 2, name: "Tawhid Hasan", group: "O+", when: "12 Jun 2025, 12:30 PM", contact: "0182XXXXXXX", status: "Confirmed" },
  { id: 3, name: "Sadia Rahman", group: "B+", when: "13 Jun 2025, 09:00 AM", contact: "0167XXXXXXX", status: "Pending" },
  { id: 4, name: "Arif Hossain", group: "O-", when: "13 Jun 2025, 11:00 AM", contact: "0193XXXXXXX", status: "Confirmed" },
];

export const bedOccupancy = { occupied: 216, available: 84, total: 300 };

/* Inventory Trends (last 30 days) - collected vs used */
export const trends = {
  collected: [60, 80, 65, 100, 110, 95, 130, 105, 125, 110, 140, 150, 135, 145, 150, 165, 150, 160, 145, 155, 165, 140, 150, 170, 150, 165, 185, 160, 150, 190],
  used: [28, 35, 25, 45, 50, 40, 60, 48, 55, 50, 62, 70, 66, 72, 78, 85, 80, 88, 76, 90, 95, 82, 100, 105, 95, 108, 112, 105, 100, 125],
};

export const quickActions = [
  "Update Blood Stock",
  "Approve Blood Request",
  "Manage Hospital Beds",
  "View Reports",
  "Manage Donors",
  "Send Notifications",
];