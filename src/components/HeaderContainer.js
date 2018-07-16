import React from 'react'

const HeaderContainer = ({ children }) => (
  <div id='HeaderContainer'>
    <img src='/assets/icon.png' alt='logo' />
    <h1>Test Job "FORUM"</h1>
    {children}
  </div>
)

export default HeaderContainer
