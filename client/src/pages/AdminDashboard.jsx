import React, { useEffect, useState } from 'react';
import {
  Shield,
  Users,
  Store,
  Building,
  Sprout,
  DollarSign,
  Download,
  AlertTriangle,
  History,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Check,
  X
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'complaints' | 'logs'
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMsg, setActionMsg] = useState(null);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [ovRes, usRes, compRes, logsRes] = await Promise.all([
        api.getAdminOverview(),
        api.getAllUsers(),
        api.getAllComplaints(),
        api.getAuditLogs()
      ]);

      if (ovRes.success) setOverview(ovRes.stats);
      if (usRes.success) setUsersList(usRes.users || []);
      if (compRes.success) setComplaints(compRes.complaints || []);
      if (logsRes.success) setAuditLogs(logsRes.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleUser = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    if (!window.confirm(`Are you sure you want to change user #${userId} status to ${nextStatus}?`)) return;

    try {
      const res = await api.toggleUserStatus(userId, nextStatus);
      if (res.success) {
        setActionMsg(`User status updated to ${nextStatus}.`);
        await loadAdminData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateComplaint = async (complaintId, status) => {
    const notes = prompt('Enter admin resolution notes:', 'Verified and resolved.');
    if (notes === null) return;

    try {
      const res = await api.updateComplaint(complaintId, { status, admin_notes: notes });
      if (res.success) {
        setActionMsg(`Complaint marked as ${status}.`);
        await loadAdminData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredUsers = usersList.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Admin Header */}
      <div className="bg-stone-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-stone-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 text-xs font-bold border border-emerald-800 mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Authorized Administrator Panel</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            System Administration & Governance
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-xl">
            Real-time oversight over vegetable waste collections, compost batch tracking, user accounts, and compliance auditing.
          </p>
        </div>

        {/* 1-Click CSV Exports */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={api.exportCSVUrl('users')}
            download
            className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-stone-700"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Users CSV</span>
          </a>
          <a
            href={api.exportCSVUrl('waste')}
            download
            className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-stone-700"
          >
            <Download className="w-3.5 h-3.5 text-yellow-400" />
            <span>Waste CSV</span>
          </a>
          <a
            href={api.exportCSVUrl('orders')}
            download
            className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-stone-700"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Orders CSV</span>
          </a>
          <a
            href={api.exportCSVUrl('batches')}
            download
            className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-stone-700"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Batches CSV</span>
          </a>
        </div>
      </div>

      {actionMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{actionMsg}</span>
          </div>
          <button onClick={() => setActionMsg(null)} className="text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      {overview && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
            <div className="text-xs font-semibold text-stone-500">Total Registered Users</div>
            <div className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
              {usersList.length}
            </div>
            <p className="text-[11px] text-stone-400 mt-1">All roles active</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
            <div className="text-xs font-semibold text-stone-500">Collected Market Waste</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-800 mt-1">
              {overview.waste?.total_collected_kg || 0} <span className="text-sm font-semibold text-stone-400">kg</span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">From {overview.waste?.total_listings || 0} listings</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
            <div className="text-xs font-semibold text-stone-500">Compost Batches</div>
            <div className="text-2xl sm:text-3xl font-black text-amber-900 mt-1">
              {overview.compost?.total_batches || 0}
            </div>
            <p className="text-[11px] text-stone-400 mt-1">{overview.compost?.total_finished_kg || 0} kg output</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
            <div className="text-xs font-semibold text-stone-500">Platform GMV</div>
            <div className="text-2xl sm:text-3xl font-black text-green-700 mt-1">
              ₹{(overview.orders?.total_revenue || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-stone-400 mt-1">Across {overview.orders?.total_orders || 0} orders</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-stone-200 gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'overview' ? 'border-emerald-700 text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Ecosystem Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'users' ? 'border-emerald-700 text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <span>User Accounts ({usersList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('complaints')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'complaints' ? 'border-emerald-700 text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <span>Complaints & Reports ({complaints.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'logs' ? 'border-emerald-700 text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Audit Logs
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
            <h3 className="font-bold text-stone-900 text-base">Participant Role Distribution</h3>
            <div className="space-y-3">
              {overview?.usersByRole?.map((r, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs">
                  <span className="font-bold uppercase tracking-wider text-stone-700">{r.role.replace('_', ' ')}</span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">{r.count} accounts</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
            <h3 className="font-bold text-stone-900 text-base">Circular Conversion Efficiency</h3>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-950 space-y-2">
              <div className="flex justify-between">
                <span>Total Vegetable Waste Input:</span>
                <span className="font-bold">{overview?.waste?.total_collected_kg || 0} kg</span>
              </div>
              <div className="flex justify-between">
                <span>Total Finished Compost Humus:</span>
                <span className="font-bold">{overview?.compost?.total_finished_kg || 0} kg</span>
              </div>
              <div className="flex justify-between border-t border-emerald-200 pt-2 font-bold text-emerald-900 text-sm">
                <span>Net Humus Yield Ratio:</span>
                <span>~36.5% Conversion</span>
              </div>
            </div>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Standard biological decomposition causes moisture evaporation and natural microbial respiration, creating dense, odorless humus.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: USER ACCOUNTS */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-stone-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search user name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>
            <span className="text-xs text-stone-500">Showing {filteredUsers.length} users</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">City / Region</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-stone-900">{u.name}</div>
                      <div className="text-[11px] text-stone-500">{u.email} • {u.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-100 text-stone-800">
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-700">{u.city}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUser(u.id, u.status)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                            u.status === 'active'
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: COMPLAINTS */}
      {activeTab === 'complaints' && (
        <div className="space-y-4">
          {complaints.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <h3 className="font-bold text-stone-800 text-base">No active complaints or reports</h3>
              <p className="text-xs text-stone-500 mt-1">Platform listings and collections are currently operating cleanly.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {complaints.map((c) => (
                <div key={c.id} className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        c.status === 'open' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {c.status}
                      </span>
                      <h4 className="font-bold text-stone-900 text-xs">{c.reason}</h4>
                    </div>
                    <button
                      onClick={() => handleUpdateComplaint(c.id, c.status === 'open' ? 'resolved' : 'open')}
                      className="text-xs font-bold text-emerald-700 hover:underline"
                    >
                      Mark as {c.status === 'open' ? 'Resolved' : 'Re-open'}
                    </button>
                  </div>
                  <p className="text-xs text-stone-600">{c.details}</p>
                  <div className="text-[11px] text-stone-400">
                    Reported by {c.reporter_name} ({c.reporter_email}) on {new Date(c.created_at).toLocaleDateString()}
                  </div>
                  {c.admin_notes && (
                    <div className="p-2 rounded bg-stone-50 text-[11px] text-stone-600 border border-stone-100">
                      <strong>Admin Notes:</strong> {c.admin_notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-stone-200 flex items-center justify-between">
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">System Audit Trail</h4>
            <span className="text-xs text-stone-500">Last 100 recorded operations</span>
          </div>
          <div className="divide-y divide-stone-100 max-h-[500px] overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 text-xs flex justify-between items-center hover:bg-stone-50">
                <div>
                  <span className="font-mono font-bold text-stone-900 mr-2">{log.action}</span>
                  <span className="text-stone-600">{log.details}</span>
                </div>
                <div className="text-stone-400 text-[11px] whitespace-nowrap ml-4">
                  {new Date(log.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
