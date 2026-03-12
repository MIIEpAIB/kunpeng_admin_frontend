import { Button, Card, DatePicker, Form, Input, InputNumber, Modal, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import ImageUpload from "../../components/ImageUpload";
import { endpoints } from "../../api/endpoints";
import { getData, postData } from "../../api/request";

export default function BlessItems() {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchList = async (p = 1) => {
    const v = form.getFieldsValue();
    setLoading(true);
    try {
      const data = await getData<{ total: number; list: any[] }>(endpoints.blessItemList, {
        item_name: v.item_name || undefined,
        min_price: v.min_price ?? undefined,
        max_price: v.max_price ?? undefined,
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
    fetchList(1);
  }, []);

  const columns: ColumnsType<any> = [
    { title: "物件名称", dataIndex: "item_name" },
    { title: "图片", dataIndex: "image_url", render: (v: string) => (v ? <a href={v} target="_blank" rel="noreferrer">查看</a> : "-") },
    { title: "价格(祈福币)", dataIndex: "price" },
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
              const d = await getData<any>(endpoints.blessItemDetail, { id: record.id });
              editForm.setFieldsValue({
                item_name: d.item_name,
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
              await postData<any>(endpoints.blessItemDelete, { id: record.id });
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
      title="祈福物件"
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
        <Form.Item name="item_name" label="名称">
          <Input allowClear style={{ width: 180 }} />
        </Form.Item>
        <Form.Item name="min_price" label="最小价">
          <InputNumber min={0} />
        </Form.Item>
        <Form.Item name="max_price" label="最大价">
          <InputNumber min={0} />
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
        title={editingId ? "编辑物件" : "新增物件"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={async () => {
          const v = await editForm.validateFields();
          if (editingId) {
            await postData<any>(endpoints.blessItemEdit, { id: editingId, ...v });
          } else {
            await postData<any>(endpoints.blessItemAdd, v);
          }
          setOpen(false);
          await fetchList(1);
        }}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="item_name" label="物件名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="image_url" label="物件图片">
            <ImageUpload />
          </Form.Item>
          <Form.Item name="price" label="价格(祈福币)" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: 240 }} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

