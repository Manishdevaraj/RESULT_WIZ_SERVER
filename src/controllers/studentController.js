import { BAD_REQUEST, FORBIDDEN, NOT_FOUND } from "../constants/http.js";
import { Class } from "../models/classModel.js";
import { Student } from "../models/studenModel.js";
import { Subject } from "../models/subjectModel.js";
import appAssert from "../utils/appAssert.js";


export const createStudentsInBulk = async (req, res) => {
    const { students, ClassId} = req.body;

    // console.log(req.body);
   // Validate that all required fields are present
   appAssert(students && ClassId, BAD_REQUEST, 'Missing required fields: students, ClassId');

   // Validate batchId and departmentId exist in the database
   const classData = await Class.findById(ClassId);


   appAssert(classData , NOT_FOUND, `Batch with ID ${ClassId} not found`);

   // Validate that each student has the necessary fields
   students.forEach((student, index) => {
     appAssert(student.name && student.rollNumber, NOT_FOUND, `Missing required fields in student at index ${index}`);
   });

   // Prepare the student data with batchId and departmentId
   const preparedStudents = students.map(student => ({
     ...student,
     classId:ClassId,
     CGPA: student.CGPA || 0,
     totalCredits: student.totalCredits || 0,
     currentCredits: student.currentCredits || 0,
     performance: student.performance || [],
     arrears: student.arrears || [],
   }));

   // Insert all students at once
   const createdStudents = await Student.insertMany(preparedStudents);

   res.status(201).json({
     message: 'Students created successfully',
     students: createdStudents,
   });
    
    }

//     const charValueMap = {
//       'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5,
//       'U': 0, 'W': 0, 'WH': 0, 'AB': 0, ' ': 0, 'CO': 0,
//     };
    
// export const updateStudentSgpa = async (req, res) => {
      
//         const { jsonData, semester } = req.body;
//         appAssert(jsonData && semester, BAD_REQUEST, "Missing required fields");
    
//         const subjectCodes = [...new Set(jsonData.flatMap((s) => s.courses.map((c) => c.code)))];
    
//         // Fetch all subjects at once
//         const subjects = await Subject.find({ code: { $in: subjectCodes } });
    
//         // Map subject codes to credits
//         const subjectCreditMap = subjects.reduce((acc, subject) => {
//           acc[subject.code] = subject.credit;
//           return acc;
//         }, {});
//         //check the subject in area list if it the pop it out
    
//         // Process each student
//         const updatedStudents = await Promise.all(
//           jsonData.map(async (studentData) => {
//             let totalCredits = 0;
//             let hasArrear = false;
//             let sum = 0;
//             let arrearsList = [];
//             const subjectRecords = [];
    
//             for (const course of studentData.courses) {
//               const gradeValue = charValueMap[course.grade];
//               const credit = subjectCreditMap[course.code]; // Default to 3 credits
    
//               if (["U", "AB", "WH", "W"].includes(course.grade)) {
//                 hasArrear = true;
//                 arrearsList.push({
//                   subjectId: subjects.find((s) => s.code === course.code)?._id,
//                   semester,
//                   status: "pending",
//                 });
//               } else {
//                 sum += gradeValue * credit;
                
//                 totalCredits += credit;
//               }
    
//               // Create subject performance record
//               subjectRecords.push({
//                 subjectId: subjects.find((s) => s.code === course.code)?._id,
//                 marks: gradeValue * 10, // Assuming marks = grade * 10
//                 status: ["U", "AB", "WH", "W"].includes(course.grade) ? "arrear" : "cleared",
//               });
//             }
    
//             // ✅ Corrected SGPA calculation (ignoring arrear subjects)
//             const sgpa = totalCredits > 0 ? (sum/ totalCredits).toFixed(2) : "0.00";
//             console.log(sgpa);
    
//             // Find student
//             const student = await Student.findOne({ rollNumber: studentData.rollNumber });
//             appAssert(student, NOT_FOUND, "Student not found");
    
//             // Update performance history
//             student.performance.push({
//               semester,
//               SGPA: parseFloat(sgpa),
//               subjects: subjectRecords,
//             });
    
//             // Update arrears list
//             student.arrears = hasArrear ? arrearsList : [];
    
//             // ✅ Corrected CGPA calculation (credit-weighted)
//             const totalWeightedSgpa = student.performance.reduce(
//               (acc, p) => acc + (p.SGPA * p.subjects.reduce((cSum, subj) => cSum + (subjectCreditMap[subj.subjectId] || 3), 0)),
//               0
//             );
//             const totalCreditsEarned = student.performance.reduce(
//               (acc, p) => acc + p.subjects.reduce((cSum, subj) => cSum + (subjectCreditMap[subj.subjectId] || 3), 0),
//               0
//             );
    
//             student.CGPA = totalCreditsEarned > 0 ? (totalWeightedSgpa / totalCreditsEarned).toFixed(2) : student.CGPA;
    
//             await student.save();
//             return student;
//           })
//         );
    
//         res.status(200).json({ message: "SGPA and CGPA updated successfully" });
      
//     };

const charValueMap = {
  'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5,
  'U': 0, 'W': 0, 'WH': 0, 'AB': 0, ' ': 0, 'CO': 0,
};

export const updateStudentSgpa = async (req, res) => {
  
    const { jsonData,semester } = req.body;
    appAssert(jsonData &&semester, BAD_REQUEST, "Missing required fields");

    const subjectCodes = [...new Set(jsonData.flatMap((s) => s.courses.map((c) => c.code)))];

    // Fetch all subjects at once
    const subjects = await Subject.find({ code: { $in: subjectCodes } });

    appAssert(subjects.length===subjectCodes.length,FORBIDDEN,'subject is not upded in db or wron subject filed in data..');

    // Map subject codes to credits
    const subjectCreditMap = subjects.reduce((acc, subject) => {
      acc[subject.code] = subject.credit;
      return acc;
    }, {});

    // Process each student
    const updatedStudents = await Promise.all(
      jsonData.map(async (studentData) => {
        let hasArrear = false;
        let sum = 0;
        let totalCredits=0;
        let arrearsList = [];
        const subjectRecords = [];


        for (const course of studentData.courses) 
          {
          const gradeValue = charValueMap[course.grade];
          const credit = subjectCreditMap[course.code]; // Default to 3 credits if not found

          // Find student
        const student = await Student.findOne({ rollNumber: studentData.rollNumber });
        appAssert(student, NOT_FOUND, "Student not found");

        // Remove cleared arrears
      // Remove cleared arrears & update performance
student.arrears = student.arrears.filter((arrear) => {
  const clearedSubject = subjectRecords.find(
    (sub) => sub.subjectId.equals(arrear.subjectId) && sub.status === "cleared"
  );

  return !clearedSubject; // Remove from arrears if cleared
});


        

          if (["U", "AB", "WH", "W"].includes(course.grade)) {
            hasArrear = true;
            arrearsList.push({
              subjectId: subjects.find((s) => s.code === course.code)?._id,
              semester:studentData.semester,
              status: "pending",
            });
          } else {
            sum += gradeValue * credit;
            totalCredits += credit;
          }

          // Create subject performance record
          subjectRecords.push({
            subjectId: subjects.find((s) => s.code === course.code)?._id,
            marks: gradeValue * 10, // Assuming marks = grade * 10
            grade:course.grade,
            status:course.grade!=="AB" ?(["U", "AB", "WH", "W"].includes(course.grade) ? "arrear" : "cleared"):"absent",
          });
        }
         // Find student
         const student = await Student.findOne({ rollNumber: studentData.rollNumber });
         appAssert(student, NOT_FOUND, "Student not found");

        // student.performance.forEach((perf) => {
        //   perf.subjects.forEach((sub) => {
        //     if (sub.subjectId.equals(subjects.find((s) => s.code === course.code)?._id)) {
        //       sub.status = "PC";  // ✅ Update status to PC (Previously Cleared)
        //       sub.grade = course.grade;  // ✅ Update grade to latest attempt
        //       sub.marks = course.marks;  // ✅ Ensure marks are updated
        //     }
        //   });
        // });
        
        // ✅ SGPA Calculation
        const sgpa = totalCredits > 0 ? (sum / totalCredits).toFixed(2) : "0.00";

          
        // ✅ Update existing semester entry instead of creating a new one
        const existingPerformance = student.performance.find((p) => p.semester === Number(studentData.semester));
        
        //if sem is exist then just update the marks
        if (existingPerformance) {
          // If performance exists for the semester, update it
        // Ensure previous SGPA is a valid number
const p_sgpa = existingPerformance.SGPA ? parseFloat(existingPerformance.SGPA) : 0;
  // console.log(existingPerformance.SGPA);
// Ensure sgpa is a valid number
const currentSgpa = parseFloat(sgpa) || 0;

// If previous SGPA exists, calculate the new SGPA properly
// let p_sum = p_sgpa !== 0 ? (p_sgpa + currentSgpa) / 2 : currentSgpa !==0?currentSgpa:p_sgpa;
let p_sum;
if (p_sgpa !== 0 && currentSgpa !== 0) {
    p_sum = (p_sgpa + currentSgpa) / 2;  // Average both SGPA values
} else if ((p_sgpa === undefined || p_sgpa === 0)&& currentSgpa !== 0) {
    p_sum = currentSgpa;  // Only new SGPA exists
} else {
    p_sum = p_sgpa;  // Only old SGPA exists
}





// Debugging logs to check calculations
// console.log(
//   "Prev SGPA:", p_sgpa, 
//   "New SGPA:", currentSgpa, 
//   "Computed SGPA:", p_sum, 
//   "Sum of SGPA:", p_sgpa + currentSgpa, 
//   "Average:", (p_sgpa + currentSgpa) / 2
// );

// Update the student's SGPA with the computed value
existingPerformance.SGPA = parseFloat(p_sum.toFixed(2));

          subjectRecords.forEach((newSubject) => {
            const existingSubject = existingPerformance.subjects.find((s) =>
              s.subjectId.equals(newSubject.subjectId)
            );

        
            if (existingSubject) {
              // ✅ Update marks if subject already exists
              existingSubject.grade=newSubject.grade;
              existingSubject.marks = newSubject.marks;
              existingSubject.status = "PC";
            } else {
              // ✅ Add new subject if it does not exist in the semester
              existingPerformance.subjects.push(newSubject);
            }
          });
        } else {
          // Otherwise, add a new performance entry
          student.performance.push({
            semester:studentData.semester,
            SGPA: parseFloat(sgpa),
            subjects: subjectRecords,
          });
        }
         // Update arrears list
         student.arrears = hasArrear ? arrearsList : [];

        // ✅ CGPA Calculation (Weighted Average)
        // ✅ Check if it's the first semester
      if (semester === 1) {
        student.CGPA = parseFloat(sgpa); // First semester CGPA = SGPA
      } else {
        // ✅ Compute CGPA as the average of all SGPA values
        const totalSGPA = student.performance.reduce((sum, perf) => sum + perf.SGPA, 0);
        const numSemesters = student.performance.length;
        student.CGPA = parseFloat((totalSGPA / semester).toFixed(2));
      }

        const totalCreditsEarned = student.performance.reduce(
          (acc, p) => acc + p.subjects.reduce((cSum, subj) => cSum + (subjectCreditMap[subj.subjectId] || 3), 0),
          0
        );
      

        await student.save();
        return student;
      })
    );

    res.status(200).json({ message: "SGPA and CGPA updated successfully",student:updatedStudents });
  
};
