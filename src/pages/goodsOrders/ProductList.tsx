import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Switch,
  Table
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import ImageUpload from "../../components/ImageUpload";
import { endpoints } from "../../api/endpoints";
import { getData, postData } from "../../api/request";

export default function ProductList() {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [categories, setCategories] = useState<{ label: string; value: number }[]>([]);

  const loadCategories = async () => {
    const data = await getData<{ total: number; list: any[] }>(endpoints.productCategoryList, {
      page_num: 1,
      page_size: 500
    });
    setCategories(data.list.map((c) => ({ label: c.category_name, value: c.id })));
  };

  const fetchList = async (p = 1) => {
    const v = form.getFieldsValue();
    setLoading(true);
    try {
      const data = await getData<{ total: number; list: any[] }>(endpoints.productList, {
        product_name: v.product_name || undefined,
        category_id: v.category_id || undefined,
        zodiac: v.zodiac || undefined,
        is_home_display: v.is_home_display,
        home_category: v.home_category || undefined,
        stock_filter: v.stock_filter || undefined,
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
    form.setFieldsValue({ is_home_display: undefined });
    loadCategories();
    fetchList(1);
  }, []);

  const columns: ColumnsType<any> = [
    { title: "商品名称", dataIndex: "product_name" },
    { title: "分类", dataIndex: "category_name" },
    { title: "金额", dataIndex: "price" },
    { title: "适合生肖", dataIndex: "zodiac" },
    { title: "首页展示", dataIndex: "is_home_display" },
    { title: "首页分类", dataIndex: "home_category" },
    { title: "总库存", dataIndex: "total_stock" },
    { title: "已售", dataIndex: "sold_stock" },
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
              const d = await getData<any>(endpoints.productDetail, { id: record.id });
              editForm.setFieldsValue({
                product_name: d.product_name,
                category_id: d.category_id,
                price: d.price,
                zodiac: d.zodiac || [],
                initial_stock: d.initial_stock,
                is_home_display: d.is_home_display === 1,
                home_category: d.home_category || "",
                main_image: d.main_image || "",
                description: d.description || ""
              });
              setOpen(true);
            }}
          >
            编辑
          </Button>
          <Button
            size="small"
            danger
            onClick={() => {
              Modal.confirm({
                title: "确认删除？",
                content: record.product_name,
                onOk: async () => {
                  await postData<any>(endpoints.productDelete, { id: record.id });
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
      title="商品列表"
      extra={
        <Space>
          <Button onClick={() => fetchList(1)}>查询</Button>
          <Button
            type="primary"
            onClick={() => {
              setEditingId(null);
              editForm.resetFields();
              editForm.setFieldsValue({ is_home_display: false, zodiac: [] });
              setOpen(true);
            }}
          >
            新增
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="product_name" label="商品名称">
          <Input placeholder="模糊搜索" allowClear style={{ width: 200 }} />
        </Form.Item>
        <Form.Item name="category_id" label="分类">
          <Select allowClear style={{ width: 180 }} options={categories} />
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
        title={editingId ? "编辑商品" : "新增商品"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={async () => {
          const v = await editForm.validateFields();
          const payload = {
            product_name: v.product_name,
            category_id: v.category_id,
            price: v.price,
            zodiac: v.zodiac || [],
            initial_stock: v.initial_stock,
            is_home_display: v.is_home_display ? 1 : 0,
            home_category: v.is_home_display ? v.home_category : "",
            main_image: v.main_image || "",
            detail_images: [],
            blessing_images: [],
            description: v.description || ""
          };
          if (editingId) {
            await postData<any>(endpoints.productEdit, { id: editingId, ...payload });
          } else {
            await postData<any>(endpoints.productAdd, payload);
          }
          setOpen(false);
          await fetchList(1);
        }}
        destroyOnClose
        width={720}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="product_name" label="商品名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category_id" label="所属分类" rules={[{ required: true }]}>
            <Select options={categories} />
          </Form.Item>
          <Form.Item name="price" label="价格(元)" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: 240 }} />
          </Form.Item>
          <Form.Item name="initial_stock" label="初始库存" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: 240 }} />
          </Form.Item>
          <Form.Item name="zodiac" label="适合生肖（枚举值数组）">
            <Select mode="tags" style={{ width: "100%" }} placeholder="如 rat, ox, horse" />
          </Form.Item>
          <Form.Item name="is_home_display" label="首页展示" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item shouldUpdate noStyle>
            {() => {
              const show = !!editForm.getFieldValue("is_home_display");
              return (
                <Form.Item
                  name="home_category"
                  label="首页分类"
                  rules={show ? [{ required: true, message: "首页展示时必须填写" }] : []}
                >
                  <Input placeholder="如：热门产品/守护平安/转运法宝" disabled={!show} />
                </Form.Item>
              );
            }}
          </Form.Item>
          <Form.Item name="main_image" label="主图">
            <ImageUpload />
          </Form.Item>
          <Form.Item name="description" label="商品介绍（富文本HTML）">
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

