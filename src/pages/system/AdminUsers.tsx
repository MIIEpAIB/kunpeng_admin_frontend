import { Button, Card, Form, Input, Modal, Popconfirm, Select, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import { endpoints } from "../../api/endpoints";
import { getData, postData } from "../../api/request";

type RoleOption = { id: number; name: string };

export default function AdminUsers() {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [roles, setRoles] = useState<RoleOption[]>([]);

  const roleOptions = useMemo(() => roles.map((r) => ({ value: r.id, label: r.name })), [roles]);

  const fetchRoles = async () => {
    const list = await getData<any>(endpoints.adminRoles);
    setRoles(list || []);
  };

  const fetchList = async (p = 1) => {
    const v = form.getFieldsValue();
    setLoading(true);
    try {
      const res = await getData<any>(endpoints.adminList, {
        account: v.account || undefined,
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
    fetchRoles().then(() => fetchList(1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: ColumnsType<any> = [
    { title: "账号", dataIndex: "account" },
    { title: "角色", dataIndex: "role_name" },
    { title: "创建时间", dataIndex: "created_at" },
    {
      title: "操作",
      width: 220,
      render: (_, r) => (
        <Space>
          <a
            onClick={(e) => {
              e.preventDefault();
              setEditing(r);
              editForm.setFieldsValue({
                admin_id: r.id,
                role_id: roles.find((x) => x.name === r.role_name)?.id,
                password: ""
              });
              setOpen(true);
            }}
          >
            编辑
          </a>
          <Popconfirm
            title="确认删除该管理员？"
            onConfirm={async () => {
              await postData<any>(endpoints.adminDelete, { admin_id: r.id });
              await fetchList(1);
            }}
          >
            <a>删除</a>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <Card
      title="管理员管理"
      extra={
        <Button
          type="primary"
          onClick={() => {
            setEditing(null);
            editForm.resetFields();
            setOpen(true);
          }}
        >
          新增管理员
        </Button>
      }
    >
      <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="account" label="账号">
          <Input allowClear placeholder="模糊搜索" style={{ width: 200 }} />
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
        title={editing ? "编辑管理员" : "新增管理员"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={async () => {
          const v = await editForm.validateFields();
          if (editing) {
            const payload: any = { admin_id: editing.id, role_id: v.role_id };
            if (v.password) payload.password = v.password;
            await postData<any>(endpoints.adminEdit, payload);
          } else {
            await postData<any>(endpoints.adminCreate, v);
          }
          setOpen(false);
          await fetchList(1);
        }}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical">
          {!editing && (
            <Form.Item name="account" label="账号" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          )}
          {!editing && (
            <Form.Item name="password" label="密码" rules={[{ required: true }]}>
              <Input.Password />
            </Form.Item>
          )}
          {editing && (
            <Form.Item name="password" label="重置密码">
              <Input.Password placeholder="不填则不修改" />
            </Form.Item>
          )}
          <Form.Item name="role_id" label="角色" rules={[{ required: true }]}>
            <Select options={roleOptions} placeholder="请选择角色" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

