// react
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

// firebase
import { signInWithEmailAndPassword } from "firebase/auth";
import { FirebaseContext } from "bca-firebase-queries";

// components
import { TextInput } from "../components/TextInput";

// css
import "./login.css";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { auth } = useContext(FirebaseContext);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (auth) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        navigate("/"); // Redirect to the dashboard after login
      } catch (error) {
        console.error("Login failed:", error);
      }
    }
  };

  return (
    <form onSubmit={handleLogin} className="login-form">
      <h2>Login</h2>
      <TextInput
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <TextInput
        type={"password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />

      <Link
        to="/forgot-password"
        style={{ fontSize: "12px", marginBottom: "15px" }}
      >
        Forgot Password
      </Link>
      <button className="mt-4 mb-12" type="submit">
        Login
      </button>

      <Link to="/register" style={{ marginTop: "45px" }}>
        Register here
      </Link>
    </form>
  );
};
