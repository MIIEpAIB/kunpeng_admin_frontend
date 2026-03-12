import { Button, Card, DatePicker, Form, Input, Modal, Select, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { endpoints } from "../../api/endpoints";
import { getData, postData } from "../../api/request";

export default function ProductOrders() {
  const [form] = Form.useForm();
  const [shipForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [shipOpen, setShipOpen] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [expressList, setExpressList] = useState<string[]>([]);

  const fetchList = async (p = 1) => {
    const v = form.getFieldsValue();
    setLoading(true);
    try {
      const data = await getData<{ total: number; list: any[] }>(endpoints.productOrderList, {
        order_no: v.order_no || undefined,
        user_account: v.user_account || undefined,
        product_name: v.product_name || undefined,
        pay_status: v.pay_status || "all",
        ship_status: v.ship_status || "all",
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

  const loadExpress = async () => {
    const data = await getData<{ list: string[] }>(endpoints.expressCompanies);
    setExpressList(data.list || []);
  };

  useEffect(() => {
    form.setFieldsValue({ pay_status: "all", ship_status: "all" });
    loadExpress();
    fetchList(1);
  }, []);

  const openDetail = async (orderId: number) => {
    const d = await getData<any>(endpoints.productOrderDetail, { order_id: orderId });
    setDetail(d);
    setDetailOpen(true);
  };

  const columns: ColumnsType<any> = [
    { title: "下单时间", dataIndex: "order_time", width: 180 },
    { title: "订单号", dataIndex: "order_no" },
    { title: "用户账号", dataIndex: "user_account" },
    { title: "商品名称", dataIndex: "product_name" },
    { title: "数量", dataIndex: "quantity", width: 80 },
    { title: "总额", dataIndex: "total_amount" },
    { title: "付款状态", dataIndex: "pay_status" },
    { title: "发货状态", dataIndex: "ship_status" },
    {
      title: "操作",
      width: 260,
      render: (_: any, record) => (
        <Space>
          <Button size="small" onClick={() => openDetail(record.id)}>
            详情
          </Button>
          <Button
            size="small"
            disabled={record.pay_status !== "已付款" || record.ship_status !== "未发货"}
            onClick={() => {
              setCurrentId(record.id);
              shipForm.resetFields();
              shipForm.setFieldsValue({ express_company: expressList[0] });
              setShipOpen(true);
            }}
          >
            发货
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Card title="实物订单">
      <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="order_no" label="订单号">
          <Input allowClear style={{ width: 200 }} />
        </Form.Item>
        <Form.Item name="user_account" label="用户账号">
          <Input allowClear style={{ width: 180 }} />
        </Form.Item>
        <Form.Item name="product_name" label="商品名称">
          <Input allowClear style={{ width: 180 }} />
        </Form.Item>
        <Form.Item name="pay_status" label="付款状态">
          <Select
            style={{ width: 140 }}
            options={[
              { value: "all", label: "全部" },
              { value: "unpaid", label: "未付款" },
              { value: "paid", label: "已付款" }
            ]}
          />
        </Form.Item>
        <Form.Item name="ship_status" label="发货状态">
          <Select
            style={{ width: 140 }}
            options={[
              { value: "all", label: "全部" },
              { value: "unshipped", label: "未发货" },
              { value: "shipped", label: "已发货" },
              { value: "received", label: "已收货" }
            ]}
          />
        </Form.Item>
        <Form.Item name="range" label="下单时间">
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

      <Modal title="订单详情" open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={720}>
        {detail ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div>订单号：{detail.order_no}</div>
            <div>商品：{detail.product_name} × {detail.quantity}</div>
            <div>金额：{detail.total_amount}</div>
            <div>付款状态：{detail.pay_status}</div>
            <div>发货状态：{detail.ship_status}</div>
            <div>物流：{detail.express_company} {detail.express_no}</div>
            <div>收货人：{detail.receiver_name} {detail.receiver_phone}</div>
            <div>地址：{detail.receiver_address}</div>
          </div>
        ) : null}
      </Modal>

      <Modal
        title="确认发货"
        open={shipOpen}
        onCancel={() => setShipOpen(false)}
        onOk={async () => {
          const v = await shipForm.validateFields();
          await postData<any>(endpoints.productOrderShip, {
            order_id: currentId,
            express_company: v.express_company,
            express_no: v.express_no
          });
          setShipOpen(false);
          await fetchList(pageNum);
        }}
        destroyOnClose
      >
        <Form form={shipForm} layout="vertical">
          <Form.Item name="express_company" label="物流公司" rules={[{ required: true }]}>
            <Select options={expressList.map((x) => ({ value: x, label: x }))} />
          </Form.Item>
          <Form.Item name="express_no" label="物流单号" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

