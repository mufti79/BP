import React, { useState, useEffect } from 'react';
import { PlusCircle, Send, MapPin, Ticket, Download, Calendar, History, FileText, CheckCircle } from 'lucide-react';
import { Promoter, TicketType, CustomerData, SaleRecord, SaleStatus } from '../types';
import { addSale, generateId, getSales } from '../services/storageService';

interface PromoterViewProps {
  promoter: Promoter;
}

const PromoterView: React.FC<PromoterViewProps> = ({ promoter }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [lastUniqueCode, setLastUniqueCode] = useState('');
  
  // History & Download State
  const [myHistory, setMyHistory] = useState<SaleRecord[]>([]);
  const [dateStart, setDateStart] = useState(new Date().toISOString().split('T')[0]);
  const [dateEnd, setDateEnd] = useState(new Date().toISOString().split('T')[0]);
  
  const [customer, setCustomer] = useState<CustomerData>({
    name: '',
    mobile: '',
    email: '',
    location: '',
    age: 18,
  });

  const [items, setItems] = useState<Record<string, number>>({
    [TicketType.KIDDO]: 0,
    [TicketType.EXTREME]: 0,
    [TicketType.INDIVIDUAL]: 0,
    [TicketType.ENTRY_ONLY]: 0,
  });

  useEffect(() => {
    refreshHistory();
  }, [promoter.id]);

  const refreshHistory = () => {
    const allSales = getSales();
    const mySales = allSales
      .filter(s => s.promoterId === promoter.id)
      .sort((a, b) => b.timestamp - a.timestamp);
    setMyHistory(mySales);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: value }));
  };

  const handleTicketChange = (type: string, delta: number) => {
    setItems(prev => ({
      ...prev,
      [type]: Math.max(0, (prev[type] || 0) + delta)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const hasTickets = Object.values(items).some((val: number) => val > 0);
    if (!hasTickets) {
      alert("Please select at least one ticket type.");
      setIsSubmitting(false);
      return;
    }

    // Generate Unique Code: First 4 letters of name (or all if shorter) + Last 4 digits of mobile
    const namePart = customer.name.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase();
    const mobilePart = customer.mobile.replace(/[^0-9]/g, '').slice(-4);
    const uniqueCode = `${namePart}-${mobilePart || '0000'}`;

    const newSale: SaleRecord = {
      id: generateId(),
      promoterId: promoter.id,
      promoterName: promoter.name,
      uniqueCode: uniqueCode,
      customer: { ...customer, age: Number(customer.age) },
      items,
      totalAmount: 0, // In a real app, calculate price based on rate card
      status: SaleStatus.PENDING,
      timestamp: Date.now(),
    };

    addSale(newSale);
    refreshHistory();

    // Simulate network delay - reduced for faster entry workflow
    setTimeout(() => {
      setSuccessMsg('Entry Submitted Successfully!');
      setLastUniqueCode(uniqueCode);
      
      // Clear form
      setCustomer({ name: '', mobile: '', email: '', location: '', age: 18 });
      setItems({ [TicketType.KIDDO]: 0, [TicketType.EXTREME]: 0, [TicketType.INDIVIDUAL]: 0, [TicketType.ENTRY_ONLY]: 0 });
      setIsSubmitting(false);
      
      // Hide success message after 5 seconds (give time to read code)
      setTimeout(() => {
        setSuccessMsg('');
        setLastUniqueCode('');
      }, 5000);
    }, 300);
  };

  const handleDownload = () => {
    const start = new Date(dateStart).setHours(0, 0, 0, 0);
    const end = new Date(dateEnd).setHours(23, 59, 59, 999);
    
    const dataToExport = myHistory.filter(s => s.timestamp >= start && s.timestamp <= end);
    
    if (dataToExport.length === 0) {
      alert("No entries found for the selected date range.");
      return;
    }

    // Updated headers to include Promoter Name and Unique Code
    const headers = ['Date', 'Unique Code', 'Promoter Name', 'Customer Name', 'Mobile', 'Email', 'Location', 'Age', 'Kiddo', 'Extreme', 'Individual', 'Entry Only', 'Status'];
    const rows = dataToExport.map(s => [
      new Date(s.timestamp).toLocaleDateString() + ' ' + new Date(s.timestamp).toLocaleTimeString(),
      `"${s.uniqueCode || '-'}"`,
      `"${s.promoterName}"`,
      `"${s.customer.name}"`,
      s.customer.mobile,
      s.customer.email,
      `"${s.customer.location}"`,
      s.customer.age,
      s.items[TicketType.KIDDO] || 0,
      s.items[TicketType.EXTREME] || 0,
      s.items[TicketType.INDIVIDUAL] || 0,
      s.items[TicketType.ENTRY_ONLY] || 0,
      s.status
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const safePromoterName = promoter.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.setAttribute("download", `${safePromoterName}_entries_${dateStart}_to_${dateEnd}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const assignedLocations = promoter.assignedFloors && promoter.assignedFloors.length > 0 
    ? promoter.assignedFloors.join(', ')
    : 'No location assigned';

  return (
    <div className="max-w-4xl mx-auto p-6 pb-20">
      <div className="bg-indigo-900 text-white rounded-2xl p-6 mb-8 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <h2 className="text-2xl font-bold relative z-10">{promoter.name}</h2>
        <div className="flex items-center mt-2 text-indigo-200 relative z-10">
          <MapPin size={16} className="mr-2 flex-shrink-0" />
          <span className="truncate">{assignedLocations}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Entry Form */}
        <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md border border-slate-200 p-6 h-full relative overflow-hidden">
                <div className="flex items-center mb-6 pb-4 border-b border-slate-100">
                <Ticket className="text-indigo-600 mr-3" />
                <h3 className="text-xl font-bold text-slate-800">New Customer Entry</h3>
                </div>

                {successMsg && (
                  <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-6 animate-fade-in">
                     <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600 shadow-sm">
                       <CheckCircle size={40} />
                     </div>
                     <h3 className="text-2xl font-bold text-slate-800 mb-2">{successMsg}</h3>
                     <p className="text-slate-500 mb-6">Customer Verification Code:</p>
                     <div className="bg-slate-100 border-2 border-slate-200 rounded-xl px-8 py-4 mb-8">
                        <span className="text-3xl font-mono font-bold text-indigo-700 tracking-wider">{lastUniqueCode}</span>
                     </div>
                     <button 
                       type="button" 
                       onClick={() => { setSuccessMsg(''); setLastUniqueCode(''); }}
                       className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                     >
                       Make Another Entry
                     </button>
                  </div>
                )}

                {/* Customer Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
                    <input
                    required
                    type="text"
                    name="name"
                    value={customer.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="Mufti Mahmud"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                    <input
                    required
                    type="number"
                    name="age"
                    value={customer.age}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mobile No</label>
                    <input
                    required
                    type="tel"
                    name="mobile"
                    value={customer.mobile}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="+880 1XXX..."
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email ID</label>
                    <input
                    required
                    type="email"
                    name="email"
                    value={customer.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="mufti@example.com"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                    <input
                    required
                    type="text"
                    name="location"
                    value={customer.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Shymoli"
                    />
                </div>
                </div>

                {/* Ticket Selection */}
                <div className="mb-8">
                <label className="block text-sm font-medium text-slate-700 mb-3">KPI Targets / Ticket Types</label>
                <div className="space-y-3">
                    {Object.values(TicketType).map((type) => (
                    <div key={type} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="font-medium text-slate-700">{type}</span>
                        <div className="flex items-center space-x-3">
                        <button
                            type="button"
                            onClick={() => handleTicketChange(type, -1)}
                            className="w-8 h-8 rounded-full bg-white border border-slate-300 text-slate-500 hover:bg-slate-100 flex items-center justify-center"
                        >
                            -
                        </button>
                        <span className="w-8 text-center font-bold text-lg">{items[type]}</span>
                        <button
                            type="button"
                            onClick={() => handleTicketChange(type, 1)}
                            className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 hover:bg-indigo-200 flex items-center justify-center"
                        >
                            +
                        </button>
                        </div>
                    </div>
                    ))}
                </div>
                </div>

                <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all flex items-center justify-center"
                >
                {isSubmitting ? (
                    'Processing...'
                ) : (
                    <>
                    <PlusCircle className="mr-2" /> Submit Entry
                    </>
                )}
                </button>
            </form>
        </div>

        {/* History & Download Section */}
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
                <div className="flex items-center mb-4 pb-2 border-b border-slate-100">
                   <Download className="text-emerald-600 mr-2" />
                   <h3 className="text-lg font-bold text-slate-800">Export Data</h3>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">From</label>
                        <div className="relative">
                           <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
                           <input 
                             type="date" 
                             value={dateStart}
                             onChange={(e) => setDateStart(e.target.value)}
                             className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500"
                           />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">To</label>
                         <div className="relative">
                           <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
                           <input 
                             type="date" 
                             value={dateEnd}
                             onChange={(e) => setDateEnd(e.target.value)}
                             className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500"
                           />
                        </div>
                    </div>
                    <button 
                        onClick={handleDownload}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                        <FileText className="mr-2" size={18} /> Download CSV
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 flex-1">
                <div className="flex items-center mb-4 pb-2 border-b border-slate-100">
                   <History className="text-purple-600 mr-2" />
                   <h3 className="text-lg font-bold text-slate-800">Recent Entries</h3>
                </div>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                    {myHistory.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-4">No entries found yet.</p>
                    ) : (
                        myHistory.slice(0, 10).map(sale => (
                            <div key={sale.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex flex-col">
                                       <span className="font-semibold text-slate-700 text-sm truncate">{sale.customer.name}</span>
                                       {sale.uniqueCode && <span className="text-[10px] font-mono text-indigo-500">{sale.uniqueCode}</span>}
                                    </div>
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                        sale.status === SaleStatus.VERIFIED ? 'bg-emerald-100 text-emerald-700' :
                                        sale.status === SaleStatus.REJECTED ? 'bg-red-100 text-red-700' :
                                        'bg-amber-100 text-amber-700'
                                    }`}>
                                        {sale.status}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-500 mb-2">
                                    {new Date(sale.timestamp).toLocaleString()}
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {Object.entries(sale.items).map(([type, count]) => (
                                        ((count as number) || 0) > 0 && (
                                            <span key={type} className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                                                {type}: {count}
                                            </span>
                                        )
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PromoterView;