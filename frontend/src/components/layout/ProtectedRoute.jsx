import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import { LoadingScreen } from "../common/LoadingScreen";

export function ProtectedRoute() {
  const location = useLocation();
  const { token, initialized, status } = useSelector((state) => state.auth);

  if (!initialized && status === "loading") {
    return <LoadingScreen label="Restoring your workspace..." />;
  }

  if (!token) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

