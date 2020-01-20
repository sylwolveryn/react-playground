const time = {
    getDiff: (startTime) => {
        const rawDiff = process.hrtime(startTime);
        const mSec = rawDiff[1].toString().substr(0, 3);
        return Number(`${rawDiff[0]}${mSec}`);
    },
    sleep: async (ms) => {
        return await new Promise(resolve => setTimeout(resolve, ms));
    },
};

module.exports = time;
