import { useEffect, useState } from "react";
import { Card, Input, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import api, { ApiResponse } from "../api/client";

interface ProductRow {
  id: number;
  name: string;
  category_id: number;
  category_name?: string;
  price: number;
  stock: number;
  zodiacs: string[];
  is_home_show: boolean;
  home_section?: string;
}

const Products = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ProductRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [name, setName] = useState("");

  const fetchData = async (pageNo = 1) => {
    setLoading(true);
    try {
      const resp = await api.get<ApiResponse<{ total: number; list: ProductRow[] }>>(
        "/api/admin/products",
        {
          params: {
            page: pageNo,
            page_size: 10,
            name: name || undefined
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

  const columns: ColumnsType<ProductRow> = [
    { title: "商品名称", dataIndex: "name" },
    { title: "所属分类", dataIndex: "category_name" },
    { title: "金额(元)", dataIndex: "price" },
    {
      title: "适合生肖",
      dataIndex: "zodiacs",
      render: (zodiacs: string[]) =>
        zodiacs?.map((z) => (
          <Tag key={z} color="blue">
            {z}
          </Tag>
        ))
    },
    { title: "总件/库存", dataIndex: "stock" },
    {
      title: "首页展示",
      dataIndex: "is_home_show",
      render: (v: boolean) => (v ? <Tag color="green">是</Tag> : <Tag>否</Tag>)
    },
    { title: "首页分类", dataIndex: "home_section" }
  ];

  return (
    <Card title="商品列表">
      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <Input
          placeholder="商品名称"
          value={name}
          style={{ width: 240 }}
          onChange={(e) => setName(e.target.value)}
          onPressEnter={() => fetchData(1)}
        />
      </div>
      <Table<ProductRow>
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data}
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

export default Products;

