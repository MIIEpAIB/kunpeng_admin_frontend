import { Button, Dropdown, Layout, Menu } from "antd";
import {
  UserOutlined,
  ShopOutlined,
  ProfileOutlined,
  DashboardOutlined,
  SettingOutlined,
  BarChartOutlined,
  ThunderboltOutlined,
  HeartOutlined,
  CoffeeOutlined,
  ReadOutlined,
  SafetyOutlined
} from "@ant-design/icons";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const selectedKey = location.pathname;
  const openKeys = [location.pathname.split("/").slice(0, 3).join("/")];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible>
        <div className="logo">鲲鹏易道商城管理后台</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          defaultOpenKeys={openKeys}
          items={[
            {
              key: "/dashboard/overview",
              icon: <DashboardOutlined />,
              label: <Link to="/dashboard/overview">今日概况</Link>
            },
            {
              key: "/dashboard",
              icon: <BarChartOutlined />,
              label: "运营报表",
              children: [
                {
                  key: "/dashboard/operation-report",
                  label: <Link to="/dashboard/operation-report">运营报表</Link>
                }
              ]
            },
            {
              key: "/operation",
              icon: <ThunderboltOutlined />,
              label: "运营管理",
              children: [
                { key: "/operation/payment-qrcode", label: <Link to="/operation/payment-qrcode">收款码配置</Link> },
                { key: "/operation/home-category", label: <Link to="/operation/home-category">首页分类</Link> },
                { key: "/operation/banners", label: <Link to="/operation/banners">首页轮播图</Link> },
                { key: "/operation/contact", label: <Link to="/operation/contact">专家信息</Link> },
                { key: "/operation/exchange-rate", label: <Link to="/operation/exchange-rate">虚拟币汇率</Link> }
              ]
            },
            {
              key: "/user-finance",
              icon: <UserOutlined />,
              label: "用户与资金",
              children: [
                { key: "/user-finance/users", label: <Link to="/user-finance/users">用户列表</Link> },
                { key: "/user-finance/recharges", label: <Link to="/user-finance/recharges">充值记录</Link> },
                { key: "/user-finance/balance-logs", label: <Link to="/user-finance/balance-logs">账变记录</Link> }
              ]
            },
            {
              key: "/goods-orders",
              icon: <ShopOutlined />,
              label: "商品与订单",
              children: [
                { key: "/goods-orders/categories", label: <Link to="/goods-orders/categories">商品分类</Link> },
                { key: "/goods-orders/products", label: <Link to="/goods-orders/products">商品列表</Link> },
                { key: "/goods-orders/orders", label: <Link to="/goods-orders/orders">实物订单</Link> }
              ]
            },
            {
              key: "/blessing",
              icon: <HeartOutlined />,
              label: "网上祈福",
              children: [
                { key: "/blessing/items", label: <Link to="/blessing/items">祈福物件</Link> },
                { key: "/blessing/dynamics", label: <Link to="/blessing/dynamics">祈福动态</Link> },
                { key: "/blessing/orders", label: <Link to="/blessing/orders">祈福订单</Link> }
              ]
            },
            {
              key: "/memorial",
              icon: <CoffeeOutlined />,
              label: "网上祭祀",
              children: [
                { key: "/memorial/categories", label: <Link to="/memorial/categories">贡品分类</Link> },
                { key: "/memorial/tributes", label: <Link to="/memorial/tributes">贡品列表</Link> },
                { key: "/memorial/dynamics", label: <Link to="/memorial/dynamics">祭祀动态</Link> },
                { key: "/memorial/orders", label: <Link to="/memorial/orders">消费订单</Link> },
                { key: "/memorial/cemetery", label: <Link to="/memorial/cemetery">网上陵园</Link> }
              ]
            },
            {
              key: "/content-teaching",
              icon: <ReadOutlined />,
              label: "内容与教学",
              children: [
                { key: "/content-teaching/articles", label: <Link to="/content-teaching/articles">玄学文章</Link> },
                { key: "/content-teaching/videos", label: <Link to="/content-teaching/videos">教学视频</Link> },
                { key: "/content-teaching/courseware", label: <Link to="/content-teaching/courseware">课件管理</Link> },
                { key: "/content-teaching/one2one", label: <Link to="/content-teaching/one2one">一对一教学</Link> },
                { key: "/content-teaching/live", label: <Link to="/content-teaching/live">直播管理</Link> }
              ]
            },
            {
              key: "/system",
              icon: <SafetyOutlined />,
              label: "系统设置",
              children: [
                { key: "/system/change-password", label: <Link to="/system/change-password">修改密码</Link> },
                { key: "/system/admins", label: <Link to="/system/admins">管理员管理</Link> },
                { key: "/system/roles", label: <Link to="/system/roles">角色管理</Link> },
                { key: "/system/op-logs", label: <Link to="/system/op-logs">操作日志</Link> }
              ]
            }
          ]}
        />
      </Sider>
      <Layout>
        <Header className="header-bar">
          <div className="header-right">
            <Dropdown
              menu={{
                items: [
                  {
                    key: "changePassword",
                    icon: <SettingOutlined />,
                    label: "修改密码",
                    onClick: () => navigate("/system/change-password")
                  },
                  {
                    key: "logout",
                    danger: true,
                    label: "退出登录",
                    onClick: () => {
                      localStorage.removeItem("admin_token");
                      navigate("/login");
                    }
                  }
                ]
              }}
            >
              <Button type="text">管理员</Button>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: 16 }}>
          <div className="content-card">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;

