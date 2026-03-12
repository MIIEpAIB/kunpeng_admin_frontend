import { Card, Col, Row, Statistic } from "antd";

const Dashboard = () => {
  // 当前先静态展示，后续可对接统计接口
  return (
    <Row gutter={16}>
      <Col span={6}>
        <Card>
          <Statistic title="今日新增用户" value={0} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="今日实物订单数" value={0} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="今日祈福次数" value={0} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="今日祭祀次数" value={0} />
        </Card>
      </Col>
    </Row>
  );
};

export default Dashboard;

