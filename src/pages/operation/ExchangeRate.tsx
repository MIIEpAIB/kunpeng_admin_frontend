import { Button, Card, Form, InputNumber, message } from "antd";
import { useEffect, useState } from "react";
import { endpoints } from "../../api/endpoints";
import { getData, postData } from "../../api/request";

type Detail = {
  blessing_coin_rate: number;
  memorial_coin_rate: number;
};

export default function ExchangeRate() {
  const [form] = Form.useForm<Detail>();
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getData<Detail>(endpoints.exchangeRateDetail);
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
    await postData<any>(endpoints.exchangeRateSave, v);
    message.success("保存成功");
    await load();
  };

  return (
    <Card
      title="虚拟币汇率"
      loading={loading}
      extra={
        <Button type="primary" onClick={onSave}>
          保存
        </Button>
      }
      style={{ maxWidth: 720 }}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="blessing_coin_rate" label="祈福币汇率（1人民币 = X祈福币）" rules={[{ required: true }]}>
          <InputNumber min={1} style={{ width: 240 }} />
        </Form.Item>
        <Form.Item name="memorial_coin_rate" label="纪念币汇率（1人民币 = X纪念币）" rules={[{ required: true }]}>
          <InputNumber min={1} style={{ width: 240 }} />
        </Form.Item>
      </Form>
    </Card>
  );
}

