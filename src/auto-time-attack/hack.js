const fetch = require('node-fetch');
const {exampleCharSet} = require('./charSet.json');

const sleep = async (ms) => {
    return await new Promise(resolve => setTimeout(resolve, ms));
};
const generateRandomInteger = (min, max) => {
    return ~~(min + Math.random()*(max + 1 - min))
};

async function test(password) {
    const startTime = process.hrtime();
    const result = await fetch('http://localhost:8000/api/login', {
        method: 'post',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({accountId: 'asdasd', password})
    });
    const diff = process.hrtime(startTime);
    const { authenticated } = await result.json();
    if (authenticated) {
        console.warn(`password: ${diff}`);
    } else {
        password = (endTimeSec-startTimeSec);
        console.log(password);
        test(password);
    }
    console.log(`startTime: ${startTimeSec} (${startTimeNano})`);
    console.log(`endTime: ${endTimeSec} (${endTimeNano})`);
    console.log(`authenticated: ${authenticated}`);
    console.log('~~~ ° ~~~');
}

test('a');