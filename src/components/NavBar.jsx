import React from 'react';
import './../index.css';
import { Link } from 'react-router-dom';

const Navbar = ({link1, text1, link2, text2, link3, text3}) => {
    return (
        <nav className = "navbar">
            <ul className = "nav-links">
                <li><Link to = {link1}>{text1}</Link></li>
                <li><Link to = {link2}>{text2}</Link></li>
                <li><Link to = {link3}>{text3}</Link></li>
            </ul>
        </nav>
    );
};
export default Navbar;