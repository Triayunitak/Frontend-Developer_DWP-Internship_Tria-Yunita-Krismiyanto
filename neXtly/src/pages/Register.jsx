import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message, Divider } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import axios from 'axios';
import Darktheme from '../assets/Dark theme.png';
import bgImage from '../assets/background.png';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    if (values.password !== values.confirm) return message.error('Password tidak cocok!');
    setLoading(true);
    try {
      const newUser = { ...values, role: 'customer' };
      delete newUser.confirm;
      await axios.post('http://localhost:3001/users', newUser);
      message.success('Registrasi berhasil! Silakan login.');
      navigate('/login');
    } catch (err) {
      message.error('Gagal mendaftar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      backgroundImage: `url(${bgImage})`, 
      backgroundSize: 'cover', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: '20px'
    }}>
      <img src={Darktheme} alt="Logo" style={{ height: '45px', marginBottom: '2vh' }} />
      
      <div style={{ 
        background: 'white', 
        padding: '25px 35px', 
        borderRadius: '20px', 
        width: '100%',
        maxWidth: '380px', // Disesuaikan dengan Login agar konsisten
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
      }}>
        <h2 style={{ textAlign: 'center', fontWeight: '800', fontSize: '1.3rem', marginBottom: '1.5vh' }}>Register</h2>
        
        <Button block icon={<GoogleOutlined />} style={{ borderRadius: '10px', height: '38px', fontSize: '0.85rem' }}>
          Register with Google
        </Button>
        
        <Divider plain style={{ margin: '12px 0' }}>
          <span style={{ color: '#999', fontSize: '10px' }}>or Register with Email</span>
        </Divider>
        
        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item label={<span style={{ fontSize: '0.8rem' }}>Username</span>} name="username" rules={[{ required: true }]} style={{ marginBottom: '10px' }}>
            <Input placeholder="ex. Nityunita07" style={{ height: '34px', fontSize: '0.8rem' }} />
          </Form.Item>

          <Form.Item label={<span style={{ fontSize: '0.8rem' }}>Email</span>} name="email" rules={[{ required: true, type: 'email' }]} style={{ marginBottom: '10px' }}>
            <Input placeholder="ex. triya@gmail.com" style={{ height: '34px', fontSize: '0.8rem' }} />
          </Form.Item>

          <Form.Item label={<span style={{ fontSize: '0.8rem' }}>Password</span>} name="password" rules={[{ required: true }]} style={{ marginBottom: '10px' }}>
            <Input.Password placeholder="ex. password" style={{ height: '34px', fontSize: '0.8rem' }} />
          </Form.Item>

          <Form.Item label={<span style={{ fontSize: '0.8rem' }}>Confirm Password</span>} name="confirm" rules={[{ required: true }]} style={{ marginBottom: '15px' }}>
            <Input.Password placeholder="Repeat password" style={{ height: '34px', fontSize: '0.8rem' }} />
          </Form.Item>

          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading} 
            block 
            style={{ 
              background: 'linear-gradient(to right, #FFBF00, #C62129)', 
              border: 'none', 
              height: '40px', 
              borderRadius: '10px', 
              fontWeight: '800',
              fontSize: '0.9rem' 
            }}
          >
            Register
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default Register;