import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, Layout, Menu, Badge, Popover } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DashboardOutlined, ShoppingOutlined, BellOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

const { Header, Sider, Content } = Layout;

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => { fetchPackages(); }, []);

  const fetchPackages = async () => {
    try {
      const res = await axios.get('http://localhost:3001/packages');
      setData(res.data);
    } catch (err) { message.error("DB Connection Error"); }
  };

  const handleLogout = () => {
    logout();
    message.success("Logged out from Admin");
    navigate('/login');
  };

  const onFinish = async (values) => {
    try {
      if (editingId) {
        await axios.put(`http://localhost:3001/packages/${editingId}`, values);
        message.success("Paket Updated!");
      } else {
        await axios.post('http://localhost:3001/packages', values);
        message.success("New Paket Added!");
        setNotifCount(prev => prev + 1);
      }
      setIsModalOpen(false);
      form.resetFields();
      fetchPackages();
    } catch (err) { message.error("Save failed"); }
  };

  const menuProfil = (
    <div style={{ width: '130px' }}>
      <Button type="text" danger icon={<LogoutOutlined />} onClick={handleLogout} block>Logout</Button>
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} style={{ background: 'var(--hitam)' }}>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--oren)', fontSize: '1.2rem' }}>neXtly</h2>
          <small style={{ color: 'var(--putih)', opacity: 0.6 }}>Admin Panel</small>
        </div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['2']} style={{ background: 'var(--hitam)' }}>
          <Menu.Item key="1" icon={<DashboardOutlined />}>Statistik</Menu.Item>
          <Menu.Item key="2" icon={<ShoppingOutlined />}>Kelola Paket</Menu.Item>
        </Menu>
      </Sider>
      
      <Layout>
        <Header style={{ background: 'white', padding: '0 25px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', height: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Badge count={notifCount}><BellOutlined style={{ fontSize: '1.1rem', cursor: 'pointer' }} onClick={() => setNotifCount(0)} /></Badge>
            <Popover content={menuProfil} title={`Admin: ${user?.username}`} trigger="click">
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Hi! {user?.username}</span>
                <Button shape="circle" size="small" icon={<UserOutlined />} />
              </div>
            </Popover>
          </div>
        </Header>

        <Content style={{ padding: '20px', background: '#f0f2f5' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Package Management</h3>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingId(null); setIsModalOpen(true); }} style={{ background: 'var(--oren)', border: 'none' }}>Add Package</Button>
            </div>
            <Table 
              dataSource={data} 
              rowKey="id" 
              size="small"
              columns={[
                { title: 'Name', dataIndex: 'name' },
                { title: 'GB', dataIndex: 'quota', render: q => `${q} GB` },
                { title: 'Price', dataIndex: 'price', render: p => `Rp ${p?.toLocaleString()}` },
                { title: 'Type', dataIndex: 'type' },
                { title: 'Action', render: (_, record) => (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button size="small" icon={<EditOutlined />} onClick={() => { setEditingId(record.id); form.setFieldsValue(record); setIsModalOpen(true); }} />
                    <Button size="small" danger icon={<DeleteOutlined />} onClick={async () => { await axios.delete(`http://localhost:3001/packages/${record.id}`); fetchPackages(); }} />
                  </div>
                )}
              ]}
            />
          </div>
        </Content>

        <Modal title={editingId ? "Edit Paket" : "Tambah Paket"} open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={() => form.submit()} width={400}>
          <Form form={form} layout="vertical" size="small">
            <Form.Item name="name" label="Package Name" rules={[{required: true}]}><Input /></Form.Item>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Form.Item name="quota" label="Quota (GB)" style={{flex:1}}><InputNumber min={1} style={{width:'100%'}}/></Form.Item>
              <Form.Item name="duration" label="Days" style={{flex:1}}><InputNumber min={1} style={{width:'100%'}}/></Form.Item>
            </div>
            <Form.Item name="price" label="Price (Rp)"><InputNumber min={0} style={{width:'100%'}}/></Form.Item>
            <Form.Item name="type" label="Category">
              <Select>
                <Select.Option value="Student">Student</Select.Option>
                <Select.Option value="Professional">Professional</Select.Option>
                <Select.Option value="Best Deal">Best Deal</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </Layout>
    </Layout>
  );
};
export default AdminDashboard;