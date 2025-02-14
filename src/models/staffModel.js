import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    istutor:{
     
      type:Boolean,
      default:false,
     
    },
    classId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
    },
    ishod:{
      type:Boolean,
      default:false,
    },
    ismaster:{
      type:Boolean,
      default:false,
    },   
    subjectsHandled: [
      {
        subjectId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Subject',
          required: true
        },
        classId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Class',
          required: true
        }
      }
    ],
    performance: [
      {
        subjectId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Subject',
          required: true
        },
        sem: {
          type: Number,
          required: true
        },
        averageMarks: {
          type: Number,
          required: true
        },
        totalStudents: {
          type: Number,
          required: true
        },
        arrearsCount: {
          type: Number,
          required: true
        }
      }
    ]
  });
  
  export const Staff = mongoose.model('Staff', staffSchema);
  