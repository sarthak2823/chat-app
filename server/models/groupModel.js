const mongoose = require("mongoose");

const GroupSchema = mongoose.Schema(
  {
    name: {
      text: { type: String, required: true },
    },
    members:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }],
    messages:[{
        sender:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        message: {
            type:String,
            required: true,
        },
        createdAt: {
            type : Date,
            default : Date.now,
        },
    }],
    createAt: {
        type : Date,
        default : Date.now,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Group", GroupSchema);