import React from 'react';

// Skeleton pour les cartes produits
export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-lg border border-slate-200 p-4 animate-pulse">
    <div className="h-32 bg-slate-200 rounded-lg mb-3"></div>
    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
  </div>
);

// Skeleton pour les items du panier
export const OrderItemSkeleton = () => (
  <div className="flex items-center gap-4 p-4 border-b border-slate-200 animate-pulse">
    <div className="w-12 h-12 bg-slate-200 rounded"></div>
    <div className="flex-1">
      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
    </div>
    <div className="h-4 bg-slate-200 rounded w-16"></div>
  </div>
);

// Skeleton pour les lignes de tableau
export const TableRowSkeleton = ({ cols = 5 }) => (
  <tr className="animate-pulse">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
      </td>
    ))}
  </tr>
);

// Skeleton complet pour un tableau
export const TableSkeleton = ({ cols = 5, rows = 3 }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-slate-200">
      <thead className="bg-slate-50">
        <tr>
          {Array.from({ length: cols }).map((_, i) => (
            <th key={i} className="px-6 py-3">
              <div className="h-4 bg-slate-200 rounded w-24"></div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-slate-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <TableRowSkeleton key={rowIndex} cols={cols} />
        ))}
      </tbody>
    </table>
  </div>
);

// Skeleton pour les graphiques
export const ChartSkeleton = () => (
  <div className="bg-white rounded-xl p-6 animate-pulse">
    <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
    <div className="h-64 bg-slate-200 rounded"></div>
  </div>
);

// Skeleton pour les KPI cards
export const KPICardSkeleton = () => (
  <div className="bg-white rounded-xl p-6 shadow-lg animate-pulse">
    <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
    <div className="h-8 bg-slate-200 rounded w-1/3"></div>
  </div>
);

// Skeleton générique
export const Skeleton = ({ className = '', width = 'w-full', height = 'h-4' }) => (
  <div className={`${className} ${width} ${height} bg-slate-200 rounded animate-pulse`}></div>
);

// Spinner de chargement
export const Spinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}></div>
  );
};

// Loading overlay
export const LoadingOverlay = ({ message = 'Chargement...' }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="bg-white rounded-xl p-8 shadow-2xl flex flex-col items-center gap-4">
      <Spinner size="lg" />
      <p className="text-slate-700 font-medium">{message}</p>
    </div>
  </div>
);

