import React, { useState } from 'react';
import {
  Box,
  TextField,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { Search, Folder, Person, Schedule } from '@mui/icons-material';
import { useSearch } from '../hooks/useSearch';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from '@mui/material';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    workspaceId: '',
    contentOnly: false,
  });
  const {
    results,
    loading,
    error,
    hasMore,
    totalCount,
    search,
    loadMore,
  } = useSearch();

  const navigate = useNavigate();

  const handleSearch = (newQuery, newFilters = filters) => {
    setQuery(newQuery);
    search(newQuery, newFilters);
  };

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    if (query) {
      search(query, newFilters);
    }
  };

  const handleResultClick = (document) => {
    navigate(`/document/${document._id}`);
  };

  const highlightText = (text, highlight) => {
    if (!highlight || !text) return text;

    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase()
        ? <mark key={i} style={{ backgroundColor: '#ffeb3b', padding: '0 2px' }}>{part}</mark>
        : part
    );
  };

  return (
    <Box>
      {/* Search Header */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Search Documents
        </Typography>

        {/* Search Box */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search across all your documents..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {/* Filters */}
        <Box display="flex" gap={2} alignItems="center">
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>Workspace</InputLabel>
            <Select
              value={filters.workspaceId}
              label="Workspace"
              onChange={(e) => handleFilterChange('workspaceId', e.target.value)}
            >
              <MenuItem value="">All Workspaces</MenuItem>
              {/* Workspace options would be populated from API */}
            </Select>
          </FormControl>

          <Chip
            label="Search content only"
            variant={filters.contentOnly ? "filled" : "outlined"}
            clickable
            onClick={() => handleFilterChange('contentOnly', !filters.contentOnly)}
            color={filters.contentOnly ? "primary" : "default"}
          />
        </Box>
      </Box>

      {/* Search Results */}
      {query && (
        <Box>
          <Typography variant="h6" gutterBottom>
            {totalCount} results for "{query}"
          </Typography>

          {loading && (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Typography color="error" sx={{ p: 2 }}>
              {error}
            </Typography>
          )}

          <Grid container spacing={3}>
            {results.map((document) => (
              <Grid item xs={12} key={document._id}>
                <Card
                  sx={{ cursor: 'pointer', transition: 'all 0.2s', '&:hover': { elevation: 4 } }}
                  onClick={() => handleResultClick(document)}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {highlightText(document.title, query)}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" paragraph>
                      {highlightText(
                        document.content.substring(0, 200) +
                        (document.content.length > 200 ? '...' : ''),
                        query
                      )}
                    </Typography>

                    {/* Metadata */}
                    <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Folder fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {document.workspace?.name || 'Unknown Workspace'}
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Person fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {document.createdBy?.name}
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Schedule fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {format(new Date(document.updatedAt), 'MMM d, yyyy')}
                        </Typography>
                      </Box>

                      {document.relevance && (
                        <Chip
                          label={`Relevance: ${document.relevance.toFixed(2)}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Load More */}
          {hasMore && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Button
                variant="outlined"
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More Results'}
              </Button>
            </Box>
          )}

          {!loading && results.length === 0 && query && (
            <Box textAlign="center" p={4}>
              <Typography variant="h6" color="text.secondary">
                No documents found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search terms or filters
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Empty State */}
      {!query && (
        <Box textAlign="center" p={8}>
          <Search sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom color="text.secondary">
            Search Your Documents
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter keywords to find documents across all your workspaces
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default SearchPage;