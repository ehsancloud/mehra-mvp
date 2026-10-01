// نقطه ورود واحد برای همه‌ی مدل‌ها.
// نکته: Freelancer/Employer/Supervisor/Admin دیگه discriminator نیستن -
// هر کدوم یک Collection جدا با فیلد userId (ref به User) هستن.
module.exports = {
    User: require("./User"),
    Freelancer: require("./Freelancer"),
    Employer: require("./Employer"),
    Supervisor: require("./Supervisor"),
    Admin: require("./Admin"),

    Department: require("./Department"),
    Project: require("./Project"),
    Proposal: require("./Proposal"),
    Ticket: require("./Ticket"),
    TicketMessage: require("./TicketMessage"),
    Task: require("./Task"),
    FinanceProject: require("./FinanceProject"),
    Log: require("./Log"),
    Notification: require("./Notifications"),
};