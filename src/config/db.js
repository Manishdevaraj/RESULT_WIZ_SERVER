import { DB_URL } from "../constants/env.js";
import mongoose from "mongoose";

  // Connect to MongoDB
export const connectToDb=async()=>{
  await mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log('Connected to MongoDB');
      
    })
    .catch((err) => {
      console.error('Connection error', err);
    });
}