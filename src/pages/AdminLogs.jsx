import React, { useState, useEffect, useCallback } from "react";
import UserHeader from "../components/UserHeader";
import { useAuthStore } from "../store/authStore";
import { getLogs } from "../data/api";

const statusBadge = (code) => {
  if (code >= 200 && code < 300) return "bg-green-100 text-green-700 border-green-300";
  if (code >= 400 && code < 500) return "bg-yellow-100 text-yellow-700 border-yellow-300";
  if (code >= 500) return "bg-red-100 text-red-700 border-red-300";
  return "bg-gray-100 text-gray-700 border-gray-300";
};

const AdminLogs = () => {
  const { user: currentAdmin } = useAuthStore();
  
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 30, totalDocs: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [statusCodeFilter, setStatusCodeFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const result = await getLogs({
      page: currentPage,
      limit: 30,
      search: debouncedSearch || undefined,
      method: methodFilter || undefined,
      statusCode: statusCodeFilter || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
    setLogs(result.logs || []);
    setPagination(result.pagination || { page: 1, limit: 30, totalDocs: 0, totalPages: 0 });
    setLoading(false);
  }, [currentPage, debouncedSearch, methodFilter, statusCodeFilter, startDate, endDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleClearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setMethodFilter("");
    setStatusCodeFilter("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  return (
    <div className="flex h-screen w-full flex-col bg-gray-50 overflow-hidden relative" dir="rtl">
      <header className="w-full flex justify-between items-center px-12 py-6 shrink-0 select-none">
        <h1 className="text-[32px] font-bold text-[#1c1c1e]" style={{ fontFamily: "Pinar-FD" }}>
          لاگ سیستم
        </h1>
        <UserHeader userInitial={currentAdmin?.initial} hasNotification={true} />
      </header>

      <div className="flex-1 w-full px-12 pb-12 overflow-y-auto flex flex-col gap-4">
        {/* Filters */}
        <div className="bg-white border border-black rounded-[5px] shadow-[0_4px_0_0_#000000] p-4 flex flex-wrap gap-4 items-end" style={{ fontFamily: "Pinar-FD" }}>
          <div className="flex flex-col gap-1 w-[200px]">
            <label className="text-[12px] font-bold">جستجو</label>
            <input 
              type="text" 
              className="border border-gray-300 rounded p-2 text-[13px] outline-none focus:border-black"
              placeholder="جستجو در مسیر، پیام..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1 w-[120px]">
            <label className="text-[12px] font-bold">متد</label>
            <select 
              className="border border-gray-300 rounded p-2 text-[13px] outline-none focus:border-black bg-white cursor-pointer"
              value={methodFilter}
              onChange={(e) => { setMethodFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="">همه</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 w-[120px]">
            <label className="text-[12px] font-bold">کد وضعیت</label>
            <input 
              type="number" 
              className="border border-gray-300 rounded p-2 text-[13px] outline-none focus:border-black"
              placeholder="مثلا 404"
              value={statusCodeFilter}
              onChange={(e) => { setStatusCodeFilter(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="flex flex-col gap-1 w-[150px]">
            <label className="text-[12px] font-bold">از تاریخ (میلادی)</label>
            <input 
              type="date" 
              className="border border-gray-300 rounded p-2 text-[13px] outline-none focus:border-black"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="flex flex-col gap-1 w-[150px]">
            <label className="text-[12px] font-bold">تا تاریخ (میلادی)</label>
            <input 
              type="date" 
              className="border border-gray-300 rounded p-2 text-[13px] outline-none focus:border-black"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <button 
            onClick={handleClearFilters}
            className="h-[38px] px-4 bg-gray-200 text-black border border-gray-400 rounded text-[13px] font-bold hover:bg-gray-300 transition-colors"
          >
            پاک کردن
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-black rounded-[5px] shadow-[0_4px_0_0_#000000] overflow-hidden flex flex-col flex-1" style={{ fontFamily: "Pinar-FD" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="p-3 text-[13px] font-bold text-gray-700 w-16">ردیف</th>
                  <th className="p-3 text-[13px] font-bold text-gray-700 w-40">تاریخ</th>
                  <th className="p-3 text-[13px] font-bold text-gray-700 w-48">کاربر</th>
                  <th className="p-3 text-[13px] font-bold text-gray-700">مسیر و متد</th>
                  <th className="p-3 text-[13px] font-bold text-gray-700 w-24">وضعیت</th>
                  <th className="p-3 text-[13px] font-bold text-gray-700 w-32">IP</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500 font-bold">در حال بارگذاری...</td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500 font-bold">هیچ لاگی یافت نشد</td>
                  </tr>
                ) : (
                  logs.map((log, index) => (
                    <tr key={log._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-[13px] text-gray-600">
                        {((pagination.page - 1) * pagination.limit) + index + 1}
                      </td>
                      <td className="p-3 text-[13px] text-gray-600" dir="ltr" style={{textAlign: 'right'}}>
                        {new Date(log.createdAt).toLocaleString("fa-IR")}
                      </td>
                      <td className="p-3 text-[13px]">
                        {log.user ? (
                          <div>
                            <div className="font-bold">{log.user.firstName} {log.user.lastName}</div>
                            <div className="text-[11px] text-gray-500">{log.user.role} - {log.user.username}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">ناشناس</span>
                        )}
                      </td>
                      <td className="p-3 text-[13px]" dir="ltr" style={{textAlign: 'right'}}>
                        <div className="font-mono text-[12px]">
                          <span className="font-bold text-blue-600 mr-2">{log.method}</span>
                          {log.path}
                        </div>
                        {log.message && <div className="text-[11px] text-gray-500 mt-1" style={{textAlign: 'right'}} dir="rtl">{log.message}</div>}
                      </td>
                      <td className="p-3 text-[13px]">
                        <span className={`px-2 py-1 rounded text-[11px] font-bold border ${statusBadge(log.statusCode)}`}>
                          {log.statusCode || "—"}
                        </span>
                      </td>
                      <td className="p-3 text-[13px] font-mono text-gray-500">{log.ip}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="text-[13px] text-gray-600 font-bold">
              مجموع رکوردها: {pagination.totalDocs}
            </div>
            <div className="flex items-center gap-4">
              <button 
                disabled={pagination.page <= 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="px-4 py-1.5 bg-white border border-gray-300 rounded text-[13px] font-bold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                قبلی
              </button>
              <span className="text-[13px] font-bold text-gray-700">
                صفحه {pagination.page} از {pagination.totalPages || 1}
              </span>
              <button 
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="px-4 py-1.5 bg-white border border-gray-300 rounded text-[13px] font-bold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                بعدی
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminLogs;
