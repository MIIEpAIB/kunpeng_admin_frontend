import { Button, Card, DatePicker, Form, Input, Modal, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { endpoints } from "../../api/endpoints";
import { getData, postData } from "../../api/request";

export default function ProductCategories() {
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
      const data = await getData<{ total: number; list: any[] }>(endpoints.productCategoryList, {
        category_name: v.category_name || undefined,
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
    { title: "ID", dataIndex: "id", width: 90 },
    { title: "分类名称", dataIndex: "category_name" },
    { title: "创建时间", dataIndex: "created_at", width: 180 },
    {
      title: "操作",
      width: 200,
      render: (_: any, record) => (
        <Space>
          <Button
            size="small"
            onClick={async () => {
              setEditingId(record.id);
              const d = await getData<any>(endpoints.productCategoryDetail, { id: record.id });
              editForm.setFieldsValue({ category_name: d.category_name });
              setOpen(true);
            }}
          >
            编辑
          </Button>
          <Button
            size="small"
            danger
            onClick={() => {
              Modal.confirm({
                title: "确认删除？",
                content: record.category_name,
                onOk: async () => {
                  await postData<any>(endpoints.productCategoryDelete, { id: record.id });
                  await fetchList(pageNum);
                }
              });
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
      title="商品分类"
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
        <Form.Item name="category_name" label="分类名称">
          <Input placeholder="模糊搜索" allowClear style={{ width: 220 }} />
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
        title={editingId ? "编辑分类" : "新增分类"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={async () => {
          const v = await editForm.validateFields();
          if (editingId) {
            await postData<any>(endpoints.productCategoryEdit, { id: editingId, ...v });
          } else {
            await postData<any>(endpoints.productCategoryAdd, v);
          }
          setOpen(false);
          await fetchList(1);
        }}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="category_name" label="分类名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

