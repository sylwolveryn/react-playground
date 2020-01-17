import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import {users} from "./constants/users";
import {sleep} from "./utils/utils";

const app = express();

app.use(express.static(path.join(__dirname, '/build')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let jwt = require('jwt-simple');
const secret = Buffer.from('16562abcdaac26594301248613846a58', 'hex');

const passwordCheckUnsafe_01 = async (s1, s2) => {
    if (s1.length != s2.length) {
        await sleep(2000);
        return false;
    }

    return s1 == s2;
};

const passwordCheckUnsafe_02 = async (s1, s2) => {
    let authenticated = true;
    if (s1.length != s2.length) {
        return false;
    }

    for (let index = 0; index < s1.length ; index++) {
        await sleep(500);
        if (s1[index] != s2[index]) {
            authenticated = false;
            break;
        }
    }

    return authenticated;
};

const passwordCheckUnsafe_03 = async (s1, s2) => {
    if (s1.length !== s2.length) {
        return !!0;
    }
    for (let index = 0; index < s1.length ; index++) {
        await sleep(300); // in reality, this is not happening of course. However, with enough patience and not safe devops setup, it is happening in small
        if (s1[index] !== s2[index]) {
            console.log('sleeping: ' + index);
            return false;
        }
    }
    return true;
};

const tokenCheckUnsafe_00 = async (token) => {
    let decodedToken = jwt.decode(token, secret);
    //do create vulnerable decode first don't check the secret if encode type is NONE
    return true;
};

app.post('/api/login', async (req, res) => {
    const { accountId, password } = req.body;
    const storedPassword = users[accountId];
    if (!storedPassword) {
        await sleep(777);
        res.send({
            error: 'no such user moron, and I probably shouldn\'t tell you this information....',
            authenticated: false
        });
    }
    const authenticated = await passwordCheckUnsafe_03(storedPassword, password);
    res.send({authenticated});
});

app.post('/api/loginJWT', async (req, res) => {
    const { token } = req.body;
      let decodedToken = jwt.decode(token, secret);
    res.send({
        error: decodedToken,
        authenticated: false
    });
    //send some text on succesfull login with username
});

app.post('/api/registerJwt', async (req, res) => {
    const { token } = req.body;
    let decodedToken = jwt.decode(token, secret);
    res.send({
        error: decodedToken,
        authenticated: false
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/build/index.html'));
});

app.listen(8000, () => console.log('Listening on port 8000'));
