import { Outlet } from "react-router";
import AppHeader from "./AppHeader";

const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default PublicLayout; 