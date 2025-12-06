import React, { useState, useEffect } from 'react';
import { PlusCircle, MapPin, Ticket, History, CheckCircle, MessageSquare, Star, Send } from 'lucide-react';
import { Promoter, TicketType, CustomerData, SaleRecord, SaleStatus, FeedbackRecord } from '../types';
import { addSale, generateId, getSales, addFeedback, getFeedbacks } from '../services/storageService';

interface PromoterViewProps {
  promoter: Promoter;
}

const PromoterView: React.FC<PromoterViewProps> = ({ promoter }) => {
  const [activeTab, setActiveTab] = useState<'ENTRY' | 'FEEDBACK'>('ENTRY');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [lastUniqueCode, setLastUniqueCode] = useState('');
  
  // History State
  const [myHistory, setMyHistory] = useState<SaleRecord[]>([]);
  const [myFeedbacks, setMyFeedbacks] = useState<FeedbackRecord[]>([]);
  
  const [customer, setCustomer] = useState<CustomerData>({
    name: '',
    mobile: '',
    email: '',
    location: '',
    age: 18,
  });

  // Sales specific state
  const [items, setItems] = useState<Record<string, number>>({
    [TicketType.KIDDO]: 0,
    [TicketType.EXTREME]: 0,
    [TicketType.INDIVIDUAL]: 0,
    [TicketType.ENTRY_ONLY]: 0,
  });

  // Feedback specific state
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');

  useEffect(() => {
    refreshHistory();
  }, [promoter.id]);

  const refreshHistory = () => {
    // Refresh Sales
    const allSales = getSales();
    const mySales = allSales
      .filter(s => s.promoterId === promoter.id)
      .sort((a, b) => b.timestamp - a.timestamp);
    setMyHistory(mySales);

    // Refresh Feedbacks
    const allFeedbacks = getFeedbacks();
    const myFbs = allFeedbacks
        .filter(f => f.promoterId === promoter.id)
        .sort((a, b) => b.timestamp - a.timestamp);
    setMyFeedbacks(myFbs);
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

    if (activeTab === 'ENTRY') {
        const hasTickets = Object.values(items).some((val: number) => val > 0);
        if (!hasTickets) {
          alert("Please select at least one ticket type.");
          setIsSubmitting(false);
          return;
        }

        // Generate Unique Code
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
          totalAmount: 0,
          status: SaleStatus.PENDING,
          timestamp: Date.now(),
        };

        addSale(newSale);
        
        setTimeout(() => {
          setSuccessMsg('Entry Submitted Successfully!');
          setLastUniqueCode(uniqueCode);
          resetForm();
          setIsSubmitting(false);
          
          setTimeout(() => {
            setSuccessMsg('');
            setLastUniqueCode('');
          }, 5000);
        }, 300);
    } else {
        // Handle Feedback Submission
        if (feedbackRating === 0) {
            alert("Please provide a rating.");
            setIsSubmitting(false);
            return;
        }

        const newFeedback: FeedbackRecord = {
            id: generateId(),
            promoterId: promoter.id,
            promoterName: promoter.name,
            customer: { ...customer, age: Number(customer.age) },
            rating: feedbackRating,
            comment: feedbackComment,
            timestamp: Date.now()
        };

        addFeedback(newFeedback);

        setTimeout(() => {
            setSuccessMsg('Feedback Recorded!');
            resetForm();
            setIsSubmitting(false);

            setTimeout(() => {
                setSuccessMsg('');
            }, 3000);
        }, 300);
    }
    
    refreshHistory();
  };

  const resetForm = () => {
      setCustomer({ name: '', mobile: '', email: '', location: '', age: 18 });
      setItems({ [TicketType.KIDDO]: 0, [TicketType.EXTREME]: 0, [TicketType.INDIVIDUAL]: 0, [TicketType.ENTRY_ONLY]: 0 });
      setFeedbackRating(0);
      setFeedbackComment('');
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

      <div className="flex gap-4 mb-6">
        <button
            onClick={() => setActiveTab('ENTRY')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center ${
                activeTab === 'ENTRY' 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
        >
            <Ticket className="mr-2" size={20} /> New Sale Entry
        </button>
        <button
            onClick={() => setActiveTab('FEEDBACK')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center ${
                activeTab === 'FEEDBACK' 
                ? 'bg-rose-600 text-white shadow-lg' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
        >
            <MessageSquare className="mr-2" size={20} /> Customer Feedback
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md border border-slate-200 p-6 h-full relative overflow-hidden">
                <div className="flex items-center mb-6 pb-4 border-b border-slate-100">
                {activeTab === 'ENTRY' ? <Ticket className="text-indigo-600 mr-3" /> : <MessageSquare className="text-rose-600 mr-3" />}
                <h3 className="text-xl font-bold text-slate-800">
                    {activeTab === 'ENTRY' ? 'New Customer Entry' : 'Collect Customer Feedback'}
                </h3>
                </div>

                {successMsg && (
                  <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-6 animate-fade-in">
                     <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-sm ${activeTab === 'ENTRY' ? 'bg-green-100 text-green-600' : 'bg-rose-100 text-rose-600'}`}>
                       {activeTab === 'ENTRY' ? <CheckCircle size={40} /> : <MessageSquare size={40} />}
                     </div>
                     <h3 className="text-2xl font-bold text-slate-800 mb-2">{successMsg}</h3>
                     {activeTab === 'ENTRY' && (
                        <>
                            <p className="text-slate-500 mb-6">Customer Verification Code:</p>
                            <div className="bg-slate-100 border-2 border-slate-200 rounded-xl px-8 py-4 mb-8">
                                <span className="text-3xl font-mono font-bold text-indigo-700 tracking-wider">{lastUniqueCode}</span>
                            </div>
                        </>
                     )}
                     <button 
                       type="button" 
                       onClick={() => { setSuccessMsg(''); setLastUniqueCode(''); }}
                       className={`px-6 py-2 rounded-lg font-medium transition-colors text-white ${activeTab === 'ENTRY' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-rose-600 hover:bg-rose-700'}`}
                     >
                       {activeTab === 'ENTRY' ? 'Make Another Entry' : 'Collect Another Feedback'}
                     </button>
                  </div>
                )}

                {/* Common Customer Details */}
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
                {activeTab === 'ENTRY' && (
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
                )}
                </div>

                {activeTab === 'ENTRY' ? (
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
                ) : (
                    <div className="mb-8">
                         <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
                         <div className="flex gap-2 mb-4">
                             {[1, 2, 3, 4, 5].map((star) => (
                                 <button
                                     key={star}
                                     type="button"
                                     onClick={() => setFeedbackRating(star)}
                                     className={`p-2 rounded-full transition-colors ${feedbackRating >= star ? 'text-yellow-400' : 'text-slate-200'}`}
                                 >
                                     <Star size={32} fill={feedbackRating >= star ? "currentColor" : "none"} />
                                 </button>
                             ))}
                         </div>
                         <label className="block text-sm font-medium text-slate-700 mb-2">Comments</label>
                         <textarea 
                             className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                             rows={4}
                             placeholder="Short feedback..."
                             value={feedbackComment}
                             onChange={(e) => setFeedbackComment(e.target.value)}
                         />
                    </div>
                )}

                <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center ${activeTab === 'ENTRY' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-rose-600 hover:bg-rose-700'}`}
                >
                {isSubmitting ? (
                    'Processing...'
                ) : (
                    activeTab === 'ENTRY' ? (
                        <><PlusCircle className="mr-2" /> Submit Entry</>
                    ) : (
                        <><Send className="mr-2" /> Submit Feedback</>
                    )
                )}
                </button>
            </form>
        </div>

        {/* History Section */}
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 flex-1 h-full">
                <div className="flex items-center mb-4 pb-2 border-b border-slate-100">
                   <History className="text-purple-600 mr-2" />
                   <h3 className="text-lg font-bold text-slate-800">
                       {activeTab === 'ENTRY' ? 'Recent Entries' : 'Recent Feedback'}
                   </h3>
                </div>
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                    {activeTab === 'ENTRY' ? (
                        myHistory.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-4">No entries found yet.</p>
                        ) : (
                            myHistory.slice(0, 15).map(sale => (
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
                        )
                    ) : (
                        myFeedbacks.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-4">No feedback collected yet.</p>
                        ) : (
                            myFeedbacks.slice(0, 15).map(fb => (
                                <div key={fb.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-semibold text-slate-700 text-sm truncate">{fb.customer.name}</span>
                                        <div className="flex text-yellow-500">
                                            {[...Array(fb.rating)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-500 mb-2">
                                        {new Date(fb.timestamp).toLocaleString()}
                                    </div>
                                    {fb.comment && (
                                        <p className="text-xs text-slate-600 italic border-l-2 border-slate-300 pl-2">
                                            "{fb.comment}"
                                        </p>
                                    )}
                                </div>
                            ))
                        )
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PromoterView;