import { Routes, Route, Link, useLocation } from "react-router-dom";
import { publicRoutes, privateRoutes } from "./routes";
import { useAuthContext } from "../context/useAuthContext";
import { ProtectedRoute } from "./ProtectedRoute";

import "./navigation.css";
import { PublicRoute } from "./PublicRoute";
import { AdminNav, PrivateNav } from "./NavBars";
import { useState } from "react";

export const Navigation = () => {
  const [showAdmin, setShowAdmin] = useState(false);
  const { isLoggedIn, isAdmin } = useAuthContext();

  const location = useLocation();
  const hideNavOnPaths = ["/signUp"];

  const toggleAdmin = () => {
    setShowAdmin((prev) => !prev);
  };

  return (
    <>
      {!hideNavOnPaths.includes(location.pathname) && (
        <nav>
          <ul>
            {/* Private Routes for logged-in users */}
            {isLoggedIn && !showAdmin && <PrivateNav />}
            {/* Admin Routes, for administrators */}
            {isAdmin && showAdmin && <AdminNav />}
            {/* Admin Routes, additionally for administrators */}
            {isAdmin && (
              <Link to="#" onClick={toggleAdmin}>
                {showAdmin ? "Exit Admin" : "Administration"}
              </Link>
            )}
          </ul>
        </nav>
      )}

      <Routes>
        {publicRoutes.map(({ name, path, Component }) => (
          <Route
            key={name}
            path={path}
            element={
              <PublicRoute>
                <Component />
              </PublicRoute>
            }
          />
        ))}
        {privateRoutes.map(({ name, path, Component }) => (
          <Route
            key={name}
            path={path}
            element={
              <ProtectedRoute>
                <Component />
              </ProtectedRoute>
            }
          />
        ))}
      </Routes>
    </>
  );
};
