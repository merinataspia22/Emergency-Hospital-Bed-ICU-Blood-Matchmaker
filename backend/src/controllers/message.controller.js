import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import * as logic from "../logic/message.logic.js";

export const getConversations = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, "Conversations fetched", await logic.listConversations(req.user.id));
});
export const getThread = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, "Messages fetched", await logic.getThread(req.user.id, req.params.userId));
});
export const sendMessage = asyncHandler(async (req, res) => {
  sendSuccess(res, 201, "Message sent", await logic.sendMessage(req.user.id, req.params.userId, req.body));
});
