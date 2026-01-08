import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message, Divider } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import axios from 'axios';

// Assets
import logoDark from '../assets/Dark theme.png';
import bgImage from '../assets/background.png';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    if (values.password !== values.confirm) {
      return message.error('Passwords do not match!');
    }

    setLoading(true);
    try {
      const newUser = {
        username: values.username,
        email: values.email,
        password: values.password,
        role: 'customer' // Role default sesuai instruksi
      };

      await axios.post('http://localhost:3001/users', newUser);
      message.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      message.error('Failed to register user');
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
      <img src={logoDark} alt="Logo" style={{ height: '60px', marginBottom: '20px' }} />
      
      <div style={{ 
        background: 'white', 
        padding: '30px 40px', 
        borderRadius: '20px', 
        width: '420px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', fontWeight: '800' }}>Register</h2>
        
        <Button block icon={<GoogleOutlined />} style={{ borderRadius: '10px' }}>
          Register with Google
        </Button>

        <Divider plain><span style={{ color: '#999', fontSize: '11px' }}>or Register with Email</span></Divider>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Username" name="username" rules={[{ required: true }]}>
            <Input placeholder="ex. Nityunita07" style={{ borderRadius: '8px' }} />
          </Form.Item>

          <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="ex. triya@gmail.com" style={{ borderRadius: '8px' }} />
          </Form.Item>

          <Form.Item label="Password" name="password" rules={[{ required: true }]}>
            <Input.Password placeholder="ex. password" style={{ borderRadius: '8px' }} />
          </Form.Item>

          <Form.Item label="Confirm your password" name="confirm" rules={[{ required: true }]}>
            <Input.Password placeholder="Repeat password" style={{ borderRadius: '8px' }} />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
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
                fontWeight: 'bold',
                marginTop: '10px'
              }}
            >
              Register
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Register;