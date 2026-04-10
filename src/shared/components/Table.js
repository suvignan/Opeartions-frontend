import React from 'react';
import { TableSkeleton } from './SkeletonLoader';

export const Table = ({ columns, data, onRowClick, isLoading, emptyMessage = "No data available" }) => {
  if (isLoading) {
    // Dynamically render skeletons based on exactly how many columns the table defines
    return <TableSkeleton columns={columns.length} rows={5} />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full py-16 text-center">
        <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
          <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '32px'}}>inbox</span>
        </div>
        <p className="text-slate-500 font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50/50">
            {columns.map((col, index) => (
              <th 
                key={index} 
                className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.map((row, rowIndex) => (
            <tr 
              key={rowIndex} 
              onClick={() => onRowClick && onRowClick(row)}
              className={`hover:bg-slate-50/80 transition-colors group ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="px-6 py-4 text-sm text-slate-600">
                  {col.render ? col.render(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
