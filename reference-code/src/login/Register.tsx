// react
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

// firebase
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { FirebaseContext } from "bca-firebase-queries";

// components
import { TextInput } from "../components/TextInput";

// css
import "./login.css";

export const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { auth } = useContext(FirebaseContext);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (auth) {
      try {
        const userResponse = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        // If registration is successful, shows success message, sends verification email, and goes to VerifyEmail page
        if (userResponse) {
          alert(
            "Registration successful! Please check your email for a verification link."
          );
          await sendEmailVerification(userResponse.user);
          navigate("/verify-email");
        }
      } catch (error) {
        const firebaseError = error as { message: string };
        console.error("Login failed:", error);
        setError(firebaseError.message ?? "Unknown error");
      }
    }
  };

  return (
    <form onSubmit={handleRegister} className="login-form">
      <h2>Register</h2>
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
      <TextInput
        type={"password"}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm Password"
        required
      />
      {error && <div>{error}</div>}
      <button className="mt-4 mb-12" type="submit">
        Register
      </button>

      <Link to="/login" style={{ marginTop: "45px" }}>
        Back to Login
      </Link>
    </form>
  );
};
