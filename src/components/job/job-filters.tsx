import { Briefcase, X } from "lucide-react";

import { texts } from "@/texts";
import { formatEnumLabel } from "@/utils/string";

import type { JobFilterValues } from "@/components/job/job-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const JOB_LEVELS = ["JUNIOR", "MID", "SENIOR", "LEAD"] as const;
const JOB_TYPES = ["CLT", "PJ", "FREELANCE", "INTERN"] as const;

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
