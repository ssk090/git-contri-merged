export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionData {
  total: {
    [year: number]: number;
  };
  contributions: ContributionDay[];
}

export interface GitHubContribution {
  date: string;
  contributionCount: number;
  color: string;
}

interface BaseMergedCalendarProps {
  years?: number[];
  colorScheme?: 'light' | 'dark';
  blockSize?: number;
  blockMargin?: number;
  fontSize?: number;
  showWeekdayLabels?: boolean;
  showMonthLabels?: boolean;
  loading?: React.ReactNode;
  error?: React.ReactNode;
  githubToken?: string;
  onDataLoad?: (data: ContributionData) => void;
  onContributorsLoad?: (contributors: string[]) => void;
}

interface MergedCalendarPropsWithUsernames extends BaseMergedCalendarProps {
  usernames: string[];
  repoName?: never;
}

interface MergedCalendarPropsWithRepo extends BaseMergedCalendarProps {
  repoName: string;
  usernames?: never;
}

export type MergedCalendarProps =
  | MergedCalendarPropsWithUsernames
  | MergedCalendarPropsWithRepo;

export interface CalendarTheme {
  level0: string;
  level1: string;
  level2: string;
  level3: string;
  level4: string;
  text: string;
  background: string;
}
