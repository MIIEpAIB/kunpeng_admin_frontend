import { Button, Card, DatePicker, Form, Input, Select, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { endpoints } from "../../api/endpoints";
import { getData } from "../../api/request";

export default function BalanceLogList() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);

  const fetchList = async (p = 1) => {
    const v = form.getFieldsValue();
    setLoading(true);
    try {
      const data = await getData<{ total: number; list: any[] }>(endpoints.balanceLogList, {
        user_account: v.user_account || undefined,
        type: v.type || undefined,
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
    form.setFieldsValue({ type: "all" });
    fetchList(1);
  }, []);

  const columns: ColumnsType<any> = [
    { title: "用户账号", dataIndex: "user_account" },
    { title: "时间", dataIndex: "created_at", width: 180 },
    { title: "类型", dataIndex: "type" },
    { title: "变动前", dataIndex: "before_balance" },
    { title: "变动金额", dataIndex: "change_amount" },
    { title: "变动后", dataIndex: "after_balance" }
  ];

  return (
    <Card
      title="账变记录"
      extra={
        <Button type="primary" onClick={() => fetchList(1)}>
          查询
        </Button>
      }
    >
      <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="user_account" label="用户账号">
          <Input placeholder="手机号/账号" allowClear style={{ width: 220 }} />
        </Form.Item>
        <Form.Item name="type" label="类型">
          <Select
            style={{ width: 160 }}
            options={[
              { value: "all", label: "全部" },
              { value: "recharge", label: "充值" },
              { value: "purchase", label: "购买商品" },
              { value: "sacrifice", label: "网上祭祀" },
              { value: "blessing", label: "网上祈福" }
            ]}
          />
        </Form.Item>
        <Form.Item name="range" label="时间范围">
          <DatePicker.RangePicker allowClear />
        </Form.Item>
        <Form.Item>
          <Button onClick={() => fetchList(1)}>查询</Button>
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

