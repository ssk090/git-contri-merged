import React, { useEffect, useState, useRef, useCallback } from 'react';
import { toPng } from 'html-to-image';
import { MergedCalendarProps, ContributionData } from '../types';
import { fetchMultipleUserContributions, fetchRepositoryContributors } from '../utils/api';
import { mergeContributions, fillMissingDates, getDateRange } from '../utils/merge';
import { getTheme } from '../utils/themes';
import { CalendarGrid } from './CalendarGrid';

export const MergedGitHubCalendar: React.FC<MergedCalendarProps> = (props) => {
  const {
    years,
    colorScheme = 'light',
    blockSize = 12,
    blockMargin = 3,
    fontSize = 14,
    showWeekdayLabels = true,
    showMonthLabels = true,
    loading,
    error,
    githubToken,
    onDataLoad,
    onContributorsLoad,
  } = props;

  const [contributionData, setContributionData] = useState<ContributionData | null>(null);
  const [contributors, setContributors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState<Error | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const theme = getTheme(colorScheme);

  // Determine if we're using usernames or repoName
  const usernames = 'usernames' in props ? props.usernames : undefined;
  const repoName = 'repoName' in props ? props.repoName : undefined;

  const handleDownload = useCallback(async () => {
    if (ref.current === null) {
      return;
    }

    try {
      const dataUrl = await toPng(ref.current, {
        cacheBust: true,
        filter: (node) => {
          const element = node as HTMLElement;
          return !element.classList?.contains('download-btn');
        },
        backgroundColor: theme.background,
        style: {
          display: 'inline-block',
          height: 'auto',
        },
      });
      const link = document.createElement('a');
      link.download = `${repoName || 'merged-contributions'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download image', err);
    }
  }, [ref, repoName, theme.background]);

  useEffect(() => {
    const loadContributions = async () => {
      try {
        setIsLoading(true);
        setErrorState(null);

        let usersToFetch: string[] = [];

        // If repoName is provided, fetch contributors first
        if (repoName) {
          const repoContributors = await fetchRepositoryContributors(repoName, githubToken);
          usersToFetch = repoContributors;
          setContributors(repoContributors);
          onContributorsLoad?.(repoContributors);
        } else if (usernames) {
          usersToFetch = usernames;
          setContributors(usernames);
        }

        if (usersToFetch.length === 0) {
          setIsLoading(false);
          return;
        }

        // Fetch contributions for all users
        const userContributionsMap = await fetchMultipleUserContributions(usersToFetch, years, githubToken);

        // Merge contributions
        const merged = mergeContributions(userContributionsMap);

        // Fill in missing dates for a complete calendar
        const { start, end } = getDateRange(merged.contributions);
        const filledContributions = fillMissingDates(merged.contributions, start, end);

        const finalData: ContributionData = {
          ...merged,
          contributions: filledContributions,
        };

        setContributionData(finalData);
        onDataLoad?.(finalData);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to load contributions');
        setErrorState(error);
        console.error('Error loading contributions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (usernames || repoName) {
      loadContributions();
    }
  }, [usernames, repoName, years, onDataLoad, onContributorsLoad, githubToken]);

  if (isLoading) {
    return loading ? (
      <>{loading}</>
    ) : (
      <div style={{ padding: '20px', color: theme.text }}>
        Loading contributions...
      </div>
    );
  }

  if (errorState) {
    return (
      <div style={{ padding: '20px', color: theme.text }}>
        {error || `Error: ${errorState.message}`}
      </div>
    );
  }

  if (!contributionData || contributionData.contributions.length === 0) {
    return (
      <div style={{ padding: '20px', color: theme.text }}>
        No contributions found
      </div>
    );
  }

  const totalContributions = Object.values(contributionData.total).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <div
      ref={ref}
      style={{
        padding: '20px',
        backgroundColor: theme.background,
        borderRadius: '6px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: '0 0 8px 0', color: theme.text, fontSize }}>
            {repoName ? `${repoName} - Merged Contributions` : 'Merged Contributions'}
          </h3>
          <div style={{ color: theme.text, fontSize: fontSize - 2, opacity: 0.8 }}>
            {contributors.length} contributor{contributors.length !== 1 ? 's' : ''} • {totalContributions} total contributions
          </div>
          <div style={{ color: theme.text, fontSize: fontSize - 3, opacity: 0.6, marginTop: '4px' }}>
            {contributors.length <= 10 ? contributors.join(', ') : `${contributors.slice(0, 10).join(', ')} and ${contributors.length - 10} more`}
          </div>
        </div>
        <button
          className="download-btn"
          onClick={handleDownload}
          style={{
            background: 'transparent',
            border: `1px solid ${theme.text}`,
            borderRadius: '4px',
            cursor: 'pointer',
            padding: '6px 10px',
            color: theme.text,
            opacity: 0.7,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: fontSize - 2,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.backgroundColor = theme.text + '10';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.7';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          title="Download as Image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download
        </button>
      </div>

      <CalendarGrid
        contributions={contributionData.contributions}
        theme={theme}
        blockSize={blockSize}
        blockMargin={blockMargin}
        showWeekdayLabels={showWeekdayLabels}
        showMonthLabels={showMonthLabels}
      />

      <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: fontSize - 3 }}>
        <span style={{ color: theme.text, opacity: 0.6 }}>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            style={{
              width: blockSize,
              height: blockSize,
              backgroundColor: theme[`level${level}` as keyof typeof theme],
              borderRadius: '2px',
            }}
            title={`Level ${level}`}
          />
        ))}
        <span style={{ color: theme.text, opacity: 0.6 }}>More</span>
      </div>
    </div>
  );
};
