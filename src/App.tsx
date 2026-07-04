/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { motion } from 'motion/react';
import { Calculator, Delete, RotateCcw } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [expression, setExpression] = React.useState('');
  const [result, setResult] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleCalculate = async () => {
    if (!expression) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expression }),
      });
      if (!res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to calculate');
        } else {
          throw new Error(`Server error: ${res.status} ${res.statusText}`);
        }
      }

      const data = await res.json();
      
      setResult(data.result);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const appendToExpression = (value: string) => {
    if (result !== null) {
      setExpression(result + value);
      setResult(null);
      setError(null);
    } else {
      setExpression((prev) => prev + value);
    }
  };

  const clear = () => {
    setExpression('');
    setResult(null);
    setError(null);
  };

  const deleteLast = () => {
    setExpression((prev) => prev.slice(0, -1));
    if (result !== null) setResult(null);
    setError(null);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCalculate();
    }
  };

  const buttons = [
    { label: 'C', onClick: clear, className: 'bg-rose-100 text-rose-600 hover:bg-rose-200 active:bg-rose-300' },
    { label: 'DEL', onClick: deleteLast, className: 'bg-slate-100 text-slate-600 hover:bg-slate-200 active:bg-slate-300', icon: <Delete size={20} /> },
    { label: '(', onClick: () => appendToExpression('('), className: 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300' },
    { label: ')', onClick: () => appendToExpression(')'), className: 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300' },
    { label: '7', onClick: () => appendToExpression('7') },
    { label: '8', onClick: () => appendToExpression('8') },
    { label: '9', onClick: () => appendToExpression('9') },
    { label: '÷', onClick: () => appendToExpression('/'), className: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 active:bg-indigo-200 font-medium' },
    { label: '4', onClick: () => appendToExpression('4') },
    { label: '5', onClick: () => appendToExpression('5') },
    { label: '6', onClick: () => appendToExpression('6') },
    { label: '×', onClick: () => appendToExpression('*'), className: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 active:bg-indigo-200 font-medium' },
    { label: '1', onClick: () => appendToExpression('1') },
    { label: '2', onClick: () => appendToExpression('2') },
    { label: '3', onClick: () => appendToExpression('3') },
    { label: '−', onClick: () => appendToExpression('-'), className: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 active:bg-indigo-200 font-medium' },
    { label: '0', onClick: () => appendToExpression('0') },
    { label: '.', onClick: () => appendToExpression('.') },
    { label: '=', onClick: handleCalculate, className: 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 font-medium' },
    { label: '+', onClick: () => appendToExpression('+'), className: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 active:bg-indigo-200 font-medium' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-900">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-sm bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100"
      >
        <div className="p-6 pb-0 flex items-center gap-2 text-indigo-600 mb-4">
          <Calculator size={20} />
          <span className="font-semibold text-sm tracking-wide uppercase">Python Calc</span>
        </div>

        {/* Display */}
        <div className="px-6 py-4 bg-slate-50/50 mx-4 rounded-2xl border border-slate-100 flex flex-col justify-end items-end min-h-[120px] mb-6">
          <div className="w-full overflow-hidden text-right">
            <input
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              onKeyDown={onKeyDown}
              className="w-full bg-transparent text-right text-slate-500 text-lg focus:outline-none mb-1"
              placeholder="0"
            />
          </div>
          <div className={cn("text-4xl font-semibold tracking-tight h-10 transition-colors", error ? "text-rose-500 text-lg" : "text-slate-800")}>
            {isLoading ? (
              <RotateCcw className="animate-spin text-slate-400" size={24} />
            ) : error ? (
              <span>{error}</span>
            ) : (
              <span>{result !== null ? result : '\u00A0'}</span>
            )}
          </div>
        </div>

        {/* Keypad */}
        <div className="p-6 pt-0">
          <div className="grid grid-cols-4 gap-3">
            {buttons.map((btn, i) => (
              <button
                key={i}
                onClick={btn.onClick}
                className={cn(
                  "h-14 flex items-center justify-center rounded-2xl text-xl transition-all duration-150 active:scale-95",
                  btn.className || "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                )}
              >
                {btn.icon || btn.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
