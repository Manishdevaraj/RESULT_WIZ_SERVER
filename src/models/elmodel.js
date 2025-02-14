import mongoose from "mongoose";

const electiveSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    semester: {
      type: Number,
      required: true
    },
    departments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
      }
    ],
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: true
    },
    studentsEnrolled: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
      }
    ],
    staffAssigned: {
      staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: true
      },
      classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
      }
    },
    performance: {
      averageMarks: {
        type: Number,
        default: 0
      },
      totalStudents: {
        type: Number,
        default: 0
      },
      arrearsCount: {
        type: Number,
        default: 0
      }
    }
  });
  
  const Elective = mongoose.model('Elective', electiveSchema);
  
  module.exports = Elective;