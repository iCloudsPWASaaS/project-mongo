import mongoose from "mongoose";

interface UserDoc {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  avatar?: string | null;
  isActive: boolean;
  emailVerified?: Date | null;
  lastLogin?: Date | null;
  deletedAt?: Date | null;
}

const UserSchema = new mongoose.Schema<UserDoc>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    role: { type: String, default: 'tenant' },
    avatar: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    emailVerified: { type: Date, default: null },
    lastLogin: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const User =
  (mongoose.models.User as unknown as mongoose.Model<UserDoc>) ||
  mongoose.model<UserDoc>("User", UserSchema);

export default User;
