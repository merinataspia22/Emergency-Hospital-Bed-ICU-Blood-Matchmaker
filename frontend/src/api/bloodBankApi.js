// Member 5: Blood bank API calls (talks to backend /api/bloodbank/...)
// Uses the same apiRequest + token as login (services/api.js), so no extra setup.
import { apiRequest, readToken } from "../services/api.js";

const withToken = (options = {}) => ({ ...options, token: readToken() });

// GET /api/bloodbank/me/stock  ->  { hospitalName, hospitalLocation, stock: { "A+": 12, ... } }
export async function getMyStock() {
  const data = await apiRequest("/bloodbank/me/stock", withToken());
  const stock = {};
  (data.stock || []).forEach((row) => {
    stock[row.bloodGroup] = row.unitsAvailable;
  });
  return {
    hospitalName: data.hospitalName,
    hospitalLocation: data.hospitalLocation,
    stock,
  };
}

// PATCH /api/bloodbank/me/stock/:group  body { unitsAvailable }
// encodeURIComponent is needed because "A+" contains "+".
export function setGroupUnits(group, unitsAvailable) {
  return apiRequest(
    `/bloodbank/me/stock/${encodeURIComponent(group)}`,
    withToken({ method: "PATCH", body: { unitsAvailable } })
  );
}
