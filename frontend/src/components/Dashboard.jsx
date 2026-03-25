import React, { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import TransactionsTable from './TransactionsTable';
import BudgetsManager from './BudgetsManager';
import SubscriptionsTracker from './SubscriptionsTracker';
import InsightsCard from './InsightsCard';

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

  // Chart Data
  const doughnutData = {
    labels: Object.keys(metrics.catTotals).filter(k => k !== 'Income' && k !== 'Transfer'),
    datasets: [{
      data: Object.entries(metrics.catTotals).filter(([k]) => k !== 'Income' && k !== 'Transfer').map(e => e[1]),
      backgroundColor: [
        '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#6366f1'
      ],
      borderWidth: 0,
    }]
  };

  const barData = {
    labels: Object.keys(metrics.monthlySpend),
    datasets: [{
      label: 'Spending',
      data: Object.values(metrics.monthlySpend),
      backgroundColor: '#14b8a6',
      borderRadius: 4
    }]
  };

  return (
    <div className="animate-fade-in-up">
      {/* Transparency Strip */}
      <div className="bg-gradient-to-r from-teal-500/10 to-indigo-500/10 border border-teal-500/20 rounded-2xl p-4 mb-8 flex justify-between items-center shadow-lg shadow-teal-500/5">
        <div>
          <span className="text-teal-400 font-bold text-lg">{data.stats?.ai_percentage}%</span> <span className="text-slate-400 text-sm">AI Categorized</span>
        </div>
        <div className="h-6 w-px bg-slate-800"></div>
        <div>
           <span className="text-indigo-400 font-bold text-lg">{data.stats?.rules_percentage}%</span> <span className="text-slate-400 text-sm">Rule Categorized</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-slate-800 flex flex-col justify-center transform transition-all hover:-translate-y-1 hover:shadow-teal-500/10">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Total Spent</p>
          <p className="text-3xl font-extrabold text-white">₹{metrics.totalSpend.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}</p>
        </div>
        {/* Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-slate-800 flex flex-col justify-center transform transition-all hover:-translate-y-1 hover:shadow-teal-500/10">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Net Flow</p>
          <p className={`text-3xl font-extrabold ${metrics.netFlow >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
            ₹{Math.abs(metrics.netFlow).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}
          </p>
        </div>
        {/* Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-slate-800 flex flex-col justify-center transform transition-all hover:-translate-y-1 hover:shadow-teal-500/10">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Top Spend Category</p>
          <p className="text-xl font-bold text-white truncate">{metrics.topCategory ? metrics.topCategory.name : 'N/A'}</p>
          {metrics.topCategory && <p className="text-slate-500 text-sm">₹{metrics.topCategory.value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}</p>}
        </div>
        {/* Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-slate-800 flex flex-col justify-center transform transition-all hover:-translate-y-1 hover:shadow-teal-500/10">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Largest Transaction</p>
          <p className="text-xl font-bold text-white truncate">{metrics.maxTx ? metrics.maxTx.description : 'N/A'}</p>
        </div>
        {/* Savings Rate Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-slate-800 flex flex-col justify-center transform transition-all hover:-translate-y-1 hover:shadow-teal-500/10 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path></svg>
          </div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Savings Rate</p>
          <div className="flex items-baseline gap-2">
            <p className={`text-3xl font-extrabold ${metrics.savingsRate >= 20 ? 'text-teal-400' : metrics.savingsRate > 0 ? 'text-amber-400' : 'text-rose-400'}`}>
              {metrics.savingsRate.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-slate-800 flex flex-col items-center justify-center">
           <h3 className="text-lg font-bold text-white mb-6 w-full text-left">Spending Breakdown</h3>
           <div className="w-full max-w-[250px] aspect-square">
           {doughnutData.labels.length > 0 ? (
             <Doughnut data={doughnutData} options={{ cutout: '75%', plugins: { legend: { display: false } } }} />
           ) : (
             <p className="text-slate-500 text-center mt-10">No spending data.</p>
           )}
           </div>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-slate-800 lg:col-span-2 flex flex-col items-center justify-center">
           <h3 className="text-lg font-bold text-white mb-6 w-full text-left">Monthly Distribution</h3>
           <div className="h-64 flex items-center justify-center w-full">
             {Object.keys(metrics.monthlySpend).length > 0 ? (
               <Bar data={barData} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }, x: { grid: { display: false }, ticks: { color: '#94a3b8' } } }, plugins: { legend: { display: false } } }} />
             ) : (
               <p className="text-slate-500">No spending data.</p>
             )}
           </div>
        </div>
      </div>

      {/* New Features Row: Budgets, Subscriptions, AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="col-span-1">
          <BudgetsManager catTotals={metrics.catTotals} />
        </div>
        <div className="col-span-1">
          <SubscriptionsTracker transactions={transactions} />
        </div>
        <div className="col-span-1">
          <InsightsCard />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-800/60 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
        </div>
        <TransactionsTable transactions={transactions} refreshData={refreshData} />
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
