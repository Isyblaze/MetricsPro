"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import useUser from "@/utils/useUser";
import { Upload, Plus, X, FileText, Table as TableIcon } from "lucide-react";
import Papa from "papaparse";

export default function NewReport() {
  const { data: user, loading: userLoading } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [period, setPeriod] = useState("");
  const [uploadMode, setUploadMode] = useState("csv"); // 'csv' or 'manual'
  const [csvData, setCsvData] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [manualMetrics, setManualMetrics] = useState([
    { metric: "", value: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!userLoading && !user) {
      if (typeof window !== "undefined") {
        window.location.href = "/account/signin";
      }
    }
  }, [user, userLoading]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch("/api/clients");
        if (!response.ok) throw new Error("Failed to fetch clients");
        const data = await response.json();
        setClients(data);
      } catch (error) {
        console.error("Error fetching clients:", error);
        setError("Failed to load clients");
      }
    };

    if (user) {
      fetchClients();
    }
  }, [user]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setError("Please upload a CSV file");
      return;
    }

    setCsvFile(file);
    setError("");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError("Error parsing CSV: " + results.errors[0].message);
          return;
        }

        if (results.data.length === 0) {
          setError("CSV file is empty");
          return;
        }

        setCsvData(results.data);
      },
      error: (error) => {
        setError("Failed to parse CSV: " + error.message);
      },
    });
  };

  const handleAddMetric = () => {
    setManualMetrics([...manualMetrics, { metric: "", value: "" }]);
  };

  const handleRemoveMetric = (index) => {
    setManualMetrics(manualMetrics.filter((_, i) => i !== index));
  };

  const handleMetricChange = (index, field, value) => {
    const updated = [...manualMetrics];
    updated[index][field] = value;
    setManualMetrics(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedClient) {
      setError("Please select a client");
      return;
    }

    if (!period) {
      setError("Please enter a period");
      return;
    }

    let metricsJson;

    if (uploadMode === "csv") {
      if (!csvData || csvData.length === 0) {
        setError("Please upload a CSV file");
        return;
      }
      metricsJson = csvData;
    } else {
      // Manual mode
      const validMetrics = manualMetrics.filter((m) => m.metric && m.value);
      if (validMetrics.length === 0) {
        setError("Please add at least one metric");
        return;
      }
      metricsJson = validMetrics;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: selectedClient,
          period,
          metrics_json: metricsJson,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create report");
      }

      const result = await response.json();
      setSuccess("Report created successfully!");

      // Redirect to reports page after a short delay
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.href = "/reports";
        }
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create report");
    } finally {
      setLoading(false);
    }
  };

  if (userLoading || !user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-[#F3F3F3] dark:bg-[#0A0A0A]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
        transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 transition-transform duration-300 ease-in-out
      `}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title="Create Report"
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-black dark:text-white mb-2 font-sora">
                Create New Report
              </h2>
              <p className="text-[#6F6F6F] dark:text-[#AAAAAA] font-inter">
                Upload a CSV file or manually enter metrics to create a new
                report
              </p>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400 font-inter">
                  {error}
                </p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400 font-inter">
                  {success}
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Client Selection */}
              <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-xl p-6">
                <label className="block text-sm font-medium text-[#2B2B2B] dark:text-white mb-2 font-inter">
                  Client
                </label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  required
                  className="w-full h-12 px-4 rounded-xl bg-white dark:bg-[#262626] border border-[#E5E5E5] dark:border-[#404040] text-black dark:text-white font-inter transition-all duration-200 focus:border-black dark:focus:border-white focus:outline-none"
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                {clients.length === 0 && (
                  <p className="mt-2 text-sm text-[#6F6F6F] dark:text-[#888888] font-inter">
                    No clients found.{" "}
                    <a
                      href="/clients"
                      className="text-blue-600 hover:underline"
                    >
                      Create a client first
                    </a>
                  </p>
                )}
              </div>

              {/* Period */}
              <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-xl p-6">
                <label className="block text-sm font-medium text-[#2B2B2B] dark:text-white mb-2 font-inter">
                  Period
                </label>
                <input
                  type="text"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  placeholder="e.g., Q4 2024, December 2024, 2024"
                  required
                  className="w-full h-12 px-4 rounded-xl bg-white dark:bg-[#262626] border border-[#E5E5E5] dark:border-[#404040] text-black dark:text-white placeholder-[#6E6E6E] dark:placeholder-[#888888] font-inter transition-all duration-200 focus:border-black dark:focus:border-white focus:outline-none"
                />
              </div>

              {/* Upload Mode Toggle */}
              <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-xl p-6">
                <label className="block text-sm font-medium text-[#2B2B2B] dark:text-white mb-4 font-inter">
                  Input Method
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setUploadMode("csv")}
                    className={`flex-1 h-12 px-4 rounded-xl font-semibold transition-all duration-150 active:scale-95 font-inter flex items-center justify-center gap-2 ${
                      uploadMode === "csv"
                        ? "bg-gradient-to-b from-[#252525] to-[#0F0F0F] dark:from-[#FFFFFF] dark:to-[#E0E0E0] text-white dark:text-black"
                        : "bg-[#F3F3F3] dark:bg-[#262626] text-black dark:text-white hover:bg-[#E5E5E5] dark:hover:bg-[#303030]"
                    }`}
                  >
                    <Upload size={18} />
                    CSV Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode("manual")}
                    className={`flex-1 h-12 px-4 rounded-xl font-semibold transition-all duration-150 active:scale-95 font-inter flex items-center justify-center gap-2 ${
                      uploadMode === "manual"
                        ? "bg-gradient-to-b from-[#252525] to-[#0F0F0F] dark:from-[#FFFFFF] dark:to-[#E0E0E0] text-white dark:text-black"
                        : "bg-[#F3F3F3] dark:bg-[#262626] text-black dark:text-white hover:bg-[#E5E5E5] dark:hover:bg-[#303030]"
                    }`}
                  >
                    <TableIcon size={18} />
                    Manual Entry
                  </button>
                </div>
              </div>

              {/* CSV Upload */}
              {uploadMode === "csv" && (
                <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-xl p-6">
                  <label className="block text-sm font-medium text-[#2B2B2B] dark:text-white mb-4 font-inter">
                    Upload CSV File
                  </label>

                  <div className="border-2 border-dashed border-[#E5E5E5] dark:border-[#404040] rounded-xl p-8 text-center">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="csv-upload"
                    />
                    <label
                      htmlFor="csv-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload
                        size={48}
                        className="mb-4 text-[#6F6F6F] dark:text-[#AAAAAA]"
                      />
                      {csvFile ? (
                        <p className="text-sm text-black dark:text-white font-semibold font-inter mb-1">
                          {csvFile.name}
                        </p>
                      ) : (
                        <p className="text-sm text-black dark:text-white font-semibold font-inter mb-1">
                          Click to upload CSV file
                        </p>
                      )}
                      <p className="text-xs text-[#6F6F6F] dark:text-[#888888] font-inter">
                        CSV files with metric columns
                      </p>
                    </label>
                  </div>

                  {/* CSV Preview */}
                  {csvData && csvData.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-[#2B2B2B] dark:text-white mb-3 font-inter">
                        Preview ({csvData.length} rows)
                      </h3>
                      <div className="border border-[#E5E5E5] dark:border-[#404040] rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-[#F9FAFB] dark:bg-[#262626]">
                              <tr>
                                {Object.keys(csvData[0]).map(
                                  (header, index) => (
                                    <th
                                      key={index}
                                      className="px-4 py-3 text-left text-xs font-semibold text-[#4D4D4D] dark:text-[#B0B0B0] font-inter"
                                    >
                                      {header}
                                    </th>
                                  ),
                                )}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#404040]">
                              {csvData.slice(0, 5).map((row, rowIndex) => (
                                <tr
                                  key={rowIndex}
                                  className="bg-white dark:bg-[#1E1E1E]"
                                >
                                  {Object.values(row).map((cell, cellIndex) => (
                                    <td
                                      key={cellIndex}
                                      className="px-4 py-3 text-black dark:text-white font-inter"
                                    >
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {csvData.length > 5 && (
                          <div className="px-4 py-2 bg-[#F9FAFB] dark:bg-[#262626] text-xs text-[#6F6F6F] dark:text-[#888888] font-inter">
                            Showing 5 of {csvData.length} rows
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Manual Entry */}
              {uploadMode === "manual" && (
                <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-[#2B2B2B] dark:text-white font-inter">
                      Metrics
                    </label>
                    <button
                      type="button"
                      onClick={handleAddMetric}
                      className="h-8 px-3 rounded-lg bg-[#F3F3F3] dark:bg-[#262626] text-black dark:text-white font-semibold text-sm transition-all duration-150 hover:bg-[#E5E5E5] dark:hover:bg-[#303030] active:scale-95 font-inter flex items-center gap-1"
                    >
                      <Plus size={14} />
                      Add Metric
                    </button>
                  </div>

                  <div className="space-y-3">
                    {manualMetrics.map((metric, index) => (
                      <div key={index} className="flex gap-3">
                        <input
                          type="text"
                          value={metric.metric}
                          onChange={(e) =>
                            handleMetricChange(index, "metric", e.target.value)
                          }
                          placeholder="Metric name"
                          className="flex-1 h-12 px-4 rounded-xl bg-white dark:bg-[#262626] border border-[#E5E5E5] dark:border-[#404040] text-black dark:text-white placeholder-[#6E6E6E] dark:placeholder-[#888888] font-inter transition-all duration-200 focus:border-black dark:focus:border-white focus:outline-none"
                        />
                        <input
                          type="text"
                          value={metric.value}
                          onChange={(e) =>
                            handleMetricChange(index, "value", e.target.value)
                          }
                          placeholder="Value"
                          className="flex-1 h-12 px-4 rounded-xl bg-white dark:bg-[#262626] border border-[#E5E5E5] dark:border-[#404040] text-black dark:text-white placeholder-[#6E6E6E] dark:placeholder-[#888888] font-inter transition-all duration-200 focus:border-black dark:focus:border-white focus:outline-none"
                        />
                        {manualMetrics.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMetric(index)}
                            className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 transition-all duration-150 hover:bg-red-100 dark:hover:bg-red-900/30 active:scale-95 flex items-center justify-center"
                          >
                            <X size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.location.href = "/reports";
                    }
                  }}
                  className="h-12 px-6 rounded-xl bg-[#F3F3F3] dark:bg-[#262626] text-black dark:text-white font-semibold transition-all duration-150 hover:bg-[#E5E5E5] dark:hover:bg-[#303030] active:scale-95 font-inter"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-12 rounded-xl bg-gradient-to-b from-[#252525] to-[#0F0F0F] dark:from-[#FFFFFF] dark:to-[#E0E0E0] text-white dark:text-black font-semibold transition-all duration-150 hover:from-[#2d2d2d] hover:to-[#171717] dark:hover:from-[#F0F0F0] dark:hover:to-[#D0D0D0] active:from-[#1a1a1a] active:to-[#000000] dark:active:from-[#E0E0E0] dark:active:to-[#C0C0C0] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-inter"
                >
                  {loading ? "Creating Report..." : "Create Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
