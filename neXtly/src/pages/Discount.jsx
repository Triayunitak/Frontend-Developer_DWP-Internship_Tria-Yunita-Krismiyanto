import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Empty, message, Popover, Badge, List } from 'antd';
import { BellOutlined, UserOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import bgImage from '../assets/background.png';
import logoDark from '../assets/logo dark theme.png';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

const Discount = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [discounts, setDiscounts] = useState([]);
  const [filteredDiscounts, setFilteredDiscounts] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [hoveredId, setHoveredId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchDiscounts();
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications(); // Polling notifikasi
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterDiscounts(activeTab);
  }, [discounts, activeTab]);

  const fetchDiscounts = async () => {
    try {
      const res = await axios.get('http://localhost:3001/discounts');
      setDiscounts(res.data);
    } catch (err) { message.error("Gagal memuat diskon"); }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('http://localhost:3001/notifications');
      setNotifications(res.data.reverse());
      setUnreadCount(res.data.filter(n => !n.read).length);
    } catch (err) { console.error(err); }
  };

  const handleOpenNotif = async (open) => {
    if (open && unreadCount > 0) {
      setUnreadCount(0);
      notifications.forEach(async (n) => {
        if (!n.read) await axios.patch(`http://localhost:3001/notifications/${n.id}`, { read: true });
      });
    }
  };

  const filterDiscounts = (tab) => {
    if (tab === 'All') {
      setFilteredDiscounts(discounts);
    } else {
      // Tampilkan diskon khusus Tipe tersebut ATAU General
      setFilteredDiscounts(discounts.filter(d => d.type === tab || d.type === 'General'));
    }
  };

  const handleClaim = async (discount) => {
    if (!user) { message.error("Silahkan login untuk klaim!"); return navigate('/login'); }
    
    // Logika Klaim: Kirim notifikasi sukses
    const newNotif = {
      message: `Berhasil Klaim: ${discount.name} (${discount.percentage}%). Gunakan sebelum ${discount.validUntil}.`,
      date: new Date().toLocaleString(),
      type: "success",
      read: false
    };
    await axios.post('http://localhost:3001/notifications', newNotif);
    message.success("Diskon Berhasil Diklaim!");
    fetchNotifications(); // Refresh notif
  };

  const notifContent = (
    <div style={{ width: '300px', maxHeight: '400px', overflowY: 'auto', fontFamily: 'Narnoor' }}>
      <div style={{padding: '10px', borderBottom: '1px solid #eee', display:'flex', justifyContent:'space-between'}}>
        <Text strong>Notifikasi</Text>
        <Button type="link" size="small" onClick={() => setUnreadCount(0)} style={{color: 'var(--oren)'}}>Tandai dibaca</Button>
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
      {/* HEADER */}
      <div style={{ backgroundImage: `url(${bgImage})`, height: '32vh', backgroundSize: 'cover', backgroundPosition: 'center', borderBottomLeftRadius: '50px', borderBottomRightRadius: '50px', position: 'relative', zIndex: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '35px 6%', alignItems: 'center' }}>
          
          <Popover content={notifContent} trigger="click" placement="bottomLeft" onOpenChange={handleOpenNotif}>
            <span style={{ marginRight: 20, cursor: 'pointer', display: 'inline-flex' }}>
              <Badge count={unreadCount}>
                <Button shape="circle" className="btn-icon-nav" icon={<BellOutlined className="icon-nav-custom" />} />
              </Badge>
            </span>
          </Popover>

          <div style={{ background: 'rgba(255,255,255,0.15)', padding: '10px 15px', borderRadius: '45px', display: 'flex', alignItems: 'center', gap: '15px', backdropFilter: 'blur(15px)', border: '1px solid rgba(255,255,255,0.1)' }}>
             <img src={logoDark} style={{ height: '30px', margin: '0 10px', cursor: 'pointer' }} onClick={() => navigate('/')} />
             <span className="nav-item-dash" onClick={() => navigate('/dashboard')}>Internet Plan</span>
             <span className="nav-item-dash active">Discount</span>
             <span className="nav-item-dash">History</span>
          </div>

          <Popover content={(<div style={{width:'150px', fontFamily: 'Narnoor'}}>{user ? <Button type="text" danger icon={<LogoutOutlined />} onClick={() => {logout(); navigate('/')}} block style={{fontFamily: 'Narnoor'}}>Logout</Button> : <Button type="primary" onClick={() => navigate('/login')} block style={{background: 'var(--oren)', border:'none', fontFamily:'Narnoor'}}>Login</Button>}</div>)} title={user ? <span style={{fontFamily:'Narnoor'}}>{`Hi! ${user.username}`}</span> : "Profil"} trigger="click">
            <div style={{ background: 'rgba(255,255,255,0.9)', padding: '10px 25px', borderRadius: '35px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', height: '50px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--hitam)', fontFamily: 'Narnoor' }}>{user ? `Hi! ${user.username}` : 'Guest'}</span>
              <Button shape="circle" size="small" style={{ width: '35px', height: '35px', background: 'var(--hitam)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }} icon={<UserOutlined style={{ color: 'white' }} />} />
            </div>
          </Popover>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ padding: '40px 8%', marginTop: '-20px' }}>
        
        {/* SEGMENTASI FILTER */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'flex', gap: '10px', background: 'white', padding: '6px', borderRadius: '35px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            {['All', 'Student', 'Professional'].map(tab => (
              <Button key={tab} onClick={() => setActiveTab(tab)} style={{ borderRadius: '25px', border: 'none', background: activeTab === tab ? 'var(--oren)' : 'transparent', color: activeTab === tab ? 'white' : 'black', fontWeight: 800, fontFamily: 'Narnoor', padding: '0 30px' }}>{tab}</Button>
            ))}
          </div>
        </div>

        {/* LIST KARTU DISKON */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
          {filteredDiscounts.map(item => (
            <div 
              key={item.id} 
              className="pkg-card"
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{ 
                background: 'white', borderRadius: '25px', padding: '30px', 
                height: hoveredId === item.id ? '280px' : '220px', // Efek memanjang
                position: 'relative', overflow: 'hidden', 
                transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
                boxShadow: hoveredId === item.id ? '0 12px 30px rgba(255, 119, 0, 0.3)' : '0 4px 15px rgba(0,0,0,0.05)', 
                borderColor: hoveredId === item.id ? 'var(--oren)' : 'transparent', 
                borderWidth: '1px', borderStyle: 'solid',
                display: 'flex', flexDirection: 'column'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ background: 'var(--oren)', color: 'white', padding: '2px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 800, fontFamily: 'Narnoor' }}>N.ly</span>
                {/* LABEL TIPE HANYA MUNCUL JIKA BUKAN GENERAL */}
                {item.type !== 'General' && (
                  <span style={{ background: 'var(--merah)', color: 'white', padding: '2px 12px', borderRadius: '12px', fontSize: '10px', fontWeight: 700, fontFamily: 'Narnoor' }}>{item.type}</span>
                )}
              </div>
              
              <h3 style={{ marginTop: '20px', fontSize: '1.4rem', color: 'var(--hitam)', fontFamily: 'Narnoor' }}>{item.name}</h3>
              
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <h1 style={{ color: 'var(--oren)', margin: 0, fontSize: '3rem', fontFamily: 'Narnoor' }}>{item.percentage}%</h1>
                <span style={{ color: '#999', fontSize: '1rem', fontFamily: 'Narnoor' }}>| OFF</span>
              </div>
              
              <Text type="secondary" style={{ fontFamily: 'Narnoor', marginTop: '5px' }}>Berlaku s/d {item.validUntil}</Text>

              {/* BUTTON CLAIM (MUNCUL SAAT HOVER) */}
              <div style={{ marginTop: 'auto', opacity: hoveredId === item.id ? 1 : 0, transition: '0.3s', paddingTop: '15px' }}>
                <Button block style={{ background: 'var(--oren)', color: 'white', height: '45px', borderRadius: '12px', border: 'none', fontWeight: 800, fontFamily: 'Narnoor' }} 
                  onClick={() => handleClaim(item)}>Claim Discount</Button>
              </div>
            </div>
          ))}
        </div>

        {filteredDiscounts.length === 0 && <Empty style={{marginTop: '50px'}} description={<span style={{fontFamily:'Narnoor', color:'#999'}}>Tidak ada diskon tersedia untuk kategori ini.</span>} />}
      </div>
    </motion.div>
  );
};

export default Discount;