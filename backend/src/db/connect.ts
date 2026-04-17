import mongoose from "mongoose";

export async function connectMongo(uri: string | undefined): Promise<boolean> {
  if (!uri?.trim()) {
    console.warn("[mongo] MONGODB_URI missing — skipping database (race history won’t be saved)");
    return false;
  }
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log("[mongo] connected");
  return true;
}
