import {Router} from 'express';
import { catchError } from '../utils/catchError.js';
import { createDepartment, getDbStaus } from '../controllers/departmentController.js';
import { createBatch } from '../controllers/BatchController.js';
import { assignStaffToSubject, assignSubjectToClass, assignTutorToClass, createClass, createClasses, getAllBatch, getAllClassWithDept, getAllDepartment, getAllStaff } from '../controllers/classController.js';
import { createStaff, createStaffBulk } from '../controllers/staffController.js';
import { createSubjects, getAllSubjects } from '../controllers/SubjectController.js';
import { createStudentsInBulk } from '../controllers/studentController.js';

export const adminRoute=Router();
//to create department
adminRoute.get('/get/dbStatus',catchError(getDbStaus))
//to create department
adminRoute.post('/create/department',catchError(createDepartment));
//to create batch
adminRoute.post('/create/batch',catchError(createBatch));
//to create single class
adminRoute.post('/create/class',catchError(createClass));
//get all batch
adminRoute.get('/get/all/batches',catchError(getAllBatch));
//get all department
adminRoute.get('/get/all/department',catchError(getAllDepartment));
//get all staffs
adminRoute.get('/get/all/staff',catchError(getAllStaff));

//get all subjects
adminRoute.get('/get/all/subject',catchError(getAllSubjects));
//get all class with dept
adminRoute.get('/get/all/class/dept',catchError(getAllClassWithDept));
//upadt the class tutor filed and staf tuto file also
adminRoute.post('/update/class/tutor',catchError(assignTutorToClass));
//to create bulk class
adminRoute.post('/create/bulk/classes',catchError(createClasses))
//te creat subject
// adminRoute.post('/create/bulk/subjects',catchError(createSubjectsInBulk))
// to create staff
adminRoute.post('/create/staff',catchError(createStaff));
adminRoute.post('/create/staff/bulk',catchError(createStaffBulk));
//assinig a staff to subject
// adminRoute.post('/assign/subject/staff',catchError(assignSubjectToStaff))

//crate stude in bulk
adminRoute.post('/create/bulk/students',catchError(createStudentsInBulk))

//create subjexts
adminRoute.post('/create/subject',catchError(createSubjects))

//assing subject to class
adminRoute.post('/assign/subject/class',catchError(assignSubjectToClass))

//assing staff to ubject
adminRoute.post('/assign/subject/staff',catchError(assignStaffToSubject))
