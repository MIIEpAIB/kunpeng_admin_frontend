import { Card, DatePicker, Form, Input, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { endpoints } from "../../api/endpoints";
import { getData } from "../../api/request";

export default function SacrificeOrders() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);

  const fetchList = async (p = 1) => {
    const v = form.getFieldsValue();
    const range = v.dateRange as [dayjs.Dayjs, dayjs.Dayjs] | undefined;
    setLoading(true);
    try {
      const res = await getData<any>(endpoints.sacrificeOrderList, {
        user_account: v.user_account || undefined,
        tribute_name: v.tribute_name || undefined,
        category_id: v.category_id ? Number(v.category_id) : undefined,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: ColumnsType<any> = [
    { title: "用户账号", dataIndex: "user_account" },
    { title: "贡品名称", dataIndex: "tribute_name" },
    { title: "贡品分类", dataIndex: "category_name" },
    { title: "逝者", dataIndex: "deceased_name" },
    { title: "单价(纪念币)", dataIndex: "unit_price" },
    { title: "数量", dataIndex: "quantity" },
    { title: "总价(纪念币)", dataIndex: "total_price" },
    { title: "折合人民币", dataIndex: "rmb_equivalent" },
    { title: "消费时间", dataIndex: "created_at" }
  ];

  return (
    <Card title="祭祀消费订单">
      <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="user_account" label="用户账号">
          <Input allowClear placeholder="模糊搜索" style={{ width: 180 }} />
        </Form.Item>
        <Form.Item name="tribute_name" label="贡品名称">
          <Input allowClear placeholder="模糊搜索" style={{ width: 180 }} />
        </Form.Item>
        <Form.Item name="category_id" label="分类ID">
          <Input allowClear placeholder="可选" style={{ width: 120 }} />
        </Form.Item>
        <Form.Item name="dateRange" label="消费时间">
          <DatePicker.RangePicker />
        </Form.Item>
        <Form.Item>
          <Space>
            <a
              onClick={(e) => {
                e.preventDefault();
                fetchList(1);
              }}
            >
              查询
            </a>
            <a
              onClick={(e) => {
                e.preventDefault();
                form.resetFields();
                fetchList(1);
              }}
            >
              重置
            </a>
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

