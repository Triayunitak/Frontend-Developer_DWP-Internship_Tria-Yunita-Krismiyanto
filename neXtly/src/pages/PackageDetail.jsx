// src/pages/PackageDetail.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Badge, List, Typography, Spin } from 'antd';
import { ArrowLeftOutlined, LeftOutlined, RightOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import bgImage from '../assets/background.png';

const { Title, Paragraph } = Typography;

const PackageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pkg, setPkg] = useState(null);
  const [similar, setSimilar] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchDetail = async () => {
      const res = await axios.get('http://localhost:3001/packages');
      const found = res.data.find(p => p.id === id);
      setPkg(found);
      // Non-dummy similar packages (limit 10)
      setSimilar(res.data.filter(p => p.type === found?.type && p.id !== id).slice(0, 10));
    };
    fetchDetail();
    window.scrollTo(0,0);
  }, [id]);

  const scroll = (dir) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const move = dir === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: move, behavior: 'smooth' });
    }
  };

  if (!pkg) return <div style={{height:'100vh', display:'flex', justifyContent:'center', alignItems:'center'}}><Spin size="large"/></div>;

  return (
    <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', paddingBottom: '50px' }}>
      {/* Header Area */}
      <div style={{ backgroundImage: `url(${bgImage})`, height: '28vh', backgroundSize: 'cover', borderBottomLeftRadius: '50px', borderBottomRightRadius: '50px', padding: '35px 6%' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/dashboard')} style={{ borderRadius: '20px', fontWeight: 'bold' }}>Back</Button>
      </div>

      <div style={{ padding: '0 8%', marginTop: '-80px' }}>
        {/* Detail Card */}
        <div style={{ background: 'white', borderRadius: '30px', padding: '40px', display: 'flex', gap: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginBottom: '50px', flexWrap: 'wrap' }}>
          <div className="pkg-card" style={{ width: '300px', padding: '25px', borderRadius: '25px', border: '1px solid #eee' }}>
            <span style={{ background: 'var(--oren)', color: 'white', padding: '2px 12px', borderRadius: '12px', fontSize: '12px' }}>N.ly</span>
            <Title level={3} style={{ marginTop: '20px' }}>{pkg.name}</Title>
            <Title level={1} style={{ color: 'var(--oren)', margin: 0 }}>{pkg.quota} GB</Title>
            <Paragraph>Rp {pkg.price.toLocaleString()}</Paragraph>
          </div>
          
          <div style={{ flex: 1, minWidth: '300px' }}>
            <Title level={2}>Detail {pkg.name} for {pkg.type}</Title>
            <Title level={3} style={{color: 'var(--oren)'}}>Rp {pkg.price.toLocaleString()}</Title>
            <Paragraph style={{fontSize: '16px', marginTop: '20px'}}>
               {pkg.description || "Nikmati layanan internet super cepat dengan kuota utama besar dan bonus aplikasi favorit."}
            </Paragraph>
            <List split={false} dataSource={[`${pkg.quota} GB Main Quota`, 'Bonus Youtube & Sosmed Apps']} 
              renderItem={item => <List.Item style={{padding:'5px 0'}}><Text>• {item}</Text></List.Item>} />
            <Button size="large" onClick={() => navigate(`/checkout/${pkg.id}`)} style={{ background: 'var(--oren)', color: 'white', borderRadius: '15px', height: '50px', padding: '0 50px', marginTop: '30px', fontWeight: 'bold' }}>Buy Now</Button>
          </div>
        </div>

        {/* Similar Packages Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Title level={3}>Similar Packages</Title>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button shape="circle" icon={<LeftOutlined />} onClick={() => scroll('left')} />
            <Button shape="circle" icon={<RightOutlined />} onClick={() => scroll('right')} />
          </div>
        </div>

        <div ref={scrollRef} style={{ display: 'flex', gap: '20px', overflowX: 'hidden', padding: '10px 0' }}>
          {similar.map(item => (
            <div key={item.id} onClick={() => navigate(`/package/${item.id}`)} style={{ minWidth: '260px', background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #eee', cursor: 'pointer' }}>
               <span style={{ background: 'var(--oren)', color: 'white', padding: '1px 8px', borderRadius: '8px', fontSize: '10px' }}>N.ly</span>
               <Title level={4} style={{marginTop:'10px'}}>{item.name}</Title>
               <Title level={2} style={{color: 'var(--oren)', margin: 0}}>{item.quota} GB</Title>
               <Text strong>Rp {item.price.toLocaleString()}</Text>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PackageDetail;