import { Router } from "express";
import { Create_Sgpa, getClass, getClassByid, getExcel, getgriddata, getStaff, getStudentPerformance, getStudents, onhodClick, onMasterClick, subjectsHandledbystaff, updateemail, updatename } from "../controllers/staffController.js";
import { updateStudentSgpa } from "../controllers/studentController.js";
import { getExamResultsA1, getExamResultsA2, getExamResultsA3, getExamResultsA4, getExamResultsA5, getExamResultsA7 } from "../controllers/classController.js";
import { catchError } from "../utils/catchError.js";


export const staffRoute=Router();
staffRoute.post('/ismasterclick',catchError(onMasterClick));
staffRoute.post('/ishodclick',catchError(onhodClick));
staffRoute.post('/updatename',catchError(updatename));
staffRoute.post('/updateemail',catchError(updateemail));

staffRoute.post('/getuser',catchError( getStaff));
staffRoute.post('/download/excel',catchError( getExcel));

staffRoute.get('/all/class',catchError( getClass));
// staffRoute.get('/get/class',catchError( getClass));
staffRoute.post('/get/class',catchError( getClassByid));
staffRoute.post('/get/grid/data',catchError( getgriddata));
staffRoute.post('/get/staff/subjecthandeled',catchError( subjectsHandledbystaff));


staffRoute.post('/get/students',catchError( getStudents));
staffRoute.post('/get/students/performance',catchError( getStudentPerformance));

staffRoute.post('/calculate/sgpa',Create_Sgpa);
staffRoute.post('/update/marks',catchError( updateStudentSgpa));
staffRoute.post('/result/a1', getExamResultsA1);
staffRoute.post('/result/a2', getExamResultsA2);
staffRoute.post('/result/a3', getExamResultsA3);
staffRoute.post('/result/a4', getExamResultsA4);
staffRoute.post('/result/a5', getExamResultsA5);
staffRoute.post('/result/a7', getExamResultsA7);


// staffRoute.post('/', getExamResultsA7);



