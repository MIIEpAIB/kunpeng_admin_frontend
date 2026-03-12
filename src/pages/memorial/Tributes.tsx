import { Button, Card, DatePicker, Form, Input, InputNumber, Modal, Select, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import ImageUpload from "../../components/ImageUpload";
import { endpoints } from "../../api/endpoints";
import { getData, postData } from "../../api/request";

export default function Tributes() {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [cats, setCats] = useState<{ label: string; value: number }[]>([]);

  const loadCats = async () => {
    const data = await getData<{ list: any[] }>(endpoints.sacrificeCategoryAll);
    setCats((data.list || []).map((x) => ({ label: x.category_name, value: x.id })));
  };

  const fetchList = async (p = 1) => {
    const v = form.getFieldsValue();
    setLoading(true);
    try {
      const data = await getData<{ total: number; list: any[] }>(endpoints.tributeList, {
        tribute_name: v.tribute_name || undefined,
        category_id: v.category_id || undefined,
        start_date: v.range?.[0]?.format?.("YYYY-MM-DD"),
        end_date: v.range?.[1]?.format?.("YYYY-MM-DD"),
        page_num: p,
        page_size: 10
      });
      setRows(data.list);
      setTotal(data.total);
      setPageNum(p);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCats();
    fetchList(1);
  }, []);

  const columns: ColumnsType<any> = [
    { title: "贡品名称", dataIndex: "tribute_name" },
    { title: "分类", dataIndex: "category_name" },
    { title: "图片", dataIndex: "image_url", render: (v: string) => (v ? <a href={v} target="_blank" rel="noreferrer">查看</a> : "-") },
    { title: "价格(纪念币)", dataIndex: "price" },
    { title: "创建时间", dataIndex: "created_at", width: 180 },
    {
      title: "操作",
      width: 220,
      render: (_: any, record) => (
        <Space>
          <Button
            size="small"
            onClick={async () => {
              setEditingId(record.id);
              const d = await getData<any>(endpoints.tributeDetail, { id: record.id });
              editForm.setFieldsValue({
                tribute_name: d.tribute_name,
                category_id: d.category_id,
                image_url: d.image_url,
                price: d.price
              });
              setOpen(true);
            }}
          >
            编辑
          </Button>
          <Button
            size="small"
            danger
            onClick={async () => {
              await postData<any>(endpoints.tributeDelete, { id: record.id });
              await fetchList(pageNum);
            }}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Card
      title="贡品列表"
      extra={
        <Space>
          <Button onClick={() => fetchList(1)}>查询</Button>
          <Button
            type="primary"
            onClick={() => {
              setEditingId(null);
              editForm.resetFields();
              setOpen(true);
            }}
          >
            新增
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="tribute_name" label="贡品名称">
          <Input allowClear style={{ width: 180 }} />
        </Form.Item>
        <Form.Item name="category_id" label="分类">
          <Select allowClear style={{ width: 180 }} options={cats} />
        </Form.Item>
        <Form.Item name="range" label="创建时间">
          <DatePicker.RangePicker allowClear />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={() => fetchList(1)}>
            查询
          </Button>
        </Form.Item>
      </Form>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={rows}
        pagination={{
          current: pageNum,
          total,
          pageSize: 10,
          onChange: (p) => fetchList(p)
        }}
      />

      <Modal
        title={editingId ? "编辑贡品" : "新增贡品"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={async () => {
          const v = await editForm.validateFields();
          if (editingId) {
            await postData<any>(endpoints.tributeEdit, { id: editingId, ...v });
          } else {
            await postData<any>(endpoints.tributeAdd, v);
          }
          setOpen(false);
          await fetchList(1);
        }}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="tribute_name" label="贡品名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category_id" label="所属分类" rules={[{ required: true }]}>
            <Select options={cats} />
          </Form.Item>
          <Form.Item name="image_url" label="贡品图片">
            <ImageUpload />
          </Form.Item>
          <Form.Item name="price" label="价格(纪念币)" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: 240 }} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

