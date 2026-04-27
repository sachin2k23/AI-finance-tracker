import MainLayout from "../components/layout/MainLayout";
import FileUpload from "../components/bills/FileUpload";

const Bills = () => {
  return (
    <MainLayout>
      <div className="p-6">

        <h1 className="text-2xl font-bold mb-6">
          Upload Bills & Invoices
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Upload Section */}
          <FileUpload />

          {/* History (we will build next) */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="font-semibold mb-2">Recent Uploads</h2>
            <p className="text-gray-500 text-sm">
              No bills uploaded yet
            </p>
          </div>

        </div>

      </div>
    </MainLayout>
  );
};

export default Bills;