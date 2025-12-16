"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import useUser from "@/utils/useUser";
import { FileText, Plus } from "lucide-react";

export default function Reports() {
  const { data: user, loading: userLoading } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userLoading && !user) {
      if (typeof window !== "undefined") {
        window.location.href = "/account/signin";
      }
    }
  }, [user, userLoading]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch("/api/reports");
        if (!response.ok) throw new Error("Failed to fetch reports");
        const data = await response.json();
        setReports(data);
      } catch (error) {
        console.error("Error fetching reports:", error);
        setError("Failed to load reports");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchReports();
    }
  }, [user]);

  if (userLoading || !user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-[#F3F3F3] dark:bg-[#0A0A0A]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
        transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 transition-transform duration-300
      `}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} title="Reports" />

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-black dark:text-white mb-2 font-sora">
                Reports
              </h2>
              <p className="text-[#6F6F6F] dark:text-[#AAAAAA] font-inter">
                Manage all your client reports
              </p>
            </div>
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.location.href = "/reports/new";
                }
              }}
              className="h-12 px-6 rounded-xl bg-gradient-to-b from-[#252525] to-[#0F0F0F] dark:from-[#FFFFFF] dark:to-[#E0E0E0] text-white dark:text-black font-semibold transition-all duration-150 hover:from-[#2d2d2d] hover:to-[#171717] active:scale-95 font-inter flex items-center gap-2"
            >
              <Plus size={18} />
              New Report
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 font-inter">
                {error}
              </p>
            </div>
          )}

          {/* Reports List */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-[#6F6F6F] dark:text-[#AAAAAA] font-inter">
                Loading reports...
              </p>
            </div>
          ) : reports.length === 0 ? (
            <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-xl p-12 text-center">
              <FileText
                size={48}
                className="mx-auto mb-4 text-[#D0D0D0] dark:text-[#404040]"
              />
              <h3 className="text-xl font-semibold text-black dark:text-white mb-2 font-sora">
                No reports yet
              </h3>
              <p className="text-[#6F6F6F] dark:text-[#AAAAAA] mb-6 font-inter">
                Create your first report to get started
              </p>
              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.location.href = "/reports/new";
                  }
                }}
                className="h-12 px-6 rounded-xl bg-gradient-to-b from-[#252525] to-[#0F0F0F] dark:from-[#FFFFFF] dark:to-[#E0E0E0] text-white dark:text-black font-semibold transition-all duration-150 hover:from-[#2d2d2d] hover:to-[#171717] active:scale-95 font-inter"
              >
                Create Report
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report) => {
                const metricsCount = Array.isArray(report.metrics_json)
                  ? report.metrics_json.length
                  : Object.keys(report.metrics_json || {}).length;

                return (
                  <div
                    key={report.id}
                    className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-xl p-6 hover:border-black dark:hover:border-white transition-all duration-150 cursor-pointer"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        window.location.href = `/reports/${report.id}`;
                      }
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold font-sora"
                        style={{
                          backgroundColor:
                            report.client_brand_color || "#3B82F6",
                        }}
                      >
                        {report.client_name.charAt(0).toUpperCase()}
                      </div>
                      <FileText
                        size={20}
                        className="text-[#6F6F6F] dark:text-[#AAAAAA]"
                      />
                    </div>

                    <h3 className="text-lg font-semibold text-black dark:text-white mb-1 font-sora">
                      {report.client_name}
                    </h3>
                    <p className="text-sm text-[#6F6F6F] dark:text-[#AAAAAA] mb-4 font-inter">
                      {report.period}
                    </p>

                    <div className="flex items-center justify-between text-xs text-[#6F6F6F] dark:text-[#888888] font-inter">
                      <span>{metricsCount} metrics</span>
                      <span>
                        {new Date(report.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
