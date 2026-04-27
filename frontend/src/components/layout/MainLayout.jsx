import Header from "./Header";
import Sidebar from "./Sidebar";

const MainLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen w-full">  {/* ✅ added w-full */}
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0">  {/* ✅ flex-1 + min-w-0 is key */}
        <Header />

        <main className="ml-64 bg-gray-50 p-6 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>

    </div>
  );
};

export default MainLayout;
