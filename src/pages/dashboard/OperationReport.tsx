import { Button, Card, DatePicker, Form, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { endpoints } from "../../api/endpoints";
import { getData } from "../../api/request";
import { downloadByGet } from "../../utils/download";

type Row = {
  date: string;
  shopping_user_count: number;
  shopping_amount: number;
  blessing_user_count: number;
  blessing_amount: number;
  memorial_user_count: number;
  memorial_amount: number;
  shopping_order_count: number;
};

type Resp = {
  total: number;
  list: Row[];
  summary: {
    total_shopping_user_count: number;
    total_shopping_amount: number;
    total_blessing_user_count: number;
    total_blessing_amount: number;
    total_memorial_user_count: number;
    total_memorial_amount: number;
    total_shopping_order_count: number;
  };
};

export default function OperationReport() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Row[]>([]);
  const [summary, setSummary] = useState<Resp["summary"] | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchList = async (p = 1) => {
    const v = form.getFieldsValue();
    const params = {
      start_date: v.range?.[0]?.format?.("YYYY-MM-DD"),
      end_date: v.range?.[1]?.format?.("YYYY-MM-DD"),
      page_num: p,
      page_size: 10
    };
    setLoading(true);
    try {
      const resp = await getData<Resp>(endpoints.operationReportList, params);
      setData(resp.list);
      setSummary(resp.summary);
      setTotal(resp.total);
      setPageNum(p);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const end = dayjs();
    const start = end.subtract(30, "day");
    form.setFieldsValue({ range: [start, end] });
    fetchList(1);
  }, []);

  const columns: ColumnsType<Row> = [
    { title: "日期", dataIndex: "date" },
    { title: "购物人数", dataIndex: "shopping_user_count" },
    { title: "购物金额", dataIndex: "shopping_amount" },
    { title: "祈福人数", dataIndex: "blessing_user_count" },
    { title: "祈福金额", dataIndex: "blessing_amount" },
    { title: "祭祀人数", dataIndex: "memorial_user_count" },
    { title: "祭祀金额", dataIndex: "memorial_amount" },
    { title: "购物订单数", dataIndex: "shopping_order_count" }
  ];

  return (
    <Card
      title="运营报表"
      extra={
        <Space>
          <Button
            onClick={async () => {
              const v = form.getFieldsValue();
              await downloadByGet(
                endpoints.operationReportExport,
                {
                  start_date: v.range?.[0]?.format?.("YYYY-MM-DD"),
                  end_date: v.range?.[1]?.format?.("YYYY-MM-DD")
                },
                "operation_report.csv"
              );
            }}
          >
            导出
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="range" label="日期范围">
          <DatePicker.RangePicker allowClear />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={() => fetchList(1)}>
            查询
          </Button>
        </Form.Item>
      </Form>

      <Table<Row>
        rowKey="date"
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={{
          current: pageNum,
          total,
          pageSize: 10,
          onChange: (p) => fetchList(p)
        }}
        summary={() => {
          if (!summary) return null;
          return (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0}>总计</Table.Summary.Cell>
              <Table.Summary.Cell index={1}>{summary.total_shopping_user_count}</Table.Summary.Cell>
              <Table.Summary.Cell index={2}>{summary.total_shopping_amount}</Table.Summary.Cell>
              <Table.Summary.Cell index={3}>{summary.total_blessing_user_count}</Table.Summary.Cell>
              <Table.Summary.Cell index={4}>{summary.total_blessing_amount}</Table.Summary.Cell>
              <Table.Summary.Cell index={5}>{summary.total_memorial_user_count}</Table.Summary.Cell>
              <Table.Summary.Cell index={6}>{summary.total_memorial_amount}</Table.Summary.Cell>
              <Table.Summary.Cell index={7}>{summary.total_shopping_order_count}</Table.Summary.Cell>
            </Table.Summary.Row>
          );
        }}
      />
    </Card>
  );
}

