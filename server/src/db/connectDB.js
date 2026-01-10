import mongoose from "mongoose";
import User from "../schema/user.schema.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");

    // Drop the email index if it exists (from old schema)
    try {
      await User.collection.dropIndex("email_1");
      console.log("Dropped obsolete email_1 index");
    } catch (error) {
      // Index might not exist, which is fine
      if (error.code !== 27) {
        // 27 = IndexNotFound
        console.log("Email index doesn't exist or already removed");
      }
    }
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
