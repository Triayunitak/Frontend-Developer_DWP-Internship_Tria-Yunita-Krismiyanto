import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Typography, Input, Select, message, Modal, Divider, Form, Spin, Badge, Popover, List } from 'antd';
import { ArrowLeftOutlined, BellOutlined, UserOutlined, LogoutOutlined, SecurityScanOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import bgImage from '../assets/background.png';
import logoDefault from '../assets/logo bulet default.png';
import logoDark from '../assets/logo dark theme.png';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;
const { Option } = Select;

const Checkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logo, setLogo] = useState(logoDefault);
  
  // State Form
  const [phoneNumber, setPhoneNumber] = useState('');
  const [provider, setProvider] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [virtualAccount, setVirtualAccount] = useState('');
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  
  // Data State
  const [myDiscounts, setMyDiscounts] = useState([]); // Diskon yang valid dan BELUM DIPAKAI
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0); 
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Get Package Detail
        const resPkg = await axios.get('http://localhost:3001/packages');
        const foundPkg = resPkg.data.find(p => p.id.toString() === id.toString());
        setPkg(foundPkg);

        // 2. LOGIKA DISKON YANG BELUM DIPAKAI
        const resClaim = await axios.get(`http://localhost:3001/claimedDiscounts?userId=${user.id}`);
        const resDisc = await axios.get('http://localhost:3001/discounts');
        const resTrans = await axios.get('http://localhost:3001/transactions'); // Ambil data transaksi utk cek penggunaan

        // Filter diskon yang SUDAH diklaim user
        const claimedDetails = resClaim.data.map(claim => {
          const detail = resDisc.data.find(d => d.id === claim.discountId);
          return detail ? { ...detail, claimId: claim.id } : null;
        }).filter(item => item !== null);

        // Filter diskon yang BELUM pernah dipakai di transaksi manapun oleh user ini
        // Asumsi: 'usedDiscountId' disimpan di transaksi saat checkout (perlu ditambah di logic post transaction nanti)
        // Atau: Kita cek manual based on logic sederhana (diskon sekali pakai per user per jenis diskon)
        // Disini kita gunakan logika: Cek apakah ID diskon (discountId) sudah ada di history transaksi user.
        
        // Catatan: Karena struktur db.json sebelumnya belum menyimpan 'discountId' di tabel 'transactions',
        // kita akan menambahkan field 'discountId' saat POST transaksi di bawah agar pengecekan ini valid kedepannya.
        
        const usedDiscountIds = resTrans.data
          .filter(t => t.userId === user.id && t.discountId) // Filter transaksi user yg pakai diskon
          .map(t => t.discountId);

        const availableDiscounts = claimedDetails.filter(d => !usedDiscountIds.includes(d.id));
        
        setMyDiscounts(availableDiscounts);

        // 3. Notifications
        const resNotif = await axios.get('http://localhost:3001/notifications');
        setNotifications(resNotif.data.reverse());
        setUnreadCount(resNotif.data.filter(n => !n.read).length);

      } catch (err) {
        message.error("Gagal memuat data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user.id]);

  const handleOpenNotif = async (open) => {
    if (open && unreadCount > 0) {
      setUnreadCount(0); 
      notifications.forEach(async (n) => {
        if (!n.read) await axios.patch(`http://localhost:3001/notifications/${n.id}`, { read: true });
      });
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    }
  };

  const handlePhoneChange = (e) => {
    const num = e.target.value;
    if (!/^\d*$/.test(num)) return;
    setPhoneNumber(num);

    if (/^0851/.test(num)) setProvider('by.U');
    else if (/^081[1-3]|^082[1-3]|^085[2-3]/.test(num)) setProvider('Telkomsel');
    else if (/^081[4-6]|^085[5-8]/.test(num)) setProvider('Indosat Ooredoo');
    else if (/^081[7-9]|^0859|^087[7-8]/.test(num)) setProvider('XL');
    else if (/^083[1-3]|^0838/.test(num)) setProvider('Axis');
    else if (/^089[5-9]/.test(num)) setProvider('Tri');
    else if (/^088[1-9]/.test(num)) setProvider('Smartfren');
    else setProvider('Other');
  };

  const handleVirtualAccountChange = (e) => {
    const val = e.target.value;
    if (/^\d*$/.test(val) && val.length <= 23) {
      setVirtualAccount(val);
    }
  };

  const calculateTotal = () => {
    if (!pkg) return 0;
    let total = pkg.price;
    if (selectedDiscount) {
      const discountAmount = (pkg.price * selectedDiscount.percentage) / 100;
      total -= discountAmount;
    }
    return total < 0 ? 0 : total;
  };

  const handleBuyClick = () => {
    if (!phoneNumber || !paymentMethod || !virtualAccount) {
      message.error("Mohon lengkapi semua data transaksi!");
      return;
    }
    setIsModalOpen(true); 
  };

  const handleConfirmPayment = async () => {
    if (!confirmPassword) {
      message.error("Masukkan kata sandi!");
      return;
    }
    if (confirmPassword !== user.password) {
      message.error("Kata sandi salah!");
      return;
    }

    setModalLoading(true);

    try {
      // 1. Simpan Transaksi ke DB (Status Awal: Pending)
      // PENTING: Simpan 'discountId' agar bisa dilacak pemakaiannya
      const transactionData = {
        packageId: pkg.id,
        userId: user.id,
        discountId: selectedDiscount ? selectedDiscount.id : null, // Simpan ID Diskon
        type: pkg.type,
        month: new Date().toLocaleString('default', { month: 'long' }),
        amount: calculateTotal(),
        date: new Date().toLocaleString(),
        provider: provider,
        phoneNumber: phoneNumber,
        paymentMethod: paymentMethod,
        status: "Pending" 
      };
      
      const resTrans = await axios.post('http://localhost:3001/transactions', transactionData);
      const transactionId = resTrans.data.id; 

      // 2. Kirim Notifikasi "Menunggu Pembayaran"
      const pendingNotif = {
        message: `Pesanan Dibuat: ${pkg.name}. Menunggu pembayaran...`,
        date: new Date().toLocaleString(),
        type: "warning",
        read: false
      };
      await axios.post('http://localhost:3001/notifications', pendingNotif);

      message.loading({ content: "Memproses pembayaran... Mohon lakukan pembayaran dalam 30 detik.", key: 'paymentProcess', duration: 0 });

      // 3. JEDA 30 DETIK (Simulasi Pembayaran Berhasil)
      setTimeout(async () => {
        try {
          await axios.patch(`http://localhost:3001/transactions/${transactionId}`, {
            status: "Success"
          });

          const successNotif = {
            message: `Pembayaran Berhasil! Paket ${pkg.name} untuk ${phoneNumber} sudah aktif.`,
            date: new Date().toLocaleString(),
            type: "success",
            read: false
          };
          await axios.post('http://localhost:3001/notifications', successNotif);
          
          message.destroy('paymentProcess'); 
          message.success("Pembayaran Berhasil! Internet Aktif.");
          
          setModalLoading(false);
          setIsModalOpen(false);
          
          navigate('/history');

        } catch (error) {
          message.destroy('paymentProcess');
          message.error("Gagal mengupdate status pembayaran.");
          setModalLoading(false);
        }
      }, 30000); // 30 Detik

    } catch (err) {
      message.destroy('paymentProcess');
      message.error("Terjadi kesalahan saat membuat transaksi.");
      setModalLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const notifContent = (
    <div style={{ width: '300px', maxHeight: '400px', overflowY: 'auto', fontFamily: 'Narnoor' }}>
      <div style={{padding: '10px', borderBottom: '1px solid #eee', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <Text strong>Notifikasi</Text>
        <Button type="link" size="small" onClick={() => handleOpenNotif(true)} style={{color: 'var(--oren)', fontSize: '10px'}}>Tandai dibaca</Button>
      </div>
      <List dataSource={notifications} locale={{ emptyText: 'Tidak ada notifikasi' }}
        renderItem={(item) => (
          <List.Item style={{ background: item.read ? 'white' : '#fff7e6' }}>
            <div style={{ fontSize: '12px' }}>
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

  if (loading || !pkg) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--hitam)' }}><Spin size="large" /></div>;

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
          <Popover content={profileMenu} trigger="click" placement="bottomRight">
            <div style={{ background: 'rgba(255,255,255,0.9)', padding: '10px 25px', borderRadius: '35px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', height: '50px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--hitam)', fontFamily: 'Narnoor' }}>{user ? `Hi! ${user.username}` : 'Guest'}</span>
              <Button shape="circle" size="small" style={{ width: '35px', height: '35px', background: 'var(--hitam)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }} icon={<UserOutlined style={{ color: 'white' }} />} />
            </div>
          </Popover>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ padding: '0 8%', marginTop: '-35px', position: 'relative', zIndex: 110, paddingBottom: '80px' }}>
        <div style={{ marginBottom: '25px' }}>
            <Button className="btn-back-detail" onClick={() => navigate(-1)}><ArrowLeftOutlined className="icon-back" /><span>Back</span></Button>
        </div>

        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
          
          {/* KIRI: DETAIL PAKET */}
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div className="pkg-card" style={{ background: 'white', padding: '30px', borderRadius: '25px', border: '1px solid #f0f0f0', cursor: 'default' }}>
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
          </div>

          {/* KANAN: FORM TRANSAKSI */}
          <div style={{ flex: 1.5, background: 'white', borderRadius: '30px', padding: '40px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
            <Title level={2} style={{ fontFamily: 'Narnoor', fontWeight: 800, marginBottom: '20px' }}>Detail Transaksi</Title>
            
            <Form layout="vertical">
              <div style={{ display: 'flex', gap: '20px' }}>
                <Form.Item label="Nomor Handphone" style={{ flex: 2 }} required>
                  <Input 
                    placeholder="Contoh: 0812xxxx" 
                    value={phoneNumber} 
                    onChange={handlePhoneChange} 
                    maxLength={13}
                    style={{ height: '45px', borderRadius: '10px', fontFamily: 'Narnoor' }}
                  />
                </Form.Item>
                <Form.Item label="Provider (Otomatis)" style={{ flex: 1 }}>
                  <Select 
                    value={provider} 
                    onChange={setProvider}
                    style={{ height: '45px', fontFamily: 'Narnoor' }}
                    disabled={provider !== 'Other' && provider !== ''}
                  >
                    <Option value="Telkomsel">Telkomsel</Option>
                    <Option value="XL">XL</Option>
                    <Option value="Indosat Ooredoo">Indosat</Option>
                    <Option value="Axis">Axis</Option>
                    <Option value="by.U">by.U</Option>
                    <Option value="Tri">Tri</Option>
                    <Option value="Smartfren">Smartfren</Option>
                    <Option value="Other">Lainnya</Option>
                  </Select>
                </Form.Item>
              </div>

              <Form.Item label="Metode Pembayaran" required>
                <Select 
                  placeholder="Pilih Bank / E-Wallet" 
                  style={{ height: '45px', fontFamily: 'Narnoor' }}
                  onChange={setPaymentMethod}
                >
                  <Option value="BCA">BCA Virtual Account</Option>
                  <Option value="Mandiri">Mandiri Virtual Account</Option>
                  <Option value="Mandiri">BRI Virtual Account</Option>
                  <Option value="Mandiri">Dana</Option>
                  <Option value="Mandiri">Pulsa</Option>
                  <Option value="Mandiri">Seabank</Option>
                  <Option value="Mandiri">QRIS</Option>
                  <Option value="GoPay">GoPay</Option>
                  <Option value="OVO">OVO</Option>
                </Select>
              </Form.Item>

              <Form.Item label="No. Virtual Account / E-Wallet" required tooltip="Nomor rekening atau nomor e-wallet anda untuk pembayaran">
                <Input 
                  placeholder="Masukkan nomor pembayaran maksimal 23 digit" 
                  value={virtualAccount}
                  onChange={handleVirtualAccountChange}
                  style={{ height: '45px', borderRadius: '10px', fontFamily: 'Narnoor' }}
                />
              </Form.Item>

              <Form.Item label="Gunakan Diskon">
                <Select 
                  placeholder="Pilih diskon yang dimiliki" 
                  style={{ height: '45px', fontFamily: 'Narnoor' }}
                  onChange={(val) => setSelectedDiscount(myDiscounts.find(d => d.id === val))}
                  allowClear
                  onClear={() => setSelectedDiscount(null)}
                >
                  {myDiscounts.length > 0 ? (
                    myDiscounts.map(d => (
                      (d.type === 'General' || d.type === pkg.type) && <Option key={d.id} value={d.id}>{d.name} ({d.percentage}%)</Option>
                    ))
                  ) : <Option disabled>Diskon Tidak Dimiliki / Sudah Terpakai</Option>}
                </Select>
                {selectedDiscount && <Text type="success" style={{fontFamily:'Narnoor', fontSize:'12px'}}>Potongan: Rp {((pkg.price * selectedDiscount.percentage)/100).toLocaleString()}</Text>}
              </Form.Item>

              <Divider />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <Text style={{ fontSize: '1.2rem', fontFamily: 'Narnoor' }}>Total Pembayaran</Text>
                <Title level={2} style={{ margin: 0, color: 'var(--oren)', fontFamily: 'Narnoor' }}>
                  Rp {calculateTotal().toLocaleString()}
                </Title>
              </div>

              <Button 
                block 
                size="large" 
                onClick={handleBuyClick}
                style={{ background: 'linear-gradient(to right, #FF7700, #C62129)', color: 'white', borderRadius: '15px', height: '55px', fontWeight: 800, fontSize: '1.2rem', border: 'none', boxShadow: '0 8px 20px rgba(255, 119, 0, 0.3)', fontFamily: 'Narnoor' }}
              >
                Buy Now
              </Button>
            </Form>
          </div>
        </div>
      </div>

      {/* MODAL RECEIPT CONFIRMATION */}
      <Modal 
        title={<div style={{textAlign:'center', fontFamily:'Narnoor', fontSize:'1.5rem', fontWeight:800}}>Konfirmasi Pembelian</div>} 
        open={isModalOpen} 
        footer={null} 
        onCancel={() => !modalLoading && setIsModalOpen(false)}
        maskClosable={!modalLoading}
        closable={!modalLoading}
        centered
      >
        <div style={{ textAlign: 'center', fontFamily: 'Narnoor' }}>
          <Text type="secondary">Pastikan data berikut sudah benar</Text>
          <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '15px', marginTop: '15px', textAlign:'left' }}>
            <p><strong>Paket:</strong> {pkg.name} {pkg.quota}GB</p>
            <p><strong>Nomor:</strong> {phoneNumber} ({provider})</p>
            <p><strong>Metode:</strong> {paymentMethod} - {virtualAccount}</p>
            <p><strong>Diskon:</strong> {selectedDiscount ? `${selectedDiscount.name} (${selectedDiscount.percentage}%)` : '-'}</p>
            <Divider style={{margin:'10px 0'}} />
            <div style={{display:'flex', justifyContent:'space-between'}}>
              <Text strong>Total:</Text>
              <Text strong style={{fontSize:'1.2rem', color:'var(--oren)'}}>Rp {calculateTotal().toLocaleString()}</Text>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <Text strong style={{display:'block', marginBottom:'5px', textAlign:'left'}}>Konfirmasi Password:</Text>
            <Input.Password 
              placeholder="Masukkan password akun anda" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}
              prefix={<SecurityScanOutlined />}
              style={{ borderRadius: '10px', height: '40px' }}
              disabled={modalLoading} 
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
            <Button 
              block 
              size="large" 
              onClick={() => setIsModalOpen(false)} 
              disabled={modalLoading} 
              style={{ borderRadius: '10px', height:'45px', fontFamily:'Narnoor' }}
            >
              Cancel
            </Button>
            <Button 
              block 
              type="primary" 
              size="large" 
              loading={modalLoading} 
              onClick={handleConfirmPayment}
              style={{ borderRadius: '10px', height:'45px', background:'var(--oren)', border:'none', fontFamily:'Narnoor', fontWeight:700 }}
            >
              {modalLoading ? "Memproses..." : "Yes, Bayar"}
            </Button>
          </div>
        </div>
      </Modal>

    </motion.div>
  );
};

export default Checkout;