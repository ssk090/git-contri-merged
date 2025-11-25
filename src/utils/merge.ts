import { ContributionDay, ContributionData } from '../types';

/**
 * Merges contributions from multiple users into a single dataset
 * Contributions on the same date are summed together
 */
export function mergeContributions(
  userContributions: Map<string, ContributionDay[]>
): ContributionData {
  const mergedMap = new Map<string, number>();
  const yearTotals: { [year: number]: number } = {};

  // Merge all contributions by date
  for (const [_, contributions] of userContributions.entries()) {
    for (const contribution of contributions) {
      const currentCount = mergedMap.get(contribution.date) || 0;
      const newCount = currentCount + contribution.count;
      mergedMap.set(contribution.date, newCount);

      // Update year totals
      const year = new Date(contribution.date).getFullYear();
      yearTotals[year] = (yearTotals[year] || 0) + contribution.count;
    }
  }

  // Convert map to array and sort by date
  const contributions: ContributionDay[] = Array.from(mergedMap.entries())
    .map(([date, count]) => ({
      date,
      count,
      level: getContributionLevel(count),
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return {
    total: yearTotals,
    contributions,
  };
}

/**
 * Determines the contribution level based on count
 * Adjusted for merged contributions (higher thresholds)
 */
function getContributionLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count <= 5) return 1;
  if (count <= 10) return 2;
  if (count <= 15) return 3;
  return 4;
}

/**
 * Fills in missing dates with zero contributions
 * Ensures we have a complete calendar grid
 */
export function fillMissingDates(
  contributions: ContributionDay[],
  startDate: Date,
  endDate: Date
): ContributionDay[] {
  const filledContributions: ContributionDay[] = [];
  const contributionMap = new Map(
    contributions.map((c) => [c.date, c])
  );

  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateString = currentDate.toISOString().split('T')[0];
    const existing = contributionMap.get(dateString);

    if (existing) {
      filledContributions.push(existing);
    } else {
      filledContributions.push({
        date: dateString,
        count: 0,
        level: 0,
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return filledContributions;
}

/**
 * Gets the date range from contributions
 */
export function getDateRange(contributions: ContributionDay[]): {
  start: Date;
  end: Date;
} {
  if (contributions.length === 0) {
    const now = new Date();
    const yearAgo = new Date();
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);
    return { start: yearAgo, end: now };
  }

  const dates = contributions.map((c) => new Date(c.date));
  return {
    start: new Date(Math.min(...dates.map((d) => d.getTime()))),
    end: new Date(Math.max(...dates.map((d) => d.getTime()))),
  };
}

/**
 * Groups contributions by week for calendar grid rendering
 */
export function groupByWeeks(contributions: ContributionDay[]): ContributionDay[][] {
  if (contributions.length === 0) return [];

  const weeks: ContributionDay[][] = [];
  let currentWeek: ContributionDay[] = [];

  // Find the first Sunday to start the calendar
  const firstDate = new Date(contributions[0].date);
  const dayOfWeek = firstDate.getDay();

  // Add empty days to align to Sunday start
  for (let i = 0; i < dayOfWeek; i++) {
    const date = new Date(firstDate);
    date.setDate(date.getDate() - (dayOfWeek - i));
    currentWeek.push({
      date: date.toISOString().split('T')[0],
      count: 0,
      level: 0,
    });
  }

  // Add all contributions
  for (const contribution of contributions) {
    currentWeek.push(contribution);

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Add remaining days to complete the last week
  if (currentWeek.length > 0) {
    const lastDate = new Date(currentWeek[currentWeek.length - 1].date);
    while (currentWeek.length < 7) {
      lastDate.setDate(lastDate.getDate() + 1);
      currentWeek.push({
        date: lastDate.toISOString().split('T')[0],
        count: 0,
        level: 0,
      });
    }
    weeks.push(currentWeek);
  }

  return weeks;
}
