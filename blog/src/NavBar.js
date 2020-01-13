import React from 'react';
import { Link } from 'react-router-dom';
import {timingAttack, webCachePoisoning} from "./constants/urls";

const NavBar = () => (
    <nav>
        <ul>
            <li>
                <Link to="/">Home</Link>
            </li>
            <li>
                <Link to={timingAttack}>Timing Attack</Link>
            </li>
            <li>
                <Link to={webCachePoisoning}>Web cache poisoning</Link>
            </li>
        </ul>
    </nav>
);

export default NavBar;