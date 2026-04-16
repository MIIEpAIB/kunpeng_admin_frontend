import { Button, Card, Input, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { endpoints } from "../../api/endpoints";
import { getData, postData } from "../../api/request";
import ImageUpload from "../../components/ImageUpload";

type Row = {
  key: string;
  id?: number;
  avatar_url?: string;
  name: string;
  title?: string;
  wechat?: string;
  mobile?: string;
};

type ExpertItem = {
  id: number;
  avatar_url: string;
  name: string;
  title: string;
  wechat: string;
  mobile: string;
};

type Resp = { list: ExpertItem[] };

export default function ContactConfig() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);

  const updateRow = (key: string, patch: Partial<Row>) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        key: `tmp_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        name: "",
        title: "",
        wechat: "",
        mobile: "",
        avatar_url: "",
      },
    ]);
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await getData<Resp>(endpoints.contactDetail);
      setRows((data.list || []).map((r) => ({ ...r, key: String(r.id) })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const columns: ColumnsType<Row> = [
    {
      title: "专家头像",
      dataIndex: "avatar_url",
      width: 140,
      render: (_: any, record) => (
        <ImageUpload value={record.avatar_url || ""} onChange={(v) => updateRow(record.key, { avatar_url: v })} />
      ),
    },
    {
      title: "专家名字",
      dataIndex: "name",
      render: (_: any, record) => (
        <Input
          value={record.name}
          placeholder="请输入专家名字"
          onChange={(e) => updateRow(record.key, { name: e.target.value })}
        />
      ),
    },
    {
      title: "荣誉",
      dataIndex: "title",
      render: (_: any, record) => (
        <Input
          value={record.title || ""}
          placeholder="请输入荣誉"
          onChange={(e) => updateRow(record.key, { title: e.target.value })}
        />
      ),
    },
    {
      title: "联系方式(微信)",
      dataIndex: "wechat",
      render: (_: any, record) => (
        <Input
          value={record.wechat || ""}
          placeholder="请输入微信"
          onChange={(e) => updateRow(record.key, { wechat: e.target.value })}
        />
      ),
    },
    {
      title: "联系方式(联系电话)",
      dataIndex: "mobile",
      render: (_: any, record) => (
        <Input
          value={record.mobile || ""}
          placeholder="请输入联系电话"
          onChange={(e) => updateRow(record.key, { mobile: e.target.value })}
        />
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 90,
      render: (_: any, record) => (
        <Button danger size="small" onClick={() => setRows((prev) => prev.filter((r) => r.key !== record.key))}>
          删除
        </Button>
      ),
    },
  ];

  return (
    <Card
      title="专家信息"
      extra={
        <Space>
          <Button onClick={load}>刷新</Button>
          <Button onClick={addRow}>新增专家</Button>
          <Button
            type="primary"
            onClick={async () => {
              await postData<any>(endpoints.contactSave, {
                list: rows
                  .filter((r) => r.name.trim())
                  .map(({ avatar_url, name, title, wechat, mobile }) => ({
                    avatar_url: avatar_url || "",
                    name: name.trim(),
                    title: title || "",
                    wechat: wechat || "",
                    mobile: mobile || "",
                  })),
              });
              await load();
            }}
          >
            保存
          </Button>
        </Space>
      }
    >
      <Table<Row> rowKey="key" loading={loading} columns={columns} dataSource={rows} pagination={false} />
    </Card>
  );
}

