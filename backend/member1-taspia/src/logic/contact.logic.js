import ContactMessage from "../models/ContactMessage.model.js";
import { validateContact, validatePagination } from "../utils/validators.js";

export async function saveContactMessage(payload) {
  const input = validateContact(payload);
  const saved = await ContactMessage.create(input);
  return { id: String(saved._id), status: saved.status, createdAt: saved.createdAt };
}

// For an admin dashboard implemented by another team member.
export async function listContactMessages(query = {}) {
  const { page, limit } = validatePagination(query);
  const filter = {};
  const [messages, total] = await Promise.all([
    ContactMessage.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    ContactMessage.countDocuments(filter),
  ]);
  return {
    messages: messages.map(msg => ({
      id: String(msg._id), name: msg.name, email: msg.email,
      message: msg.message, status: msg.status, createdAt: msg.createdAt,
    })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}
