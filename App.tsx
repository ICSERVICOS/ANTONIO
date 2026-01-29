
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { Search, TrendingUp, DollarSign, Globe, Info, RefreshCw, AlertTriangle, ExternalLink, BarChart3, Calendar, Clock, ArrowRight, ChevronLeft, Award } from 'lucide-react';
import { StockData, CalculationResult } from './types';
import { fetchStockData } from './services/geminiService';
import { IndicatorCard } from './components/IndicatorCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// --- Componente de Dashboard (Home) ---
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const popularTickers = ['PETR4.SA', 'VALE3.SA', 'BBAS3.SA', 'ITSA4.SA', 'MC.PA', 'ASML.AS', 'SAP.DE', 'LVMH.PA'];

  return (
    <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-slate-200 animate-in fade-in zoom-in duration-500">
      <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
        <TrendingUp className="w-10 h-10" />
      </div>
      <h2 className="text-3xl font-extrabold text-slate-800">Monitor de Dividendos & Valuation</h2>
      <p className="text-slate-500 mt-4 max-w-xl mx-auto text-lg leading-relaxed">
        Analise o histórico de proventos e calcule o preço justo via Bazin e Graham com inteligência artificial e dados em tempo real.
      </p>
      
      <div className="mt-12">
        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-4">Ações Populares</p>
        <div className="flex flex-wrap justify-center gap-4 px-4">
          {popularTickers.map(t => (
            <button 
              key={t}
              onClick={() => navigate(`/analise/${t}`)}
              className="px-6 py-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-2xl font-bold transition-all border border-slate-100 shadow-sm flex items-center gap-2"
            >
              {t}
              <ArrowRight className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Componente de Detalhes da Ação ---
const StockDetails: React.FC = () => {
  const { ticker } = useParams<{ ticker: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stock, setStock] = useState<StockData | null>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [calc, setCalc] = useState<CalculationResult | null>(null);

  const loadData = async (symbol: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, sources } = await fetchStockData(symbol);
      setStock(data);
      setSources(sources);
      
      const bazin = data.avgDividend5Years / 0.06;
      let graham = 0;
      if (data.eps > 0 && data.bvps > 0) {
        graham = Math.sqrt(22.5 * data.eps * data.bvps);
      }

      setCalc({
        bazinFairPrice: bazin,
        grahamFairPrice: graham,
        upsideBazin: ((bazin / data.currentPrice) - 1) * 100,
        upsideGraham: graham > 0 ? ((graham / data.currentPrice) - 1) * 100 : -100,
      });
    } catch (err: any) {
      setError(err.message || "Falha ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticker) loadData(ticker);
  }, [ticker]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32">
      <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
      <p className="text-slate-500 font-medium animate-pulse">Sincronizando monitor de dividendos para {ticker}...</p>
    </div>
  );

  if (error || !stock || !calc) return (
    <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 max-w-2xl mx-auto">
      <AlertTriangle className="w-10 h-10 text-rose-500 mb-4" />
      <h3 className="text-rose-800 font-bold text-xl">Erro ao Analisar {ticker}</h3>
      <p className="text-rose-700 mt-2">{error}</p>
      <div className="flex gap-4 mt-8">
        <button onClick={() => ticker && loadData(ticker)} className="px-6 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors">Tentar Novamente</button>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-white text-rose-600 border border-rose-200 rounded-xl font-bold hover:bg-rose-50 transition-colors">Voltar</button>
      </div>
    </div>
  );

  const priceChartData = [
    { name: 'Mercado', value: stock.currentPrice, type: 'current' },
    { name: 'Justo (Bazin)', value: calc.bazinFairPrice, type: 'bazin' },
    { name: 'Justo (Graham)', value: calc.grahamFairPrice, type: 'graham' },
  ];

  const currentDividendAmount = stock.currentPrice * (stock.dividendYield / 100);
  const dividendChartData = [
    { name: 'Média (5 Anos)', value: stock.avgDividend5Years, color: '#f59e0b' },
    { name: 'Atual (Est.)', value: currentDividendAmount, color: '#10b981' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      {/* Botão Voltar */}
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold transition-colors group">
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Voltar para o Dashboard
      </button>

      {/* Resumo e Monitor de Dividendos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 p-8 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-700 rounded-2xl flex items-center justify-center font-black text-3xl shadow-inner uppercase tracking-tighter">
                {stock.ticker.substring(0, 4)}
              </div>
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900">{stock.name}</h2>
                <div className="flex items-center gap-3 text-slate-500 text-sm mt-1">
                  <span className="bg-slate-100 px-3 py-1 rounded-full font-bold uppercase text-xs">{stock.ticker}</span>
                  <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> {stock.region}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-xs uppercase font-bold tracking-widest">Preço Atual</p>
              <p className="text-4xl font-black text-slate-900">
                <span className="text-slate-400 text-2xl mr-1 font-light">{stock.currency}</span>
                {stock.currentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-100 pt-8">
             <div className="text-center">
               <p className="text-slate-400 text-[10px] uppercase font-black mb-2 tracking-tighter">Yield Atual</p>
               <p className="text-2xl font-bold text-emerald-600">{stock.dividendYield}%</p>
             </div>
             <div className="text-center border-x border-slate-100">
               <p className="text-slate-400 text-[10px] uppercase font-black mb-2 tracking-tighter">LPA (Lucro)</p>
               <p className="text-2xl font-bold text-slate-700">{stock.eps.toFixed(2)}</p>
             </div>
             <div className="text-center md:border-r border-slate-100">
               <p className="text-slate-400 text-[10px] uppercase font-black mb-2 tracking-tighter">VPA (Patrimônio)</p>
               <p className="text-2xl font-bold text-slate-700">{stock.bvps.toFixed(2)}</p>
             </div>
             <div className="text-center bg-indigo-50/50 rounded-xl p-2 md:p-0 md:bg-transparent">
               <p className="text-indigo-500 text-[10px] uppercase font-black mb-2 tracking-tighter flex items-center justify-center gap-1">
                 <Award className="w-3 h-3" /> Média (5 Anos)
               </p>
               <p className="text-2xl font-bold text-indigo-700">{stock.avgDividend5Years.toFixed(2)}</p>
             </div>
          </div>
        </div>

        <div className="bg-indigo-950 text-white rounded-3xl shadow-2xl p-8 relative overflow-hidden">
          <div className="absolute -top-6 -right-6 opacity-10 rotate-12">
             <Calendar className="w-40 h-40" />
          </div>
          <h3 className="text-xl font-bold mb-8 flex items-center gap-2 relative z-10">
             <Clock className="w-6 h-6 text-indigo-400" /> Monitor de Dividendos
          </h3>
          
          <div className="space-y-6 relative z-10">
            <div className="bg-indigo-900/40 rounded-2xl p-5 border border-indigo-800 backdrop-blur-sm">
              <p className="text-indigo-300 text-xs uppercase font-black mb-1">Próximo Pagamento</p>
              <p className="text-2xl font-bold text-white">{stock.nextDividendDate || 'A anunciar'}</p>
              <div className="flex items-center gap-2 text-indigo-400 text-[10px] mt-2 font-bold bg-indigo-900/60 w-fit px-2 py-1 rounded-md uppercase">
                <RefreshCw className="w-3 h-3" /> {stock.payoutFrequency || 'N/A'}
              </div>
            </div>

            <div className="pt-2">
              <p className="text-indigo-300 text-xs uppercase font-black mb-4">Histórico Recente</p>
              <div className="space-y-3">
                {stock.dividendHistory && stock.dividendHistory.length > 0 ? stock.dividendHistory.map((h, i) => (
                  <div key={i} className="flex justify-between items-center text-sm py-2 border-b border-indigo-900/50 last:border-0 group hover:bg-indigo-900/20 px-1 rounded transition-colors">
                    <span className="text-indigo-200 font-medium">{h.date}</span>
                    <span className="font-mono font-bold text-white bg-indigo-800/40 px-2 py-0.5 rounded flex items-center gap-2">
                      {h.type && (
                        <span className="text-[9px] uppercase opacity-70 border border-white/20 px-1.5 py-0.5 rounded leading-none">
                          {h.type}
                        </span>
                      )}
                      {stock.currency} {h.amount.toFixed(2)}
                    </span>
                  </div>
                )) : (
                  <p className="text-indigo-400 text-xs italic">Nenhum dado recente encontrado nos buscadores.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <IndicatorCard 
          title="Valuation Bazin"
          formula="Média (5A) / 0.06"
          description={`Calculado usando a média de proventos dos últimos 5 anos (${stock.currency} ${stock.avgDividend5Years.toFixed(2)}). Encontra o preço onde esse valor seria um yield de 6%.`}
          value={calc.bazinFairPrice}
          currentPrice={stock.currentPrice}
          currency={stock.currency}
        />
        <IndicatorCard 
          title="Fórmula de Graham"
          formula="√(22.5 * LPA * VPA)"
          description="Valor intrínseco conservador baseado no lucro por ação e valor patrimonial por ação."
          value={calc.grahamFairPrice}
          currentPrice={stock.currentPrice}
          currency={stock.currency}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
          <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2">
             <TrendingUp className="w-5 h-5 text-indigo-500" /> Comparativo de Preços
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priceChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  formatter={(val: number) => [`${stock.currency} ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={45}>
                  {priceChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.type === 'current' ? '#6366f1' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
          <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2">
             <BarChart3 className="w-5 h-5 text-amber-500" /> Comparativo de Dividendos
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dividendChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  formatter={(val: number) => [`${stock.currency} ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Provento']}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={45}>
                  {dividendChartData.map((entry, index) => (
                    <Cell key={`cell-div-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 text-white rounded-3xl p-10 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
         <div className="p-5 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-900/20">
           <ArrowRight className="w-10 h-10 text-white" />
         </div>
         <div className="flex-1">
           <h3 className="text-2xl font-black mb-3">Diagnóstico Antonio Cruz</h3>
           <p className="text-slate-300 text-lg leading-relaxed italic opacity-90">
             {calc.upsideBazin > 0 && calc.upsideGraham > 0 
                ? `Análise completa concluída: ${ticker} apresenta excelente margem de segurança em ambos os modelos clássicos. A média de dividendos dos últimos 5 anos (${stock.currency} ${stock.avgDividend5Years.toFixed(2)}) sustenta a tese de Bazin.`
                : calc.upsideBazin > 0 
                ? "Foco em Renda: O modelo de Bazin indica um yield atrativo baseado no histórico de 5 anos, mas o patrimônio pode estar sobrevalorizado segundo Graham. Atenção ao preço médio."
                : "Os modelos sugerem cautela. O monitoramento de dividendos é vital aqui para garantir que a tese de investimento se mantenha íntegra."}
           </p>
         </div>
      </div>

      {sources.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <h4 className="text-sm font-black text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-widest">
            <Info className="w-5 h-5 text-indigo-500" /> Fontes em Tempo Real
          </h4>
          <div className="flex flex-wrap gap-3">
            {sources.map((s, idx) => (
              s.web && (
                <a key={idx} href={s.web.uri} target="_blank" rel="noopener noreferrer" className="text-xs font-bold bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-2 text-slate-600 hover:text-indigo-600 hover:bg-white hover:border-indigo-200 transition-all shadow-sm">
                  <ExternalLink className="w-3 h-3" />
                  {s.web.title || s.web.uri.split('/')[2]}
                </a>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- App Principal com Roteamento ---
const App: React.FC = () => {
  const [tickerInput, setTickerInput] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (tickerInput.trim()) {
      navigate(`/analise/${tickerInput.trim().toUpperCase()}`);
      setTickerInput('');
    }
  };

  return (
    <div className="min-h-screen pb-20 selection:bg-indigo-100 selection:text-indigo-700">
      {/* Header Fixo */}
      <header className="bg-indigo-700 text-white shadow-2xl sticky top-0 z-50 backdrop-blur-md bg-indigo-700/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row justify-between items-center gap-6">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <TrendingUp className="w-10 h-10" />
            <h1 className="text-2xl font-black tracking-tighter uppercase">Antonio Cruz <span className="text-indigo-300 font-light lowercase text-base block tracking-normal">analisador</span></h1>
          </Link>
          
          <form onSubmit={handleSearch} className="relative w-full md:w-[400px]">
            <input
              type="text"
              placeholder="Pesquisar Ticker (ex: BBAS3, PETR4, MC.PA)..."
              className="w-full bg-indigo-800 text-white placeholder-indigo-400 border-2 border-indigo-600/50 rounded-2xl py-3 pl-5 pr-14 focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all font-bold outline-none"
              value={tickerInput}
              onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
            />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-500 hover:bg-white hover:text-indigo-600 rounded-xl transition-all shadow-lg active:scale-95"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analise/:ticker" element={<StockDetails />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </main>

      <footer className="mt-24 border-t border-slate-200 py-16 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6 opacity-50">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            <span className="font-black uppercase tracking-widest text-slate-800">Antonio Cruz</span>
          </div>
          <p className="text-slate-400 text-sm font-medium">
            Desenvolvido por Antonio Cruz &copy; {new Date().getFullYear()} - Monitor de Dividendos & Valuation Pro
          </p>
          <div className="mt-8 flex justify-center gap-8 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
             <div className="flex flex-col items-center">
               <Globe className="w-5 h-5 mb-1" />
               <span className="text-[10px] font-bold uppercase">Global Data</span>
             </div>
             <div className="flex flex-col items-center">
               <DollarSign className="w-5 h-5 mb-1" />
               <span className="text-[10px] font-bold uppercase">Real Time</span>
             </div>
             <div className="flex flex-col items-center">
               <BarChart3 className="w-5 h-5 mb-1" />
               <span className="text-[10px] font-bold uppercase">Analysis</span>
             </div>
          </div>
          <p className="text-slate-300 text-[10px] mt-10 max-w-2xl mx-auto italic leading-relaxed">
            Aviso: Este aplicativo é uma ferramenta de auxílio analítico. Os dados são provenientes de mecanismos de busca e IA, podendo conter imprecisões. Valide sempre com os documentos oficiais de RI (Relações com Investidores) das empresas citadas.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
