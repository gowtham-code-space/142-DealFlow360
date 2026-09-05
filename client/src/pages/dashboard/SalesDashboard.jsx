import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MetricCard from '../../components/common/MetricCard';
import StatusBadge from '../../components/common/StatusBadge';
import { MOCK_QUOTATIONS } from '../../utils/constants';
import { formatCurrency, formatPercent, formatDate } from '../../utils/formatters';
import {
  TrendingUp,
  DollarSign,
  FileCheck2,
  AlertCircle,
  Plus,
  Sparkles,
  ArrowUpRight,
  Filter
} from 'lucide-react';

export default function SalesDashboard() {
  const [quotations] = useState(MOCK_QUOTATIONS);

  const totalPipeline = quotations.reduce((acc, q) => acc + q.totalValue, 0);
  const avgMargin = quotations.reduce((acc, q) => acc + q.marginPercent, 0) / quotations.length;
  const pendingApprovals = quotations.filter(q => q.status === 'PENDING_APPROVAL').length;

  return (
    <div>
      {/* Top Header & Action */}
      <div className="flex-between" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Sales Representative Dashboard</h1>
          <p className="page-subtitle">Track quote lifecycles, real-time margins, and automated approval triggers.</p>
        </div>
        <div className="flex-gap-2">
          <Link to="/quotations/new" className="btn btn-primary">
            <Plus size={16} />
            <span>Create New Quote (CPQ)</span>
          </Link>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid-metrics">
        <MetricCard
          title="Total Pipeline Value"
          value={formatCurrency(totalPipeline)}
          change="18.4%"
          isPositive={true}
          icon={DollarSign}
          color="#6366f1"
        />
        <MetricCard
          title="Average Deal Margin"
          value={formatPercent(avgMargin)}
          change="2.1%"
          isPositive={true}
          icon={TrendingUp}
          color="#10b981"
        />
        <MetricCard
          title="Pending Approvals"
          value={pendingApprovals}
          change="1 high discount"
          isPositive={false}
          icon={AlertCircle}
          color="#f59e0b"
        />
        <MetricCard
          title="Win Rate (Q3)"
          value="68.5%"
          change="5.2%"
          isPositive={true}
          icon={FileCheck2}
          color="#06b6d4"
        />
      </div>

      {/* Smart AI Upsell Banner */}
      <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
        <div className="flex-between">
          <div className="flex-gap-3">
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>AI Deal Intelligence & Upsell Trigger</h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                Quote <strong>#Q-2026-001 (Nexus HyperScale)</strong> includes Enterprise Servers. Adding <strong>Optical Fiber SFP+ Packs</strong> will boost overall gross margin by +4.2%.
              </p>
            </div>
          </div>
          <Link to="/quotations/Q-2026-001" className="btn btn-secondary btn-sm">
            <span>Review & Apply</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      {/* Recent Quotations Table */}
      <div className="card">
        <div className="flex-between" style={{ marginBottom: '16px' }}>
          <div>
            <h3 className="section-title" style={{ margin: 0 }}>Active Quotations</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Real-time status updates & approval status</span>
          </div>
          <div className="flex-gap-2">
            <button className="btn btn-secondary btn-sm">
              <Filter size={14} />
              <span>Filter Status</span>
            </button>
            <Link to="/quotations" className="btn btn-secondary btn-sm">
              View All
            </Link>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Quote ID</th>
                <th>Customer</th>
                <th>Tier</th>
                <th>Value</th>
                <th>Discount</th>
                <th>Gross Margin</th>
                <th>Status</th>
                <th>Approval Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map((q) => (
                <tr key={q.id}>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    <Link to={`/quotations/${q.id}`} style={{ textDecoration: 'underline' }}>{q.id}</Link>
                  </td>
                  <td style={{ fontWeight: 600 }}>{q.customerName}</td>
                  <td>
                    <span className={`badge badge-${q.tier.toLowerCase()}`}>{q.tier}</span>
                  </td>
                  <td style={{ fontWeight: 700 }}>{formatCurrency(q.totalValue)}</td>
                  <td style={{ color: q.discountPercent > 20 ? '#ef4444' : 'var(--text-primary)', fontWeight: 600 }}>
                    {formatPercent(q.discountPercent)}
                  </td>
                  <td style={{ color: '#10b981', fontWeight: 600 }}>{formatPercent(q.marginPercent)}</td>
                  <td>
                    <StatusBadge status={q.status} />
                  </td>
                  <td style={{ fontSize: '0.78rem', color: q.requiresApprovalReason ? '#f59e0b' : 'var(--text-muted)' }}>
                    {q.requiresApprovalReason || 'Auto-cleared'}
                  </td>
                  <td>
                    <Link to={`/quotations/${q.id}`} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }}>
                      Inspect
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
