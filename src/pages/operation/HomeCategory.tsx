import { Button, Card, Form, Input, message } from "antd";
import { useEffect, useState } from "react";
import { endpoints } from "../../api/endpoints";
import { getData, postData } from "../../api/request";

type Detail = {
  category1_name: string;
  category2_name: string;
  category3_name: string;
};

export default function HomeCategory() {
  const [form] = Form.useForm<Detail>();
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getData<Detail>(endpoints.homeCategoryDetail);
      form.setFieldsValue(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSave = async () => {
    const v = await form.validateFields();
    await postData<any>(endpoints.homeCategorySave, v);
    message.success("保存成功");
    await load();
  };

  return (
    <Card
      title="首页分类"
      loading={loading}
      extra={
        <Button type="primary" onClick={onSave}>
          保存
        </Button>
      }
      style={{ maxWidth: 720 }}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="category1_name" label="分类1" rules={[{ required: true }]}>
          <Input placeholder="如：热门商品" />
        </Form.Item>
        <Form.Item name="category2_name" label="分类2" rules={[{ required: true }]}>
          <Input placeholder="如：转运法宝" />
        </Form.Item>
        <Form.Item name="category3_name" label="分类3" rules={[{ required: true }]}>
          <Input placeholder="如：守护平安" />
        </Form.Item>
      </Form>
    </Card>
  );
}

