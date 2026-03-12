import { Card, Col, DatePicker, Row, Statistic } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { endpoints } from "../../api/endpoints";
import { getData } from "../../api/request";

type OverviewData = {
  total_users: number;
  today_registered: number;
  today_recharge_count: number;
  today_recharge_amount: number;
  goods_payment_total: number;
  memorial_consume_total: number;
  blessing_consume_total: number;
  users_total_balance: number;
};

export default function DashboardOverview() {
  const [date, setDate] = useState<string | undefined>(undefined);
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async (d?: string) => {
    setLoading(true);
    try {
      const resp = await getData<OverviewData>(endpoints.dashboardOverview, d ? { date: d } : undefined);
      setData(resp);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card
        title="今日概况"
        extra={
          <DatePicker
            value={date ? dayjs(date) : undefined}
            onChange={(v) => {
              const d = v ? v.format("YYYY-MM-DD") : undefined;
              setDate(d);
              load(d);
            }}
          />
        }
        loading={loading}
      >
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Statistic title="用户总数" value={data?.total_users ?? 0} />
          </Col>
          <Col span={6}>
            <Statistic title="今日新增" value={data?.today_registered ?? 0} />
          </Col>
          <Col span={6}>
            <Statistic title="今日充值笔数" value={data?.today_recharge_count ?? 0} />
          </Col>
          <Col span={6}>
            <Statistic title="今日充值金额(元)" value={data?.today_recharge_amount ?? 0} precision={2} />
          </Col>
          <Col span={6}>
            <Statistic title="商品收款(元)" value={data?.goods_payment_total ?? 0} precision={2} />
          </Col>
          <Col span={6}>
            <Statistic title="祭祀消费(元)" value={data?.memorial_consume_total ?? 0} precision={2} />
          </Col>
          <Col span={6}>
            <Statistic title="祈福消费(元)" value={data?.blessing_consume_total ?? 0} precision={2} />
          </Col>
          <Col span={6}>
            <Statistic title="用户余额总计(元)" value={data?.users_total_balance ?? 0} precision={2} />
          </Col>
        </Row>
      </Card>
    </div>
  );
}

