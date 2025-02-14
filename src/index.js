import express from "express";
import "dotenv/config";
import cors from 'cors';
import { connectToDb } from "./config/db.js";
import { PORT } from "./constants/env.js";
import { errorHandeler } from "./middleware/errorHandeler.js";
import { adminRoute } from "./routes/adminRoute.js";
import { staffRoute } from "./routes/staffRoute.js";

const app=express();
app.use(express.json());
app.use(cors({
  origin:'*',
  credentials:true
}))

app.get('/',(req,res)=>
    {
        res.send("The Secure server running good...");
    })

app.use('/admin',adminRoute);
app.use('/staff',staffRoute);

app.use(errorHandeler);    

app.listen(PORT,'0.0.0.0',async()=>{
        console.log(`ResultWiz server running at http://localhost:${PORT}`);
        await connectToDb();
      })