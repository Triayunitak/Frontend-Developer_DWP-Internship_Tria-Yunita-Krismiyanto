import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Typography, Spin, Popover, message, List, Badge, Empty } from 'antd';
import { ArrowLeftOutlined, LeftOutlined, RightOutlined, UserOutlined, BellOutlined, LogoutOutlined, ArrowRightOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import bgImage from '../assets/background.png';
import logoDefault from '../assets/logo bulet default.png';
import logoDark from '../assets/logo dark theme.png';
import { motion } from 'framer-motion';

const { Title, Paragraph, Text } = Typography;

const PackageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [pkg, setPkg] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [logo, setLogo] = useState(logoDefault);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:3001/packages');
        const found = res.data.find(p => p.id.toString() === id.toString());
        if (found) {
          setPkg(found);
          const filtered = res.data.filter(p => p.type === found.type && p.id.toString() !== id.toString()).slice(0, 10);
          setSimilar(filtered);
        }
        const notifRes = await axios.get('http://localhost:3001/notifications');
        setNotifications(notifRes.data.reverse());
        setUnreadCount(notifRes.data.filter(n => !n.read).length);
      } catch (err) { message.error("Gagal terhubung ke database"); } finally { setLoading(false); }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  const scroll = (dir) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const move = dir === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: move, behavior: 'smooth' });
    }
  };

  const handleLogout = () => { logout(); message.success("Berhasil Logout"); navigate('/'); };

  const handleBuy = async () => {
    if(!user) { message.error("Silahkan Login terlebih dahulu"); navigate('/login'); return; }
    try {
      const newNotif = {
        message: `Pembelian Berhasil: ${pkg.name} (${pkg.quota} GB).`,
        date: new Date().toLocaleString(),
        type: "success",
        read: false
      };
      await axios.post('http://localhost:3001/notifications', newNotif);
      message.success("Pembelian Berhasil!");
      navigate(`/checkout/${pkg.id}`);
    } catch(err) { message.error("Gagal memproses pembelian"); }
  };

  const handleOpenNotif = async (open) => {
    if (open && unreadCount > 0) {
      setUnreadCount(0);
      notifications.forEach(async (n) => {
        if (!n.read) await axios.patch(`http://localhost:3001/notifications/${n.id}`, { read: true });
      });
    }
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

  const profileMenu = (
    <div style={{ width: '150px', fontFamily: 'Narnoor' }}>
      {user ? <Button type="text" danger icon={<LogoutOutlined />} onClick={handleLogout} block style={{fontFamily: 'Narnoor'}}>Logout</Button> : <Button type="primary" onClick={() => navigate('/login')} block style={{background: 'var(--oren)', border:'none', fontFamily:'Narnoor'}}>Login</Button>}
    </div>
  );

  if (loading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--hitam)' }}><Spin size="large" /></div>;
  if (!pkg) return null;

  return (
    <motion.div className="scroll-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
      <div style={{ backgroundImage: `url(${bgImage})`, height: '32vh', backgroundSize: 'cover', backgroundPosition: 'center', borderBottomLeftRadius: '50px', borderBottomRightRadius: '50px', position: 'relative', zIndex: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '35px 6%', alignItems: 'center' }}>
          <Popover content={notifContent} title={<span style={{fontFamily:'Narnoor'}}>Notifikasi</span>} trigger="click" placement="bottomLeft" onOpenChange={handleOpenNotif}>
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

             <span className="nav-item-dash active" onClick={() => navigate('/dashboard')}>Internet Plan</span>
             <span className="nav-item-dash" onClick={() => navigate('/discount')}>Discount</span>
             <span className="nav-item-dash">History</span>
          </div>
          <Popover content={profileMenu} trigger="click" placement="bottomRight">
            <div style={{ background: 'rgba(255,255,255,0.9)', padding: '10px 25px', borderRadius: '35px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', height: '50px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--hitam)', fontFamily: 'Narnoor' }}>{user ? `Hi! ${user.username}` : 'Guest Account'}</span>
              <Button shape="circle" size="small" style={{ width: '35px', height: '35px', background: 'var(--hitam)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }} icon={<UserOutlined style={{ color: 'white' }} />} />
            </div>
          </Popover>
        </div>
      </div>

      <div style={{ padding: '0 8%', marginTop: '-35px', position: 'relative', zIndex: 110, paddingBottom: '80px' }}>
        <div style={{ marginBottom: '25px' }}>
            <Button className="btn-back-detail" onClick={() => navigate('/dashboard')}><ArrowLeftOutlined className="icon-back" /><span>Back</span></Button>
        </div>

        <div style={{ background: 'white', borderRadius: '30px', padding: '40px', display: 'flex', gap: '50px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', marginBottom: '60px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="pkg-card" style={{ width: '320px', padding: '30px', borderRadius: '25px', border: '1px solid #f0f0f0', background: 'white', cursor: 'default' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ background: 'var(--oren)', color: 'white', padding: '2px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 800 }}>N.ly</span>
              <span style={{ background: 'var(--merah)', color: 'white', padding: '2px 12px', borderRadius: '12px', fontSize: '10px', fontWeight: 700 }}>{pkg.type}</span>
            </div>
            <Title level={3} style={{ marginTop: '20px', fontFamily: 'Narnoor', color: 'var(--hitam)' }}>{pkg.name}</Title>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <h1 style={{ color: 'var(--oren)', margin: 0, fontSize: '3rem', fontFamily: 'Narnoor', fontWeight: 800 }}>{pkg.quota} GB</h1>
              <span style={{ color: '#999', fontSize: '1.2rem', fontFamily: 'Narnoor' }}>| {pkg.duration} Hari</span>
            </div>
            <Title level={4} style={{ marginTop: '10px', fontFamily: 'Narnoor', fontWeight: 800 }}>Rp {pkg.price?.toLocaleString()}</Title>
          </div>

          <div style={{ flex: 1, minWidth: '350px' }}>
            <Title level={2} style={{ fontFamily: 'Narnoor', marginBottom: '5px', fontWeight: 800 }}>Detail {pkg.name} for {pkg.type}</Title>
            <Title level={3} style={{ color: 'var(--oren)', marginTop: 0, fontFamily: 'Narnoor', fontWeight: 800 }}>Rp {pkg.price?.toLocaleString()}</Title>
            <Paragraph style={{ fontSize: '16px', color: '#666', marginTop: '25px', lineHeight: '1.6', fontFamily: 'Narnoor' }}>{pkg.description}</Paragraph>
            <List split={false} dataSource={pkg.features || []} 
              renderItem={item => (<List.Item style={{padding: '5px 0', border: 'none'}}><Text style={{fontFamily: 'Narnoor', fontSize: '15px'}}><ArrowRightOutlined style={{ color: 'var(--oren)', marginRight: 10 }} /> {item}</Text></List.Item>)} 
            />
            <Button size="large" block onClick={handleBuy}
              style={{ background: 'linear-gradient(to right, #FF7700, #C62129)', color: 'white', borderRadius: '15px', height: '55px', marginTop: '40px', fontWeight: 800, fontSize: '1.2rem', border: 'none', boxShadow: '0 8px 20px rgba(255, 119, 0, 0.3)', fontFamily: 'Narnoor' }}>Buy Now</Button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <Title level={3} style={{ fontFamily: 'Narnoor', margin: 0, fontWeight: 800 }}>Similar Packages</Title>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button shape="circle" className="btn-icon-nav" icon={<LeftOutlined className="icon-nav-custom" />} onClick={() => scroll('left')} />
            <Button shape="circle" className="btn-icon-nav" icon={<RightOutlined className="icon-nav-custom" />} onClick={() => scroll('right')} />
          </div>
        </div>

        <div ref={scrollRef} style={{ display: 'flex', gap: '25px', overflowX: 'hidden', padding: '10px 5px', scrollBehavior: 'smooth' }}>
          {similar.length > 0 ? similar.map(item => (
            <div key={item.id} className="pkg-card" onClick={() => navigate(`/package/${item.id}`)} style={{ minWidth: '280px', background: 'white', padding: '25px', borderRadius: '25px', border: '1px solid #f0f0f0', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ background: 'var(--oren)', color: 'white', padding: '2px 8px', borderRadius: '8px', fontSize: '9px', fontWeight: 800 }}>N.ly</span></div>
              <Title level={5} style={{ marginTop: '15px', fontFamily: 'Narnoor', fontWeight: 700 }}>{item.name}</Title>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                <Title level={3} style={{ color: 'var(--oren)', margin: 0, fontFamily: 'Narnoor', fontWeight: 800 }}>{item.quota} GB</Title><Text type="secondary" style={{ fontSize: '11px', fontFamily: 'Narnoor' }}>| {item.duration} Hari</Text>
              </div><Text strong style={{ fontFamily: 'Narnoor', fontSize: '1rem' }}>Rp {item.price?.toLocaleString()}</Text>
            </div>
          )) : <div style={{width:'100%', textAlign:'center'}}><Empty description={<span style={{fontFamily:'Narnoor', color:'#999'}}>Tidak ada paket serupa.</span>} /></div>}
        </div>
      </div>
    </motion.div>
  );
};
export default PackageDetail;