import { Button, Card, DatePicker, Form, Input, InputNumber, Modal, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { endpoints } from "../../api/endpoints";
import { getData, postData } from "../../api/request";

export default function Live() {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchList = async (p = 1) => {
    const v = form.getFieldsValue();
    setLoading(true);
    try {
      const data = await getData<{ total: number; list: any[] }>(endpoints.teachingLiveList, {
        title: v.title || undefined,
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

  const statusTag = (s: number) => {
    if (s === 2) return <Tag color="default">已结束</Tag>;
    if (s === 1) return <Tag color="green">直播中</Tag>;
    return <Tag color="blue">未开始</Tag>;
  };

  const columns: ColumnsType<any> = [
    { title: "标题", dataIndex: "title" },
    { title: "直播时间", dataIndex: "live_time", width: 180 },
    { title: "推流地址", dataIndex: "stream_url" },
    { title: "状态", dataIndex: "status", width: 100, render: (v: number) => statusTag(v) },
    { title: "创建时间", dataIndex: "created_at", width: 180 },
    {
      title: "操作",
      width: 220,
      render: (_: any, record) => (
        <Space>
          <Button
            size="small"
            onClick={() => {
              setEditingId(record.id);
              editForm.setFieldsValue({
                title: record.title,
                live_time: record.live_time,
                duration_minutes: 60,
                stream_url: record.stream_url
              });
              setOpen(true);
            }}
          >
            编辑
          </Button>
          <Button
            size="small"
            danger
            onClick={async () => {
              await postData<any>(endpoints.teachingLiveDelete, { live_id: record.id });
              await fetchList(pageNum);
            }}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Card
      title="直播管理"
      extra={
        <Space>
          <Button onClick={() => fetchList(1)}>查询</Button>
          <Button
            type="primary"
            onClick={() => {
              setEditingId(null);
              editForm.resetFields();
              editForm.setFieldsValue({ duration_minutes: 60 });
              setOpen(true);
            }}
          >
            新增
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="title" label="标题">
          <Input allowClear style={{ width: 260 }} />
        </Form.Item>
        <Form.Item name="range" label="时间范围">
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

      <Modal
        title={editingId ? "编辑直播" : "新增直播"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={async () => {
          const v = await editForm.validateFields();
          if (editingId) {
            await postData<any>(endpoints.teachingLiveEdit, { live_id: editingId, ...v });
          } else {
            await postData<any>(endpoints.teachingLiveCreate, v);
          }
          setOpen(false);
          await fetchList(1);
        }}
        destroyOnClose
        width={720}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="live_time" label="直播时间（yyyy-MM-dd HH:mm:ss）" rules={[{ required: true }]}>
            <Input placeholder="2025-11-05 20:30:00" />
          </Form.Item>
          <Form.Item name="duration_minutes" label="直播时长(分钟)" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: 240 }} />
          </Form.Item>
          <Form.Item name="stream_url" label="推流地址" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

