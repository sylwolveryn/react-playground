import React from 'react';

const TimingAttack = () => {
    let accountId = '';
    let password = '';

    const login = async (event) => {
        event.preventDefault();
        const result = await fetch('/api/login', {
            method: 'post',
            headers: new Headers({'content-type': 'application/json'}),
            body: JSON.stringify({accountId, password})
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
        <h1>timing attack </h1>
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
        </>
    );
};

export default TimingAttack;