import { useEffect, useRef, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { Loader2, Search } from "lucide-react";

import { searchApi } from "@/lib/api";
import type { SearchResult } from "@/lib/api";
import { texts } from "@/texts";
import { navigateToHref } from "@/utils/navigation";

import { Input } from "@/components/ui/input";

import { GlobalSearchResults } from "./global-search-results";

export function GlobalSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const debounceTimer = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsResultsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMobileSearchOpen) searchInputRef.current?.focus();
  }, [isMobileSearchOpen]);

  const { data: searchResponse, isFetching } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => searchApi.search(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  const searchResults = searchResponse?.items ?? [];

  const handleCloseSearch = () => {
    setIsResultsOpen(false);
    setQuery("");
  };

  const handleSelect = (searchResult: SearchResult) => {
    handleCloseSearch();
    setIsMobileSearchOpen(false);
    navigateToHref(searchResult.href, navigate);
  };

  return (
    <>
      <button
        onClick={() => {
          setIsMobileSearchOpen(true);
          setIsResultsOpen(true);
        }}
        className="ml-auto grid h-9 w-9 place-items-center rounded-full text-text-subtle transition hover:bg-surface-2 hover:text-primary md:hidden"
        aria-label={texts.search.action}
      >
        <Search className="h-4 w-4" />
      </button>

      <div
        ref={searchContainerRef}
        className={`fixed inset-0 z-50 flex items-start justify-center bg-background/80 pt-4 backdrop-blur-sm transition-opacity ${
          isMobileSearchOpen ? "visible opacity-100" : "invisible pointer-events-none opacity-0"
        } md:visible md:static md:z-auto md:ml-2 md:block md:flex-1 md:max-w-md md:bg-transparent md:p-0 md:opacity-100 md:backdrop-blur-none md:pointer-events-auto`}
        onMouseDown={(event) => {
          if (isMobileSearchOpen && event.target === event.currentTarget) {
            setIsMobileSearchOpen(false);
            handleCloseSearch();
          }
        }}
      >
        <div className="relative w-full max-w-md px-4 md:max-w-none md:px-0">
          <Search className="pointer-events-none absolute left-7 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-text-subtle md:left-3" />
          <Input
            ref={searchInputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setIsResultsOpen(true);
            }}
            onFocus={() => setIsResultsOpen(true)}
            placeholder={texts.search.placeholder}
            className="h-12 rounded-full border-border-soft bg-surface-card pl-10 pr-4 focus-visible:border-primary md:h-10 md:bg-surface-1 md:pl-9"
          />
          {isFetching && (
            <Loader2 className="absolute right-7 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-text-subtle md:right-3" />
          )}
          {isResultsOpen && debouncedQuery.length >= 2 && (
            <div className="absolute left-4 right-4 top-full mt-2 overflow-hidden rounded-2xl border border-border-soft bg-surface-card shadow-card md:left-0 md:right-0">
              <GlobalSearchResults
                searchResults={searchResults}
                query={debouncedQuery}
                isFetching={isFetching}
                onSelect={handleSelect}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
