import { Button, Card, DatePicker, Form, Input, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { endpoints } from "../../api/endpoints";
import { getData } from "../../api/request";

export default function BlessOrders() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);

  const fetchList = async (p = 1) => {
    const v = form.getFieldsValue();
    setLoading(true);
    try {
      const data = await getData<{ total: number; list: any[] }>(endpoints.blessOrderList, {
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
    fetchList(1);
  }, []);

  const columns: ColumnsType<any> = [
    { title: "用户账号", dataIndex: "user_account" },
    { title: "物件名称", dataIndex: "item_name" },
    { title: "单价(币)", dataIndex: "item_price" },
    { title: "数量", dataIndex: "quantity" },
    { title: "总价(币)", dataIndex: "total_price" },
    { title: "折合(元)", dataIndex: "rmb_amount" },
    { title: "时间", dataIndex: "created_at", width: 180 }
  ];

  return (
    <Card title="祈福订单">
      <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="user_account" label="用户账号">
          <Input allowClear style={{ width: 200 }} />
        </Form.Item>
        <Form.Item name="item_name" label="物件名称">
          <Input allowClear style={{ width: 200 }} />
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
    </Card>
  );
}

