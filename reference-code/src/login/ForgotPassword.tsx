// react
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

// firebase
import { sendPasswordResetEmail } from "firebase/auth";
import { FirebaseContext } from "bca-firebase-queries";

// components
import { TextInput } from "../components/TextInput";

// css
import "./login.css";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const navigate = useNavigate();
  const { auth } = useContext(FirebaseContext);

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (auth) {
      try {
        await sendPasswordResetEmail(auth, email);
        alert("Reset Password email sent!");
        navigate("/login");
      } catch (error) {
        console.error("Error sending reset password email", error);
        throw error;
      }
    }
  };

  return (
    <form onSubmit={handleResetPassword} className="login-form">
      <h2>Forgot Password</h2>
      <TextInput
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <div style={{ fontSize: "12px", maxWidth: "70%" }}>
        Enter your email address. An Email will be sent with instructions to
        reset your password.
      </div>
      <button className="mt-4 mb-12" type="submit">
        Reset Password
      </button>

      <Link to="/login" style={{ marginTop: "45px" }}>
        Back To Login
      </Link>
    </form>
  );
};
