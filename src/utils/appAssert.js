import assert from "node:assert";
import Apperror from "./Apperror.js";


/**
 * Asserts a condition and throws an AppError if the condition is falsy.
 */
const appAssert = (
  condition,
  httpStatusCode,
  message,
  appErrorCode
) => assert(condition, new Apperror(httpStatusCode, message, appErrorCode));

export default appAssert;