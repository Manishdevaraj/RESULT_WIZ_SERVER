import mongoose from "mongoose";
import { FORBIDDEN } from "../constants/http.js";
import { Subject } from "../models/subjectModel.js";
import appAssert from "../utils/appAssert.js";
import { Staff } from "../models/staffModel.js";

export const createSubjects = async (req, res) => {
  try {
    const { subjects } = req.body; // Expecting an array of subjects
    appAssert(subjects, FORBIDDEN, 'Missing data to process...');

    let createdSubjects = [];

    for (let subjectData of subjects) {
      appAssert(subjectData.CODE && subjectData.NAME && subjectData.CREDIT && subjectData.TYPE, FORBIDDEN, "Missing required fields in subject data.");

     

      const newSubject = new Subject({
        code: subjectData.CODE,
        name: subjectData.NAME,
        credit: parseFloat(subjectData.CREDIT) || 0,
        type: subjectData.TYPE,
       
      });

      const savedSubject = await newSubject.save();
      createdSubjects.push(savedSubject);

    }
    res.status(201).json({ message: "Subjects created successfully", subjects: createdSubjects });

  } catch (error) {
    console.error("Error creating subjects:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const getAllSubjects = async (req, res) => {
  const subject=await Subject.find();
  res.status(200).json(subject);
}
