import mongoose from "mongoose";

export const normalizeSearch = (value = "") => value.trim();

export const buildMembershipQuery = (userId) => ({
  $or: [{ owner: userId }, { members: userId }],
});

export const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

export const uniqueObjectIds = (ids = []) => {
  const seen = new Set();

  return ids.filter(Boolean).filter((id) => {
    const stringId = id.toString();
    if (seen.has(stringId)) {
      return false;
    }

    seen.add(stringId);
    return true;
  });
};

