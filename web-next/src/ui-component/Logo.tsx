import React from 'react';
import { useSelector } from 'react-redux';
// import logo from '/images/logo.svg'; // Assuming we put it in public

const Logo = () => {
  const siteInfo = useSelector((state: any) => state.siteInfo);
  
  // Simple fallback logic
  const logoSrc = siteInfo.logo || '/logo.svg'; // Default to /logo.svg in public

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
       <img src={logoSrc} alt={siteInfo.system_name || 'One API'} height={50} onError={(e) => {
           // Fallback if image fails
           e.currentTarget.style.display = 'none';
           e.currentTarget.parentElement!.innerText = siteInfo.system_name || 'One API';
       }} />
    </div>
  );
};

export default Logo;
