import { useEffect, useState } from "react";
import { Card, Input, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import api, { ApiResponse } from "../api/client";

interface UserRow {
  id: number;
  mobile: string;
  nickname?: string;
  source: string;
  register_ip?: string;
  registered_at: string;
  last_login_at?: string;
  balance: number;
}

const Users = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [mobile, setMobile] = useState("");

  const fetchData = async (pageNo = 1) => {
    setLoading(true);
    try {
      const resp = await api.get<ApiResponse<{ total: number; list: UserRow[] }>>(
        "/api/admin/users",
        {
          params: {
            page: pageNo,
            page_size: 10,
            mobile: mobile || undefined
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

  const columns: ColumnsType<UserRow> = [
    { title: "用户账号", dataIndex: "mobile" },
    { title: "昵称", dataIndex: "nickname" },
    { title: "来源", dataIndex: "source" },
    { title: "账户余额", dataIndex: "balance" },
    { title: "注册时间", dataIndex: "registered_at" },
    { title: "最后登录时间", dataIndex: "last_login_at" }
  ];

  return (
    <Card title="用户列表">
      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <Input
          placeholder="输入用户名/手机号"
          value={mobile}
          style={{ width: 240 }}
          onChange={(e) => setMobile(e.target.value)}
          onPressEnter={() => fetchData(1)}
        />
      </div>
      <Table<UserRow>
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

export default Users;

