import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Badge, message, Empty, Popover, List, Typography, Select, Tag } from 'antd';
import { BellOutlined, UserOutlined, LogoutOutlined, CalendarOutlined, CheckCircleOutlined, FilterOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import bgImage from '../assets/background.png';
import logoDefault from '../assets/logo bulet default.png';
import logoDark from '../assets/logo dark theme.png';
import { motion } from 'framer-motion';
import moment from 'moment';

const { Text, Title } = Typography;
const { Option } = Select;

const History = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('All');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [logo, setLogo] = useState(logoDefault);
  const [filteredHistory, setFilteredHistory] = useState([]);
  
  // State untuk data
  const [transactions, setTransactions] = useState([]);
  const [claimedDiscounts, setClaimedDiscounts] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [allPackages, setAllPackages] = useState([]);

  // State untuk Filter Waktu
  const [timeFilter, setTimeFilter] = useState('All Time'); // Default All Time

  useEffect(() => {
    fetchData();
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user) {
      combineAndFilterData();
    }
  }, [transactions, claimedDiscounts, activeTab, timeFilter, user]); // Tambahkan timeFilter ke dependency

  const fetchData = async () => {
    try {
      if (!user) return;

      const transRes = await axios.get('http://localhost:3001/transactions');
      setTransactions(transRes.data); 

      const claimRes = await axios.get(`http://localhost:3001/claimedDiscounts?userId=${user.id}`);
      setClaimedDiscounts(claimRes.data);

      const discRes = await axios.get('http://localhost:3001/discounts');
      setDiscounts(discRes.data);

      const pkgRes = await axios.get('http://localhost:3001/packages');
      setAllPackages(pkgRes.data);

    } catch (err) {
      message.error("Gagal memuat riwayat");
    }
  };

  const combineAndFilterData = () => {
    let combined = [];

    // Format Data Transaksi (Pastikan tanggal valid untuk filter)
    // Di db.json transaksi belum ada field 'date' yang spesifik, kita gunakan simulasi 'month' atau tambahkan field date di db.json
    // Untuk demo filter ini berjalan, asumsikan kita pakai properti 'month' atau field baru 'transactionDate' jika ada.
    // Jika tidak ada, filter waktu mungkin tidak akurat tanpa data tanggal yang valid di transaksi.
    // SEMENTARA: Kita pakai tanggal hari ini untuk semua transaksi agar filter terlihat (Simulasi).
    // DI PRODUKSI: Pastikan db.json transaksi punya field "date": "YYYY-MM-DD"
    
    const transFormatted = transactions.map(t => ({
      type: 'Internet Plan',
      name: `Paket ${t.type}`, 
      date: t.date || new Date().toLocaleDateString(), // Fallback ke hari ini jika tidak ada tanggal
      rawDate: t.date ? moment(t.date) : moment(), // Untuk filtering
      amount: t.amount,
      status: 'Success',
      packageId: t.packageId,
      id: `trans-${t.id}`
    }));

    const claimsFormatted = claimedDiscounts.map(c => {
      const discountDetail = discounts.find(d => d.id === c.discountId);
      return {
        type: 'Discount',
        name: discountDetail ? discountDetail.name : 'Unknown Discount',
        date: c.claimedAt,
        rawDate: moment(c.claimedAt), // claimedAt sudah ada tanggalnya
        amount: discountDetail ? `${discountDetail.percentage}% OFF` : '',
        status: 'Claimed',
        id: `claim-${c.id}`
      };
    });

    combined = [...transFormatted, ...claimsFormatted];

    // 1. Filter Berdasarkan Tab (Jenis)
    if (activeTab !== 'All') {
      combined = combined.filter(item => item.type === activeTab);
    }

    // 2. Filter Berdasarkan Waktu
    const today = moment();
    if (timeFilter === 'Hari ini') {
      combined = combined.filter(item => item.rawDate.isSame(today, 'day'));
    } else if (timeFilter === 'Kemarin') {
      combined = combined.filter(item => item.rawDate.isSame(today.clone().subtract(1, 'days'), 'day'));
    } else if (timeFilter === 'Bulan ini') {
      combined = combined.filter(item => item.rawDate.isSame(today, 'month'));
    } else if (timeFilter === 'Tahun ini') {
      combined = combined.filter(item => item.rawDate.isSame(today, 'year'));
    }

    setFilteredHistory(combined);
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

  const handleItemClick = (item) => {
    if (item.type === 'Internet Plan') {
      const existingPackage = allPackages.find(p => p.id.toString() === item.packageId.toString());
      if (existingPackage) {
        navigate(`/package/${item.packageId}`);
      } else {
        message.error("Maaf paket yang anda cari sudah tidak tersedia");
      }
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

  // Konten Dropdown Filter Waktu
  const timeFilterContent = (
    <div style={{ width: '150px', fontFamily: 'Narnoor' }}>
      {['All Time', 'Hari ini', 'Kemarin', 'Bulan ini', 'Tahun ini'].map(filter => (
        <Button 
          key={filter} 
          type="text" 
          block 
          style={{ textAlign: 'left', color: timeFilter === filter ? 'var(--oren)' : 'black', fontWeight: timeFilter === filter ? 700 : 400 }}
          onClick={() => setTimeFilter(filter)}
        >
          {filter}
        </Button>
      ))}
    </div>
  );

  return (
    <motion.div className="scroll-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* HEADER */}
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
             <span className="nav-item-dash" onClick={() => navigate('/dashboard')}>Internet Plan</span>
             <span className="nav-item-dash" onClick={() => navigate('/discount')}>Discount</span>
             <span className="nav-item-dash active" onClick={() => navigate('/history')}>History</span>
          </div>

          <Popover content={profileMenu} trigger="click" placement="bottomRight">
            <div style={{ background: 'rgba(255,255,255,0.9)', padding: '10px 25px', borderRadius: '35px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', height: '50px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--hitam)', fontFamily: 'Narnoor' }}>{user ? `Hi! ${user.username}` : 'Guest'}</span>
              <Button shape="circle" size="small" style={{ width: '35px', height: '35px', background: 'var(--hitam)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }} icon={<UserOutlined style={{ color: 'white' }} />} />
            </div>
          </Popover>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div style={{ padding: '40px 8%', marginTop: '-20px' }}>
        
        {/* BAR FILTER (JENIS & WAKTU) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
          
          {/* Filter Jenis (Kiri) */}
          <div style={{ display: 'flex', gap: '10px', background: 'white', padding: '6px', borderRadius: '35px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            {['All', 'Internet Plan', 'Discount'].map(tab => (
              <Button key={tab} onClick={() => setActiveTab(tab)} style={{ borderRadius: '25px', border: 'none', background: activeTab === tab ? 'var(--oren)' : 'transparent', color: activeTab === tab ? 'white' : 'black', fontWeight: 800, fontFamily: 'Narnoor', padding: '0 30px' }}>{tab}</Button>
            ))}
          </div>

          {/* Filter Waktu (Kanan) */}
          <Popover content={timeFilterContent} title={<span style={{fontFamily:'Narnoor'}}>Filter Waktu</span>} trigger="click" placement="bottomRight">
            <Button className="btn-filter-custom" style={{borderRadius: '35px', padding: '0 25px', height: '45px', fontWeight: 700}}>
              <FilterOutlined /> {timeFilter}
            </Button>
          </Popover>

        </div>

        {/* LIST HISTORY */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredHistory.length > 0 ? filteredHistory.map(item => (
            <div 
              key={item.id} 
              onClick={() => handleItemClick(item)}
              style={{ 
                background: 'white', 
                borderRadius: '20px', 
                padding: '25px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)', 
                border: '1px solid #f0f0f0',
                cursor: item.type === 'Internet Plan' ? 'pointer' : 'default', 
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => { if(item.type === 'Internet Plan') e.currentTarget.style.borderColor = 'var(--oren)'; }}
              onMouseLeave={(e) => { if(item.type === 'Internet Plan') e.currentTarget.style.borderColor = '#f0f0f0'; }}
            >
              
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: item.type === 'Internet Plan' ? '#FFF7E6' : '#E6FFFB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.type === 'Internet Plan' ? 
                    <img src={logoDark} style={{ height: '24px' }} alt="icon" /> : 
                    <CheckCircleOutlined style={{ fontSize: '24px', color: '#13c2c2' }} />
                  }
                </div>
                <div>
                  <Title level={5} style={{ margin: 0, fontFamily: 'Narnoor' }}>{item.name}</Title>
                  <Text type="secondary" style={{ fontFamily: 'Narnoor', fontSize: '12px' }}>
                    <CalendarOutlined style={{ marginRight: '5px' }} /> {item.date}
                  </Text>
                  <div style={{ marginTop: '5px' }}>
                    <Tag color={item.type === 'Internet Plan' ? 'orange' : 'cyan'}>{item.type}</Tag>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <Title level={4} style={{ margin: 0, color: 'var(--hitam)', fontFamily: 'Narnoor' }}>
                  {item.type === 'Internet Plan' ? `Rp ${item.amount?.toLocaleString()}` : item.amount}
                </Title>
                
                {item.type === 'Internet Plan' && (
                  <Button 
                    type="primary" 
                    size="small" 
                    style={{ marginTop: '10px', background: 'var(--oren)', border: 'none', borderRadius: '8px', fontFamily: 'Narnoor', fontWeight: 600 }}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      handleItemClick(item); 
                    }} 
                  >
                    Buy Again
                  </Button>
                )}
                
                {item.type === 'Discount' && (
                  <Text style={{ display:'block', marginTop: '10px', color: 'green', fontSize:'12px', fontFamily: 'Narnoor', fontWeight: 700 }}>
                    Berhasil Diklaim
                  </Text>
                )}
              </div>

            </div>
          )) : (
            <div style={{ textAlign:'center', width:'100%' }}>
               <Empty style={{marginTop: '50px'}} description={<span style={{fontFamily:'Narnoor', color:'#999'}}>Belum ada riwayat transaksi pada periode ini.</span>} />
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
};

export default History;