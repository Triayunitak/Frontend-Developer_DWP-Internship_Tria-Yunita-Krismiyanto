import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, Layout, Menu, Badge, Popover, Card, Row, Col, Statistic } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DashboardOutlined, ShoppingOutlined, BellOutlined, UserOutlined, LogoutOutlined, RocketOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const { Header, Sider, Content } = Layout;

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [currentMenu, setCurrentMenu] = useState('1');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => { 
    fetchPackages(); 
    fetchTransactions();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await axios.get('http://localhost:3001/packages');
      setData(res.data);
    } catch (err) { message.error("Gagal memuat paket"); }
  };

  const fetchTransactions = async () => {
    const res = await axios.get('http://localhost:3001/transactions');
    setTransactions(res.data);
  };

  // Logic Statistik: Kelompokkan pendapatan per bulan
  const chartData = [
    { name: 'Jan', revenue: transactions.filter(t => t.month === 'January').reduce((a, b) => a + b.amount, 0) },
    { name: 'Feb', revenue: transactions.filter(t => t.month === 'February').reduce((a, b) => a + b.amount, 0) },
    { name: 'Mar', revenue: 0 }, // Placeholder
  ];

  // Rekomendasi berdasarkan kategori paling laku
  const getRecommendation = () => {
    const counts = transactions.reduce((acc, curr) => {
      acc[curr.type] = (acc[curr.type] || 0) + 1;
      return acc;
    }, {});
    const mostPopular = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, "N/A");
    return mostPopular;
  };

  const onFinish = async (values) => {
    try {
      if (editingId) {
        await axios.put(`http://localhost:3001/packages/${editingId}`, values);
        message.success("Paket Diperbarui!");
      } else {
        await axios.post('http://localhost:3001/packages', values);
        message.success("Paket Ditambahkan!");
      }
      setIsModalOpen(false);
      form.resetFields();
      fetchPackages();
    } catch (err) { message.error("Gagal menyimpan"); }
  };

  const menuProfil = (
    <div style={{ width: '130px' }}>
      <Button type="text" danger icon={<LogoutOutlined />} onClick={() => { logout(); navigate('/login'); }} block>Logout</Button>
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} style={{ background: 'var(--hitam)' }}>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--oren)', fontSize: '1.2rem' }}>neXtly</h2>
        </div>
        <Menu 
          theme="dark" 
          mode="inline" 
          selectedKeys={[currentMenu]} 
          onClick={(e) => setCurrentMenu(e.key)}
          style={{ background: 'var(--hitam)' }}
        >
          <Menu.Item key="1" icon={<DashboardOutlined />}>Statistik</Menu.Item>
          <Menu.Item key="2" icon={<ShoppingOutlined />}>Kelola Paket</Menu.Item>
        </Menu>
      </Sider>
      
      <Layout>
        <Header style={{ background: 'white', padding: '0 25px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', height: '60px' }}>
            <Badge count={notifCount} style={{marginRight: 20}}><BellOutlined style={{ fontSize: '1.2rem' }} /></Badge>
            <Popover content={menuProfil} title={`Hi! ${user?.username}`} trigger="click">
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 700 }}>{user?.username}</span>
                <Button shape="circle" size="small" icon={<UserOutlined />} />
              </div>
            </Popover>
        </Header>

        <Content style={{ padding: '20px' }}>
          {currentMenu === '1' ? (
            <div>
              <Row gutter={16}>
                <Col span={16}>
                  <Card title="Pendapatan Bulanan (Revenue)">
                    <div style={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer>
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="revenue" fill="var(--oren)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card title="Rekomendasi Bisnis" style={{height: '100%'}}>
                    <Statistic 
                      title="Kategori Terlaris" 
                      value={getRecommendation()} 
                      prefix={<RocketOutlined style={{color: 'var(--oren)'}} />} 
                    />
                    <div style={{marginTop: 20, color: '#666'}}>
                      Saran: Kembangkan lebih banyak variasi paket di kategori <b>{getRecommendation()}</b> untuk meningkatkan konversi.
                    </div>
                  </Card>
                </Col>
              </Row>
            </div>
          ) : (
            <Card title="Package Management" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingId(null); setIsModalOpen(true); }} style={{ background: 'var(--oren)', border: 'none' }}>Tambah Paket</Button>}>
              <Table 
                dataSource={data} 
                rowKey="id" 
                size="small"
                columns={[
                  { title: 'Name', dataIndex: 'name' },
                  { title: 'GB', dataIndex: 'quota', render: q => `${q} GB` },
                  { title: 'Price', dataIndex: 'price', render: p => `Rp ${p?.toLocaleString()}` },
                  { title: 'Category', dataIndex: 'type' },
                  { title: 'Days', dataIndex: 'duration', render: d => `${d} Hari` },
                  { title: 'Action', render: (_, record) => (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button size="small" icon={<EditOutlined />} onClick={() => { setEditingId(record.id); form.setFieldsValue(record); setIsModalOpen(true); }} />
                      <Button size="small" danger icon={<DeleteOutlined />} onClick={async () => { await axios.delete(`http://localhost:3001/packages/${record.id}`); fetchPackages(); }} />
                    </div>
                  )}
                ]}
              />
            </Card>
          )}
        </Content>

        <Modal title={editingId ? "Edit Paket" : "Tambah Paket"} open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={() => form.submit()} width={500}>
          <Form form={form} layout="vertical" size="small">
            <Form.Item name="name" label="Package Name" rules={[{required: true}]}><Input /></Form.Item>
            <Form.Item name="description" label="Detail Deskripsi" rules={[{required: true}]}><Input.TextArea rows={3} placeholder="Akan tampil di detail paket customer..." /></Form.Item>
            <Row gutter={10}>
              <Col span={12}><Form.Item name="quota" label="Quota (GB)"><InputNumber min={1} style={{width:'100%'}}/></Form.Item></Col>
              <Col span={12}>
                <Form.Item name="duration" label="Days (Masa Aktif)">
                  <Select>
                    <Select.Option value={1}>1 Hari</Select.Option>
                    <Select.Option value={3}>3 Hari</Select.Option>
                    <Select.Option value={5}>5 Hari</Select.Option>
                    <Select.Option value={7}>7 Hari</Select.Option>
                    <Select.Option value={28}>28 Hari</Select.Option>
                    <Select.Option value={30}>30 Hari</Select.Option>
                    <Select.Option value={31}>31 Hari</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="price" label="Price (Rp)"><InputNumber min={0} style={{width:'100%'}}/></Form.Item>
            <Form.Item name="type" label="Category Type">
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