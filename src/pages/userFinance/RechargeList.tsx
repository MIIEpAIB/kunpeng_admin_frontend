import { Button, Card, DatePicker, Form, Input, Modal, Select, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { endpoints } from "../../api/endpoints";
import { getData, postData } from "../../api/request";

export default function RechargeList() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);

  const fetchList = async (p = 1) => {
    const v = form.getFieldsValue();
    setLoading(true);
    try {
      const data = await getData<{ total: number; list: any[] }>(endpoints.rechargeList, {
        user_account: v.user_account || undefined,
        status: v.status || undefined,
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
    { title: "充值时间", dataIndex: "recharge_time", width: 180 },
    { title: "金额", dataIndex: "amount" },
    {
      title: "状态",
      dataIndex: "status",
      render: (v: string) => {
        const color = v === "已成功" ? "green" : v === "处理中" ? "blue" : "red";
        return <Tag color={color}>{v}</Tag>;
      }
    },
    { title: "支付方式", dataIndex: "pay_method" },
    {
      title: "操作",
      width: 200,
      render: (_: any, record) => (
        <Space>
          <Button
            size="small"
            disabled={record.status !== "处理中"}
            onClick={() => {
              Modal.confirm({
                title: "确认充值？",
                content: `用户：${record.user_account}，金额：${record.amount}`,
                onOk: async () => {
                  await postData<any>(endpoints.rechargeConfirm, { recharge_id: record.id });
                  await fetchList(pageNum);
                }
              });
            }}
          >
            确认
          </Button>
          <Button
            size="small"
            danger
            disabled={record.status !== "处理中"}
            onClick={() => {
              Modal.confirm({
                title: "取消充值？",
                content: `用户：${record.user_account}，金额：${record.amount}`,
                onOk: async () => {
                  await postData<any>(endpoints.rechargeCancel, { recharge_id: record.id });
                  await fetchList(pageNum);
                }
              });
            }}
          >
            取消
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Card
      title="充值记录"
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
        <Form.Item name="status" label="状态" initialValue="all">
          <Select
            style={{ width: 140 }}
            options={[
              { value: "all", label: "全部" },
              { value: "success", label: "已成功" },
              { value: "failed", label: "已失败" },
              { value: "pending", label: "处理中" }
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

