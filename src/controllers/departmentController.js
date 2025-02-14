import mongoose from "mongoose";
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from "../constants/http.js";
import { Department } from "../models/departmentModel.js";
import appAssert from "../utils/appAssert.js";



export const createDepartment = async (req, res) => {
  
  //get deparmen frm boad if not throw eror
  const { departments }= req.body;
  console.log(departments); 
  appAssert(departments,NOT_FOUND,'department is require to create')
   //after Map the data to match the Department schema 
   const departmentDocs = departments.map((dept) => ({
    name: dept.Name,
    code: dept.Code,
    batches: [] // Empty initially
  }));
    // Insert the data into the database
    const createdDepartments = await Department.insertMany(departmentDocs);

    res.status(201).json({
      message: 'Departments created successfully',
      data: createdDepartments
    });

  };

export const getDbStaus=async (req, res) => {
  
  // Get DB instance and stats
const db = mongoose.connection.db;

const stats = await db.stats();
const usedSpaceInMB = (stats.storageSize + stats.indexSize) / (1024 * 1024);
const freeTierLimitInMB = 513;
const availableSpaceInMB = freeTierLimitInMB - usedSpaceInMB;

console.log(`Used Space: ${usedSpaceInMB.toFixed(2)} MB`);
console.log(`Available Space: ${availableSpaceInMB.toFixed(2)} MB`);

mongoose.connection.close();

    res.status(201).json({
      availableSpaceInMB,
      usedSpaceInMB
    });

  };