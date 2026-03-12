import { Button, Card, Space, Switch, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import ImageUpload from "../../components/ImageUpload";
import { endpoints } from "../../api/endpoints";
import { getData, postData } from "../../api/request";

type Row = {
  id: number;
  pay_type: "wechat" | "alipay" | string;
  pay_type_name: string;
  qrcode_url: string;
  status: number;
};

export default function PaymentQrcode() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getData<Row[]>(endpoints.paymentQrcodeList);
      setRows(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const columns: ColumnsType<Row> = [
    { title: "支付方式", dataIndex: "pay_type_name" },
    {
      title: "二维码",
      dataIndex: "qrcode_url",
      render: (_: any, record) => (
        <ImageUpload
          value={record.qrcode_url}
          onChange={(v) => {
            setRows((prev) => prev.map((r) => (r.id === record.id ? { ...r, qrcode_url: v } : r)));
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
            setRows((prev) => prev.map((r) => (r.id === record.id ? { ...r, status: checked ? 1 : 0 } : r)));
          }}
        />
      )
    }
  ];

  return (
    <Card
      title="收款码配置"
      extra={
        <Space>
          <Button onClick={load}>刷新</Button>
          <Button
            type="primary"
            onClick={async () => {
              await postData<any>(endpoints.paymentQrcodeSave, { list: rows });
              await load();
            }}
          >
            保存
          </Button>
        </Space>
      }
    >
      <Table<Row> rowKey="id" loading={loading} columns={columns} dataSource={rows} pagination={false} />
      <div style={{ marginTop: 12, color: "#666" }}>
        提示：上传图片走通用接口，保存后才会写入配置。
      </div>
    </Card>
  );
}

