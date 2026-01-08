// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Badge, message, Empty, Popover, List, Typography, Select, Slider, Space } from 'antd';
import { BellOutlined, UserOutlined, FilterOutlined, LogoutOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import bgImage from '../assets/background.png';
import logoDark from '../assets/logo dark theme.png';

const { Text } = Typography;
const { Option } = Select;

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [packages, setPackages] = useState([]);
  const [filteredPkgs, setFilteredPkgs] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [hoveredId, setHoveredId] = useState(null);
  const [isShrink, setIsShrink] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // State Filter
  const [filterDuration, setFilterDuration] = useState('All');
  const [filterPrice, setFilterPrice] = useState(1000000); 

  useEffect(() => {
    setTimeout(() => setIsShrink(true), 150);
    fetchPackages();
    fetchNotifications();
    const interval = setInterval(async () => {
      const res = await axios.get('http://localhost:3001/packages');
      if (res.data.length > packages.length) {
        setPackages(res.data);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilter(activeTab, packages, filterDuration, filterPrice);
  }, [packages, activeTab, filterDuration, filterPrice]);

  const fetchPackages = async () => {
    const res = await axios.get('http://localhost:3001/packages');
    setPackages(res.data);
  };

  const fetchNotifications = async () => {
    const res = await axios.get('http://localhost:3001/notifications');
    setNotifications(res.data.reverse());
  };

  const applyFilter = (tab, data, duration, maxPrice) => {
    let tempPkgs = [...data];

    if (tab !== 'All') {
      tempPkgs = tempPkgs.filter(p => p.type === tab);
    }

    // Perbaikan Logika Durasi sesuai detail (Daily: 1-3, Weekly: 7, Monthly: 28-31)
    if (duration === 'Daily') {
      tempPkgs = tempPkgs.filter(p => p.duration === 1 || p.duration === 3);
    } else if (duration === 'Weekly') {
      tempPkgs = tempPkgs.filter(p => p.duration === 7);
    } else if (duration === 'Monthly') {
      tempPkgs = tempPkgs.filter(p => p.duration >= 28 && p.duration <= 31);
    }

    tempPkgs = tempPkgs.filter(p => p.price <= maxPrice);
    setFilteredPkgs(tempPkgs);
  };

  const handleLogout = () => { logout(); message.success("Berhasil Logout"); navigate('/'); };

  const filterDropdownContent = (
    <div style={{ width: '260px', padding: '8px', fontFamily: 'Narnoor' }}>
      <div style={{ marginBottom: '15px' }}>
        <Text strong style={{ color: 'var(--hitam)', fontFamily: 'Narnoor' }}>Durasi Paket</Text>
        <Select 
          value={filterDuration} 
          style={{ width: '100%', marginTop: '8px', fontFamily: 'Narnoor' }} 
          onChange={setFilterDuration}
          size="middle"
        >
          <Option value="All">Semua</Option>
          <Option value="Daily">Daily</Option>
          <Option value="Weekly">Weekly</Option>
          <Option value="Monthly">Monthly</Option>
        </Select>
      </div>
      <div>
  <Text strong style={{ color: 'var(--hitam)', fontFamily: 'Narnoor', display: 'block', marginBottom: '8px' }}>
    Maks. Harga: Rp {filterPrice >= 1000000 ? 'Tanpa Batas' : filterPrice.toLocaleString()}
  </Text>
  <Slider 
    min={5000} 
    max={200000} 
    step={10000} 
    value={filterPrice > 200000 ? 200000 : filterPrice} 
    onChange={(val) => setFilterPrice(val)}
    trackStyle={{ background: 'var(--oren)' }}
    handleStyle={{ borderColor: 'var(--oren)', backgroundColor: 'var(--putih)' }}
    tooltip={{ open: false }} // Menyembunyikan tooltip bawaan agar lebih clean
  />
  
  <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      fontSize: '10px', 
      color: '#999', 
      marginTop: '-5px', 
      fontFamily: 'Narnoor' 
    }}>
      <span>5.000</span>
      <span>50.000</span>
      <span>100.000+</span>
    </div>
  </div>
      <Button 
        type="primary" 
        size="small" 
        block 
        onClick={() => { setFilterDuration('All'); setFilterPrice(1000000); }}
        style={{ marginTop: '15px', background: 'var(--oren)', border: 'none', borderRadius: '4px', fontFamily: 'Narnoor' }}
      >
        Reset Filter
      </Button>
    </div>
  );

  const notifContent = (
    <div style={{ width: '300px', maxHeight: '400px', overflowY: 'auto' }}>
      <List dataSource={notifications} locale={{ emptyText: 'Tidak ada notifikasi' }}
        renderItem={(item) => (
          <List.Item><div style={{ fontSize: '12px' }}><Text strong style={{ display: 'block' }}>{item.message}</Text><Text type="secondary" style={{ fontSize: '10px' }}>{item.date}</Text></div></List.Item>
        )}
      />
    </div>
  );

  return (
    <div style={{ backgroundColor: '#f9f9f9', height: '100vh', overflowY: 'auto' }}>
      <div style={{ backgroundImage: `url(${bgImage})`, height: isShrink ? '32vh' : '100vh', backgroundSize: 'cover', backgroundPosition: 'center', transition: 'height 1.2s cubic-bezier(0.65, 0, 0.35, 1)', borderBottomLeftRadius: '50px', borderBottomRightRadius: '50px', position: 'relative', zIndex: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '35px 6%', alignItems: 'center' }}>
          <Popover content={notifContent} title="Notifikasi" trigger="click" placement="bottomLeft">
            <Badge count={notifications.length}>
              <Button 
                shape="circle" 
                className="btn-icon-nav"
                style={{ width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--putih)', border: 'none' }}
                icon={<BellOutlined style={{ fontSize: '1.5rem' }} className="icon-nav-custom" />} 
              />
            </Badge>
          </Popover>
          <div style={{ background: 'rgba(255,255,255,0.15)', padding: '10px 15px', borderRadius: '45px', display: 'flex', alignItems: 'center', gap: '15px', backdropFilter: 'blur(15px)', border: '1px solid rgba(255,255,255,0.1)' }}>
             <img src={logoDark} style={{height: '30px', margin: '0 10px', cursor: 'pointer'}} onClick={() => navigate('/')} />
             <span className="nav-item-dash active">Internet Plan</span>
             <span className="nav-item-dash">Discount</span>
             <span className="nav-item-dash">History</span>
          </div>
          <Popover content={(<div style={{width:'150px'}}>{user ? <Button type="text" danger icon={<LogoutOutlined />} onClick={handleLogout} block>Logout</Button> : <Button type="primary" onClick={() => navigate('/login')} block>Login</Button>}</div>)} title={user ? `Hi! ${user.username}` : "Profil"} trigger="click">
            <div style={{ background: 'rgba(255,255,255,0.9)', padding: '10px 25px', borderRadius: '35px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', height: '50px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--hitam)' }}>{user ? `Hi! ${user.username}` : 'Silahkan Login!'}</span>
              <Button shape="circle" size="small" style={{ width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--hitam)', border: 'none' }} icon={<UserOutlined style={{ fontSize: '1.2rem', color: 'var(--putih)' }} />} />
            </div>
          </Popover>
        </div>
      </div>

      <div style={{ padding: '40px 8%', marginTop: '-20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '35px' }}>
          <div style={{ display: 'flex', gap: '10px', background: 'white', padding: '6px', borderRadius: '35px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            {['All', 'Student', 'Professional', 'Best Deal'].map(tab => (
              <Button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                style={{ 
                  borderRadius: '25px', border: 'none', 
                  background: activeTab === tab ? 'var(--oren)' : 'transparent', 
                  color: activeTab === tab ? 'white' : 'black', 
                  fontWeight: 800 
                }}
              >
                {tab}
              </Button>
            ))}
          </div>
          
          <Popover content={filterDropdownContent} title={<span style={{fontFamily: 'Narnoor'}}>Filter Paket</span>} trigger="click" placement="bottomRight">
            <Button className="btn-filter-custom">
              <FilterOutlined className="icon-filter" />
              <span>Filter</span>
            </Button>
          </Popover>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
          {filteredPkgs.map(pkg => (
            <div 
              key={pkg.id} 
              className="pkg-card"
              onMouseEnter={() => setHoveredId(pkg.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => navigate(`/package/${pkg.id}`)}
              style={{ 
                background: 'white', 
                borderRadius: '25px', 
                padding: '25px', 
                height: hoveredId === pkg.id ? '360px' : '260px',
                position: 'relative', 
                overflow: 'hidden',
                transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                boxShadow: hoveredId === pkg.id ? '0 12px 30px rgba(255, 119, 0, 0.3)' : '0 4px 15px rgba(0,0,0,0.05)',
                borderColor: hoveredId === pkg.id ? 'var(--oren)' : 'transparent',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ background: 'var(--oren)', color: 'white', padding: '2px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 800 }}>N.ly</span>
                {pkg.type !== 'All' && <span style={{ background: 'var(--merah)', color: 'white', padding: '2px 12px', borderRadius: '12px', fontSize: '10px', fontWeight: 700 }}>{pkg.type}</span>}
              </div>
              <h3 style={{ marginTop: '15px', fontSize: '1.3rem', color: 'var(--hitam)' }}>{pkg.name}</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <h1 style={{ color: 'var(--oren)', margin: 0, fontSize: '2.2rem' }}>{pkg.quota} GB</h1>
                <span style={{ color: '#999', fontSize: '0.9rem' }}>| {pkg.duration} Hari</span>
              </div>
              <p style={{ fontWeight: 800, fontSize: '1.1rem', marginTop: '5px', color: 'var(--hitam)' }}>Rp {pkg.price?.toLocaleString()}</p>
              
              <div style={{ marginTop: 'auto', opacity: hoveredId === pkg.id ? 1 : 0, transition: '0.3s', paddingBottom: '10px' }}>
                <Button block style={{ background: 'var(--oren)', color: 'white', height: '45px', borderRadius: '12px', border: 'none', fontWeight: 800 }} 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if(!user) navigate('/login'); else navigate(`/checkout/${pkg.id}`);
                  }}>Buy Now</Button>
              </div>
            </div>
          ))}
        </div>
        {filteredPkgs.length === 0 && <Empty style={{marginTop: '50px'}} description="Tidak ada paket" />}
      </div>
    </div>
  );
};

export default CustomerDashboard;