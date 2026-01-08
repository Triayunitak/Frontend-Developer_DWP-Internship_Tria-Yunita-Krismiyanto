import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Layout } from 'antd';

// Assets
import logoDefault from '../assets/logo bulet default.png';
import logoDark from '../assets/logo dark theme.png';
import bgImage from '../assets/background.png';
import mainText from '../assets/text landing page.png';
import cardNormal from '../assets/card.png';
import cardBouncy from '../assets/bouncy card.png';
import googlePlay from '../assets/get google.png';
import appStore from '../assets/get appstore.png';

const LandingPage = () => {
  const navigate = useNavigate();
  const [logo, setLogo] = useState(logoDefault);
  const [cardSrc, setCardSrc] = useState(cardNormal);
  const [isHovered, setIsHovered] = useState(false);

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div style={{ 
      backgroundImage: `url(${bgImage})`, 
      backgroundSize: 'cover', 
      minHeight: '100vh',
      color: 'white',
      position: 'relative'
    }}>
      {/* Topbar */}
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        padding: '20px 50px', 
        alignItems: 'center' 
      }}>
        <div 
          onMouseEnter={() => setLogo(logoDark)} 
          onMouseLeave={() => setLogo(logoDefault)}
        >
          <img src={logo} alt="Logo" style={{ height: '50px', cursor: 'pointer', transition: '0.3s' }} />
        </div>

        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          <span className="nav-link" style={{ cursor: 'pointer' }}>Internet Plan</span>
          <span className="nav-link" style={{ cursor: 'pointer' }}>Discount</span>
          <Button 
            className="btn-hover-oren"
            style={{ borderRadius: '20px', fontWeight: 'bold' }}
            onClick={handleLoginRedirect}
          >
            Buy Now
          </Button>
          <Button 
            ghost 
            className="btn-hover-oren"
            style={{ borderRadius: '20px', color: 'white', borderColor: 'white' }}
            onClick={handleLoginRedirect}
          >
            Login
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-around', 
        alignItems: 'center', 
        padding: '100px 50px' 
      }}>
        {/* Card Section */}
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <img 
            src={cardSrc} 
            alt="Internet Package" 
            style={{ 
              width: '400px', 
              transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              transform: isHovered ? 'rotate(-10deg) scale(1.05)' : 'rotate(0deg)'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
              setIsHovered(false);
              setCardSrc(cardNormal); // Reset card saat kursor keluar
            }}
            onClick={() => setCardSrc(cardBouncy)}
          />
        </div>

        {/* Text Section */}
        <div>
          <img src={mainText} alt="Stay Connected, Your Way!" style={{ width: '500px' }} />
        </div>
      </div>

      {/* Footer / App Links */}
      <div style={{ 
        position: 'absolute', 
        bottom: '30px', 
        width: '100%', 
        textAlign: 'center' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '10px' }}>
          <img src={googlePlay} alt="Google Play" style={{ height: '40px', cursor: 'pointer' }} />
          <img src={appStore} alt="App Store" style={{ height: '40px', cursor: 'pointer' }} />
        </div>
        <p style={{ fontSize: '12px', opacity: 0.8 }}>
          Copyright © 2026 – byU PT Telekomunikasi Selular
        </p>
      </div>
    </div>
  );
};

export default LandingPage;