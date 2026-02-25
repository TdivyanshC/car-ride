import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  googleId?: string;
  name: string;
  email: string;
  photo?: string;
  provider: string;
  is_rider?: boolean;
  is_passenger?: boolean;
  createdAt: Date;
  updatedAt: Date;
  getSafeUser(): any;
}

const UserSchema: Schema = new Schema({
  googleId: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  photo: { type: String },
  provider: { type: String, default: 'google' },
  is_rider: { type: Boolean, default: true },
  is_passenger: { type: Boolean, default: true },
}, {
  timestamps: true,
});

// Method to get safe user object (without sensitive fields)
UserSchema.methods.getSafeUser = function() {
  const user = this.toObject();
  delete user.__v;
  return {
    _id: user._id,
    id: user._id,
    name: user.name,
    email: user.email,
    photo: user.photo,
    is_rider: user.is_rider,
    is_passenger: user.is_passenger,
  };
};

export default mongoose.model<IUser>('User', UserSchema);
