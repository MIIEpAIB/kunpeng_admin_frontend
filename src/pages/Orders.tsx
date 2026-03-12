import { useEffect, useState } from "react";
import { Card, Input, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import api, { ApiResponse } from "../api/client";

interface OrderItem {
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
  amount: number;
}

interface OrderRow {
  id: number;
  order_no: string;
  user_id: number;
  user_mobile: string;
  amount_total: number;
  pay_status: string;
  ship_status: string;
  express_company?: string;
  tracking_no?: string;
  created_at: string;
  items: OrderItem[];
}

const Orders = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [orderNo, setOrderNo] = useState("");
  const [mobile, setMobile] = useState("");

  const fetchData = async (pageNo = 1) => {
    setLoading(true);
    try {
      const resp = await api.get<ApiResponse<{ total: number; list: OrderRow[] }>>(
        "/api/admin/orders/products",
        {
          params: {
            page: pageNo,
            page_size: 10,
            order_no: orderNo || undefined,
            user_mobile: mobile || undefined
          }
        }
      );
      if (resp.data.code === 0) {
        setData(resp.data.data.list);
        setTotal(resp.data.data.total);
        setPage(pageNo);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, []);

  const columns: ColumnsType<OrderRow> = [
    { title: "下单时间", dataIndex: "created_at" },
    { title: "订单号", dataIndex: "order_no" },
    { title: "用户账号", dataIndex: "user_mobile" },
    { title: "订单总额", dataIndex: "amount_total" },
    {
      title: "付款状态",
      dataIndex: "pay_status",
      render: (v: string) =>
        v === "paid" ? <Tag color="green">已付款</Tag> : <Tag>未付款</Tag>
    },
    {
      title: "货品状态",
      dataIndex: "ship_status",
      render: (v: string) => {
        if (v === "shipped") return <Tag color="blue">已发货</Tag>;
        if (v === "received") return <Tag color="green">已收货</Tag>;
        return <Tag>未发货</Tag>;
      }
    }
  ];

  return (
    <Card title="商品订单列表">
      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <Input
          placeholder="订单号"
          value={orderNo}
          style={{ width: 200 }}
          onChange={(e) => setOrderNo(e.target.value)}
        />
        <Input
          placeholder="用户账号"
          value={mobile}
          style={{ width: 200 }}
          onChange={(e) => setMobile(e.target.value)}
          onPressEnter={() => fetchData(1)}
        />
      </div>
      <Table<OrderRow>
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data}
        expandable={{
          expandedRowRender: (record) => (
            <ul style={{ margin: 0, paddingLeft: 24 }}>
              {record.items.map((it) => (
                <li key={it.product_id}>
                  {it.product_name} × {it.quantity} = {it.amount}
                </li>
              ))}
            </ul>
          )
        }}
        pagination={{
          current: page,
          total,
          pageSize: 10,
          onChange: (p) => fetchData(p)
        }}
      />
    </Card>
  );
};

export default Orders;

