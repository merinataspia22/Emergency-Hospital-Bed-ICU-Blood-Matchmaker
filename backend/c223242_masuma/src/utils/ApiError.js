// Ekta jaygay error banano: throw new ApiError(404, "Not found")
export default class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}
