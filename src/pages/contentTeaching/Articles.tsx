import { Button, Card, DatePicker, Form, Input, InputNumber, Modal, Select, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import ImageUpload from "../../components/ImageUpload";
import { endpoints } from "../../api/endpoints";
import { getData, postData } from "../../api/request";

export default function Articles() {
  const [catForm] = Form.useForm();
  const [catEditForm] = Form.useForm();
  const [articleForm] = Form.useForm();
  const [loadingCats, setLoadingCats] = useState(false);
  const [cats, setCats] = useState<any[]>([]);
  const [catTotal, setCatTotal] = useState(0);
  const [catPage, setCatPage] = useState(1);

  const [loadingArticles, setLoadingArticles] = useState(false);
  const [articles, setArticles] = useState<any[]>([]);
  const [artTotal, setArtTotal] = useState(0);
  const [artPage, setArtPage] = useState(1);

  const [catModalOpen, setCatModalOpen] = useState(false);
  const [catEditingId, setCatEditingId] = useState<number | null>(null);

  const [artModalOpen, setArtModalOpen] = useState(false);
  const [artEditingId, setArtEditingId] = useState<number | null>(null);

  const fetchCats = async (p = 1) => {
    const v = catForm.getFieldsValue();
    setLoadingCats(true);
    try {
      const data = await getData<{ total: number; list: any[] }>(endpoints.metaphysicsCategoryList, {
        category_name: v.category_name || undefined,
        start_date: v.range?.[0]?.format?.("YYYY-MM-DD"),
        end_date: v.range?.[1]?.format?.("YYYY-MM-DD"),
        page_num: p,
        page_size: 10
      });
      setCats(data.list);
      setCatTotal(data.total);
      setCatPage(p);
    } finally {
      setLoadingCats(false);
    }
  };

  const fetchArticles = async (p = 1) => {
    const v = catForm.getFieldsValue();
    setLoadingArticles(true);
    try {
      const data = await getData<{ total: number; list: any[] }>(endpoints.metaphysicsArticleList, {
        title: v.title || undefined,
        start_date: v.artRange?.[0]?.format?.("YYYY-MM-DD"),
        end_date: v.artRange?.[1]?.format?.("YYYY-MM-DD"),
        page_num: p,
        page_size: 10
      });
      setArticles(data.list);
      setArtTotal(data.total);
      setArtPage(p);
    } finally {
      setLoadingArticles(false);
    }
  };

  useEffect(() => {
    fetchCats(1);
    fetchArticles(1);
  }, []);

  const catOptions = cats.map((c) => ({ label: c.category_name, value: c.id }));

  const catColumns: ColumnsType<any> = [
    { title: "ID", dataIndex: "id", width: 90 },
    { title: "分类名称", dataIndex: "category_name" },
    { title: "创建时间", dataIndex: "created_at", width: 180 },
    {
      title: "操作",
      width: 220,
      render: (_: any, record) => (
        <Space>
          <Button
            size="small"
            onClick={() => {
              setCatEditingId(record.id);
              catEditForm.setFieldsValue({ category_name: record.category_name });
              setCatModalOpen(true);
            }}
          >
            编辑
          </Button>
          <Button
            size="small"
            danger
            onClick={async () => {
              await postData<any>(endpoints.metaphysicsCategoryDelete, { id: record.id });
              await fetchCats(1);
            }}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  const artColumns: ColumnsType<any> = [
    { title: "标题", dataIndex: "title" },
    { title: "分类", dataIndex: "category_name", width: 160 },
    {
      title: "封面",
      dataIndex: "cover_image",
      width: 100,
      render: (v: string) => (v ? <a href={v} target="_blank" rel="noreferrer">查看</a> : "-")
    },
    { title: "创建时间", dataIndex: "created_at", width: 180 },
    {
      title: "操作",
      width: 220,
      render: (_: any, record) => (
        <Space>
          <Button
            size="small"
            onClick={async () => {
              setArtEditingId(record.id);
              const d = await getData<any>(endpoints.metaphysicsArticleDetail, { article_id: record.id });
              articleForm.setFieldsValue({
                title: d.title,
                category_id: d.category_id,
                cover_image: d.cover_image,
                content: d.content,
                publish_time: d.publish_time
              });
              setArtModalOpen(true);
            }}
          >
            编辑
          </Button>
          <Button
            size="small"
            danger
            onClick={async () => {
              await postData<any>(endpoints.metaphysicsArticleDelete, { article_id: record.id });
              await fetchArticles(artPage);
            }}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card
        title="玄学文化分类"
        extra={
          <Space>
            <Button onClick={() => fetchCats(1)}>查询</Button>
            <Button
              type="primary"
              onClick={() => {
                setCatEditingId(null);
                catEditForm.resetFields();
                setCatModalOpen(true);
              }}
            >
              新增分类
            </Button>
          </Space>
        }
      >
        <Form form={catForm} layout="inline" style={{ marginBottom: 16 }}>
          <Form.Item name="category_name" label="分类名称">
            <Input allowClear style={{ width: 220 }} />
          </Form.Item>
          <Form.Item name="range" label="创建时间">
            <DatePicker.RangePicker allowClear />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={() => fetchCats(1)}>
              查询
            </Button>
          </Form.Item>
        </Form>
        <Table
          rowKey="id"
          loading={loadingCats}
          columns={catColumns}
          dataSource={cats}
          pagination={{
            current: catPage,
            total: catTotal,
            pageSize: 10,
            onChange: (p) => fetchCats(p)
          }}
        />
      </Card>

      <Card
        title="玄学文化文章"
        extra={
          <Space>
            <Button onClick={() => fetchArticles(1)}>查询</Button>
            <Button
              type="primary"
              onClick={() => {
                setArtEditingId(null);
                articleForm.resetFields();
                setArtModalOpen(true);
              }}
            >
              新增文章
            </Button>
          </Space>
        }
      >
        <Form form={catForm} layout="inline" style={{ marginBottom: 16 }}>
          <Form.Item name="title" label="标题">
            <Input allowClear style={{ width: 260 }} />
          </Form.Item>
          <Form.Item name="artRange" label="发布时间">
            <DatePicker.RangePicker allowClear />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={() => fetchArticles(1)}>
              查询
            </Button>
          </Form.Item>
        </Form>
        <Table
          rowKey="id"
          loading={loadingArticles}
          columns={artColumns}
          dataSource={articles}
          pagination={{
            current: artPage,
            total: artTotal,
            pageSize: 10,
            onChange: (p) => fetchArticles(p)
          }}
        />
      </Card>

      <Modal
        title={catEditingId ? "编辑分类" : "新增分类"}
        open={catModalOpen}
        onCancel={() => setCatModalOpen(false)}
        onOk={async () => {
          const v = await catEditForm.validateFields();
          if (catEditingId) {
            await postData<any>(endpoints.metaphysicsCategoryEdit, { id: catEditingId, ...v });
          } else {
            await postData<any>(endpoints.metaphysicsCategoryAdd, v);
          }
          setCatModalOpen(false);
          await fetchCats(1);
        }}
        destroyOnClose
      >
        <Form form={catEditForm} layout="vertical">
          <Form.Item name="category_name" label="分类名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={artEditingId ? "编辑文章" : "新增文章"}
        open={artModalOpen}
        onCancel={() => setArtModalOpen(false)}
        onOk={async () => {
          const v = await articleForm.validateFields();
          if (artEditingId) {
            await postData<any>(endpoints.metaphysicsArticleEdit, { article_id: artEditingId, ...v });
          } else {
            await postData<any>(endpoints.metaphysicsArticleCreate, v);
          }
          setArtModalOpen(false);
          await fetchArticles(1);
        }}
        destroyOnClose
        width={820}
      >
        <Form form={articleForm} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category_id" label="所属分类" rules={[{ required: true }]}>
            <Select options={catOptions} />
          </Form.Item>
          <Form.Item name="cover_image" label="封面图" rules={[{ required: true }]}>
            <ImageUpload />
          </Form.Item>
          <Form.Item name="publish_time" label="发布时间（yyyy-MM-dd HH:mm:ss，可空）">
            <Input placeholder="2025-11-05 10:00:00" />
          </Form.Item>
          <Form.Item name="content" label="正文（HTML）">
            <Input.TextArea rows={6} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

