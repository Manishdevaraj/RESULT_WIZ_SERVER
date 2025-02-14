import { INTERNAL_SERVER_ERROR } from "../constants/http.js";
import Apperror from "../utils/Apperror.js";

export const errorHandeler = (err, req, res, next) => {

       const statusCode = err.httpStatusCode || 500; // Default to 500 if undefined
       const message = err.message || "Internal Server Error";
     // Handle other errors
     console.log(`--path:${req.path} --error:${err}`);
     
       if (err instanceof Apperror) {
         // Custom error handling for Apperror
         return res.status(statusCode).json({
           success: false,
           message,
           errorCode: err.appErrorCode || "UNKNOWN_ERROR",
         });
       }
     
       

       return res.status(500).json({
         success: false,
         message: "Internal Server Error",
       });
     };
     

     