// نقش "supervisor" فعلاً فیلد اختصاصی نداره، ولی همچنان یک discriminator جدا
// تعریف می‌کنیم تا هم query کردن (Supervisor.find()) راحت باشه، هم اگه بعداً
// فیلد اختصاصی لازم شد (مثلاً maxActiveProjects) همینجا اضافه میشه.
const mongoose = require("mongoose");

const supervisorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    projects : [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
    departments : [{type : String}]
});

module.exports = mongoose.model("Supervisor", supervisorSchema);