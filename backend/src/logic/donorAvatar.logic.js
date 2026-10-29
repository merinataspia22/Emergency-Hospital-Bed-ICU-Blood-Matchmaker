import DonorProfile from "../models/DonorProfile.js";
import ApiError from "../utils/ApiError.js";

export async function setMyAvatar(userId, body) {
  const avatar = body?.avatar;
  const profile = await DonorProfile.forUser(userId);
  if (avatar === null || avatar === "") {
    profile.avatar = "";
  } else {
    if (typeof avatar !== "string" || avatar.length > 300000 ||
        !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(avatar)) {
      throw new ApiError(400, "Send a small jpeg, png or webp image");
    }
    profile.avatar = avatar;
  }
  await profile.save();
  return { avatar: profile.avatar };
}
