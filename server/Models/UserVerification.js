import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userVerificationSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    uniqueString: {
      type: String,
      required: true,
      unique: true,
    },
    createdAt: {
      type: Date,
      required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
  },
  {
    timestamps: true,
  }
);


const UserVerification = mongoose.model("UserVerification", userVerificationSchema);

export default UserVerification;
