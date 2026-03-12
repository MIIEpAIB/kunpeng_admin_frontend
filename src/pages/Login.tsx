import { Button, Card, Form, Input, message } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { endpoints } from "../api/endpoints";
import { getData, postData } from "../api/request";

interface LoginFormValues {
  username: string;
  password: string;
  captcha: string;
  captcha_key?: string;
}

const Login = () => {
  const navigate = useNavigate();
  const [captchaKey, setCaptchaKey] = useState<string>("");
  const [captchaImage, setCaptchaImage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const loadCaptcha = async () => {
    const data = await getData<{ captcha_key: string; captcha_image: string }>(
      endpoints.captchaImage
    );
    setCaptchaKey(data.captcha_key);
    setCaptchaImage(data.captcha_image);
  };

  useEffect(() => {
    loadCaptcha();
  }, []);

  const onFinish = async (values: LoginFormValues) => {
    try {
      setLoading(true);
      const data = await postData<any>(endpoints.adminLogin, {
        ...values,
        captcha_key: captchaKey
      });
      localStorage.setItem("admin_token", data.token);
      message.success("登录成功");
      navigate("/dashboard/overview");
    } catch (err: any) {
      message.error(err?.response?.data?.detail || "登录失败");
      await loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Card title="鲲鹏易道商城管理后台" className="login-card">
        <Form<LoginFormValues> onFinish={onFinish}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: "请输入登录账号" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="登录账号" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "请输入登录密码" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="登录密码" />
          </Form.Item>
          <Form.Item
            name="captcha"
            rules={[{ required: true, message: "请输入验证码" }]}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Input placeholder="验证码" />
              <div
                style={{ width: 120, height: 40, cursor: "pointer" }}
                onClick={loadCaptcha}
                title="点击刷新"
              >
                {captchaImage ? (
                  <img
                    src={captchaImage}
                    alt="captcha"
                    style={{ width: "120px", height: "40px", objectFit: "contain" }}
                  />
                ) : (
                  <div style={{ width: 120, height: 40, background: "#f0f0f0" }} />
                )}
              </div>
            </div>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;

