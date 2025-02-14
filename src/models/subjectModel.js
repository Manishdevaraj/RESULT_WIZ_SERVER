import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique:true
  },
  code: {
    type: String,
    unique:true,
    required: true,
  },
  credit: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['CORE', 'ELECTIVE'],
    required: true
  },
  staffAssigned: [
    {
      staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: true
      },
    }
  ]
});

export const Subject = mongoose.model('Subject', subjectSchema);
