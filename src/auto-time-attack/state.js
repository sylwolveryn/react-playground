const {exampleCharSet} = require('./charSet.js');

const state = {
        ESTABLISH_CONNECTION: 'ESTABLISH_CONNECTION',
        FIND_OUT_PASSWORD_SIZE: 'FIND_OUT_PASSWORD_SIZE',
        FIND_OUT_PASSWORD_CHARS: 'FIND_OUT_PASSWORD_CHARS',
        RECALCULATE_LATENCY: 'RECALCULATE_LATENCY',

        password: exampleCharSet[0],
        charIndex: 0,
        exampleCharSetPointer: 0,
        sizedMatchedTimes: 0,
        charIndexMatchedTimes: 0,
        establishConnectionRequestTimes: 0,
        connectionLatencyReestablishedTimes: 0,
        latency: 0,

        serverResponseTimes: [],

        actualState: this.ESTABLISH_CONNECTION,

        reset: () => {
                this.state.password = exampleCharSet[0];
                this.charIndex = 0;
                this.exampleCharSetPointer = 0;
                this.sizedMatchedTimes = 0;
                this.charIndexMatchedTimes = 0;
        },
};

module.exports = state;
