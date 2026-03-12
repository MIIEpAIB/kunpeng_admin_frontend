import { Button, Card, DatePicker, Form, Input, Modal, Select, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { endpoints } from "../../api/endpoints";
import { getData, postData } from "../../api/request";
import ImageUpload from "../../components/ImageUpload";

export default function CemeteryList() {
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [open, setOpen] = useState(false);

  const fetchList = async (p = 1) => {
    const v = form.getFieldsValue();
    const range = v.dateRange as [dayjs.Dayjs, dayjs.Dayjs] | undefined;
    setLoading(true);
    try {
      const res = await getData<any>(endpoints.cemeteryList, {
        user_account: v.user_account || undefined,
        deceased_name: v.deceased_name || undefined,
        start_date: range?.[0]?.format("YYYY-MM-DD"),
        end_date: range?.[1]?.format("YYYY-MM-DD"),
        page_num: p,
        page_size: 10
      });
      setRows(res.list || []);
      setTotal(res.total || 0);
      setPageNum(p);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: ColumnsType<any> = [
    { title: "创建账号", dataIndex: "user_account" },
    { title: "逝者姓名", dataIndex: "deceased_name" },
    { title: "关系", dataIndex: "relationship" },
    { title: "性别", dataIndex: "gender" },
    { title: "出生日期", dataIndex: "birth_date" },
    { title: "逝世日期", dataIndex: "death_date" },
    { title: "墓志铭", dataIndex: "epitaph" },
    { title: "创建时间", dataIndex: "created_at" }
  ];

  return (
    <Card
      title="网上陵园"
      extra={
        <Space>
          <Button
            type="primary"
            onClick={() => {
              createForm.resetFields();
              setOpen(true);
            }}
          >
            新增陵墓
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="user_account" label="创建账号">
          <Input allowClear placeholder="模糊搜索" style={{ width: 180 }} />
        </Form.Item>
        <Form.Item name="deceased_name" label="逝者姓名">
          <Input allowClear placeholder="模糊搜索" style={{ width: 180 }} />
        </Form.Item>
        <Form.Item name="dateRange" label="创建时间">
          <DatePicker.RangePicker />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" onClick={() => fetchList(1)}>
              查询
            </Button>
            <Button
              onClick={() => {
                form.resetFields();
                fetchList(1);
              }}
            >
              重置
            </Button>
          </Space>
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
        title="新增陵墓"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={async () => {
          const v = await createForm.validateFields();
          await postData<any>(endpoints.cemeteryCreate, v);
          setOpen(false);
          await fetchList(1);
        }}
        destroyOnClose
      >
        <Form form={createForm} layout="vertical">
          <Form.Item name="user_account" label="创建账号" rules={[{ required: true }]}>
            <Input placeholder="可自由输入展示账号" />
          </Form.Item>
          <Form.Item name="deceased_name" label="逝者姓名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="gender" label="性别" rules={[{ required: true }]}>
            <Select
              options={[
                { value: "男", label: "男" },
                { value: "女", label: "女" }
              ]}
            />
          </Form.Item>
          <Form.Item name="birth_date" label="出生日期">
            <Input placeholder="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="death_date" label="逝世日期">
            <Input placeholder="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="relationship" label="与逝者关系">
            <Input />
          </Form.Item>
          <Form.Item name="image_url" label="头像">
            <ImageUpload />
          </Form.Item>
          <Form.Item name="epitaph" label="墓志铭">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

