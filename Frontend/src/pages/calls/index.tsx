import  { useEffect, useState, useMemo, type ReactElement } from "react";
import { Phone, Clock, User, FileText, AlertCircle, CheckCircle2, XCircle, Filter, Search} from "lucide-react";

interface CallLog {
  call_id: string;
  call_type: string;
  from_number: string;
  to_number: string;
  direction: string;
  call_status: string;
  start_timestamp: number;
  end_timestamp: number;
  duration_ms: number;
  transcript: [string, string][];
  call_analysis: {
    summary: string;
    is_successful: boolean;
    success_evaluation: boolean;
    extracted_data: any;
  };
  dynamic_variables: any;
}

export default function CallLogsPage(): ReactElement {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const selectedCall = useMemo(
    () => callLogs.find((call) => call.call_id === selectedCallId) ?? null,
    [callLogs, selectedCallId]
  );

  const filteredCalls = useMemo(() => {
    let filtered = callLogs;

    if (filterStatus !== "all") {
      filtered = filtered.filter((call) => call.call_status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter((call) =>
        call.call_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.from_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.call_analysis?.summary?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => b.start_timestamp - a.start_timestamp);
  }, [callLogs, filterStatus, searchTerm]);

  const fetchCallLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        import.meta.env.VITE_SERVER_API_URL + `/calls`,
        {
          method: "GET"
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched call logs:', data);
      

      const calls = data.calls || data || [];
      setCallLogs(calls);
    } catch (error) {
      console.error("Error fetching call logs:", error);

      setCallLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCallLogs();
  }, []);

  const formatDuration = (durationMs: number) => {
    if (!durationMs) return "0s";
    const seconds = Math.floor(durationMs / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusIcon = (status: string, isSuccessful: boolean) => {
    if (status === "ended") {
      return isSuccessful ? (
        <CheckCircle2 size={16} className="text-emerald-500" />
      ) : (
        <XCircle size={16} className="text-red-500" />
      );
    }
    return <AlertCircle size={16} className="text-yellow-500" />;
  };

  const getStatusColor = (status: string, isSuccessful: boolean) => {
    if (status === "ended") {
      return isSuccessful 
        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/40"
        : "bg-red-500/10 text-red-400 border-red-500/40";
    }
    return "bg-yellow-500/10 text-yellow-400 border-yellow-500/40";
  };

  if (loading) {
    return (
      <div className="w-full h-full flex justify-center items-center bg-[#0f1117]">
        <div className="text-white">Loading call logs...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex justify-center items-start bg-[#0f1117] p-6">
      <div className="w-full max-w-7xl h-[84vh] bg-[#1c1e26] rounded-xl shadow-2xl flex overflow-hidden border border-[#2c2e3a]">

        <div className="w-96 border-r border-[#2c2e3a] p-5 flex flex-col">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Call Logs</h3>
                <p className="text-sm text-gray-400">
                  Monitor agent call activities
                </p>
              </div>
              <Phone size={20} className="text-emerald-500" />
            </div>

            <div className="space-y-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search calls..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#0f1117] border border-[#3a3d4d] rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              
              <div className="relative">
                <Filter size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#0f1117] border border-[#3a3d4d] rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="ended">Ended</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredCalls.length === 0 ? (
              <div className="text-center py-16">
                <Phone size={48} className="mx-auto text-gray-500 mb-4" />
                <p className="text-gray-400">
                  {loading ? "Loading..." : "No call logs found"}
                </p>
                {!loading && callLogs.length === 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Make some calls to see them here
                  </p>
                )}
              </div>
            ) : (
              filteredCalls.map((call) => (
                <div
                  key={call.call_id}
                  onClick={() => setSelectedCallId(call.call_id)}
                  className={`p-4 rounded-lg cursor-pointer transition border ${
                    selectedCallId === call.call_id
                      ? getStatusColor(call.call_status, call.call_analysis?.is_successful)
                      : "hover:bg-[#2c2e3a] border-transparent"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(call.call_status, call.call_analysis?.is_successful)}
                      <div className="text-sm font-medium text-white truncate">
                        {call.from_number || 'Unknown'}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDuration(call.duration_ms)}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mb-2">
                    {formatTimestamp(call.start_timestamp)}
                  </div>

                  <div className="text-xs text-gray-400 line-clamp-2">
                    {call.call_analysis?.summary || "No summary available"}
                  </div>

                </div>
              ))
            )}
          </div>

          <div className="mt-4 text-xs text-gray-500">
            Total calls: {filteredCalls.length}
          </div>
        </div>

        <div className="flex-1 p-8 overflow-y-auto">
          {selectedCall ? (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-semibold text-white">Call Details</h2>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    getStatusColor(selectedCall.call_status, selectedCall.call_analysis?.is_successful)
                  }`}>
                    {selectedCall.call_status} • {selectedCall.call_analysis?.is_successful ? "Success" : "Failed"}
                  </div>
                </div>
                <p className="text-sm text-gray-500 font-mono">
                  Call ID: {selectedCall.call_id}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-[#2c2e3a] rounded-xl p-4 border border-[#3a3d4d]">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock size={20} className="text-emerald-500" />
                    <h4 className="text-sm font-medium text-gray-400">Duration</h4>
                  </div>
                  <p className="text-xl font-semibold text-white">
                    {formatDuration(selectedCall.duration_ms)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimestamp(selectedCall.start_timestamp)}
                  </p>
                </div>

                <div className="bg-[#2c2e3a] rounded-xl p-4 border border-[#3a3d4d]">
                  <div className="flex items-center gap-3 mb-2">
                    <User size={20} className="text-purple-500" />
                    <h4 className="text-sm font-medium text-gray-400">Caller</h4>
                  </div>
                  <p className="text-lg font-semibold text-white">
                    {selectedCall.from_number || 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedCall.direction} • {selectedCall.call_type || 'phonecall'}
                  </p>
                </div>
              </div>

              {/* Call Analysis */}
              <div className="bg-[#2c2e3a] rounded-xl p-6 mb-6 border border-[#3a3d4d]">
                <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-emerald-500" />
                  Call Analysis
                </h4>
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-400 mb-2">Summary</h5>
                    <p className="text-white text-sm leading-relaxed">
                      {selectedCall.call_analysis?.summary || "No summary available"}
                    </p>
                  </div>
                  
             
                </div>
              </div>


              <div className="bg-[#2c2e3a] rounded-xl p-6 mb-6 border border-[#3a3d4d]">
                <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-blue-500" />
                  Transcript
                </h4>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {selectedCall.transcript && Array.isArray(selectedCall.transcript) && selectedCall.transcript.length > 0 ? (
                    selectedCall.transcript.map((message, index) => {

                      const speaker = message[0] ;
                      const text = message[1] ;
                      
                      return (
                        <div key={index} className="flex gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                            speaker === 'user' 
                              ? 'bg-emerald-500/20 text-emerald-400' 
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {speaker === 'user' ? 'U' : 'A'}
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 mb-1 capitalize">
                              {speaker === 'user' ? 'User' : 'Assistant'}
                            </div>
                            <div className="text-sm text-white leading-relaxed">
                              {text || 'No message'}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 text-sm">No transcript available</p>
                  )}
                </div>
              </div>


              <div className="bg-[#2c2e3a] rounded-xl p-6 mb-6 border border-[#3a3d4d]">
                <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-purple-500" />
                  Custom Function Results
                </h4>
                {selectedCall.call_analysis?.extracted_data && Array.isArray(selectedCall.call_analysis.extracted_data) && selectedCall.call_analysis.extracted_data.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCall.call_analysis.extracted_data.map((result, index) => (
                      <div key={index} className="bg-[#1c1e26] p-3 rounded-lg">
                        <div className="text-xs text-gray-400 mb-2">
                          Function Call #{index + 1}
                          {result.timestamp && (
                            <span className="ml-2">• {new Date(result.timestamp).toLocaleTimeString()}</span>
                          )}
                        </div>
                        <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                          {JSON.stringify(result.data || result, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No custom function results available</p>
                )}
              </div>


              <div className="bg-[#2c2e3a] rounded-xl p-6 border border-[#3a3d4d]">
                <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-orange-500" />
                  Dynamic Variables
                </h4>
                {selectedCall.dynamic_variables && Object.keys(selectedCall.dynamic_variables).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(selectedCall.dynamic_variables).map(([key, _]) => (
                      <div key={key} className="flex justify-between text-sm text-gray-200">
                        <span className="font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No dynamic variables available</p>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <Phone size={64} className="text-gray-600" />
              <div>
                <h2 className="text-2xl font-semibold text-white mb-2">
                  Select a call to view details
                </h2>
                <p className="text-gray-400 max-w-md">
                  Choose a call from the list to see detailed information, transcript, and analysis.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}