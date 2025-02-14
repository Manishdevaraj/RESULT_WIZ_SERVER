import mongoose from "mongoose";
import { BAD_REQUEST, CONFLICT, FORBIDDEN, NOT_FOUND } from "../constants/http.js";
import { Batch } from "../models/batchModel.js";
import { Class } from "../models/classModel.js";
import { Staff } from "../models/staffModel.js";
import { Student } from "../models/studenModel.js";
import { Subject } from "../models/subjectModel.js";
import appAssert from "../utils/appAssert.js";
import ExcelJS from 'exceljs'

export const onMasterClick=async (req, res)=>
{
      const {id}=req.body;
      const staff=await Staff.findById(id);

      staff.ismaster=!staff.ismaster;
      await staff.save();
      res.status(200).json(staff);
}
export const onhodClick=async (req, res)=>
{
      const {id}=req.body;
      const staff=await Staff.findById(id);

      staff.ishod=!staff.ishod;
      await staff.save();
      res.status(200).json(staff);
}
export const updatename=async(req, res) => {
  const { id, name } = req.body;
  const staff=await Staff.findByIdAndUpdate(id, { name }, { new: true });
  res.status(200).json(staff);
}
export const updateemail=async(req, res) => {
  const { id, email } = req.body;
  const staff=await Staff.findByIdAndUpdate(id, { email }, { new: true });
  res.status(200).json(staff);
}

export const getExcel=async (req, res) => {
  const {id}=req.body;
  appAssert(id,FORBIDDEN,'email is required');
  const data=await Student.find({classId:id});
// Create a new workbook
const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('Sheet 1');

// Add headers
worksheet.columns = [
  { header: 'Name', key: 'name', width: 20 },
  { header: 'Roll Number', key: 'rollNumber', width: 20 },
  { header: 'CGPA', key: 'CGPA', width: 10 },
  { header: 'SGPA', key: 'performance_SGPA', width: 10 },
  { header: 'Semester', key: 'performance_semester', width: 10 },
  // Add more fields as needed
];

// Add data rows
data.forEach(student => {
  student.performance.forEach(perf => {
    worksheet.addRow({
      name: student.name,
      rollNumber: student.rollNumber,
      CGPA: student.CGPA,
      performance_SGPA: perf.SGPA,
      performance_semester: perf.semester,
    });
  });
});

// Set the response header for downloading the file
res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
res.setHeader('Content-Disposition', 'attachment; filename="students.xlsx"');

// Write the Excel file to the response
await workbook.xlsx.write(res);
res.end();
}
export const getStaff=async (req, res) => {
  const {email}=req.body;
  appAssert(email,FORBIDDEN,'email is required');
  const staff=await Staff.findOne({email});
  res.status(200).json({user:staff})
}

export const getClass=async (req, res) => {
    
  const classes=await Class.find().populate('batchId').populate('departmentId');
  res.status(200).json({classes:classes})
}
export const getClassByid=async (req, res) => {
    const {id}=req.body;
  const classes=await Class.findById(id).populate({ path: 'subjects.subjectId' });
  res.status(200).json(classes)
}

export const getStudents=async (req, res) => {
    const {classId}=req.body;

  const stu=await Student.find({classId:classId});
  res.status(200).json({stus:stu})
}

export const getStudentPerformance = async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: 'Invalid student ID' });
    }

    // Fetch the student document by ID
    const student = await Student.findById(studentId).lean();

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Fetch the class data to get subject information
    const classData = await Class.findById(student.classId).lean();

    if (!classData) {
      return res.status(404).json({ message: 'Class not found for this student' });
    }

    const performanceData = await Promise.all(
      student.performance.map(async (semData) => {
        const subjects = await Promise.all(
          semData.subjects.map(async (sub) => {
            const subjectDetails = await Subject.findById(sub.subjectId).lean();
            return {
              subjectId: sub.subjectId,
              subjectName: subjectDetails ? subjectDetails.name : 'N/A', // Corrected field name
              subjectCode: subjectDetails ? subjectDetails.code : 'N/A', // Corrected field name
              marks: sub.marks,
              grade: sub.grade,
              status: sub.status,
            };
          })
        );
        return {
          semester: semData.semester,
          SGPA: semData.SGPA,
          subjects,
        };
      })
    );

    res.status(200).json({
      studentName: student.name,
      rollNumber: student.rollNumber,
      CGPA: student.CGPA,
      totalCredits: student.totalCredits,
      performanceData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const createStaff = async (req, res) => {
  
    const { name, email } = req.body;


    // Validate input
    appAssert(name && email,BAD_REQUEST,'Missing required fields');
    
    // Check for duplicate email
    const existingStaff = await Staff.findOne({ email });
    appAssert(!existingStaff,CONFLICT,'Email already exist');

    // Create the staff with an empty subjectsHandled field
    const newStaff = await Staff.create({
      name,
      email,
      subjectsHandled: [], // Initially empty
      performance: [] // Initially empty
    });

    return res.status(201).json({ message: "Staff created successfully", staff: newStaff });
  
};
export const createStaffBulk = async (req, res) => {
  try {
    const {staffList} = req.body; // Expecting an array of staff objects

    if (!Array.isArray(staffList) || staffList.length === 0) {
      return res.status(400).json({ message: "Invalid or empty staff data" });
    }

    const bulkOperations = [];

    for (const staff of staffList) {
      const { email,  name } = staff; // Extract email and name

      if (!email || !name) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Check for duplicate emails
      const existingStaff = await Staff.findOne({ email });
      if (existingStaff) {
        return res.status(409).json({ message: `Email already exists: ${email}` });
      }

      // Add to bulk operations
      bulkOperations.push({
        insertOne: {
          document: {
            name,
            email,
            subjectsHandled: [],
            performance: [],
          },
        },
      });
    }

    if (bulkOperations.length > 0) {
      await Staff.bulkWrite(bulkOperations);
    }

    return res.status(201).json({ message: "Bulk staff created successfully" });
  } catch (error) {
    console.error("Error creating bulk staff:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getgriddata = async (req, res) => {
  try {
    const { id } = req.body;

    // Get students by class ID
    const students = await Student.find({ classId: id });

    // Count students with arrears in the `arrears` or `performance` fields
    const arrearCount = students.filter(student => 
      student.arrears.some(arrear => arrear.status === 'pending') || 
      student.performance.some(perf =>
        perf.subjects.some(subject => subject.status === 'arrear')
      )
    ).length;

    res.status(200).json({
      totalStudents: students.length,
      students,
      arrearCount
    });
  } catch (error) {
    console.error("Error fetching grid data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const subjectsHandledbystaff = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Staff ID is required" });
    }

    const staff = await Staff.findById(id)
      .populate('subjectsHandled.subjectId')
      .populate('subjectsHandled.classId');

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    res.status(200).json(staff);
  } catch (error) {
    console.error("Error fetching subjects handled by staff:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

  

// export const assignSubjectToStaff = async (req, res) => {
//     try {
//       const { staffId, subjectId, batchId, classId } = req.body;
//       console.log(req.body)
  
//       // Validate input
//       appAssert(staffId && subjectId && batchId && classId, BAD_REQUEST, "Missing required fields");
  
//       // Check if staff exists
//       const staff = await Staff.findById(staffId);
//       appAssert(staff, NOT_FOUND, "Staff not found");
  
//       // Check if subject, batch, and class exist
//       const subject = await Subject.findById(subjectId);
//       const batch = await Batch.findById(batchId);
//       const classInstance = await Class.findById(classId);
//       appAssert(subject && batch && classInstance, NOT_FOUND, "Invalid subject, batch, or class");
  
//       // Update staff document
//       staff.subjectsHandled.push({ subjectId, batchId, classId });
//       await staff.save();
  
//       // Update subject document
//       subject.staffAssigned.push({ staffId, classId });
//       await subject.save();
  
//       return res.status(200).json({ 
//         message: "Subject assigned successfully to staff", 
//         staff, 
//         subject 
//       });
//     } catch (error) {
//       console.error("Error assigning subject to staff:", error);
//       res.status(500).json({ error: "Internal server error" });
//     }
//   };
  

const charValueMap = {
    'O': 10,
    'A+': 9,
    'A': 8,
    'B+': 7,
    'B': 6,
    'C': 5,
    'U': 0,
    'W': 0,
    'WH': 0,
    'AB': 0,
    ' ': 0,
    'CO': 0,
  };
  export const Create_Sgpa = async (req, res) => {
    try {
      const { jsonData } = req.body; // Expecting JSON input
      appAssert(jsonData, FORBIDDEN, "Data is missing to process...");
  
      // Extract unique subject codes
      const subjectCodes = [...new Set(jsonData.flatMap((student) => student.courses.map((c) => c.code)))];

      // console.log(subjectCodes);
      
      // Fetch all subjects in one query
      const subjects = await Subject.find({ code: { $in: subjectCodes } });
      // console.log(subjects);
  
      // Create a map for quick lookup
      const subjectCreditMap = subjects.reduce((acc, subject) => {
        acc[subject.code] = subject.credit;
        return acc;
      }, {});

      // console.log(subjectCreditMap);
  
      // Process each student
      const processedStudents = await Promise.all(
        jsonData.map(async (student) => {
          // console.log(student);
          let sum = 0;
          let totalCredits = 0;
          let arrears = 0;
          let hasArrear = false;
  
          for (const course of student.courses) {
            const gradeValue = charValueMap[course.grade];
            const credit = subjectCreditMap[course.code]; // Default to 3 if not found
  
            if (["U", "AB", "WH","W"].includes(course.grade)) {
              hasArrear = true;
              arrears++;
            } else {
              sum += gradeValue * credit;
              totalCredits += credit;
            }
          }
          //  console.log(sum);
          //  console.log(totalCredits);
          return {
            ...student,
            sgpa: totalCredits > 0 ? (sum / totalCredits).toFixed(2) : "0.00",
            totalArrears: hasArrear ? arrears : 0,
          };
        })
      );
  
      res.json({ students: processedStudents });
    } catch (error) {
      console.error("Error processing JSON data:", error);
      res.status(500).json({ error: "Error processing JSON data" });
    }
  };
  

  