"use client";
import Link from "next/link";
import React from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieLabelRenderProps
} from "recharts";

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalVariants: number;
  totalBuildRequests: number;
  totalUsers: number;
  totalOrders: number;
  totalInboxMessages: number;
  totalBuildPartsAvailable: number;
  productTrend: number;
  categoryTrend: number;
  variantTrend: number;
  buildRequestTrend: number;
  userTrend: number;
  orderTrend: number;
  inboxTrend: number;
  buildPartsTrend: number;
}

interface AdminDashboardProps {
  stats: DashboardStats;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
  iconBg: string;
  trend?: "up" | "down";
  trendValue?: string;
  link: string;
}

interface ChartDataItem {
  [key: string]: number | string;
  name: string;
  value: number;
  color: string;
}

interface OverviewDataItem {
  [key: string]: number | string;
  category: string;
  count: number;
}

interface EngagementDataItem {
  [key: string]: number | string;
  name: string;
  value: number;
}

// ---------- Stat Card Component ----------
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  gradient,
  iconBg,
  trend,
  trendValue,
  link
}) => (
    <Link href={link}>
  <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`${iconBg} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}
        >
          {icon}
        </div>
        {trend && trendValue && (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              trend === "up" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {trend === "up" ? "↑" : "↓"} {trendValue}%
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
      </div>
    </div>
    <div className={`h-1 ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
  </div>
  </Link>
);

// ---------- Admin Dashboard Component ----------
const AdminDashboard: React.FC<AdminDashboardProps> = ({ stats }) => {
  // ---------- Pie & Bar chart data ----------
  const categoryData: ChartDataItem[] = [
    { name: "Products", value: stats.totalProducts, color: "#EF4444" }, // red
    { name: "Variants", value: stats.totalVariants, color: "#10B981" }, // green
    { name: "Build Parts", value: stats.totalBuildPartsAvailable, color: "#F59E0B" }, // yellow
    { name: "Categories", value: stats.totalCategories, color: "#3B82F6" } // blue
  ];

  const requestData: ChartDataItem[] = [
    { name: "Build Requests", value: stats.totalBuildRequests, color: "#EF4444" }, // red
    { name: "Inbox Messages", value: stats.totalInboxMessages, color: "#10B981" }, // green
    { name: "Orders", value: stats.totalOrders, color: "#3B82F6" } // blue
  ];

  const overviewData: OverviewDataItem[] = [
    { category: "Products", count: stats.totalProducts },
    { category: "Variants", count: stats.totalVariants },
    { category: "Build Parts", count: stats.totalBuildPartsAvailable },
    { category: "Categories", count: stats.totalCategories },
    { category: "Orders", count: stats.totalOrders },
    { category: "Users", count: stats.totalUsers },
    { category: "Messages", count: stats.totalInboxMessages }
  ];

  const engagementData: EngagementDataItem[] = [
    { name: "Users", value: stats.totalUsers },
    { name: "Orders", value: stats.totalOrders },
    { name: "Build Requests", value: stats.totalBuildRequests },
    { name: "Messages", value: stats.totalInboxMessages }
  ];




  // ---------- Stats Cards ----------
// ---------- Stats Cards ----------
 const statsCards: StatCardProps[] = [
  {
    title: "Total Products",
    value: stats.totalProducts,
    icon: (
      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    gradient: "bg-gradient-to-r from-red-500 to-red-600",
    iconBg: "bg-red-50",
    trend: stats.productTrend >= 0 ? "up" : "down",
    trendValue: Math.abs(stats.productTrend).toFixed(1),
    link: "/admin/product"
  },
  {
    title: "Total Categories",
    value: stats.totalCategories,
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    gradient: "bg-gradient-to-r from-blue-500 to-blue-600",
    iconBg: "bg-blue-50",
    trend: stats.categoryTrend >= 0 ? "up" : "down",
    trendValue: Math.abs(stats.categoryTrend).toFixed(1),
    link: "/admin/category"
  },
  {
    title: "Product Variants",
    value: stats.totalVariants,
    icon: (
      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
      </svg>
    ),
    gradient: "bg-gradient-to-r from-yellow-500 to-yellow-600",
    iconBg: "bg-yellow-50",
    trend: stats.variantTrend >= 0 ? "up" : "down",
    trendValue: Math.abs(stats.variantTrend).toFixed(1),
    link: "/admin/variants"
  },
  {
    title: "Total Users",
    value: stats.totalUsers,
    icon: (
      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    gradient: "bg-gradient-to-r from-green-500 to-green-600",
    iconBg: "bg-green-50",
    trend: stats.userTrend >= 0 ? "up" : "down",
    trendValue: Math.abs(stats.userTrend).toFixed(1),
    link: "/admin/users"
  },
  {
    title: "Build Requests",
    value: stats.totalBuildRequests,
    icon: (
      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    gradient: "bg-gradient-to-r from-amber-500 to-amber-600",
    iconBg: "bg-amber-50",
    trend: stats.buildRequestTrend >= 0 ? "up" : "down",
    trendValue: Math.abs(stats.buildRequestTrend).toFixed(1),
    link: "/admin/build-requests"
  },
  {
    title: "Inbox Messages",
    value: stats.totalInboxMessages,
    icon: (
      <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    gradient: "bg-gradient-to-r from-rose-500 to-rose-600",
    iconBg: "bg-rose-50",
    trend: stats.inboxTrend >= 0 ? "up" : "down",
    trendValue: Math.abs(stats.inboxTrend).toFixed(1),
    link: "/admin/inbox"
  },
  {
    title: "Total Orders",
    value: stats.totalOrders,
    icon: (
      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
      </svg>
    ),
    gradient: "bg-gradient-to-r from-indigo-500 to-indigo-600",
    iconBg: "bg-indigo-50",
    trend: stats.orderTrend >= 0 ? "up" : "down",
    trendValue: Math.abs(stats.orderTrend).toFixed(1),
    link: "/admin/orders"
  },
  {
    title: "Build Parts Available",
    value: stats.totalBuildPartsAvailable,
    icon: (
      <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4M12 4v16" />
      </svg>
    ),
    gradient: "bg-gradient-to-r from-teal-500 to-teal-600",
    iconBg: "bg-teal-50",
    trend: stats.buildPartsTrend >= 0 ? "up" : "down",
    trendValue: Math.abs(stats.buildPartsTrend).toFixed(1),
    link: "admin/build-user-pc/parts-table"
  }
];


  // ---------- Pie Label renderer ----------
  const renderPieLabel = (props: PieLabelRenderProps) => {
    const { name = "", percent = 0 } = props;
    return `${name}: ${(percent * 100).toFixed(0)}%`;
  };

  // ---------- Render ----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-gray-500 text-lg">Real-time insights into Proud IT Nepal</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2  2xl:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Inventory Overview */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Inventory Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderPieLabel}
                  outerRadius={100}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Customer Engagement */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Customer Engagement</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 12 }} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                  }}
                />
                <Bar dataKey="value" fill="#EF4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Full Width Charts */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          {/* Platform Activity */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Platform Activity Overview</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={overviewData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="category" tick={{ fill: "#6b7280", fontSize: 12 }} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                  }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Requests & Inbox */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Requests & Communications</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={requestData}
                  cx="50%"
                  cy="50%"
                  labelLine
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={110}
                  dataKey="value"
                >
                  {requestData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
            <h4 className="text-sm font-medium opacity-90 mb-2">Total Catalog Items</h4>
            <p className="text-4xl font-bold mb-1">{(stats.totalProducts + stats.totalVariants).toLocaleString()}</p>
            <p className="text-sm opacity-80">Products + Variants</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
            <h4 className="text-sm font-medium opacity-90 mb-2">Customer Base</h4>
            <p className="text-4xl font-bold mb-1">{stats.totalUsers.toLocaleString()}</p>
            <p className="text-sm opacity-80">Registered Users</p>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg p-6 text-white">
            <h4 className="text-sm font-medium opacity-90 mb-2">Pending Actions</h4>
            <p className="text-4xl font-bold mb-1">{(stats.totalBuildRequests + stats.totalInboxMessages).toLocaleString()}</p>
            <p className="text-sm opacity-80">Requests + Messages</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
