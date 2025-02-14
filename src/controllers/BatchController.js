import { FORBIDDEN } from "../constants/http.js";
import { Batch } from "../models/batchModel.js";
import { Department } from "../models/departmentModel.js";
import appAssert from "../utils/appAssert.js";


export const createBatch=async(req,res)=>
    {
      const { year } = req.body;
      appAssert(year, FORBIDDEN, 'Year is missing');
  
      // Fetch all departments from the database
      const departments = await Department.find({}, '_id');
      appAssert(departments.length > 0, FORBIDDEN, 'No departments found to create batch');
  
      // Extract department IDs from the fetched departments
      const departmentIds = departments.map(dept => dept._id);
  
      // Create a new batch
      const batch = await Batch.create({
        year,
        departments: departmentIds,
      });
  
      return res.status(201).json({ message: 'Batch created successfully', batch });

    }