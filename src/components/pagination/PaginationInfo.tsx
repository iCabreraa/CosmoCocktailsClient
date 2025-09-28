"use client";

interface PaginationInfoProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  startIndex: number;
  endIndex: number;
  loading?: boolean;
  className?: string;
}

export default function PaginationInfo({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  startIndex,
  endIndex,
  loading = false,
  className = "",
}: PaginationInfoProps) {
  if (totalItems === 0) {
    return (
      <div className={`text-center text-cosmic-silver ${className}`}>
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cosmic-gold"></div>
            <span>Cargando...</span>
          </div>
        ) : (
          <span>No se encontraron resultados</span>
        )}
      </div>
    );
  }

  const showingText =
    totalPages > 1
      ? `Mostrando ${startIndex + 1}-${endIndex} de ${totalItems} cócteles`
      : `${totalItems} cóctel${totalItems !== 1 ? "es" : ""}`;

  return (
    <div className={`text-center text-cosmic-silver text-sm ${className}`}>
      <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
        <span>{showingText}</span>

        {totalPages > 1 && (
          <div className="flex items-center space-x-2">
            <span>Página</span>
            <span className="font-semibold text-cosmic-gold">
              {currentPage}
            </span>
            <span>de</span>
            <span className="font-semibold text-cosmic-gold">{totalPages}</span>
          </div>
        )}

        {loading && (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-cosmic-gold"></div>
            <span className="text-xs">Actualizando...</span>
          </div>
        )}
      </div>
    </div>
  );
}
