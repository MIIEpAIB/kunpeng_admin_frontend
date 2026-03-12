import { Button, Card, DatePicker, Form, Input, Modal, Select, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { endpoints } from "../../api/endpoints";
import { getData, postData } from "../../api/request";

export default function BlessDynamics() {
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<{ label: string; value: number }[]>([]);

  const loadItems = async () => {
    const data = await getData<{ list: any[] }>(endpoints.blessItemAll);
    setItems((data.list || []).map((x) => ({ label: x.item_name, value: x.id })));
  };

  const fetchList = async (p = 1) => {
    const v = form.getFieldsValue();
    setLoading(true);
    try {
      const data = await getData<{ total: number; list: any[] }>(endpoints.blessDynamicList, {
        user_account: v.user_account || undefined,
        item_name: v.item_name || undefined,
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
    loadItems();
    fetchList(1);
  }, []);

  const columns: ColumnsType<any> = [
    { title: "用户账号", dataIndex: "user_account" },
    { title: "物件名称", dataIndex: "item_name" },
    { title: "祈福语", dataIndex: "blessing_message" },
    { title: "时间", dataIndex: "created_at", width: 180 }
  ];

  return (
    <Card
      title="祈福动态"
      extra={
        <Space>
          <Button onClick={() => fetchList(1)}>查询</Button>
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
          <Input allowClear style={{ width: 180 }} />
        </Form.Item>
        <Form.Item name="item_name" label="物件名称">
          <Input allowClear style={{ width: 180 }} />
        </Form.Item>
        <Form.Item name="range" label="时间范围">
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
        title="创建祈福动态"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={async () => {
          const v = await createForm.validateFields();
          await postData<any>(endpoints.blessDynamicCreate, v);
          setOpen(false);
          await fetchList(1);
        }}
        destroyOnClose
      >
        <Form form={createForm} layout="vertical">
          <Form.Item name="user_account" label="展示账号" rules={[{ required: true }]}>
            <Input placeholder="可自由输入" />
          </Form.Item>
          <Form.Item name="item_id" label="祈福物件" rules={[{ required: true }]}>
            <Select options={items} />
          </Form.Item>
          <Form.Item name="blessing_message" label="祈福语" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

