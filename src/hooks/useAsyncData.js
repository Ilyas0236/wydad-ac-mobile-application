// ===========================================
// WYDAD AC - USE ASYNC DATA HOOK
// Hook pour chargement de données API
// ===========================================

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook pour gérer le chargement de données asynchrones
 * @param {Function} fetchFn - Fonction qui retourne une Promise avec les données
 * @param {Object} options - Options de configuration
 * @returns {Object} - État et fonctions de contrôle
 */
export const useAsyncData = (fetchFn, options = {}) => {
  const {
    initialData = null,
    autoFetch = true,
    dependencies = [],
    onSuccess = null,
    onError = null,
    transformData = null,
  } = options;

  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await fetchFn();
      
      if (response && response.success !== undefined) {
        // Format API standard { success: boolean, data: any }
        if (response.success) {
          const result = transformData ? transformData(response.data) : response.data;
          setData(result);
          onSuccess?.(result);
        } else {
          const errorMsg = response.message || 'Erreur lors du chargement';
          setError(errorMsg);
          onError?.(errorMsg);
        }
      } else {
        // Données directes
        const result = transformData ? transformData(response) : response;
        setData(result);
        onSuccess?.(result);
      }
    } catch (err) {
      const errorMsg = err.message || 'Erreur de connexion';
      setError(errorMsg);
      onError?.(errorMsg);
      console.error('useAsyncData error:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [fetchFn, transformData, onSuccess, onError]);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  const reload = useCallback(() => {
    return fetchData(false);
  }, [fetchData]);

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setIsLoading(false);
    setRefreshing(false);
  }, [initialData]);

  // Auto-fetch au montage si activé
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [...dependencies, autoFetch]);

  return {
    data,
    setData,
    isLoading,
    refreshing,
    error,
    refresh,
    reload,
    reset,
    fetchData,
  };
};

/**
 * Hook simplifié pour une liste de données
 */
export const useAsyncList = (fetchFn, options = {}) => {
  return useAsyncData(fetchFn, {
    initialData: [],
    ...options,
  });
};

/**
 * Hook pour données avec pagination
 */
export const usePaginatedData = (fetchFn, options = {}) => {
  const {
    pageSize = 20,
    initialPage = 1,
    ...restOptions
  } = options;

  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);
  const [allData, setAllData] = useState([]);

  const paginatedFetch = useCallback(async () => {
    const response = await fetchFn(page, pageSize);
    return response;
  }, [fetchFn, page, pageSize]);

  const { data, isLoading, refreshing, error, refresh } = useAsyncData(paginatedFetch, {
    ...restOptions,
    autoFetch: false,
    onSuccess: (newData) => {
      if (page === initialPage) {
        setAllData(newData);
      } else {
        setAllData(prev => [...prev, ...newData]);
      }
      setHasMore(newData.length >= pageSize);
    },
  });

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [isLoading, hasMore]);

  const resetPagination = useCallback(() => {
    setPage(initialPage);
    setAllData([]);
    setHasMore(true);
  }, [initialPage]);

  useEffect(() => {
    paginatedFetch();
  }, [page]);

  return {
    data: allData,
    isLoading,
    refreshing,
    error,
    hasMore,
    page,
    loadMore,
    refresh: () => {
      resetPagination();
      refresh();
    },
    reset: resetPagination,
  };
};

export default useAsyncData;
