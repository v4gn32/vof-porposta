import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  FileText,
  Calendar,
  Download
} from 'lucide-react';
import { getProposals, getClients, getServices } from '../utils/storage';
import { Proposal, Client, Service } from '../types';
import StatusBadge from '../components/StatusBadge';

const Reports: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  
  useEffect(() => {
    setProposals(getProposals());
    setClients(getClients());
    setServices(getServices());
  }, []);
  
  const filteredProposals = proposals.filter(proposal => {
    const proposalDate = new Date(proposal.createdAt);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    return proposalDate >= startDate && proposalDate <= endDate;
  });
  
  // Statistics
  const totalProposals = filteredProposals.length;
  const approvedProposals = filteredProposals.filter(p => p.status === 'aprovada');
  const totalRevenue = approvedProposals.reduce((sum, p) => sum + p.total, 0);
  const conversionRate = totalProposals > 0 ? (approvedProposals.length / totalProposals) * 100 : 0;
  const averageValue = approvedProposals.length > 0 ? totalRevenue / approvedProposals.length : 0;
  
  // Status distribution
  const statusStats = [
    { status: 'rascunho', count: filteredProposals.filter(p => p.status === 'rascunho').length },
    { status: 'enviada', count: filteredProposals.filter(p => p.status === 'enviada').length },
    { status: 'aprovada', count: filteredProposals.filter(p => p.status === 'aprovada').length },
    { status: 'recusada', count: filteredProposals.filter(p => p.status === 'recusada').length },
  ];
  
  // Top clients
  const clientStats = clients.map(client => {
    const clientProposals = filteredProposals.filter(p => p.clientId === client.id);
    const approvedValue = clientProposals
      .filter(p => p.status === 'aprovada')
      .reduce((sum, p) => sum + p.total, 0);
    
    return {
      client,
      proposalCount: clientProposals.length,
      totalValue: approvedValue
    };
  }).filter(stat => stat.proposalCount > 0)
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 5);
  
  // Service usage
  const serviceStats = services.map(service => {
    const serviceUsage = filteredProposals.reduce((count, proposal) => {
      const serviceItems = proposal.items.filter(item => item.serviceId === service.id);
      return count + serviceItems.reduce((sum, item) => sum + item.quantity, 0);
    }, 0);
    
    const serviceRevenue = filteredProposals
      .filter(p => p.status === 'aprovada')
      .reduce((sum, proposal) => {
        const serviceItems = proposal.items.filter(item => item.serviceId === service.id);
        return sum + serviceItems.reduce((itemSum, item) => itemSum + item.total, 0);
      }, 0);
    
    return {
      service,
      usage: serviceUsage,
      revenue: serviceRevenue
    };
  }).filter(stat => stat.usage > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
  
  const exportReport = () => {
    const reportData = {
      period: `${dateRange.start} a ${dateRange.end}`,
      summary: {
        totalProposals,
        approvedProposals: approvedProposals.length,
        totalRevenue,
        conversionRate,
        averageValue
      },
      statusDistribution: statusStats,
      topClients: clientStats,
      topServices: serviceStats
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_${dateRange.start}_${dateRange.end}.json`;
    link.click();
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Análise de desempenho e métricas</p>
        </div>
        <button
          onClick={exportReport}
          className="inline-flex items-center px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors duration-200"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar Relatório
        </button>
      </div>
      
      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Período:</span>
          </div>
          <div className="flex space-x-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
            <span className="py-2 text-gray-500">até</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-500 rounded-lg p-3 mr-4">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Propostas</p>
              <p className="text-2xl font-semibold text-gray-900">{totalProposals}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-500 rounded-lg p-3 mr-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
              <p className="text-2xl font-semibold text-gray-900">{conversionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-cyan-500 rounded-lg p-3 mr-4">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
              <p className="text-2xl font-semibold text-gray-900">R$ {totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-purple-500 rounded-lg p-3 mr-4">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
              <p className="text-2xl font-semibold text-gray-900">R$ {averageValue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Distribuição por Status</h3>
          <div className="space-y-4">
            {statusStats.map(({ status, count }) => {
              const percentage = totalProposals > 0 ? (count / totalProposals) * 100 : 0;
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <StatusBadge status={status as any} />
                    <span className="text-sm text-gray-900">{count} propostas</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-cyan-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Top Clients */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Clientes</h3>
          {clientStats.length > 0 ? (
            <div className="space-y-4">
              {clientStats.map(({ client, proposalCount, totalValue }) => (
                <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{client.company}</p>
                    <p className="text-sm text-gray-600">{proposalCount} propostas</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">R$ {totalValue.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Nenhum dado disponível</p>
          )}
        </div>
        
        {/* Top Services */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Serviços Mais Vendidos</h3>
          {serviceStats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Serviço
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Categoria
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Quantidade
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Receita
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {serviceStats.map(({ service, usage, revenue }) => (
                    <tr key={service.id}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{service.name}</p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {service.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {service.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">
                        {usage}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        R$ {revenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Nenhum dado disponível</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;