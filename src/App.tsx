import { Navigate, Route, Routes } from "react-router-dom";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import Login from "./pages/Login";
import AdminLayout from "./layout/AdminLayout";
import DashboardOverview from "./pages/dashboard/Overview";
import OperationReport from "./pages/dashboard/OperationReport";
import ChangePassword from "./pages/system/ChangePassword";
import AdminUsers from "./pages/system/AdminUsers";
import Roles from "./pages/system/Roles";
import OpLogs from "./pages/system/OpLogs";

import PaymentQrcode from "./pages/operation/PaymentQrcode";
import HomeCategory from "./pages/operation/HomeCategory";
import Banners from "./pages/operation/Banners";
import ContactConfig from "./pages/operation/ContactConfig";
import ExchangeRate from "./pages/operation/ExchangeRate";

import UserList from "./pages/userFinance/UserList";
import RechargeList from "./pages/userFinance/RechargeList";
import BalanceLogList from "./pages/userFinance/BalanceLogList";

import ProductCategories from "./pages/goodsOrders/ProductCategories";
import ProductList from "./pages/goodsOrders/ProductList";
import ProductOrders from "./pages/goodsOrders/ProductOrders";

import BlessItems from "./pages/blessing/BlessItems";
import BlessDynamics from "./pages/blessing/BlessDynamics";
import BlessOrders from "./pages/blessing/BlessOrders";

import TributeCategories from "./pages/memorial/TributeCategories";
import Tributes from "./pages/memorial/Tributes";
import SacrificeDynamics from "./pages/memorial/SacrificeDynamics";
import CemeteryList from "./pages/memorial/CemeteryList";
import SacrificeOrders from "./pages/memorial/SacrificeOrders";

import Articles from "./pages/contentTeaching/Articles";
import Videos from "./pages/contentTeaching/Videos";
import Courseware from "./pages/contentTeaching/Courseware";
import One2One from "./pages/contentTeaching/One2One";
import Live from "./pages/contentTeaching/Live";

const App = () => {
  return (
    <ConfigProvider locale={zhCN} theme={{ token: { colorPrimary: "#1677ff" } }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Navigate to="/dashboard/overview" replace />} />

          <Route path="dashboard">
            <Route path="overview" element={<DashboardOverview />} />
            <Route path="operation-report" element={<OperationReport />} />
          </Route>

          <Route path="operation">
            <Route path="payment-qrcode" element={<PaymentQrcode />} />
            <Route path="home-category" element={<HomeCategory />} />
            <Route path="banners" element={<Banners />} />
            <Route path="contact" element={<ContactConfig />} />
            <Route path="exchange-rate" element={<ExchangeRate />} />
          </Route>

          <Route path="user-finance">
            <Route path="users" element={<UserList />} />
            <Route path="recharges" element={<RechargeList />} />
            <Route path="balance-logs" element={<BalanceLogList />} />
          </Route>

          <Route path="goods-orders">
            <Route path="categories" element={<ProductCategories />} />
            <Route path="products" element={<ProductList />} />
            <Route path="orders" element={<ProductOrders />} />
          </Route>

          <Route path="blessing">
            <Route path="items" element={<BlessItems />} />
            <Route path="dynamics" element={<BlessDynamics />} />
            <Route path="orders" element={<BlessOrders />} />
          </Route>

          <Route path="memorial">
            <Route path="categories" element={<TributeCategories />} />
            <Route path="tributes" element={<Tributes />} />
            <Route path="dynamics" element={<SacrificeDynamics />} />
            <Route path="cemetery" element={<CemeteryList />} />
            <Route path="orders" element={<SacrificeOrders />} />
          </Route>

          <Route path="content-teaching">
            <Route path="articles" element={<Articles />} />
            <Route path="videos" element={<Videos />} />
            <Route path="courseware" element={<Courseware />} />
            <Route path="one2one" element={<One2One />} />
            <Route path="live" element={<Live />} />
          </Route>

          <Route path="system">
            <Route path="change-password" element={<ChangePassword />} />
            <Route path="admins" element={<AdminUsers />} />
            <Route path="roles" element={<Roles />} />
            <Route path="op-logs" element={<OpLogs />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </ConfigProvider>
  );
};

export default App;

