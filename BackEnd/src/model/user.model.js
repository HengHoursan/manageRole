const mongoose = require("mongoose");
const PROVIDERS = require("../constants/providers");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: false, // Made optional for provider-based logins
      unique: true,
      sparse: true, // Allows null values for unique fields
      trim: true,
    },
    password: {
      type: String,
      required: false, // Made optional for provider-based logins
      select: false, // Do not return password by default
    },
    role: {
      type: String,
      required: true,
      enum: ["Admin", "Editor", "Viewer"],
      default: "Viewer",
    },
    provider: {
      type: String,
      enum: Object.values(PROVIDERS),
      required: true,
      default: PROVIDERS.PASSWORD, // Default to password for existing users
    },
    provider_id: {
      type: String,
      unique: true,
      sparse: true, // Allows null values for unique fields
    },
    photo_url: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);
userSchema.methods.toJSON = function () {
  const { __v, _id, ...Object } = this.toObject();
  Object.id = _id;
  return Object;
};
module.exports = mongoose.model("User", userSchema);