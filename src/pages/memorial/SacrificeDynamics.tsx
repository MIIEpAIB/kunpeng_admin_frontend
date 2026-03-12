import { Button, Card, DatePicker, Form, Input, Modal, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { endpoints } from "../../api/endpoints";
import { getData, postData } from "../../api/request";

export default function SacrificeDynamics() {
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [open, setOpen] = useState(false);

  const fetchList = async (p = 1) => {
    const v = form.getFieldsValue();
    const range = v.dateRange as [dayjs.Dayjs, dayjs.Dayjs] | undefined;
    setLoading(true);
    try {
      const res = await getData<any>(endpoints.sacrificeDynamicList, {
        user_account: v.user_account || undefined,
        tribute_name: v.tribute_name || undefined,
        start_date: range?.[0]?.format("YYYY-MM-DD"),
        end_date: range?.[1]?.format("YYYY-MM-DD"),
        page_num: p,
        page_size: 10
      });
      setRows(res.list || []);
      setTotal(res.total || 0);
      setPageNum(p);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(1);
  }, []);

  const columns: ColumnsType<any> = [
    { title: "用户账号", dataIndex: "user_account" },
    { title: "贡品名称", dataIndex: "tribute_name" },
    { title: "逝者", dataIndex: "deceased_name" },
    { title: "关系", dataIndex: "relationship" },
    { title: "哀文", dataIndex: "message" },
    { title: "祭祀时间", dataIndex: "created_at" }
  ];

  return (
    <Card
      title="祭祀动态"
      extra={
        <Space>
          <Button
            type="primary"
            onClick={() => {
              createForm.resetFields();
              setOpen(true);
            }}
          >
            创建动态
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="user_account" label="用户账号">
          <Input allowClear placeholder="模糊搜索" style={{ width: 180 }} />
        </Form.Item>
        <Form.Item name="tribute_name" label="贡品名称">
          <Input allowClear placeholder="模糊搜索" style={{ width: 180 }} />
        </Form.Item>
        <Form.Item name="dateRange" label="祭祀时间">
          <DatePicker.RangePicker />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" onClick={() => fetchList(1)}>
              查询
            </Button>
            <Button
              onClick={() => {
                form.resetFields();
                fetchList(1);
              }}
            >
              重置
            </Button>
          </Space>
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
        title="创建祭祀动态"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={async () => {
          const v = await createForm.validateFields();
          await postData<any>(endpoints.sacrificeDynamicCreate, v);
          setOpen(false);
          await fetchList(1);
        }}
        destroyOnClose
      >
        <Form form={createForm} layout="vertical">
          <Form.Item name="user_account" label="展示账号" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="tribute_name" label="贡品名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="deceased_name" label="供奉逝者" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="relationship" label="与逝者关系" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="message" label="祭奠哀文" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

