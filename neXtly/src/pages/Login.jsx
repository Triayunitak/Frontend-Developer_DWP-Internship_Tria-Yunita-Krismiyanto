import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Checkbox, message, Divider } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone, GoogleOutlined } from '@ant-design/icons';
import axios from 'axios';

// Assets
import logoDark from '../assets/Dark theme.png';
import bgImage from '../assets/background.png';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Simulasi fetch data dari db.json
      const response = await axios.get('http://localhost:3001/users');
      const users = response.data;
      
      const foundUser = users.find(
        (u) => u.email === values.email && u.password === values.password
      );

      if (foundUser) {
        message.success(`Welcome back, ${foundUser.username}!`);
        
        // Cek Remember Me
        if (values.remember) {
          localStorage.setItem('rememberedUser', JSON.stringify(foundUser));
        }

        // Logic Redirect berdasarkan Role
        if (foundUser.role === 'admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        message.error('Invalid email or password');
      }
    } catch (error) {
      message.error('Connection error with database');
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
      overflow: 'hidden'
    }}>
      <img src={logoDark} alt="Logo" style={{ height: '60px', marginBottom: '30px' }} />
      
      <div style={{ 
        background: 'white', 
        padding: '40px', 
        borderRadius: '20px', 
        width: '400px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '25px', fontWeight: '800' }}>Login</h2>
        
        <Button block icon={<GoogleOutlined />} style={{ borderRadius: '10px', height: '40px' }}>
          Login with Google
        </Button>

        <Divider plain><span style={{ color: '#999', fontSize: '12px' }}>or Login with Email</span></Divider>

        <Form layout="vertical" onFinish={onFinish} initialValues={{ remember: true }}>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="ex. triya@gmail.com" style={{ borderRadius: '8px' }} />
          </Form.Item>

          <Form.Item label="Password" name="password" rules={[{ required: true }]}>
            <Input.Password 
              placeholder="ex. password" 
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked">
            <Checkbox>Remember me</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block 
              style={{ 
                background: 'linear-gradient(to right, #FFBF00, #C62129)', 
                border: 'none', 
                height: '45px', 
                borderRadius: '10px',
                fontWeight: 'bold'
              }}
            >
              Login
            </Button>
          </Form.Item>
        </Form>

        <p style={{ textAlign: 'center', marginTop: '10px' }}>
          Don't have account yet? <Link to="/register" style={{ color: '#FF7700', fontWeight: 'bold' }}>Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;