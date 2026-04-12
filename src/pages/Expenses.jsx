import React, { useState, useEffect } from 'react';
import { IndianRupee, Plus, Receipt } from 'lucide-react';
import './Expenses.css';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [billName, setBillName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [purchasedBy, setPurchasedBy] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await fetch('/api/expenses');
      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
      }
    } catch (err) {
      console.error("Failed to fetch expenses", err);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!billName || !amount || !date || !purchasedBy) return;

    setIsSubmitting(true);
    const newExpense = {
      billName,
      amount: parseFloat(amount),
      date,
      purchasedBy
    };

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense)
      });
      if (res.ok) {
        const result = await res.json();
        // Update local state without re-fetching
        setExpenses(prev => [...prev, { id: result.expense.id || Date.now().toString(), ...newExpense }]);
        // Reset form
        setBillName('');
        setAmount('');
        setDate('');
        setPurchasedBy('');
      }
    } catch (err) {
      console.error("Failed to save expense", err);
      alert("Error saving the expense. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalExpenses = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return (
    <div className="expenses-container fade-in">
      <div className="expenses-header glass-panel">
        <Receipt size={40} color="var(--primary-color)" />
        <h2>VBS 2026 Expenses</h2>
        <p>Log and track all bills and expenditures here.</p>
      </div>

      <div className="expenses-content">
        {/* Form Section */}
        <div className="expense-form-card glass-panel slide-up-1">
          <h3>Add New Bill</h3>
          <form onSubmit={handleAddExpense} className="expense-form">
            <div className="form-group">
              <label>Bill Name / Description</label>
              <input 
                type="text" 
                placeholder="e.g. Craft Supplies, Snacks" 
                value={billName} 
                onChange={(e) => setBillName(e.target.value)} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Amount (₹)</label>
              <input 
                type="number" 
                placeholder="Enter amount" 
                min="0" 
                step="0.01"
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                required 
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Date of Purchase</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Purchased By</label>
                <input 
                  type="text" 
                  placeholder="Person's name"
                  value={purchasedBy} 
                  onChange={(e) => setPurchasedBy(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary sumbit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : <><Plus size={18} /> Record Expense</>}
            </button>
          </form>
        </div>

        {/* Totals & History Section */}
        <div className="expense-history-card glass-panel slide-up-2">
          <div className="history-header">
            <h3>Expense History</h3>
            <div className="total-badge glow-pulse">
              <IndianRupee size={20} />
              <span className="total-amount">{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              <span className="total-label">Total Spent</span>
            </div>
          </div>

          <div className="table-responsive">
            <table className="expenses-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Bill Name</th>
                  <th>Purchased By</th>
                  <th className="amount-col">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="empty-state">No expenses recorded yet.</td>
                  </tr>
                ) : (
                  expenses.map((exp, idx) => (
                    <tr key={exp.id || idx}>
                      <td>{exp.date}</td>
                      <td style={{fontWeight: '600', color: 'var(--text-light)'}}>{exp.billName}</td>
                      <td>{exp.purchasedBy}</td>
                      <td className="amount-col font-mono">₹{Number(exp.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
