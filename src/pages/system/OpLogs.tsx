import { Button, Card, Form, Input, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { endpoints } from "../../api/endpoints";
import { getData } from "../../api/request";

export default function OpLogs() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);

  const fetchList = async (p = 1) => {
    const v = form.getFieldsValue();
    setLoading(true);
    try {
      const res = await getData<any>(endpoints.adminLogList, {
        account: v.account || undefined,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: ColumnsType<any> = [
    { title: "管理员账号", dataIndex: "admin_account" },
    { title: "角色", dataIndex: "role_name" },
    { title: "操作", dataIndex: "action" },
    { title: "时间", dataIndex: "created_at" }
  ];

  return (
    <Card title="操作日志">
      <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="account" label="账号">
          <Input allowClear placeholder="模糊搜索" style={{ width: 220 }} />
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
    </Card>
  );
}

