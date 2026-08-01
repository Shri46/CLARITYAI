import React, { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import TransactionsTable from './TransactionsTable';
import BudgetsManager from './BudgetsManager';
import SubscriptionsTracker from './SubscriptionsTracker';
import InsightsCard from './InsightsCard';
import TelegramConnect from './TelegramConnect';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = ({ data, refreshData }) => {
  if (!data || !data.transactions) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p className="text-lg">No data analyzed yet. Return to the Upload tab.</p>
      </div>
    );
  }

  const { transactions, stats } = data;

  // Calculate Metrics
  const metrics = useMemo(() => {
    let totalSpend = 0;
    let netFlow = 0;
    let income = 0;
    let expenses = 0;
    let maxTx = null;
    const monthlySpend = {};
    const catTotals = {};
    
    transactions.forEach(t => {
      const amt = Number(t.amount) || 0;
      netFlow += amt;
      
      if (amt < 0) {
        expenses += Math.abs(amt);
        totalSpend += Math.abs(amt);
        catTotals[t.category] = (catTotals[t.category] || 0) + Math.abs(amt);
        if (!maxTx || Math.abs(amt) > Math.abs(maxTx.amount)) {
          maxTx = t;
        }
        const d = new Date(t.date || Date.now());
        const monthYear = d.toLocaleString('default', { month: 'short', year: 'numeric' });
        monthlySpend[monthYear] = (monthlySpend[monthYear] || 0) + Math.abs(amt);
      } else if (amt > 0 && t.category === 'Income') {
        income += amt;
        catTotals[t.category] = (catTotals[t.category] || 0) + amt;
      }
    });

    const topCategory = Object.entries(catTotals)
      .filter(([cat]) => cat !== 'Income' && cat !== 'Transfer')
      .sort((a, b) => b[1] - a[1])[0];

    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

    return { totalSpend, netFlow, income, expenses, savingsRate, topCategory: topCategory ? { name: topCategory[0], value: topCategory[1] } : null, maxTx, monthlySpend, catTotals };
  }, [transactions]);

  // Chart Colors
  const CHART_COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#06B6D4',
    '#84CC16', '#D946EF'
  ];

  // Chart Data
  const doughnutData = {
    labels: Object.keys(metrics.catTotals).filter(k => k !== 'Income' && k !== 'Transfer'),
    datasets: [{
      data: Object.entries(metrics.catTotals).filter(([k]) => k !== 'Income' && k !== 'Transfer').map(e => e[1]),
      backgroundColor: CHART_COLORS,
      borderWidth: 2,
      borderColor: '#ffffff',
      hoverBorderColor: '#ffffff',
      hoverOffset: 6,
    }]
  };

  const barLabels = Object.keys(metrics.monthlySpend);
  const barData = {
    labels: barLabels,
    datasets: [{
      label: 'Spending',
      data: Object.values(metrics.monthlySpend),
      backgroundColor: barLabels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
      borderRadius: 6,
      borderSkipped: false,
    }]
  };

  return (
    <div className="animate-fade-in-up">
      {/* Transparency Strip */}
      <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-100 rounded-2xl p-4 mb-8 flex justify-between items-center shadow-sm">
        <div>
          <span className="text-teal-700 font-bold text-lg">{data.stats?.ai_percentage}%</span> <span className="text-slate-600 text-sm">AI Categorized</span>
        </div>
        <div className="h-6 w-px bg-slate-200"></div>
        <div>
           <span className="text-blue-700 font-bold text-lg">{data.stats?.rules_percentage}%</span> <span className="text-slate-600 text-sm">Rule Categorized</span>
        </div>
      </div>

      <TelegramConnect />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-center transform transition-all hover:-translate-y-0.5 hover:shadow-md">
          <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider mb-2">Total Spent</p>
          <p className="text-3xl font-extrabold text-slate-900">₹{metrics.totalSpend.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}</p>
        </div>
        {/* Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-center transform transition-all hover:-translate-y-0.5 hover:shadow-md">
          <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider mb-2">Net Flow</p>
          <p className={`text-3xl font-extrabold ${metrics.netFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            ₹{Math.abs(metrics.netFlow).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}
          </p>
        </div>
        {/* Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-center transform transition-all hover:-translate-y-0.5 hover:shadow-md">
          <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider mb-2">Top Spend Category</p>
          <p className="text-xl font-bold text-slate-900 truncate">{metrics.topCategory ? metrics.topCategory.name : 'N/A'}</p>
          {metrics.topCategory && <p className="text-slate-500 text-sm">₹{metrics.topCategory.value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}</p>}
        </div>
        {/* Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-center transform transition-all hover:-translate-y-0.5 hover:shadow-md">
          <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider mb-2">Largest Transaction</p>
          <p className="text-xl font-bold text-slate-900 truncate">{metrics.maxTx ? metrics.maxTx.description : 'N/A'}</p>
        </div>
        {/* Savings Rate Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-center transform transition-all hover:-translate-y-0.5 hover:shadow-md relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5 text-teal-700">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path></svg>
          </div>
          <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider mb-2">Savings Rate</p>
          <div className="flex items-baseline gap-2">
            <p className={`text-3xl font-extrabold ${metrics.savingsRate >= 20 ? 'text-emerald-600' : metrics.savingsRate > 0 ? 'text-amber-600' : 'text-rose-600'}`}>
              {metrics.savingsRate.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col">
           <h3 className="text-base font-bold text-slate-900 mb-4 w-full text-left">Spending Breakdown</h3>
           <div className="w-full max-w-[200px] aspect-square mx-auto">
           {doughnutData.labels.length > 0 ? (
             <Doughnut data={doughnutData} options={{ cutout: '70%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ₹${ctx.parsed.toLocaleString()}` } } } }} />
           ) : (
             <p className="text-slate-400 text-center mt-10 text-xs">No spending data.</p>
           )}
           </div>
           {/* Custom Legend */}
           {doughnutData.labels.length > 0 && (
             <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 justify-center">
               {doughnutData.labels.map((label, i) => (
                 <div key={label} className="flex items-center gap-1.5">
                   <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}></span>
                   <span className="text-[10px] text-slate-600 font-medium">{label}</span>
                 </div>
               ))}
             </div>
           )}
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 lg:col-span-2 flex flex-col justify-center">
           <h3 className="text-base font-bold text-slate-900 mb-6">Monthly Spending Trend</h3>
           <div className="h-64">
           {barData.labels.length > 0 ? (
             <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#64748b' } }, y: { grid: { color: '#f1f5f9' }, ticks: { color: '#64748b' } } } }} />
           ) : (
             <p className="text-slate-400 text-center py-20 text-sm">No monthly trend data available.</p>
           )}
           </div>
        </div>
      </div>

      {/* AI Insights & Subscriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <InsightsCard transactions={transactions} />
        </div>
        <div>
          <SubscriptionsTracker transactions={transactions} />
        </div>
      </div>

      {/* Budgets & Transactions Table */}
      <div className="space-y-8">
        <BudgetsManager transactions={transactions} onUpdate={refreshData} />
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
          </div>
          <TransactionsTable transactions={transactions} refreshData={refreshData} />
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, subValue, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition duration-200">
    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
    <p className={`text-3xl font-extrabold tracking-tight ${color}`}>{value}</p>
    {subValue && <p className="text-xs text-gray-400 mt-2 truncate w-full" title={subValue}>{subValue}</p>}
  </div>
);

export default Dashboard;
