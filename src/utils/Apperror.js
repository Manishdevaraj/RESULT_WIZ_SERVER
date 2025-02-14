export default class Apperror extends Error {
    constructor(httpStatusCode = 500, message = "An error occurred", appErrorCode) {
      super(message); // Pass the message to the parent Error class
      this.name = this.constructor.name; // Set the error name to the class name
      this.httpStatusCode = httpStatusCode; // Add HTTP status code
      this.appErrorCode = appErrorCode; // Add an application-specific error code
    }
  }
  