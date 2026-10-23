import { listContactMessages, saveContactMessage } from "../logic/contact.logic.js";
import { sendSuccess } from "../utils/apiResponse.js";

export async function sendContactMessage(req, res) {
  const record = await saveContactMessage(req.body);
  return sendSuccess(res, 201, "Message received", { contact: record });
}
export async function getContactMessages(req, res) {
  const result = await listContactMessages(req.query);
  return sendSuccess(res, 200, "Messages fetched", result);
}
