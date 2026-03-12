import { Button, Card, Form, Input, message } from "antd";
import { endpoints } from "../../api/endpoints";
import { postData } from "../../api/request";
import { useNavigate } from "react-router-dom";

type Body = {
  old_password: string;
  new_password: string;
  confirm_password: string;
};

export default function ChangePassword() {
  const [form] = Form.useForm<Body>();
  const navigate = useNavigate();

  const onFinish = async (v: Body) => {
    await postData<any>(endpoints.adminChangePassword, v);
    message.success("修改成功，请重新登录");
    localStorage.removeItem("admin_token");
    navigate("/login");
  };

  return (
    <Card title="修改密码" style={{ maxWidth: 520 }}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="old_password" label="原密码" rules={[{ required: true }]}>
          <Input.Password placeholder="请输入原密码" />
        </Form.Item>
        <Form.Item name="new_password" label="新密码" rules={[{ required: true }]}>
          <Input.Password placeholder="请输入新密码" />
        </Form.Item>
        <Form.Item
          name="confirm_password"
          label="确认新密码"
          dependencies={["new_password"]}
          rules={[
            { required: true },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("new_password") === value) return Promise.resolve();
                return Promise.reject(new Error("两次输入的新密码不一致"));
              }
            })
          ]}
        >
          <Input.Password placeholder="请再次输入新密码" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            保存
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

