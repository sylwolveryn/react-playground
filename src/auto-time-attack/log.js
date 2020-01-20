const logLevel = 5;
const log = (msg, level = 0) => {
    if (level === 0) {
        console.error(msg);
    } else if (level === 1) {
        console.warn(msg);
    } else if (logLevel >= level) {
        console.log(msg);
    }
};

// exports.log = log;
module.exports = log;
