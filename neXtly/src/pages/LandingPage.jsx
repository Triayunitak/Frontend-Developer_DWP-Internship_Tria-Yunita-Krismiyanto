import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';

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

  return (
    <div style={{ 
      backgroundImage: `url(${bgImage})`, 
      backgroundSize: 'cover', 
      backgroundPosition: 'center',
      height: '100vh', 
      width: '100vw',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#1E1E1E'
    }}>
      
      {/* HEADER: Memberikan jarak vertikal yang cukup */}
      <header style={{ 
        height: '20vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        position: 'relative',
        zIndex: 100
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '6px',
          borderRadius: '50px',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}>
          <div 
            onMouseEnter={() => setLogo(logoDark)} 
            onMouseLeave={() => setLogo(logoDefault)}
            style={{ padding: '0 25px', display: 'flex', alignItems: 'center' }}
          >
            <img src={logo} alt="Logo" style={{ height: '28px', cursor: 'pointer' }} />
          </div>

          <div className="nav-item" onClick={() => navigate('/Dashboard')}>Internet Plan</div>
          <div className="nav-item" onClick={() => navigate('/Discount')}>Discount</div>
          <div className="nav-item" onClick={() => navigate('/Login')}>Buy Now</div>
        </div>

        <Button 
          className="btn-login-header"
          onClick={() => navigate('/login')}
          style={{ position: 'absolute', right: '60px' }}
        >
          Login
        </Button>
      </header>

      {/* MAIN CONTENT: Fokus pada kelonggaran jarak (Gap 10vw) */}
      <main style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '0 10vw',
        gap: '10vw' /* Jarak antar elemen diperlebar agar tidak menumpuk */
      }}>
        {/* Card Section: Dikecilkan ukurannya */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <img 
            src={cardSrc} 
            alt="Product Card" 
            style={{ 
              maxHeight: '40vh', /* Mengecil dari 48vh ke 40vh */
              width: 'auto',
              /* Transisi lebih lambat dan halus */
              transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)', 
              transform: isHovered ? 'rotate(-8deg) scale(1.1) translateY(-15px)' : 'rotate(0deg)',
              cursor: 'pointer',
              filter: isHovered ? 'drop-shadow(0 25px 50px rgba(0,0,0,0.5))' : 'none'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
              setIsHovered(false);
              setCardSrc(cardNormal);
            }}
            onClick={() => setCardSrc(cardBouncy)}
          />
        </div>

        {/* Text Area: Dikecilkan ukurannya */}
        <div style={{ flex: 1.2, display: 'flex', justifyContent: 'flex-start' }}>
          <img 
            src={mainText} 
            alt="Stay Connected" 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '45vh', /* Mengecil dari 55vh ke 45vh */
              objectFit: 'contain' 
            }} 
          />
        </div>
      </main>

      {/* FOOTER */}
      <footer style={{ 
        height: '15vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: '25px', marginBottom: '15px' }}>
          <img src={googlePlay} alt="Google Store" style={{ height: '32px', cursor: 'pointer', opacity: 0.9 }} />
          <img src={appStore} alt="App Store" style={{ height: '32px', cursor: 'pointer', opacity: 0.9 }} />
        </div>
        <p style={{ 
          color: 'var(--putih)', 
          opacity: 0.4, 
          fontSize: '0.65rem', 
          margin: 0, 
          letterSpacing: '4px',
          fontWeight: 600
        }}>
          COPYRIGHT © 2026 — neXtly PT Next With Me
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;