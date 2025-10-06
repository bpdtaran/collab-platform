import { useState, useCallback, useRef } from 'react';
import { documentService } from '../services/documentService';
import debounce from 'debounce';

export const useSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const searchOffset = useRef(0);
  const currentQuery = useRef('');

  const performSearch = useCallback(async (query, filters = {}, reset = false) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const offset = reset ? 0 : searchOffset.current;

      const response = await documentService.searchDocuments(query, {
        ...filters,
        offset,
        limit: 20,
      });

      if (reset) {
        setResults(response.results);
        searchOffset.current = response.results.length;
      } else {
        setResults(prev => [...prev, ...response.results]);
        searchOffset.current += response.results.length;
      }

      setTotalCount(response.totalCount);
      setHasMore(response.hasMore);
      currentQuery.current = query;
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useCallback(
    debounce((query, filters) => performSearch(query, filters, true), 300),
    []
  );

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      performSearch(currentQuery.current, {}, false);
    }
  }, [hasMore, loading, performSearch]);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
    searchOffset.current = 0;
    currentQuery.current = '';
  }, []);

  return {
    results,
    loading,
    error,
    hasMore,
    totalCount,
    search: debouncedSearch,
    loadMore,
    clearResults,
  };
};