"use client";

import { useEffect, useState } from "react";
import "./Home.scss";
import { useSelector } from "react-redux";
import {
  Row,
  Col,
  Card,
  CardBody,
  CardText,
  CardTitle,
  Container,
} from "reactstrap";
import { LocalServer } from "@/app/utils";
import {
  FaUsers,
  FaUserCheck,
  FaUserSlash,
  FaUserClock,
  FaArrowUp,
  FaChartLine,
} from "react-icons/fa";
import { HiTemplate } from "react-icons/hi";
import { IoDocuments } from "react-icons/io5";
import { MdPayment, MdDashboard } from "react-icons/md";
import { getErrorMessage } from "@/app/utils/helper";
import { useRouter } from "next/navigation";
import ToastNotification from "@/app/utils/Toast";

const { ToastComponent } = ToastNotification;

function Home() {
  const { user } = useSelector((state) => state.user);
  const [stats, setStats] = useState(null);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const response = await LocalServer.get(`/api/stats/get`);
      if (response?.data?.success) {
        setStats(response?.data);
      }
    } catch (error) {
      ToastComponent("error", getErrorMessage(error));
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // helper function for navigation
  const goTo = (path, params = {}) => {
    const query = new URLSearchParams(params).toString();
    router.push(`${path}${query ? "?" + query : ""}`);
  };

  return (
    <Container fluid className="modern-dashboard p-4">
      {/* Header Section */}
      <div className="dashboard-header mb-5">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <div className="me-4">
              <div
                className="d-flex align-items-center justify-content-center"
                style={{
                  width: "60px",
                  height: "60px",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "16px",
                  boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)",
                }}
              >
                <MdDashboard style={{ fontSize: "28px", color: "white" }} />
              </div>
            </div>
            <div>
              <h1
                className="mb-2"
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "700",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Welcome back, {user?.user?.first_name || "Admin"}!
              </h1>
              <p className="text-muted mb-0" style={{ fontSize: "1.1rem" }}>
                {user?.user?.role_id === 1
                  ? "Here's what's happening with your platform today"
                  : "Manage and track your documents efficiently"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Section */}
      {user?.user?.role_id === 1 && (
        <div className="mb-5">
          <div className="mb-4">
            <h2
              className="d-flex align-items-center mb-2"
              style={{
                fontSize: "1.75rem",
                fontWeight: "600",
                color: "#2c3e50",
              }}
            >
              <FaUsers className="me-3" style={{ color: "#3498db" }} />
              User Management
            </h2>
            <p className="text-muted">Monitor and manage your user base</p>
          </div>

          <Row>
            <Col lg="3" md="6" className="mb-4">
              <Card
                className="border-0 h-100 cursor-pointer"
                onClick={() => goTo("/admin/users", { filter: "all" })}
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "16px",
                  boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)",
                  transition: "all 0.3s ease",
                  transform: "translateY(0)",
                  cursor: "grab",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow =
                    "0 16px 48px rgba(102, 126, 234, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 32px rgba(102, 126, 234, 0.3)";
                }}
              >
                <CardBody className="text-white">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: "48px",
                        height: "48px",
                        background: "rgba(255, 255, 255, 0.2)",
                        borderRadius: "12px",
                      }}
                    >
                      <FaUsers style={{ fontSize: "24px" }} />
                    </div>
                    <div className="d-flex align-items-center">
                      <FaArrowUp
                        style={{
                          fontSize: "12px",
                          marginRight: "4px",
                          color: "#4caf50",
                        }}
                      />
                      <span style={{ fontSize: "12px", fontWeight: "500" }}>
                        +12%
                      </span>
                    </div>
                  </div>
                  <h3
                    className="mb-1"
                    style={{ fontSize: "2rem", fontWeight: "700" }}
                  >
                    {stats?.users?.totalUsers ?? "-"}
                  </h3>
                  <p className="mb-0" style={{ opacity: 0.9 }}>
                    Total Users
                  </p>
                </CardBody>
              </Card>
            </Col>
            {/* Additional User Cards */}
            <Col lg="3" md="6" className="mb-4">
              <Card
                className="border-0 h-100 cursor-pointer"
                onClick={() => goTo("/admin/users", { filter: "active" })}
                style={{
                  background:
                    "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                  borderRadius: "16px",
                  boxShadow: "0 8px 32px rgba(17, 153, 142, 0.3)",
                  transition: "all 0.3s ease",
                  cursor: "grab",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow =
                    "0 16px 48px rgba(102, 126, 234, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 32px rgba(102, 126, 234, 0.3)";
                }}
              >
                <CardBody className="text-white">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: "48px",
                        height: "48px",
                        background: "rgba(255, 255, 255, 0.2)",
                        borderRadius: "12px",
                      }}
                    >
                      <FaUserCheck style={{ fontSize: "24px" }} />
                    </div>
                  </div>
                  <h3
                    className="mb-1"
                    style={{ fontSize: "2rem", fontWeight: "700" }}
                  >
                    {stats?.users?.activeUsers ?? "-"}
                  </h3>
                  <p className="mb-0" style={{ opacity: 0.9 }}>
                    Active Users
                  </p>
                </CardBody>
              </Card>
            </Col>

            <Col lg="3" md="6" className="mb-4">
              <Card
                className="border-0 h-100 cursor-pointer"
                onClick={() => goTo("/admin/users", { filter: "inactive" })}
                style={{
                  background:
                    "linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)",
                  borderRadius: "16px",
                  boxShadow: "0 8px 32px rgba(252, 74, 26, 0.3)",
                  transition: "all 0.3s ease",
                  cursor: "grab",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow =
                    "0 16px 48px rgba(102, 126, 234, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 32px rgba(102, 126, 234, 0.3)";
                }}
              >
                <CardBody className="text-white">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: "48px",
                        height: "48px",
                        background: "rgba(255, 255, 255, 0.2)",
                        borderRadius: "12px",
                      }}
                    >
                      <FaUserSlash style={{ fontSize: "24px" }} />
                    </div>
                  </div>
                  <h3
                    className="mb-1"
                    style={{ fontSize: "2rem", fontWeight: "700" }}
                  >
                    {stats?.users?.inActiveUsers ?? "-"}
                  </h3>
                  <p className="mb-0" style={{ opacity: 0.9 }}>
                    Inactive Users
                  </p>
                </CardBody>
              </Card>
            </Col>

            <Col lg="3" md="6" className="mb-4">
              <Card
                className="border-0 h-100 cursor-pointer"
                onClick={() =>
                  goTo("/admin/users", { filter: "not_confirmed" })
                }
                style={{
                  background:
                    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                  borderRadius: "16px",
                  boxShadow: "0 8px 32px rgba(79, 172, 254, 0.3)",
                  transition: "all 0.3s ease",
                  cursor: "grab",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow =
                    "0 16px 48px rgba(102, 126, 234, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 32px rgba(102, 126, 234, 0.3)";
                }}
              >
                <CardBody className="text-white">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: "48px",
                        height: "48px",
                        background: "rgba(255, 255, 255, 0.2)",
                        borderRadius: "12px",
                      }}
                    >
                      <FaUserClock style={{ fontSize: "24px" }} />
                    </div>
                  </div>
                  <h3
                    className="mb-1"
                    style={{ fontSize: "2rem", fontWeight: "700" }}
                  >
                    {stats?.users?.notConfirmedUsers ?? "-"}
                  </h3>
                  <p className="mb-0" style={{ opacity: 0.9 }}>
                    Not Confirmed
                  </p>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      )}

      {/* Templates Section */}
      {user?.user?.role_id === 1 && (
        <div className="mb-5">
          <div className="mb-4">
            <h2
              className="d-flex align-items-center mb-2"
              style={{
                fontSize: "1.75rem",
                fontWeight: "600",
                color: "#2c3e50",
              }}
            >
              <HiTemplate className="me-3" style={{ color: "#e74c3c" }} />
              Template Management
            </h2>
            <p className="text-muted">Create and manage document templates</p>
          </div>

          <Row>
            <Col lg="4" md="6" className="mb-4">
              <Card
                className="border-0 h-100 cursor-pointer"
                onClick={() =>
                  goTo("/admin/template/listing", { filter: "all" })
                }
                style={{
                  background:
                    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                  borderRadius: "16px",
                  boxShadow: "0 8px 32px rgba(250, 112, 154, 0.3)",
                  transition: "all 0.3s ease",
                  cursor: "grab",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow =
                    "0 16px 48px rgba(102, 126, 234, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 32px rgba(102, 126, 234, 0.3)";
                }}
              >
                <CardBody className="text-white">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: "48px",
                        height: "48px",
                        background: "rgba(255, 255, 255, 0.2)",
                        borderRadius: "12px",
                      }}
                    >
                      <HiTemplate style={{ fontSize: "24px" }} />
                    </div>
                  </div>
                  <h3
                    className="mb-1"
                    style={{ fontSize: "2rem", fontWeight: "700" }}
                  >
                    {stats?.templates?.total_templates ?? "-"}
                  </h3>
                  <p className="mb-0" style={{ opacity: 0.9 }}>
                    Total Templates
                  </p>
                </CardBody>
              </Card>
            </Col>

            <Col lg="4" md="6" className="mb-4">
              <Card
                className="border-0 h-100 cursor-pointer"
                onClick={() =>
                  goTo("/admin/template/listing", { filter: "active" })
                }
                style={{
                  background:
                    "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                  borderRadius: "16px",
                  boxShadow: "0 8px 32px rgba(17, 153, 142, 0.3)",
                  transition: "all 0.3s ease",
                  cursor: "grab",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow =
                    "0 16px 48px rgba(102, 126, 234, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 32px rgba(102, 126, 234, 0.3)";
                }}
              >
                <CardBody className="text-white">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: "48px",
                        height: "48px",
                        background: "rgba(255, 255, 255, 0.2)",
                        borderRadius: "12px",
                      }}
                    >
                      <HiTemplate style={{ fontSize: "24px" }} />
                    </div>
                  </div>
                  <h3
                    className="mb-1"
                    style={{ fontSize: "2rem", fontWeight: "700" }}
                  >
                    {stats?.templates?.activeTemplates ?? "-"}
                  </h3>
                  <p className="mb-0" style={{ opacity: 0.9 }}>
                    Active Templates
                  </p>
                </CardBody>
              </Card>
            </Col>

            <Col lg="4" md="6" className="mb-4">
              <Card
                className="border-0 h-100 cursor-pointer"
                onClick={() =>
                  goTo("/admin/template/listing", { filter: "inactive" })
                }
                style={{
                  background:
                    "linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)",
                  borderRadius: "16px",
                  boxShadow: "0 8px 32px rgba(252, 74, 26, 0.3)",
                  transition: "all 0.3s ease",
                  cursor: "grab",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow =
                    "0 16px 48px rgba(102, 126, 234, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 32px rgba(102, 126, 234, 0.3)";
                }}
              >
                <CardBody className="text-white">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: "48px",
                        height: "48px",
                        background: "rgba(255, 255, 255, 0.2)",
                        borderRadius: "12px",
                      }}
                    >
                      <HiTemplate style={{ fontSize: "24px" }} />
                    </div>
                  </div>
                  <h3
                    className="mb-1"
                    style={{ fontSize: "2rem", fontWeight: "700" }}
                  >
                    {stats?.templates?.inActiveTemplates ?? "-"}
                  </h3>
                  <p className="mb-0" style={{ opacity: 0.9 }}>
                    Inactive Templates
                  </p>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      )}

      {/* Documents Section */}
      <div className="mb-5">
        <div className="mb-4">
          <h2
            className="d-flex align-items-center mb-2"
            style={{ fontSize: "1.75rem", fontWeight: "600", color: "#2c3e50" }}
          >
            <IoDocuments className="me-3" style={{ color: "#9b59b6" }} />
            Document Management
          </h2>
          <p className="text-muted">Track and manage all documents</p>
        </div>

        <Row>
          <Col lg="3" md="6" className="mb-4">
            <Card
              className="border-0 h-100 cursor-pointer"
              onClick={() => goTo("/admin/document/listing", { filter: "all" })}
              style={{
                background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
                borderRadius: "16px",
                boxShadow: "0 8px 32px rgba(168, 237, 234, 0.3)",
                transition: "all 0.3s ease",
                color: "#2c3e50",
                cursor: "grab",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow =
                  "0 16px 48px rgba(102, 126, 234, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 8px 32px rgba(102, 126, 234, 0.3)";
              }}
            >
              <CardBody>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: "48px",
                      height: "48px",
                      background: "rgba(44, 62, 80, 0.1)",
                      borderRadius: "12px",
                    }}
                  >
                    <IoDocuments
                      style={{ fontSize: "24px", color: "#2c3e50" }}
                    />
                  </div>
                </div>
                <h3
                  className="mb-1"
                  style={{ fontSize: "2rem", fontWeight: "700" }}
                >
                  {stats?.documents?.totalDocuments ?? "-"}
                </h3>
                <p className="mb-0" style={{ opacity: 0.8 }}>
                  Total Documents
                </p>
              </CardBody>
            </Card>
          </Col>

          <Col lg="3" md="6" className="mb-4">
            <Card
              className="border-0 h-100 cursor-pointer"
              onClick={() =>
                goTo("/admin/document/listing", { filter: "pending" })
              }
              style={{
                background: "linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)",
                borderRadius: "16px",
                boxShadow: "0 8px 32px rgba(255, 234, 167, 0.3)",
                transition: "all 0.3s ease",
                cursor: "grab",
                color: "#2c3e50",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow =
                  "0 16px 48px rgba(102, 126, 234, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 8px 32px rgba(102, 126, 234, 0.3)";
              }}
            >
              <CardBody>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: "48px",
                      height: "48px",
                      background: "rgba(44, 62, 80, 0.1)",
                      borderRadius: "12px",
                    }}
                  >
                    <IoDocuments
                      style={{ fontSize: "24px", color: "#2c3e50" }}
                    />
                  </div>
                </div>
                <h3
                  className="mb-1"
                  style={{ fontSize: "2rem", fontWeight: "700" }}
                >
                  {stats?.documents?.pending ?? "-"}
                </h3>
                <p className="mb-0" style={{ opacity: 0.8 }}>
                  Pending
                </p>
              </CardBody>
            </Card>
          </Col>

          <Col lg="3" md="6" className="mb-4">
            <Card
              className="border-0 h-100 cursor-pointer"
              onClick={() =>
                goTo("/admin/document/listing", { filter: "approved" })
              }
              style={{
                background: "linear-gradient(135deg, #55efc4 0%, #81ecec 100%)",
                borderRadius: "16px",
                boxShadow: "0 8px 32px rgba(85, 239, 196, 0.3)",
                transition: "all 0.3s ease",
                color: "#2c3e50",
                cursor: "grab",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow =
                  "0 16px 48px rgba(102, 126, 234, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 8px 32px rgba(102, 126, 234, 0.3)";
              }}
            >
              <CardBody>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: "48px",
                      height: "48px",
                      background: "rgba(44, 62, 80, 0.1)",
                      borderRadius: "12px",
                    }}
                  >
                    <IoDocuments
                      style={{ fontSize: "24px", color: "#2c3e50" }}
                    />
                  </div>
                </div>
                <h3
                  className="mb-1"
                  style={{ fontSize: "2rem", fontWeight: "700" }}
                >
                  {stats?.documents?.approved ?? "-"}
                </h3>
                <p className="mb-0" style={{ opacity: 0.8 }}>
                  Approved
                </p>
              </CardBody>
            </Card>
          </Col>

          <Col lg="3" md="6" className="mb-4">
            <Card
              className="border-0 h-100 cursor-pointer"
              onClick={() =>
                goTo("/admin/document/listing", { filter: "rejected" })
              }
              style={{
                background: "linear-gradient(135deg, #fd79a8 0%, #fdcb6e 100%)",
                borderRadius: "16px",
                boxShadow: "0 8px 32px rgba(253, 121, 168, 0.3)",
                transition: "all 0.3s ease",
                color: "#2c3e50",
                cursor: "grab",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow =
                  "0 16px 48px rgba(102, 126, 234, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 8px 32px rgba(102, 126, 234, 0.3)";
              }}
            >
              <CardBody>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: "48px",
                      height: "48px",
                      background: "rgba(44, 62, 80, 0.1)",
                      borderRadius: "12px",
                    }}
                  >
                    <IoDocuments
                      style={{ fontSize: "24px", color: "#2c3e50" }}
                    />
                  </div>
                </div>
                <h3
                  className="mb-1"
                  style={{ fontSize: "2rem", fontWeight: "700" }}
                >
                  {stats?.documents?.reject ?? "-"}
                </h3>
                <p className="mb-0" style={{ opacity: 0.8 }}>
                  Rejected
                </p>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Payments Section */}
      {user?.user?.role_id === 1 && (
        <div className="mb-5">
          <div className="mb-4">
            <h2
              className="d-flex align-items-center mb-2"
              style={{
                fontSize: "1.75rem",
                fontWeight: "600",
                color: "#2c3e50",
              }}
            >
              <MdPayment className="me-3" style={{ color: "#f39c12" }} />
              Payment Overview
            </h2>
            <p className="text-muted">Monitor payment transactions</p>
          </div>

          <Row>
            <Col lg="4" md="6" className="mb-4">
              <Card
                className="border-0 h-100 cursor-pointer"
                onClick={() => goTo("/admin/payment-history")}
                style={{
                  background:
                    "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
                  borderRadius: "16px",
                  boxShadow: "0 8px 32px rgba(255, 236, 210, 0.3)",
                  transition: "all 0.3s ease",
                  color: "#2c3e50",
                  cursor: "grab",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow =
                    "0 16px 48px rgba(102, 126, 234, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 32px rgba(102, 126, 234, 0.3)";
                }}
              >
                <CardBody>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: "48px",
                        height: "48px",
                        background: "rgba(44, 62, 80, 0.1)",
                        borderRadius: "12px",
                      }}
                    >
                      <MdPayment
                        style={{ fontSize: "24px", color: "#2c3e50" }}
                      />
                    </div>
                  </div>
                  <h3
                    className="mb-1"
                    style={{ fontSize: "2rem", fontWeight: "700" }}
                  >
                    {stats?.totalPayments ?? "-"}
                  </h3>
                  <p className="mb-0" style={{ opacity: 0.8 }}>
                    Total Payments
                  </p>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </Container>
  );
}

export default Home;
