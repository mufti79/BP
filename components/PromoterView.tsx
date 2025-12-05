import React, { useState } from 'react';
import { PlusCircle, Send, MapPin, Ticket } from 'lucide-react';
import { Promoter, TicketType, CustomerData, SaleRecord, SaleStatus } from '../types';
import { addSale, generateId } from '../services/storageService';

interface PromoterViewProps {
  promoter: Promoter;
}

const PromoterView: React.FC<PromoterViewProps> = ({ promoter }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
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

    const newSale: SaleRecord = {
      id: generateId(),
      promoterId: promoter.id,
      promoterName: promoter.name,
      customer: { ...customer, age: Number(customer.age) },
      items,
      totalAmount: 0, // In a real app, calculate price based on rate card
      status: SaleStatus.PENDING,
      timestamp: Date.now(),
    };

    addSale(newSale);

    // Simulate network delay
    setTimeout(() => {
      setSuccessMsg('Sales confirmed! Sent for verification.');
      setCustomer({ name: '', mobile: '', email: '', location: '', age: 18 });
      setItems({ [TicketType.KIDDO]: 0, [TicketType.EXTREME]: 0, [TicketType.INDIVIDUAL]: 0, [TicketType.ENTRY_ONLY]: 0 });
      setIsSubmitting(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    }, 600);
  };

  const assignedLocations = promoter.assignedFloors && promoter.assignedFloors.length > 0 
    ? promoter.assignedFloors.join(', ')
    : 'No location assigned';

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-indigo-900 text-white rounded-2xl p-6 mb-8 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <h2 className="text-2xl font-bold relative z-10">Hello, {promoter.name}</h2>
        <div className="flex items-center mt-2 text-indigo-200 relative z-10">
          <MapPin size={16} className="mr-2 flex-shrink-0" />
          <span className="truncate">{assignedLocations}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
        <div className="flex items-center mb-6 pb-4 border-b border-slate-100">
          <Ticket className="text-indigo-600 mr-3" />
          <h3 className="text-xl font-bold text-slate-800">New Customer Entry</h3>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center animate-pulse">
            <Send size={18} className="mr-2" /> {successMsg}
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
              placeholder="John Doe"
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
              placeholder="+1 234..."
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
              placeholder="john@example.com"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Location (Source)</label>
            <input
              required
              type="text"
              name="location"
              value={customer.location}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Downtown Mall Entrance"
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
              <PlusCircle className="mr-2" /> Confirm Sales & Entry
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default PromoterView;