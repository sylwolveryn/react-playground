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

let registeredUsers = {admin: 'sga+WQ!T%gfvwsqa23WRF'};

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

const atob = (encodedString) => {
    return Buffer.from(encodedString, 'base64').toString();
};

const createToken =  (accountId, password) => {
    let credentials = {'username': accountId, "password": password };

    let token = jwt.encode(credentials, secret);
    return token;
};

const getUsernameWithUnsafeCheck = (token) => {
    let tokenParts = token.split(".");
    if (tokenParts.length !== 3) {
        return 'Noone Yet';
    }
    let headerDecoded = JSON.parse(atob(tokenParts[0]));
    let payloadDecoded = JSON.parse(atob(tokenParts[1]));
    if ("NONE" === headerDecoded.alg) {
      return payloadDecoded.username;
    }
    let validatedAccount = jwt.decode(token, secret);

    return validatedAccount.username;
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
    const { accountId, password } = req.body;

    let storedPassword = registeredUsers[accountId];
    if (!storedPassword) {
        res.cookie('token', 'aaa');
        res.send({
            error: 'We have no such user',
            authenticated: false
        });
        return;
    }
    if (storedPassword !== password) {
        res.cookie('token', 'sss');
        res.send({
            error: 'You used the wrong password',
            authenticated: false
        });
        return;
    }

    let token = createToken(accountId, password);
    res.cookie('token', token);
    res.send({
        token: token,
        authenticated: true
    });
});

app.post('/api/getUsername', async (req, res) => {
    let username = 'Noone Yet';
    let cookie =  req.headers.cookie.split('=');

    if (cookie[0] === 'token') {
        username = getUsernameWithUnsafeCheck(cookie[1]);
        console.log(username);
    }

    res.send({
        username: username
    });
    //send some text on succesfull login with username
});

app.post('/api/registerJwt', async (req, res) => {
    const { accountIdRegister, passwordRegister } = req.body;
    let storedPassword = registeredUsers[accountIdRegister];
    if (!storedPassword) {
      registeredUsers[accountIdRegister] = passwordRegister;

      let token = createToken(accountIdRegister, passwordRegister);
      res.cookie('token', token);

      res.send({
          authenticated: true
      });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/build/index.html'));
});

app.listen(8000, () => console.log('Listening on port 8000'));
