import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import "./Auth.css";

export default function Register() {
  const navigate = useNavigate();
  const { register, login } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validate = () => {
    if (!username.trim() || !email.trim() || !password || !confirmPassword) return "所有字段必填";
    if (password.length < 8) return "密码至少8位";
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) return "密码需要包含字母和数字";
    if (password !== confirmPassword) return "两次密码不一致";
    return null;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true); setError("");
    try {
      await register(username.trim(), email.trim(), password, confirmPassword);
      setSuccess(true);
      await login(username.trim(), password);
      setTimeout(() => navigate("/library"), 800);
    } catch (err) {
      setError(err.message || "注册失败");
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
          <h2 style={{ color: "white", fontSize: "28px", marginBottom: "8px" }}>创建账号</h2>
          <p style={{ color: "#94a3b8", fontSize: "14px" }}>加入 PaperMate</p>
        </div>
        <form onSubmit={handleRegister}>
          <input type="text" placeholder="用户名" className="input-field" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input type="email" placeholder="邮箱" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="密码（8位以上，含字母和数字）" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} />
          <input type="password" placeholder="确认密码" className="input-field" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          {error && <p style={{ color: "#f87171", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}
          {success && <p style={{ color: "#4ade80", fontSize: "13px", marginBottom: "12px" }}>账号创建成功，正在登录…</p>}
          <button type="submit" className="btn-primary" disabled={loading} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", width: "100%" }}>
            {loading ? "创建中…" : (<><span>注册</span> <ArrowRight size={18} /></>)}
          </button>
        </form>
        <div style={{ marginTop: "32px", textAlign: "center", fontSize: "14px" }}>
          <span style={{ color: "#94a3b8" }}>已有账号？</span>
          <Link to="/login" style={{ color: "#60a5fa", fontWeight: "500" }}>登录</Link>
        </div>
      </div>
    </div>
  );
}
