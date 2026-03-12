import { Button, Card, DatePicker, Form, Input, Modal, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { endpoints } from "../../api/endpoints";
import { getData, postData } from "../../api/request";

export default function UserList() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);

  const [openAdd, setOpenAdd] = useState(false);
  const [openPwd, setOpenPwd] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [detail, setDetail] = useState<any>(null);

  const [addForm] = Form.useForm();
  const [pwdForm] = Form.useForm();

  const fetchList = async (p = 1) => {
    const v = form.getFieldsValue();
    setLoading(true);
    try {
      const data = await getData<{ total: number; list: any[] }>(endpoints.userList, {
        user_account: v.user_account || undefined,
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

  const openDetail = async (id: number) => {
    setCurrentId(id);
    const d = await getData<any>(endpoints.userDetail, { user_id: id });
    setDetail(d);
    setDetailOpen(true);
  };

  const columns: ColumnsType<any> = [
    { title: "用户账号", dataIndex: "user_account" },
    { title: "昵称", dataIndex: "nickname" },
    { title: "余额", dataIndex: "balance" },
    { title: "来源", dataIndex: "source" },
    { title: "注册时间", dataIndex: "created_at" },
    {
      title: "操作",
      width: 220,
      render: (_: any, record) => (
        <Space>
          <Button size="small" onClick={() => openDetail(record.id)}>
            详情
          </Button>
          <Button
            size="small"
            onClick={() => {
              setCurrentId(record.id);
              pwdForm.resetFields();
              setOpenPwd(true);
            }}
          >
            改密码
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Card
      title="用户列表"
      extra={
        <Space>
          <Button onClick={() => fetchList(1)}>查询</Button>
          <Button
            type="primary"
            onClick={() => {
              addForm.resetFields();
              setOpenAdd(true);
            }}
          >
            新增用户
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="user_account" label="用户账号">
          <Input placeholder="手机号/账号" allowClear style={{ width: 220 }} />
        </Form.Item>
        <Form.Item name="range" label="注册时间">
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
        title="新增用户"
        open={openAdd}
        onCancel={() => setOpenAdd(false)}
        onOk={async () => {
          const v = await addForm.validateFields();
          await postData<any>(endpoints.userAdd, v);
          setOpenAdd(false);
          await fetchList(1);
        }}
        destroyOnClose
      >
        <Form form={addForm} layout="vertical">
          <Form.Item name="user_account" label="用户账号" rules={[{ required: true }]}>
            <Input placeholder="手机号/账号" />
          </Form.Item>
          <Form.Item name="nickname" label="昵称">
            <Input />
          </Form.Item>
          <Form.Item name="password" label="登录密码" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="修改用户密码"
        open={openPwd}
        onCancel={() => setOpenPwd(false)}
        onOk={async () => {
          const v = await pwdForm.validateFields();
          await postData<any>(endpoints.userPasswordEdit, { user_id: currentId, new_password: v.new_password });
          setOpenPwd(false);
          await fetchList(pageNum);
        }}
        destroyOnClose
      >
        <Form form={pwdForm} layout="vertical">
          <Form.Item name="new_password" label="新密码" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="用户详情" open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={720}>
        {detail ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div>账号：{detail.user_account}</div>
            <div>昵称：{detail.nickname}</div>
            <div>余额：{detail.balance}</div>
            <div>注册IP：{detail.register_ip}</div>
            <div>最后登录：{detail.last_login_at}</div>
            <div>地址数：{detail.addresses?.length || 0}</div>
          </div>
        ) : null}
      </Modal>
    </Card>
  );
}

