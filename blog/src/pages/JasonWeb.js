import React from 'react';

const JasonWeb = () => {
    let jwt = require('jwt-simple');
    const secret = Buffer.from('16562abcdaac26594301248613846a58', 'hex');
    let accountId = '';
    let password = '';
    let credentials = {};

    const createToken =  () => {
        credentials = {'username': accountId, "password": password };

        let token = jwt.encode(credentials, secret);
        return token;
    };

    const login = async (event) => {
        event.preventDefault();
        let token = createToken();
        const result = await fetch('/api/loginJwt', {
            method: 'post',
            headers: new Headers({'content-type': 'application/json'}),
            body: JSON.stringify({token})
        });
        const body = await result.json();
        console.log(JSON.stringify(body, null, 2));
    };

    const register = async (event) => {
        event.preventDefault();
        let token = createToken();
        const result = await fetch('/api/registerJwt', {
            method: 'post',
            headers: new Headers({'content-type': 'application/json'}),
            body: JSON.stringify({token})
        });
        const body = await result.json();
        console.log(JSON.stringify(body, null, 2));
    };

    const updateAccountId = (event) => {
        const { target = {} } = event;
        const { value = '' } = target;

        accountId = value;
    };

    const updatePassword = (event) => {
        const { target = {} } = event;
        const { value = '' } = target;

        password = value;
    };

    return (
        <>
          <h1>LogIn</h1>
            <form>
                <label htmlFor="accountId">account</label>
                <input id="accountId" type="text" onChange={updateAccountId}>
                </input>
                <hr />
                <label htmlFor="password">password</label>
                <input id="password" type="password" onChange={updatePassword}>
                </input>
                <hr />
                <button onClick={login}>LogIn</button>
            </form>
          <h1>Register</h1>
            <form>
                <label htmlFor="accountId">account</label>
                <input id="accountId" type="text" onChange={updateAccountId}>
                </input>
                <hr />
                <label htmlFor="password">password</label>
                <input id="password" type="password" onChange={updatePassword}>
                </input>
                <hr />
                <button onClick={register}>Register</button>
            </form>
        </>
    );
};

export default JasonWeb;
