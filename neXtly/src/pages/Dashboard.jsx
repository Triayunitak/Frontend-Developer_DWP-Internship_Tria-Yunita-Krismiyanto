import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Badge, message, Empty, Popover, List, Typography, Select, Slider } from 'antd';
import { BellOutlined, UserOutlined, FilterOutlined, LogoutOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import bgImage from '../assets/background.png';
import logoDefault from '../assets/logo bulet default.png';
import logoDark from '../assets/logo dark theme.png';
import { motion } from 'framer-motion';

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
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterDuration, setFilterDuration] = useState('All');
  const [logo, setLogo] = useState(logoDefault);
  const [filterPrice, setFilterPrice] = useState(1000000); 

  useEffect(() => {
    setTimeout(() => setIsShrink(true), 150);
    fetchPackages();
    fetchNotifications();
    const interval = setInterval(async () => {
      const resPkg = await axios.get('http://localhost:3001/packages');
      if (resPkg.data.length > packages.length) setPackages(resPkg.data);
      const resNotif = await axios.get('http://localhost:3001/notifications');
      if (resNotif.data.length > notifications.length) {
        setNotifications(resNotif.data.reverse());
        const unread = resNotif.data.filter(n => !n.read).length;
        setUnreadCount(unread);
        message.info("Ada notifikasi baru!");
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [packages.length, notifications.length]);

  useEffect(() => { applyFilter(activeTab, packages, filterDuration, filterPrice); }, [packages, activeTab, filterDuration, filterPrice]);

  const fetchPackages = async () => { const res = await axios.get('http://localhost:3001/packages'); setPackages(res.data); };
  
  const fetchNotifications = async () => {
    const res = await axios.get('http://localhost:3001/notifications');
    setNotifications(res.data.reverse());
    const unread = res.data.filter(n => !n.read).length;
    setUnreadCount(unread);
  };

  const handleOpenNotif = async (open) => {
    if (open && unreadCount > 0) {
      setUnreadCount(0);
      notifications.forEach(async (n) => {
        if (!n.read) await axios.patch(`http://localhost:3001/notifications/${n.id}`, { read: true });
      });
    }
  };

  const applyFilter = (tab, data, duration, maxPrice) => {
    let tempPkgs = [...data];
    if (tab !== 'All') tempPkgs = tempPkgs.filter(p => p.type === tab);
    if (duration === 'Daily') tempPkgs = tempPkgs.filter(p => p.duration === 1 || p.duration === 3);
    else if (duration === 'Weekly') tempPkgs = tempPkgs.filter(p => p.duration === 7);
    else if (duration === 'Monthly') tempPkgs = tempPkgs.filter(p => p.duration >= 28 && p.duration <= 31);
    tempPkgs = tempPkgs.filter(p => p.price <= maxPrice);
    setFilteredPkgs(tempPkgs);
  };

  const handleLogout = () => { logout(); message.success("Berhasil Logout"); navigate('/'); };

  const filterDropdownContent = (
    <div style={{ width: '260px', padding: '8px', fontFamily: 'Narnoor' }}>
      <div style={{ marginBottom: '15px' }}>
        <Text strong style={{ color: 'var(--hitam)', fontFamily: 'Narnoor' }}>Durasi Paket</Text>
        <Select value={filterDuration} style={{ width: '100%', marginTop: '8px', fontFamily: 'Narnoor' }} onChange={setFilterDuration} size="middle">
          <Option value="All">Semua</Option><Option value="Daily">Daily</Option><Option value="Weekly">Weekly</Option><Option value="Monthly">Monthly</Option>
        </Select>
      </div>
      <div>
        <Text strong style={{ color: 'var(--hitam)', fontFamily: 'Narnoor', display: 'block', marginBottom: '8px' }}>Maks. Harga: Rp {filterPrice >= 1000000 ? 'Tanpa Batas' : filterPrice.toLocaleString()}</Text>
        <Slider min={5000} max={200000} step={10000} value={filterPrice > 200000 ? 200000 : filterPrice} onChange={setFilterPrice} trackStyle={{ background: 'var(--oren)' }} handleStyle={{ borderColor: 'var(--oren)', backgroundColor: 'var(--putih)' }} tooltip={{ open: false }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#999', marginTop: '-5px', fontFamily: 'Narnoor' }}><span>5.000</span><span>50.000</span><span>100.000+</span></div>
      </div>
      <Button type="primary" size="small" block onClick={() => { setFilterDuration('All'); setFilterPrice(1000000); }} style={{ marginTop: '15px', background: 'var(--oren)', border: 'none', borderRadius: '4px', fontFamily: 'Narnoor' }}>Reset Filter</Button>
    </div>
  );

  const notifContent = (
    <div style={{ width: '300px', maxHeight: '400px', overflowY: 'auto', fontFamily: 'Narnoor' }}>
      <div style={{padding: '10px', borderBottom: '1px solid #eee', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <Text strong>Notifikasi</Text>
        <Button type="link" size="small" onClick={() => setUnreadCount(0)} style={{color: 'var(--oren)', fontSize: '10px'}}>Tandai dibaca</Button>
      </div>
      <List dataSource={notifications} locale={{ emptyText: 'Tidak ada notifikasi' }}
        renderItem={(item) => (
          <List.Item style={{ background: item.read ? 'white' : '#fff7e6' }}>
            <div style={{ fontSize: '12px', width: '100%' }}>
              <Text strong style={{ display: 'block', fontFamily: 'Narnoor' }}>{item.message}</Text>
              <Text type="secondary" style={{ fontSize: '10px', fontFamily: 'Narnoor' }}>{item.date}</Text>
            </div>
          </List.Item>
        )}
      />
    </div>
  );

  return (
    <motion.div className="scroll-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div style={{ backgroundImage: `url(${bgImage})`, height: isShrink ? '32vh' : '100vh', backgroundSize: 'cover', backgroundPosition: 'center', transition: 'height 1.2s cubic-bezier(0.65, 0, 0.35, 1)', borderBottomLeftRadius: '50px', borderBottomRightRadius: '50px', position: 'relative', zIndex: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '35px 6%', alignItems: 'center' }}>
          
          <Popover content={notifContent} trigger="click" placement="bottomLeft" onOpenChange={handleOpenNotif}>
            <span style={{ marginRight: 20, cursor: 'pointer', display: 'inline-flex' }}>
              <Badge count={unreadCount}>
                <Button shape="circle" className="btn-icon-nav" icon={<BellOutlined className="icon-nav-custom" />} />
              </Badge>
            </span>
          </Popover>

          <div style={{ background: 'rgba(255,255,255,0.15)', padding: '6px 15px', borderRadius: '45px', display: 'flex', alignItems: 'center', gap: '15px', backdropFilter: 'blur(15px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    
                       <div 
                         onMouseEnter={() => setLogo(logoDark)} 
                         onMouseLeave={() => setLogo(logoDefault)}
                         style={{ padding: '0 10px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                         onClick={() => navigate('/')}
                       >
                          <img src={logo} alt="Logo" style={{ height: '28px', transition: '0.3s' }} />
                       </div>
          
                       <span className="nav-item-dash active" onClick={() => navigate('/Dashboard')}>Internet Plan</span>
                       <span className="nav-item-dash" onClick={() => navigate('/Discount')}>Discount</span>
                       <span className="nav-item-dash" onClick={() => navigate('/History')}>History</span>
                    </div>

          <Popover content={(<div style={{width:'150px', fontFamily: 'Narnoor'}}>{user ? <Button type="text" danger icon={<LogoutOutlined />} onClick={handleLogout} block style={{fontFamily: 'Narnoor'}}>Logout</Button> : <Button type="primary" onClick={() => navigate('/login')} block style={{background: 'var(--oren)', border:'none', fontFamily:'Narnoor'}}>Login</Button>}</div>)} title={user ? <span style={{fontFamily:'Narnoor'}}>{`Hi! ${user.username}`}</span> : "Profil"} trigger="click">
            
            <div style={{ background: 'rgba(255,255,255,0.9)', padding: '10px 25px', borderRadius: '35px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', height: '50px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--hitam)', fontFamily: 'Narnoor' }}>{user ? `Hi! ${user.username}` : 'Silahkan Login!'}</span>
              <Button shape="circle" size="small" style={{ width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--hitam)', border: 'none' }} icon={<UserOutlined style={{ fontSize: '1.2rem', color: 'var(--putih)' }} />} />
            </div>

          </Popover>
        </div>
      </div>

      <div style={{ padding: '40px 8%', marginTop: '-20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '35px' }}>
          <div style={{ display: 'flex', gap: '10px', background: 'white', padding: '6px', borderRadius: '35px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            {['All', 'Student', 'Professional', 'Best Deal'].map(tab => (
              <Button key={tab} onClick={() => setActiveTab(tab)} style={{ borderRadius: '25px', border: 'none', background: activeTab === tab ? 'var(--oren)' : 'transparent', color: activeTab === tab ? 'white' : 'black', fontWeight: 800, fontFamily: 'Narnoor' }}>{tab}</Button>
            ))}
          </div>
          <Popover content={filterDropdownContent} title={<span style={{fontFamily: 'Narnoor'}}>Filter Paket</span>} trigger="click" placement="bottomRight">
            <Button className="btn-filter-custom"><FilterOutlined className="icon-filter" /><span>Filter</span></Button>
          </Popover>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
          {filteredPkgs.map(pkg => (
            <div key={pkg.id} className="pkg-card" onMouseEnter={() => setHoveredId(pkg.id)} onMouseLeave={() => setHoveredId(null)} onClick={() => navigate(`/package/${pkg.id}`)}
              style={{ background: 'white', borderRadius: '25px', padding: '25px', height: hoveredId === pkg.id ? '360px' : '260px', position: 'relative', overflow: 'hidden', transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)', boxShadow: hoveredId === pkg.id ? '0 12px 30px rgba(255, 119, 0, 0.3)' : '0 4px 15px rgba(0,0,0,0.05)', borderColor: hoveredId === pkg.id ? 'var(--oren)' : 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ background: 'var(--oren)', color: 'white', padding: '2px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 800, fontFamily: 'Narnoor' }}>N.ly</span>
                {pkg.type !== 'All' && <span style={{ background: 'var(--merah)', color: 'white', padding: '2px 12px', borderRadius: '12px', fontSize: '10px', fontWeight: 700, fontFamily: 'Narnoor' }}>{pkg.type}</span>}
              </div>
              <h3 style={{ marginTop: '15px', fontSize: '1.3rem', color: 'var(--hitam)', fontFamily: 'Narnoor' }}>{pkg.name}</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <h1 style={{ color: 'var(--oren)', margin: 0, fontSize: '2.2rem', fontFamily: 'Narnoor' }}>{pkg.quota} GB</h1>
                <span style={{ color: '#999', fontSize: '0.9rem', fontFamily: 'Narnoor' }}>| {pkg.duration} Hari</span>
              </div>
              <p style={{ fontWeight: 800, fontSize: '1.1rem', marginTop: '5px', color: 'var(--hitam)', fontFamily: 'Narnoor' }}>Rp {pkg.price?.toLocaleString()}</p>
              <div style={{ marginTop: 'auto', opacity: hoveredId === pkg.id ? 1 : 0, transition: '0.3s', paddingBottom: '10px' }}>
                <Button block style={{ background: 'var(--oren)', color: 'white', height: '45px', borderRadius: '12px', border: 'none', fontWeight: 800, fontFamily: 'Narnoor' }} onClick={(e) => { e.stopPropagation(); if(!user) navigate('/login'); else navigate(`/checkout/${pkg.id}`); }}>Buy Now</Button>
              </div>
            </div>
          ))}
        </div>
        {filteredPkgs.length === 0 && <Empty style={{marginTop: '50px'}} description={<span style={{fontFamily:'Narnoor', color:'#999'}}>Tidak ada paket yang sesuai filter</span>} />}
      </div>
    </motion.div>
  );
};
export default CustomerDashboard;