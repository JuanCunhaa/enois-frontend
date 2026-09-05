import { useEffect, useRef } from "react";

import { Briefcase, Loader2, MapPin, Sparkles, X } from "lucide-react";

import type { Job } from "@/lib/api";
import { texts } from "@/texts";
import { formatEnumLabel } from "@/utils/string";
import { formatJobPostedAt } from "@/utils/time";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const JOB_LEVELS = ["JUNIOR", "MID", "SENIOR", "LEAD"] as const;
const JOB_TYPES = ["CLT", "PJ", "FREELANCE", "INTERN"] as const;

export type JobFilterValues = {
  query: string;
  level: string;
  location: string;
  type: string;
  skills: string;
};

type JobFiltersProps = {
  values: JobFilterValues;
  onChange: (field: keyof JobFilterValues, filterValue: string) => void;
  onClear: () => void;
};

export function JobFilters({ values, onChange, onClear }: JobFiltersProps) {
  const hasFilters = [values.level, values.location, values.type, values.skills].some(Boolean);

  return (
    <div className="surface-card p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{texts.jobs.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{texts.jobs.description}</p>
        </div>
        {hasFilters && (
          <Button
            size="sm"
            variant="secondary"
            className="rounded-full gap-1.5 text-muted-foreground"
            onClick={onClear}
          >
            <X className="h-4 w-4" /> {texts.jobs.clearFilters}
          </Button>
        )}
      </div>

      <JobFilterGroup
        label={texts.jobs.filters.level}
        values={JOB_LEVELS}
        selectedValue={values.level}
        onChange={(filterValue) => onChange("level", filterValue)}
        getLabel={formatEnumLabel}
      />
      <JobFilterGroup
        label={texts.jobs.filters.location}
        values={texts.jobs.filters.locations}
        selectedValue={values.location}
        onChange={(filterValue) => onChange("location", filterValue)}
      />
      <JobFilterGroup
        label={texts.jobs.filters.type}
        values={JOB_TYPES}
        selectedValue={values.type}
        onChange={(filterValue) => onChange("type", filterValue)}
      />

      <div className="mt-4 flex flex-wrap gap-3">
        <div className="relative max-w-sm flex-1">
          <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={values.query}
            onChange={(event) => onChange("query", event.target.value)}
            placeholder={texts.jobs.searchPlaceholder}
            className="h-9 rounded-full bg-muted pl-9"
          />
        </div>
        <Input
          value={values.skills}
          onChange={(event) => onChange("skills", event.target.value)}
          placeholder={texts.jobs.skillsPlaceholder}
          className="h-9 max-w-xs rounded-full bg-muted"
        />
      </div>
    </div>
  );
}

type JobGridProps = {
  jobs: Job[];
  isApplying: boolean;
  onApply: (jobId: string) => void;
};

export function JobGrid({ jobs, isApplying, onApply }: JobGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} isApplying={isApplying} onApply={onApply} />
      ))}
    </div>
  );
}

export function JobLoadingIndicator({ isVisible }: { isVisible: boolean }) {
  return isVisible ? (
    <div className="flex justify-center py-6">
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  ) : null;
}

export function JobEmptyState({ isVisible }: { isVisible: boolean }) {
  return isVisible ? (
    <p className="py-12 text-center text-sm text-muted-foreground">{texts.jobs.empty}</p>
  ) : null;
}

type JobInfiniteScrollProps = {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
};

export function JobInfiniteScroll({ hasMore, isLoading, onLoadMore }: JobInfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinelElement = sentinelRef.current;
    if (!sentinelElement || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoading) onLoadMore();
      },
      { rootMargin: "300px" },
    );

    observer.observe(sentinelElement);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  return hasMore ? <div ref={sentinelRef} className="h-4" /> : null;
}

type JobCardProps = {
  job: Job;
  isApplying: boolean;
  onApply: (jobId: string) => void;
};

function JobCard({ job, isApplying, onApply }: JobCardProps) {
  return (
    <article className="surface-card flex flex-col p-5">
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12 rounded-xl">
          {job.logo && <AvatarImage src={job.logo} alt={job.company} className="rounded-xl" />}
          <AvatarFallback className="rounded-xl">{job.company[0]}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h3 className="break-words font-semibold">{job.title}</h3>
          <p className="break-words text-sm text-muted-foreground">{job.company}</p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {job.location}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        {job.matchScore && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 font-medium text-primary">
            <Sparkles className="h-3 w-3" /> {texts.jobs.match(job.matchScore)}
          </span>
        )}
        <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">{job.type}</span>
        <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">{job.level}</span>
        {job.salary && (
          <span className="rounded-full bg-growth/15 px-2.5 py-1 font-medium text-growth">
            {job.salary}
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {job.skills.map((skill) => (
          <Badge
            key={skill}
            variant="secondary"
            className="rounded-full bg-accent font-normal text-accent-foreground"
          >
            {skill}
          </Badge>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
        <span>{formatJobPostedAt(job.postedAt)}</span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="rounded-full">
            {texts.jobs.details}
          </Button>
          <Button
            size="sm"
            className="rounded-full"
            disabled={isApplying}
            onClick={() => onApply(job.id)}
          >
            {texts.jobs.apply}
          </Button>
        </div>
      </div>
    </article>
  );
}

type JobFilterGroupProps = {
  label: string;
  values: readonly string[];
  selectedValue: string;
  onChange: (filterValue: string) => void;
  getLabel?: (filterValue: string) => string;
};

function JobFilterGroup({
  label,
  values,
  selectedValue,
  onChange,
  getLabel = (filterValue) => filterValue,
}: JobFilterGroupProps) {
  return (
    <div className="mt-3 flex flex-wrap gap-2 first:mt-4">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs font-medium text-muted-foreground">{label}</span>
        {values.map((filterValue) => (
          <button
            key={filterValue}
            type="button"
            onClick={() => onChange(selectedValue === filterValue ? "" : filterValue)}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              selectedValue === filterValue
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {getLabel(filterValue)}
          </button>
        ))}
      </div>
    </div>
  );
}
