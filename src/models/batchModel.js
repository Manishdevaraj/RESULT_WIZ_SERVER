import mongoose from "mongoose";

const batchSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true
  },
  performance: [
    {
      departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
      },
      averageGrade: {
        type: Number,  // You can calculate average grades or other metrics
        default: 0
      },
      arrears: {
        type: Number,  // Total arrears in this batch for the department
        default: 0
      }
    }
  ]
});

export const Batch = mongoose.model('Batch', batchSchema);

