// فیلدهای اختصاصی نقش "freelancer" - این‌ها فقط روی سندهای فریلنسر ذخیره میشن،
// روی employer/supervisor/admin اصلاً وجود ندارن.
const mongoose = require("mongoose");

const freelancerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    projects : [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
    level: {
        type: String,
        enum: ["a", "b", "c"],
        default: "c",
    },

    rateScore: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
    },

    availableForProposals: {
        type: Boolean,
        default: true,
    },
});

module.exports = mongoose.model("Freelancer", freelancerSchema);