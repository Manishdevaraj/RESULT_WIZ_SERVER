import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    tutors:
      [
        {type:mongoose.Schema.Types.ObjectId,
          ref:'Staff',
        }
      ],
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: true
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
      }
    ],
    subjects: [
          {
            sem:{
              type:Number,
              required: true
            },
            subjectId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Subject',
              required: true,
              unique:true
              
            },
            staffId:[ {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Staff',            
            }]
          }
        ],
  });
  
  export const Class = mongoose.model('Class', classSchema);
  
