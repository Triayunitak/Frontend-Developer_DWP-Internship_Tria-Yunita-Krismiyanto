import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, DatePicker, message, Card, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { Option } = Select;

const KelolaDiskon = ({ onSuccess }) => {
  const [discounts, setDiscounts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const res = await axios.get('http://localhost:3001/discounts');
      setDiscounts(res.data);
    } catch (err) {
      message.error("Gagal memuat data diskon");
    }
  };

  const onFinish = async (values) => {
    try {
      const formattedValues = {
        ...values,
        validUntil: values.validUntil.format('YYYY-MM-DD')
      };

      if (editingId) {
        await axios.put(`http://localhost:3001/discounts/${editingId}`, formattedValues);
        message.success("Diskon Diperbarui!");
      } else {
        await axios.post('http://localhost:3001/discounts', formattedValues);
        
        const newNotif = {
          message: `Promo Baru: ${values.name} Diskon ${values.percentage}%! Stok Terbatas: ${values.stock}`,
          date: new Date().toLocaleString(),
          type: "promo",
          read: false
        };
        await axios.post('http://localhost:3001/notifications', newNotif);
        
        message.success("Diskon Ditambahkan & Notifikasi Terkirim!");
      }
      
      setIsModalOpen(false);
      form.resetFields();
      fetchDiscounts();
      if (onSuccess) onSuccess(); 

    } catch (err) {
      message.error("Gagal menyimpan data");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/discounts/${id}`);
      message.success("Diskon Dihapus");
      fetchDiscounts();
    } catch (err) {
      message.error("Gagal menghapus");
    }
  };

  const openEditModal = (record) => {
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      validUntil: moment(record.validUntil, 'YYYY-MM-DD')
    });
    setIsModalOpen(true);
  };

  const columns = [
    { title: 'Nama Diskon', dataIndex: 'name', key: 'name' },
    { title: 'Persentase', dataIndex: 'percentage', key: 'percentage', render: (text) => `${text}%` },
    { title: 'Stok', dataIndex: 'stock', key: 'stock', render: (text) => <Tag color={text > 0 ? 'green' : 'red'}>{text}</Tag> }, // Kolom Stok Baru
    { 
      title: 'Tipe', dataIndex: 'type', key: 'type',
      render: (type) => <Tag color={type === 'Student' ? 'blue' : type === 'Professional' ? 'purple' : 'green'}>{type}</Tag>
    },
    { title: 'Berlaku Sampai', dataIndex: 'validUntil', key: 'validUntil' },
    {
      title: 'Aksi', key: 'action',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEditModal(record)} />
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(record.id)} />
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Card title="Manajemen Diskon" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingId(null); form.resetFields(); setIsModalOpen(true); }} style={{ background: 'var(--oren)', border: 'none' }}>Tambah Diskon</Button>}>
        <Table dataSource={discounts} columns={columns} rowKey="id" pagination={{ pageSize: 5 }} />
      </Card>

      <Modal title={editingId ? "Edit Diskon" : "Tambah Diskon"} open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={() => form.submit()}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="Nama Diskon" rules={[{ required: true }]}><Input placeholder="Contoh: Promo Merdeka" /></Form.Item>
          <Form.Item name="percentage" label="Persentase (%)" rules={[{ required: true }]}><InputNumber min={1} max={100} style={{ width: '100%' }} /></Form.Item>
          
          {/* INPUT STOK BARU */}
          <Form.Item name="stock" label="Stok Diskon" rules={[{ required: true, message: 'Masukkan jumlah stok' }]}>
            <InputNumber min={1} style={{ width: '100%' }} placeholder="Contoh: 10" />
          </Form.Item>

          <Form.Item name="type" label="Segmen Customer" rules={[{ required: true }]}>
            <Select><Option value="General">General (Semua)</Option><Option value="Student">Student (Pelajar)</Option><Option value="Professional">Professional</Option></Select>
          </Form.Item>
          <Form.Item name="validUntil" label="Berlaku Sampai" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default KelolaDiskon;