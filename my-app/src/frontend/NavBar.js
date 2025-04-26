import React from 'react';

const NavBar = () => {
    
    const user = JSON.parse(localStorage.getItem('user'));
    const userName = user ? user.name : ''; 

    return (
        <nav>
            <h1>Xin Chào {userName ? userName : 'Khách hàng'}</h1> 
            
        </nav>
    );
};

export default NavBar;
