import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import "./Auth.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("请输入用户名/邮箱和密码");
      return;
    }
    setLoading(true); setError("");
    try {
      await login(username.trim(), password);
      navigate("/library");
    } catch (err) {
      setError(err.message || "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-glow-1"></div>
      <div className="login-glow-2"></div>
      <div className="login-box dark-glass">
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2 style={{ color: "white", fontSize: "28px", marginBottom: "8px" }}>欢迎回来</h2>
          <p style={{ color: "#94a3b8", fontSize: "14px" }}>登录 PaperMate</p>
        </div>
        <form onSubmit={handleLogin}>
          <input type="text" placeholder="用户名或邮箱" className="input-field" value={username} onChange={(e) => setUsername(e.target.value)} />
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="密码"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px", fontSize: "14px" }}>
            <Link to="/forgot-password" style={{ color: "#60a5fa" }}>忘记密码？</Link>
          </div>
          {error && <p style={{ color: "#f87171", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", width: "100%" }}>
            {loading ? "登录中…" : (<><span>登录</span> <ArrowRight size={18} /></>)}
          </button>
        </form>
        <div style={{ marginTop: "32px", textAlign: "center", fontSize: "14px" }}>
          <span style={{ color: "#94a3b8" }}>没有账号？</span>
          <Link to="/register" style={{ color: "#60a5fa", fontWeight: "500" }}>注册</Link>
        </div>
      </div>
    </div>
  );
}
