
import React from 'react';

interface IndicatorCardProps {
  title: string;
  description: string;
  value: number;
  currentPrice: number;
  currency: string;
  formula: string;
}

export const IndicatorCard: React.FC<IndicatorCardProps> = ({ title, description, value, currentPrice, currency, formula }) => {
  const upside = ((value / currentPrice) - 1) * 100;
  const isUndervalued = value > currentPrice;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <p className="text-xs text-slate-500 uppercase tracking-wider">{formula}</p>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-semibold ${isUndervalued ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
          {isUndervalued ? 'Oportunidade' : 'Sobrevalorizada'}
        </div>
      </div>
      
      <p className="text-sm text-slate-600 mb-6">{description}</p>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-400">Preço Justo</p>
          <p className="text-xl font-bold text-slate-900">{currency} {value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Margem de Segurança</p>
          <p className={`text-xl font-bold ${upside >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {upside.toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="mt-6 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${isUndervalued ? 'bg-emerald-500' : 'bg-rose-500'}`}
          style={{ width: `${Math.min(Math.max((value / currentPrice) * 50, 5), 100)}%` }}
        ></div>
      </div>
    </div>
  );
};
