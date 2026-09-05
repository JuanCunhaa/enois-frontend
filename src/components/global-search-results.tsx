import type { SearchResult } from "@/lib/api";
import { texts } from "@/texts";

import { UserAvatar } from "@/components/user-avatar";

type GlobalSearchResultsProps = {
  searchResults: SearchResult[];
  query: string;
  isFetching: boolean;
  onSelect: (searchResult: SearchResult) => void;
};

export function GlobalSearchResults({
  searchResults,
  query,
  isFetching,
  onSelect,
}: GlobalSearchResultsProps) {
  return (
    <>
      {searchResults.length === 0 && !isFetching && (
        <p className="px-4 py-6 text-center text-sm text-text-subtle">
          {texts.search.noResults(query)}
        </p>
      )}

      <ul className="max-h-80 overflow-y-auto">
        {searchResults.map((searchResult) => (
          <li key={`${searchResult.type}-${searchResult.id}`}>
            <button
              type="button"
              onClick={() => onSelect(searchResult)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-surface-3"
            >
              <UserAvatar
                src={searchResult.image}
                alt={searchResult.title}
                className="h-10 w-10"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-light text-text-strong">
                  {searchResult.title}
                </p>
                <p className="truncate text-xs text-text-subtle">{searchResult.subtitle}</p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
