import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoutes = () => {
  const exists = useSelector((state) => state.user.userInfo.exists);
  return exists ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoutes;
