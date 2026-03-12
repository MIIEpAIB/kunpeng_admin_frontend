import { Button, Card, DatePicker, Form, Input, InputNumber, Modal, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import ImageUpload from "../../components/ImageUpload";
import { endpoints } from "../../api/endpoints";
import { getData, postData } from "../../api/request";

type Row = {
  id: number;
  title: string;
  image_url: string;
  sort: number;
  link_url: string;
  created_at: string;
};

type ListResp = { total: number; list: Row[] };

type EditBody = { title: string; image_url: string; sort: number; link_url: string };

export default function Banners() {
  const [queryForm] = Form.useForm();
  const [editForm] = Form.useForm<EditBody>();

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchList = async (p = 1) => {
    const v = queryForm.getFieldsValue();
    setLoading(true);
    try {
      const resp = await getData<ListResp>(endpoints.bannerList, {
        title: v.title || undefined,
        start_date: v.range?.[0]?.format?.("YYYY-MM-DD"),
        end_date: v.range?.[1]?.format?.("YYYY-MM-DD"),
        page_num: p,
        page_size: 10
      });
      setRows(resp.list);
      setTotal(resp.total);
      setPageNum(p);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(1);
  }, []);

  const openAdd = () => {
    setEditingId(null);
    editForm.setFieldsValue({ title: "", image_url: "", sort: 0, link_url: "" });
    setOpen(true);
  };

  const openEdit = async (id: number) => {
    setEditingId(id);
    const data = await getData<Row>(endpoints.bannerDetail, { id });
    editForm.setFieldsValue({
      title: data.title,
      image_url: data.image_url,
      sort: data.sort,
      link_url: data.link_url
    });
    setOpen(true);
  };

  const onSave = async () => {
    const v = await editForm.validateFields();
    if (editingId) {
      await postData<any>(endpoints.bannerEdit, { id: editingId, ...v });
    } else {
      await postData<any>(endpoints.bannerAdd, v);
    }
    setOpen(false);
    await fetchList(pageNum);
  };

  const columns: ColumnsType<Row> = [
    { title: "排序", dataIndex: "sort", width: 80 },
    { title: "标题", dataIndex: "title" },
    {
      title: "图片",
      dataIndex: "image_url",
      render: (v: string) => (v ? <a href={v} target="_blank" rel="noreferrer">查看</a> : "-")
    },
    { title: "跳转链接", dataIndex: "link_url" },
    { title: "创建时间", dataIndex: "created_at", width: 180 },
    {
      title: "操作",
      width: 160,
      render: (_: any, record) => (
        <Space>
          <Button size="small" onClick={() => openEdit(record.id)}>
            编辑
          </Button>
          <Button
            size="small"
            danger
            onClick={() => {
              Modal.confirm({
                title: "确认删除？",
                content: record.title || `ID=${record.id}`,
                onOk: async () => {
                  await postData<any>(endpoints.bannerDelete, { id: record.id });
                  await fetchList(pageNum);
                }
              });
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
      title="首页轮播图"
      extra={
        <Space>
          <Button onClick={() => fetchList(1)}>查询</Button>
          <Button type="primary" onClick={openAdd}>
            新增
          </Button>
        </Space>
      }
    >
      <Form form={queryForm} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="title" label="标题">
          <Input placeholder="模糊搜索" style={{ width: 220 }} allowClear />
        </Form.Item>
        <Form.Item name="range" label="创建时间">
          <DatePicker.RangePicker allowClear />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={() => fetchList(1)}>
            查询
          </Button>
        </Form.Item>
      </Form>

      <Table<Row>
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
        title={editingId ? "编辑轮播图" : "新增轮播图"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={onSave}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true, message: "请输入标题" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="image_url" label="图片" rules={[{ required: true, message: "请上传图片" }]}>
            <ImageUpload />
          </Form.Item>
          <Form.Item name="sort" label="排序（越小越靠前）" rules={[{ required: true }]}>
            <InputNumber style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="link_url" label="跳转链接（可空）">
            <Input placeholder="https://..." />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

