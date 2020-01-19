import React from 'react';

const JasonWeb = () => {
    let accountId = '';
    let password = '';
    let accountIdRegister = '';
    let passwordRegister = '';

    const login = async (event) => {
        event.preventDefault();
        const result = await fetch('/api/loginJwt', {
            method: 'post',
            headers: new Headers({'content-type': 'application/json'}),
            body: JSON.stringify({accountId, password})
        });
        const body = await result.json();
        console.log(JSON.stringify(body, null, 2));
    };

    const register = async (event) => {
        event.preventDefault();
        const result = await fetch('/api/registerJwt', {
            method: 'post',
            headers: new Headers({'content-type': 'application/json'}),
            body: JSON.stringify({accountIdRegister, passwordRegister})
        });
        const body = await result.json();
        console.log(JSON.stringify(body, null, 2));
    };

    const updateAccountId = (event) => {
        const { target = {} } = event;
        const { value = '' } = target;

        accountId = value;
    };

    const updateAccountIdRegister = (event) => {
        const { target = {} } = event;
        const { value = '' } = target;

        accountIdRegister = value;
    };

    const updatePassword = (event) => {
        const { target = {} } = event;
        const { value = '' } = target;

        password = value;
    };

    const updatePasswordRegister = (event) => {
        const { target = {} } = event;
        const { value = '' } = target;

        passwordRegister = value;
    };

    const checkUser = async (event) => {
      const result = await fetch('/api/getUsername', {
          method: 'post',
          headers: new Headers({'content-type': 'application/json'}),
      });

      const body = await result.json();

      document.getElementById('whoAmI').innerHTML = body.username;
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
                <label htmlFor="accountIdRegister">account</label>
                <input id="accountIdRegister" type="text" onChange={updateAccountIdRegister}>
                </input>
                <hr />
                <label htmlFor="passwordRegister">password</label>
                <input id="passwordRegister" type="password" onChange={updatePasswordRegister}>
                </input>
                <hr />
                <button onClick={register}>Register</button>
            </form>

            <button onClick={checkUser}>Who am I?</button>
            <label id="whoAmI">Noone Yet</label>
        </>
    );
};

export default JasonWeb;
