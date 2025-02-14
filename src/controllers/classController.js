import mongoose from "mongoose";
import { FORBIDDEN } from "../constants/http.js";
import { Batch } from "../models/batchModel.js";
import { Class } from "../models/classModel.js";
import { Department } from "../models/departmentModel.js";
import appAssert from "../utils/appAssert.js";
import { Subject } from "../models/subjectModel.js";
import { Staff } from "../models/staffModel.js";
import { Student } from "../models/studenModel.js";

export const assignTutorToClass = async (req, res) => {
 
    const { tutorId, classId } = req.body;


    // Validate required fields
    appAssert(tutorId && classId, FORBIDDEN, 'Missing required fields.');

    // Find the tutor and class
    const tutor = await Staff.findById(tutorId);
    const classData = await Class.findById(classId);

    appAssert(tutor && classData, FORBIDDEN, "Tutor or class not found");

    // Update the tutor to be a class tutor
    tutor.istutor = true;
    tutor.classId = classId;

    // Add the tutor to the class's tutors array
    if (!classData.tutors.includes(tutorId)) {
      classData.tutors.push(tutorId);
    }

    // Save the updates
    await tutor.save();
    await classData.save();

    // Fetch the updated class with populated tutor details
    const formattedClasses = await Class.findById(classId).populate('tutors', 'name email');

    res.status(200).json(formattedClasses);
 
};


export const getAllClassWithDept=async(req,res)=>
  {
    const classes = await Class.find()
    .populate({ path: 'departmentId', select: 'name _id' });

  const formattedClasses = classes.map((cls) => ({
    classId: cls._id,
    className: cls.name,
    departmentId: cls.departmentId._id,
    departmentName: cls.departmentId.name,
  }));
  res.status(200).json(formattedClasses);
  }
export const getAllStaff=async(req,res)=>
{
      const staffs=await Staff.find();
      res.status(200).json(staffs);
}
export const createClass = async (req, res) => {
    const { name, batchId, departmentId } = req.body;
    console.log(name,batchId,departmentId);
    appAssert(name && batchId && departmentId, FORBIDDEN, 'Missing required fields');
  
    // Validate batch and department existence
    const batch = await Batch.findById(batchId);
    const department = await Department.findById(departmentId);
    appAssert(batch && department, FORBIDDEN, 'Invalid batch or department');
  
    const newClass = await Class.create({ name, batchId, departmentId });
    res.status(201).json({ message: 'Class created successfully', class: newClass });
  };

  export const createClasses = async (req, res) => {
    const classes = req.body; // Expecting an array of classes from the frontend
    console.log(classes);
    appAssert(Array.isArray(classes) && classes.length > 0, FORBIDDEN, 'Invalid input format');
  
    // Validate each class entry
    for (let cls of classes) {
        const { batchId, departmentId } = cls;
      

        // Check if batchId exists
        const existingBatch = await Batch.findById(batchId);
        if (!existingBatch) {
            return res.status(400).json({ error: `Invalid batch ID: ${batchId}` });
        }

        // Check if departmentId exists
        const existingDepartment = await Department.findById(departmentId);
        if (!existingDepartment) {
            return res.status(400).json({ error: `Invalid department ID: ${departmentId}` });
        }
    }

    // If all IDs are valid, proceed to insert classes
    const newClasses = await Class.insertMany(classes);
  
    res.status(201).json({
        message: 'Classes created successfully',
        classes: newClasses,
    });
};



export const getAllBatch=async (req, res) => {
     const batches=await Batch.find();
     res.status(200).json(batches);
}

export const getAllDepartment=async (req, res) => {
  const departments=await Department.find();
  res.status(200).json(departments);
}


export const getExamResultsA1 = async (req, res) => {
  try {
    const { classId, sem } = req.body;

    // Validate classId
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({ message: "Invalid class ID" });
    }

    // Fetch class details with subjects
    let classData = await Class.findById(classId).populate("subjects.subjectId").populate('departmentId');

    // console.log(classData);

    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Filter subjects for the given semester
    let filteredSubjects = classData.subjects.filter(subject => subject.sem === sem);
    console.log(filteredSubjects);

    if (filteredSubjects.length === 0) {
      return res.status(404).json({ message: "No subjects found for the given semester" });
    }

    let reportData = [];
    let totalAppeared = 0, totalPassed = 0;
    
    // Fetch students' exam results for the subject in the given semester
    const students = await Student.find({
        classId,
        
      });
    for (let subject of filteredSubjects) {
      let subjectId = subject.subjectId._id;


      
    //   console.log(students);
      let classStrength = students.length;
      let numWithdrawn = 0;
      let numAbsent = 0;
      let numAppeared = 0;
      let numPassed = 0;
      let numFailed = 0;

      for (let student of students) {
        let semesterPerformance = student.performance.find(perf => perf.semester === sem);
        if (!semesterPerformance) continue;
    
        let subjectPerformance = semesterPerformance.subjects.find(sub => sub.subjectId.equals(subjectId));
        if (!subjectPerformance) continue;

        //check with drow count ?
        if (subjectPerformance.status==='arrear'&&(subjectPerformance.grade==='WH'||subjectPerformance.grade==='W')) 
        {
            numWithdrawn++;
        }
    
        // Check if the student was absent
        if (subjectPerformance.status === "absent") {
            numAbsent++;
            continue; // Do not count absent students in appeared count
        }

    
        // // Increase appeared count only for those who took the exam
        numAppeared++;
    
        // Count pass and fail
        if (subjectPerformance.status === "cleared") {
            numPassed++;
        } else if (subjectPerformance.status === "arrear") {
            numFailed++;
        }
    }
    

                let passPercentage = numAppeared > 0 ? ((numPassed / numAppeared) * 100).toFixed(1) : "0.0";

                totalAppeared += numAppeared;
                totalPassed += numPassed;

                let facultyMembers = await Promise.all(
                    subject.staffId.map(async (id) => {
                        let staff = await Staff.findById(id);
                        return staff ? staff.name : "Unknown"; // Ensure handling if staff is not found
                    })
                );

                

                reportData.push({
                    subjectCode: subject.subjectId.code,
                    subjectName: subject.subjectId.name,
                    facultyMembers: facultyMembers.join(", "),
                    classStrength,
                    numWithdrawn,
                    numAbsent,
                    numAppeared,
                    numPassed,
                    numFailed,
                    passPercentage
                });

                }

                let overallPassPercentage = totalAppeared > 0 ? ((totalPassed / totalAppeared) * 100).toFixed(1) : "0.0";

                res.status(200).json({
                classId,
                semester: sem,
                totalAppeared,
                totalPassed,
                overallPassPercentage,
                subjects: reportData,
                deptname:classData.departmentId.name,
                className:classData.name
                });

  } catch (error) {
    console.error("Error fetching exam results:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const getExamResultsA2 = async (req, res) => {
  try {
    const { classId, sem } = req.body;

    // Validate classId
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({ message: "Invalid class ID" });
    }

    // Fetch class details with subjects
    let classData = await Class.findById(classId).populate("subjects.subjectId");

    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Filter subjects for the given semester
    let filteredSubjects = classData.subjects.filter(subject => subject.sem === sem);

    if (filteredSubjects.length === 0) {
      return res.status(404).json({ message: "No subjects found for the given semester" });
    }

    // Fetch all students in the class
    const students = await Student.find({ classId });

    // Initialize counters
    let totalPassedAllSubjects = 0;
    let totalNoHistoryOfArrears = 0;
    let totalHistoryButNoStandingArrears = 0;
    let CGPA_Above_8_5 = 0;
    let CGPA_7_5_To_8_5 = 0;
    let CGPA_6_5_To_7_5 = 0;
    let CGPA_Below_6_5 = 0;
    let totalStandingArrears = 0;

    // a2 part1
    for (let student of students) {
      let passedAllSubjects = true; // Assume the student passes all subjects unless proven otherwise
      let hasHistoryOfArrears = false;
      let hasStandingArrears = false;

      //get studen count who passe all sebject of that sem
      const passedStudentsCount = students.filter(student => {
        // Find the performance for the specific semester
        const semesterPerformance = student.performance.find(perf => perf.semester === sem);
      
        // Check if all subjects in the semester are cleared (no "arrear" or "PC" statuses)
        return semesterPerformance && semesterPerformance.subjects.every(subject => 
          subject.status !== "arrear" && subject.status !== "PC"
        );
      }).length;
      totalPassedAllSubjects=passedStudentsCount;
     
      // Check CGPA categories
      let CGPA = student.CGPA || 0;
      if(CGPA>8.5)
        CGPA_Above_8_5++;
      else if(CGPA>=7.5 && CGPA<=8.5)
        CGPA_7_5_To_8_5++;
      else if(CGPA>=6.5 && CGPA<7.5)
        CGPA_6_5_To_7_5++;
      else
      CGPA_Below_6_5++;


      // Count students with standing arrears
      if (student.arrears.length>0) totalStandingArrears++;

      if (student.arrears.length > 0) {
        const hasPCStatus = student.performance.some(performance =>
          performance.subjects.some(subject => subject.status === "PC")
        );
      
        if (hasPCStatus) {
          console.log("The student has previously cleared arrears (PC status).");
        totalHistoryButNoStandingArrears=totalHistoryButNoStandingArrears+1;
        }
      }
      

     
    }
     // Part 3 - Calculate arrear counts per semester
     const arrearCounts = {};
     students.forEach(student => {
       const semesterPerformance = student.performance.find(perf => perf.semester === sem);
       
       if (semesterPerformance) {
         const arrearCount = semesterPerformance.subjects.filter(subject => 
           subject.status === "arrear"
         ).length;
 
         // Update the arrear count in the object
         if (arrearCount > 0) {
           arrearCounts[arrearCount] = (arrearCounts[arrearCount] || 0) + 1;
         }
       }
     });
 
     // Displaying the arrear counts (not necessary for the API response, so I'll omit console.log)
     const arrearDisplay = {};
     for (let count = 1; count <= 12; count++) {
       arrearDisplay[count] = arrearCounts[count] || "NIL";
     }

    // Return the final result
    res.status(200).json({
      classId,
      semester: sem,
      totalPassedAllSubjects,
      totalNoHistoryOfArrears:totalPassedAllSubjects-totalHistoryButNoStandingArrears,
      totalHistoryButNoStandingArrears,
      CGPA_Above_8_5,
      CGPA_7_5_To_8_5,
      CGPA_6_5_To_7_5,
      CGPA_Below_6_5,
      totalStandingArrears,
      arrearCounts: arrearDisplay
    });

  } catch (error) {
    console.error("Error fetching exam results:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const getExamResultsA3 = async (req, res) => {
  const { classId } = req.body;

  // Validate classId
  if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({ message: "Invalid class ID" });
  }

  // Fetch class details with subjects
  let classData = await Class.findById(classId).populate("subjects.subjectId");

  if (!classData) {
      return res.status(404).json({ message: "Class not found" });
  }

  // Fetch all students in the class
  const students = await Student.find({ classId });

  // Initialize an object to store the arrear count for each subject and its corresponding semester
  let subjectArrearCounts = {};

  // Iterate over each student
  for (let student of students) {
      // Iterate over all semesters in the student's performance
      student.performance.forEach(semesterPerformance => {
          // Iterate over all subjects in the current semester's performance
          semesterPerformance.subjects.forEach(subject => {
              if (subject.status === "arrear") {
                  const subjectId = subject.subjectId._id.toString(); // Assuming subjectId is a reference to the Subject model
                  const semester = semesterPerformance.semester; // Get the semester of the current subject

                  // If the subject is in arrears, increment the arrear count for that subject
                  if (!subjectArrearCounts[subjectId]) {
                      subjectArrearCounts[subjectId] = {
                          arrearCount: 0,
                          semester: semester
                      };
                  }

                  subjectArrearCounts[subjectId].arrearCount++;
              }
          });
      });
  }

  // Now, fetch the subject names and their arrear counts along with the semester
  let subjectArrears = [];
  for (let subjectId in subjectArrearCounts) {
      const subject = classData.subjects.find(sub => sub.subjectId._id.toString() === subjectId);
      subjectArrears.push({
          subjectName: subject ? subject.subjectId.name : "Unknown Subject",
          arrearCount: subjectArrearCounts[subjectId].arrearCount,
          semester: subjectArrearCounts[subjectId].semester,
          subjectcode:subject ? subject.subjectId.code : "Unknown Subject"
      });
  }

  // Return the calculated arrear counts for each subject along with the semester
  res.status(200).json({
      classId,
      subjectArrears
  });
};

export const getExamResultsA4 = async (req, res) => {
  const { classId } = req.body;

  // Validate classId
  if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({ message: "Invalid class ID" });
  }

  // Fetch class details with subjects
  const classData = await Class.findById(classId).populate("subjects.subjectId");

  if (!classData) {
      return res.status(404).json({ message: "Class not found" });
  }

  // Fetch all students in the class
  const students = await Student.find({ classId });

  // Initialize an object to store subject arrear counts and failed students
  let subjectArrears = {};

  // Use for...of to properly handle async operations
  for (const student of students) {
      for (const semesterPerformance of student.performance) {
          for (const subject of semesterPerformance.subjects) {
              if (subject.status === "arrear") {
                  const subjectId = subject.subjectId.toString(); // Convert ObjectId to string
                  const semester = semesterPerformance.semester;

                  // ✅ Fetch subject details only if `subjectId` is NOT populated
                  let sub = subject.subjectId;
                  if (!subject.subjectId.name) { // Check if it's already populated
                      sub = await Subject.findById(subject.subjectId);
                  }

                  if (!sub) continue; // Skip if subject is not found

                  // ✅ Initialize subject in arrears object
                  if (!subjectArrears[subjectId]) {
                      subjectArrears[subjectId] = {
                          subjectName: sub.name,
                          subjectCode: sub.code,
                          semester: semester,
                          failedStudents: []
                      };
                  }

                  // ✅ Add student details to the failedStudents array
                  subjectArrears[subjectId].failedStudents.push({
                      rollNumber: student.rollNumber,
                      studentName: student.name
                  });
              }
          }
      }
  }

  // Convert the subjectArrears object into an array for the response
  const responseData = Object.values(subjectArrears);

  // ✅ Return the updated arrears data for all semesters
  res.status(200).json({
      classId,
      subjectArrears: responseData
  });
};

export const getExamResultsA5= async (req, res) => {
  const { classId } = req.body;

  // Validate classId
  if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({ message: "Invalid class ID" });
  }

  // Fetch all students in the class
  const students = await Student.find({ classId });

  // Prepare response data
  let studentArrears = [];

  // Iterate over each student
  for (const student of students) {
      let arrearCount = 0;

      // Count arrears from performance records
      student.performance.forEach(semesterPerformance => {
          semesterPerformance.subjects.forEach(subject => {
              if (subject.status === "arrear") {
                  arrearCount++;
              }
          });
      });

      // Include only students who have at least 1 arrear
      if (arrearCount > 0) {
          studentArrears.push({
              rollNumber: student.rollNumber,
              studentName: student.name,
              arrearCount: arrearCount
          });
      }
  }

  // Sort by number of arrears in descending order (optional)
  studentArrears.sort((a, b) => b.arrearCount - a.arrearCount);

  // Return student arrear counts
  res.status(200).json({
      classId,
      studentArrears
  });
};


export const getExamResultsA7 = async (req, res) => {
    const { classId } = req.body;

    // Validate classId
    if (!mongoose.Types.ObjectId.isValid(classId)) {
        return res.status(400).json({ message: "Invalid class ID" });
    }

    try {
        // Fetch all students in the class with subject details
        const students = await Student.find({ classId }).populate("performance.subjects.subjectId");

        // Object to store arrear data for each subject
        let subjectArrears = {};

        // Collect all unique staff IDs to fetch their names later
        let staffIdSet = new Set();

        // Iterate over each student
        for (const student of students) {
            student.performance.forEach(semesterPerformance => {
                semesterPerformance.subjects.forEach(subject => {
                    if (subject.status === "arrear") {
                        const subjectId = subject.subjectId._id.toString();

                        // Fetch subject details
                        if (!subjectArrears[subjectId]) {
                            subjectArrears[subjectId] = {
                                subjectName: subject.subjectId.name,
                                subjectCode: subject.subjectId.code,
                                handledBy: subject.subjectId.staffAssigned, // Store staff IDs for now
                                students: []
                            };

                            // Collect staff IDs
                            subject.subjectId.staffAssigned.forEach(staff => {
                                staffIdSet.add(staff.staffId.toString());
                            });
                        }

                        // Add student details
                        subjectArrears[subjectId].students.push({
                            rollNumber: student.rollNumber,
                            studentName: student.name
                        });
                    }
                });
            });
        }

        // Fetch staff names from Staff collection
        const staffList = await Staff.find({ _id: { $in: [...staffIdSet] } }).select("name _id");

        // Convert to a lookup map (id -> name)
        const staffMap = {};
        staffList.forEach(staff => {
            staffMap[staff._id.toString()] = staff.name;
        });

        // Replace staff IDs with names in subjectArrears
        Object.values(subjectArrears).forEach(subject => {
            subject.handledBy = subject.handledBy.map(staff => ({
                staffId: staff.staffId,
                name: staffMap[staff.staffId.toString()] || "Unknown"
            }));
        });

        // Convert the object into an array for response
        let responseData = Object.values(subjectArrears);

        // Return subject-wise arrears with handling staff names
        res.status(200).json({ classId, subjects: responseData });
    } catch (error) {
        console.error("Error fetching subject-wise arrears:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const assignSubjectToClass =async (req, res) => {

  const {classId,subjects,sem}=req.body;
  const subjectObjects = subjects.map(subjectId => ({
    sem,            // Semester number
    subjectId       // Subject ID
  }));
  const updatedClass = await Class.findByIdAndUpdate(
    classId,
    {
      $push: {
        subjects: { $each: subjectObjects },  // Pushing the array of subject objects
      },
    },
    { new: true } // Returns the updated document
  );
  return res.status(200).json({suc:'suc'});
}



export const assignStaffToSubject = async (req, res) => {
  const { data, classId } = req.body;
  console.log(data);
  try {
    // Iterate through the data array which contains the staff-subject assignments
    for (const assignment of data) {
      const { subjectId, staffId } = assignment;

      // Update the Subject model by pushing the staffId to the staffAssigned array
      await Subject.findByIdAndUpdate(subjectId, {
        $addToSet: { staffAssigned: { staffId } }  // Using $addToSet to avoid duplicates
      });

      // Update the Class model by pushing the subject and staffId into the subjects array
      await Class.findOneAndUpdate(
        { _id: classId, "subjects.subjectId": subjectId }, // Find the class and the specific subject
        {
          $set: { "subjects.$.staffId": [staffId] } // Update staffId with the new value
        },
        { new: true }
      );
      

      // Optionally, update the Staff model if required
      // You might also want to add this subject to the staff's 'subjectsHandled' field
      await Staff.findByIdAndUpdate(staffId, {
        $addToSet: { subjectsHandled: { subjectId, classId } }
      });
    }

    res.status(200).json({ message: "Staff successfully assigned to subjects" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
