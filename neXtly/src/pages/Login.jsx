import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Checkbox, message, Divider } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import Darktheme from '../assets/Dark theme.png';
import bgImage from '../assets/background.png';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3001/users');
      const foundUser = res.data.find(u => u.email === values.email && u.password === values.password);

      if (foundUser) {
        
        login(foundUser, values.remember);
        message.success(`Selamat datang, ${foundUser.username}!`);
        foundUser.role === 'admin' ? navigate('/admin-dashboard') : navigate('/dashboard');
      } else {
        message.error('Email atau Password salah!');
      }
    } catch (err) {
      message.error('Koneksi database gagal!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '10px' }}>
      <img src={Darktheme} alt="Logo" style={{ height: '35px', marginBottom: '1.5vh' }} />
      <div style={{ background: 'white', padding: '20px 30px', borderRadius: '15px', width: '100%', maxWidth: '340px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', fontWeight: '800', fontSize: '1.1rem', marginBottom: '1vh' }}>Login</h2>
        <Button block icon={<GoogleOutlined />} style={{ borderRadius: '8px', height: '35px', fontSize: '0.8rem' }}>Login with Google</Button>
        <Divider plain style={{ margin: '10px 0' }}><span style={{ color: '#999', fontSize: '9px' }}>or Login with Email</span></Divider>
        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item label="Email" name="email"><Input style={{ borderRadius: '6px', height: '32px' }} /></Form.Item>
          <Form.Item label="Password" name="password"><Input.Password style={{ borderRadius: '6px', height: '32px' }} /></Form.Item>
          <Form.Item name="remember" valuePropName="checked" style={{ marginBottom: '10px' }}><Checkbox style={{ fontSize: '0.7rem' }}>Remember me</Checkbox></Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block style={{ background: 'linear-gradient(to right, #FFBF00, #C62129)', border: 'none', height: '36px', borderRadius: '8px', fontWeight: '800' }}>Login</Button>
        </Form>
        <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.75rem' }}>Don't have account? <Link to="/register" style={{ color: '#FF7700', fontWeight: 'bold' }}>Register here</Link></p>
      </div>
    </div>
  );
};

export default Login;