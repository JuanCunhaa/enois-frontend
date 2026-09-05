import { useEffect, useRef, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { jobApi } from "@/lib/api";
import type { Job } from "@/lib/api";
import { requireAuth } from "@/lib/require-auth";
import { texts } from "@/texts";
import { mergePage } from "@/utils/collections";

import { AppContainer } from "@/components/app-container";
import {
  JobEmptyState,
  JobFilters,
  JobGrid,
  JobInfiniteScroll,
  JobLoadingIndicator,
  type JobFilterValues,
} from "@/components/job/job-view";

const initialJobFilters: JobFilterValues = {
  query: "",
  level: "",
  location: "",
  type: "",
  skills: "",
};

export const Route = createFileRoute("/vagas")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: texts.jobs.seoTitle }] }),
  component: JobsPage,
});

function JobsPage() {
  const queryClient = useQueryClient();
  const [filterValues, setFilterValues] = useState<JobFilterValues>(initialJobFilters);
  const [jobsCursor, setJobsCursor] = useState<string | null>(null);
  const [loadedJobs, setLoadedJobs] = useState<Job[]>([]);

  const jobFilters = {
    query: filterValues.query || undefined,
    level: filterValues.level || undefined,
    location: filterValues.location || undefined,
    type: filterValues.type || undefined,
    skills: filterValues.skills || undefined,
  };

  const { data: jobsResponse, isFetching: isJobsFetching } = useQuery({
    queryKey: ["jobs", jobFilters, jobsCursor],
    queryFn: () => jobApi.list({ ...jobFilters, cursor: jobsCursor, limit: 10 }),
  });

  const currentPageJobs = jobsResponse?.items ?? [];
  const nextJobsCursor = jobsResponse?.nextCursor ?? null;
  const jobFiltersKey = JSON.stringify(jobFilters);
  const previousJobFiltersKey = useRef(jobFiltersKey);

  useEffect(() => {
    if (previousJobFiltersKey.current === jobFiltersKey) return;
    setLoadedJobs([]);
    setJobsCursor(null);
    previousJobFiltersKey.current = jobFiltersKey;
  }, [jobFiltersKey]);

  useEffect(() => {
    setLoadedJobs((currentJobs) => mergePage(currentJobs, currentPageJobs, jobsCursor === null));
  }, [currentPageJobs, jobsCursor]);

  const applyToJobMutation = useMutation({
    mutationFn: (jobId: string) => jobApi.apply(jobId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["jobs"] }),
  });

  const handleFilterChange = (field: keyof JobFilterValues, filterValue: string) => {
    setFilterValues((currentFilters) => ({ ...currentFilters, [field]: filterValue }));
  };

  const handleClearFilters = () => {
    setFilterValues((currentFilters) => ({ ...initialJobFilters, query: currentFilters.query }));
  };

  const handleLoadMore = () => {
    if (nextJobsCursor) setJobsCursor(nextJobsCursor);
  };

  return (
    <AppContainer>
      <div className="space-y-6">
        <JobFilters
          values={filterValues}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
        />
        <JobGrid
          jobs={loadedJobs}
          isApplying={applyToJobMutation.isPending}
          onApply={applyToJobMutation.mutate}
        />
        <JobLoadingIndicator isVisible={isJobsFetching && loadedJobs.length > 0} />
        <JobInfiniteScroll
          hasMore={Boolean(nextJobsCursor)}
          isLoading={isJobsFetching}
          onLoadMore={handleLoadMore}
        />
        <JobEmptyState isVisible={!isJobsFetching && loadedJobs.length === 0} />
      </div>
    </AppContainer>
  );
}
