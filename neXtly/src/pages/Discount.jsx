import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Empty, message, Popover, Badge, List } from 'antd';
import { BellOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import bgImage from '../assets/background.png';
import logoDefault from '../assets/logo bulet default.png';
import logoDark from '../assets/logo dark theme.png';
import { motion } from 'framer-motion';

const { Text } = Typography;

const Discount = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [discounts, setDiscounts] = useState([]);
  const [filteredDiscounts, setFilteredDiscounts] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [hoveredId, setHoveredId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [logo, setLogo] = useState(logoDefault);
  const [claimedList, setClaimedList] = useState([]);

  useEffect(() => {
    fetchDiscounts();
    fetchNotifications();
    fetchClaimedDiscounts();

    const interval = setInterval(() => {
      fetchNotifications(); 
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Filter logic diperbaiki
  useEffect(() => {
    if (discounts.length > 0) {
      filterDiscounts(activeTab);
    }
  }, [discounts, activeTab]);

  const fetchDiscounts = async () => {
    try {
      const res = await axios.get('http://localhost:3001/discounts');
      setDiscounts(res.data);
      
      setFilteredDiscounts(res.data.filter(d => d.stock > 0));
    } catch (err) { message.error("Gagal memuat diskon"); }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('http://localhost:3001/notifications');
      setNotifications(res.data.reverse());
      setUnreadCount(res.data.filter(n => !n.read).length);
    } catch (err) { console.error(err); }
  };

  // AMBIL DATA KLAIM KHUSUS USER INI
  const fetchClaimedDiscounts = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`http://localhost:3001/claimedDiscounts?userId=${user.id}`);
      setClaimedList(res.data);
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

  // --- PERBAIKAN LOGIKA FILTER (HIDE STOK 0) ---
  const filterDiscounts = (tab) => {
    
    const availableDiscounts = discounts.filter(d => d.stock > 0);

    if (tab === 'All') {

      setFilteredDiscounts(availableDiscounts);
    } else {

      setFilteredDiscounts(availableDiscounts.filter(d => d.type === tab));
    }
  };

  // --- LOGIKA KLAIM DISKON BARU ---
  const handleClaim = async (discount) => {
    if (!user) { message.error("Silahkan login untuk klaim!"); return navigate('/login'); }

    if (discount.stock <= 0) {
      message.error("Maaf, stok diskon ini sudah habis!");
      fetchDiscounts();
      return;
    }

    const isAlreadyClaimed = claimedList.some(item => item.discountId === discount.id);
    if (isAlreadyClaimed) {
      message.warning("Anda sudah mengklaim diskon ini sebelumnya!");
      return;
    }

    try {

      await axios.patch(`http://localhost:3001/discounts/${discount.id}`, {
        stock: discount.stock - 1
      });

      await axios.post('http://localhost:3001/claimedDiscounts', {
        userId: user.id,
        discountId: discount.id,
        claimedAt: new Date().toLocaleString()
      });

      const newNotif = {
        message: `Berhasil Klaim: ${discount.name} (${discount.percentage}%). Gunakan Sebelum ${discount.validUntil}`,
        date: new Date().toLocaleString(),
        type: "success",
        read: false
      };
      await axios.post('http://localhost:3001/notifications', newNotif);

      message.success("Diskon Berhasil Diklaim!");
      
      fetchDiscounts();
      fetchNotifications();
      fetchClaimedDiscounts();

    } catch (err) {
      message.error("Gagal klaim diskon");
    }
  };

  const handleLogout = () => { logout(); message.success("Berhasil Logout"); navigate('/'); };

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

  const profileMenu = (
    <div style={{ width: '150px', fontFamily: 'Narnoor' }}>
      {user ? <Button type="text" danger icon={<LogoutOutlined />} onClick={handleLogout} block style={{fontFamily: 'Narnoor'}}>Logout</Button> : <Button type="primary" onClick={() => navigate('/login')} block style={{background: 'var(--oren)', border:'none', fontFamily:'Narnoor'}}>Login</Button>}
    </div>
  );

  return (
    <motion.div className="scroll-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
  
      <div style={{ backgroundImage: `url(${bgImage})`, height: '32vh', backgroundSize: 'cover', backgroundPosition: 'center', borderBottomLeftRadius: '50px', borderBottomRightRadius: '50px', position: 'relative', zIndex: 100 }}>
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
             
             <span className="nav-item-dash" onClick={() => navigate('/Dashboard')}>Internet Plan</span>
             <span className="nav-item-dash active" onClick={() => navigate('/Discount')}>Discount</span>
             <span className="nav-item-dash" onClick={() => navigate('/History')}>History</span>
          </div>

          <Popover content={profileMenu} trigger="click" placement="bottomRight">
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
          {filteredDiscounts.map(item => {
            const isClaimed = claimedList.some(c => c.discountId === item.id);
            
            return (
              <div 
                key={item.id} 
                className="pkg-card"
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{ 
                  background: 'white', borderRadius: '25px', padding: '30px', 
                  height: hoveredId === item.id ? '280px' : '220px', 
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
                  {item.type !== 'General' && (
                    <span style={{ background: 'var(--merah)', color: 'white', padding: '2px 12px', borderRadius: '12px', fontSize: '10px', fontWeight: 700, fontFamily: 'Narnoor' }}>{item.type}</span>
                  )}
                </div>
                
                <h3 style={{ marginTop: '20px', fontSize: '1.4rem', color: 'var(--hitam)', fontFamily: 'Narnoor' }}>{item.name}</h3>
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                  <h1 style={{ color: 'var(--oren)', margin: 0, fontSize: '3rem', fontFamily: 'Narnoor' }}>{item.percentage}%</h1>
                  <span style={{ color: '#999', fontSize: '1rem', fontFamily: 'Narnoor' }}>| OFF</span>
                </div>
                
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'5px'}}>
                  <Text type="secondary" style={{ fontFamily: 'Narnoor' }}>Berlaku s/d {item.validUntil}</Text>
                  <Text style={{ fontFamily: 'Narnoor', color: item.stock > 0 ? 'green' : 'red', fontSize:'12px', fontWeight:700 }}>Stok: {item.stock}</Text>
                </div>

                <div style={{ marginTop: 'auto', opacity: hoveredId === item.id ? 1 : 0, transition: '0.3s', paddingTop: '15px' }}>
                  <Button 
                    block 
                    disabled={isClaimed} 
                    style={{ 
                      background: isClaimed ? '#ccc' : 'var(--oren)', 
                      color: 'white', 
                      height: '45px', 
                      borderRadius: '12px', 
                      border: 'none', 
                      fontWeight: 800, 
                      fontFamily: 'Narnoor' 
                    }} 
                    onClick={() => handleClaim(item)}
                  >
                    {isClaimed ? "Sudah Diklaim" : "Claim Discount"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredDiscounts.length === 0 && <Empty style={{marginTop: '50px'}} description={<span style={{fontFamily:'Narnoor', color:'#999'}}>Tidak ada diskon tersedia.</span>} />}
      </div>
    </motion.div>
  );
};

export default Discount;