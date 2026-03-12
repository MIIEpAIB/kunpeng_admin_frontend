import { Button, Card, DatePicker, Form, Input, Modal, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import ImageUpload from "../../components/ImageUpload";
import { endpoints } from "../../api/endpoints";
import { getData, postData } from "../../api/request";

export default function Courseware() {
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
      const data = await getData<{ total: number; list: any[] }>(endpoints.teachingCoursewareList, {
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

  const columns: ColumnsType<any> = [
    { title: "标题", dataIndex: "title" },
    { title: "封面", dataIndex: "cover_image", width: 100, render: (v: string) => (v ? <a href={v} target="_blank" rel="noreferrer">查看</a> : "-") },
    { title: "创建时间", dataIndex: "created_at", width: 180 },
    {
      title: "操作",
      width: 220,
      render: (_: any, record) => (
        <Space>
          <Button
            size="small"
            onClick={async () => {
              setEditingId(record.id);
              const d = await getData<any>(endpoints.teachingCoursewareDetail, { courseware_id: record.id });
              editForm.setFieldsValue({
                title: d.title,
                cover_image: d.cover_image,
                file_url: d.file_url,
                publish_time: d.publish_time
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
              await postData<any>(endpoints.teachingCoursewareDelete, { courseware_id: record.id });
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
      title="课件管理"
      extra={
        <Space>
          <Button onClick={() => fetchList(1)}>查询</Button>
          <Button
            type="primary"
            onClick={() => {
              setEditingId(null);
              editForm.resetFields();
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
        title={editingId ? "编辑课件" : "新增课件"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={async () => {
          const v = await editForm.validateFields();
          if (editingId) {
            await postData<any>(endpoints.teachingCoursewareEdit, { courseware_id: editingId, ...v });
          } else {
            await postData<any>(endpoints.teachingCoursewareCreate, v);
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
          <Form.Item name="cover_image" label="封面">
            <ImageUpload />
          </Form.Item>
          <Form.Item name="file_url" label="课件文件链接" rules={[{ required: true }]}>
            <Input placeholder="https://.../file.pdf" />
          </Form.Item>
          <Form.Item name="publish_time" label="发布时间（可空）">
            <Input placeholder="2025-11-05 10:00:00" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

