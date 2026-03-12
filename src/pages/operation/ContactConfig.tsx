import { Button, Card, Input, Space, Switch, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { endpoints } from "../../api/endpoints";
import { getData, postData } from "../../api/request";

type Row = {
  contact_type: string;
  contact_type_name: string;
  account_list: string[];
  status: number;
};

type Resp = { list: Row[] };

export default function ContactConfig() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getData<Resp>(endpoints.contactDetail);
      setRows(data.list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const columns: ColumnsType<Row> = [
    { title: "类型", dataIndex: "contact_type_name" },
    {
      title: "账号列表（每行一个）",
      dataIndex: "account_list",
      render: (_: any, record) => (
        <Input.TextArea
          value={(record.account_list || []).join("\n")}
          rows={3}
          onChange={(e) => {
            const lines = e.target.value
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean);
            setRows((prev) =>
              prev.map((r) => (r.contact_type === record.contact_type ? { ...r, account_list: lines } : r))
            );
          }}
        />
      )
    },
    {
      title: "状态",
      dataIndex: "status",
      render: (_: any, record) => (
        <Switch
          checked={record.status === 1}
          onChange={(checked) => {
            setRows((prev) =>
              prev.map((r) => (r.contact_type === record.contact_type ? { ...r, status: checked ? 1 : 0 } : r))
            );
          }}
        />
      )
    }
  ];

  return (
    <Card
      title="专家联系方式"
      extra={
        <Space>
          <Button onClick={load}>刷新</Button>
          <Button
            type="primary"
            onClick={async () => {
              await postData<any>(endpoints.contactSave, { list: rows.map(({ contact_type, account_list, status }) => ({ contact_type, account_list, status })) });
              await load();
            }}
          >
            保存
          </Button>
        </Space>
      }
    >
      <Table<Row> rowKey="contact_type" loading={loading} columns={columns} dataSource={rows} pagination={false} />
    </Card>
  );
}

