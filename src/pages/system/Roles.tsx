import { Button, Card, Checkbox, Form, Input, Modal, Popconfirm, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import { endpoints } from "../../api/endpoints";
import { getData, postData } from "../../api/request";

type PermGroup = { module: string; children: { id: string; name: string }[] };

export default function Roles() {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [permGroups, setPermGroups] = useState<PermGroup[]>([]);

  const allPermOptions = useMemo(() => {
    return permGroups.flatMap((g) => g.children.map((c) => ({ label: `${g.module} / ${c.name}`, value: c.id })));
  }, [permGroups]);

  const fetchPermGroups = async () => {
    const res = await getData<any>(endpoints.rolePermissions);
    setPermGroups(res || []);
  };

  const fetchList = async (p = 1) => {
    const v = form.getFieldsValue();
    setLoading(true);
    try {
      const res = await getData<any>(endpoints.roleList, {
        name: v.name || undefined,
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
    fetchPermGroups().then(() => fetchList(1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: ColumnsType<any> = [
    { title: "角色名", dataIndex: "name" },
    {
      title: "权限",
      dataIndex: "permissions",
      render: (v) => (Array.isArray(v) ? v.join(", ") : "")
    },
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
              editForm.setFieldsValue({ id: r.id, name: r.name, permissions: r.permissions || [] });
              setOpen(true);
            }}
          >
            编辑
          </a>
          <Popconfirm
            title="确认删除该角色？"
            onConfirm={async () => {
              await postData<any>(endpoints.roleDelete, { id: r.id });
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
      title="角色管理"
      extra={
        <Button
          type="primary"
          onClick={() => {
            setEditing(null);
            editForm.resetFields();
            setOpen(true);
          }}
        >
          新增角色
        </Button>
      }
    >
      <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="name" label="角色名">
          <Input allowClear placeholder="模糊搜索" style={{ width: 220 }} />
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
        title={editing ? "编辑角色" : "新增角色"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={async () => {
          const v = await editForm.validateFields();
          if (editing) {
            await postData<any>(endpoints.roleEdit, v);
          } else {
            await postData<any>(endpoints.roleCreate, { name: v.name, permissions: v.permissions });
          }
          setOpen(false);
          await fetchList(1);
        }}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical">
          {editing && (
            <Form.Item name="id" hidden>
              <Input />
            </Form.Item>
          )}
          <Form.Item name="name" label="角色名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="permissions" label="权限" rules={[{ required: true }]}>
            <Checkbox.Group options={allPermOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

