import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    rollNumber: {
      type: String,
      required: true,
      unique: true
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true
    },
    performance: [
      {
        semester: {
          type: Number,
          required: true
        },
        SGPA: {
          type: Number,
          required: true
        },
        subjects: [
          {
            subjectId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Subject',
              required: true
            },
            marks: {
              type: Number,
              required: true
            },
            grade: {
              type: String,
              required: true
            },
            status: {
              type: String,
              enum: ['cleared', 'arrear', 'withheld','absent','PC'],
              required: true
            },
            arrearsClearedDate: {
              type: Date
            }
          }
        ]
      }
    ],
    arrears: [
      {
        subjectId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Subject',
          required: true
        },
        semester: {
          type: Number,
          required: true
        },
        status: {
          type: String,
          enum: ['pending', 'cleared','absent','PC'],
          required: true
        },
        clearedDate: {
          type: Date
        }
      }
    ],
    CGPA: {
      type: Number,
      default: 0
    },
    totalCredits: {
      type: Number,
      default: 0
    },
    currentCredits: {
      type: Number,
      default: 0
    }
  }, { versionKey: false });
  
  export const Student = mongoose.model('Student', studentSchema);
  