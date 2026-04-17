import mongoose from "mongoose";

const PlayerResultSchema = new mongoose.Schema(
  {
    playerId: { type: String, required: true },
    name: { type: String, required: true },
    wpm: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    finished: { type: Boolean, required: true },
  },
  { _id: false },
);

const RaceMatchSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, index: true },
    passagePreview: { type: String, required: true },
    completedAt: { type: Date, required: true, default: () => new Date() },
    players: { type: [PlayerResultSchema], required: true },
  },
  { collection: "race_matches" },
);

export const RaceMatch =
  mongoose.models.RaceMatch ?? mongoose.model("RaceMatch", RaceMatchSchema);
