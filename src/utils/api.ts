import { ContributionDay } from '../types';

interface GitHubGraphQLResponse {
  data?: {
    user?: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: Array<{
            contributionDays: Array<{
              date: string;
              contributionCount: number;
              color: string;
            }>;
          }>;
        };
      };
    };
    viewer?: {
      login: string;
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: Array<{
            contributionDays: Array<{
              date: string;
              contributionCount: number;
              color: string;
            }>;
          }>;
        };
      };
    };
  };
  errors?: Array<{
    message: string;
  }>;
}

/**
 * Fetches contribution data from GitHub GraphQL API for a specific user and year
 */
export async function fetchUserContributions(
  username: string,
  year?: number,
  token?: string
): Promise<ContributionDay[]> {
  const currentYear = new Date().getFullYear();
  const targetYear = year || currentYear;

  const from = `${targetYear}-01-01T00:00:00Z`;
  const to = `${targetYear}-12-31T23:59:59Z`;

  const query = `
    query($username: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $username) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                color
              }
            }
          }
        }
      }
      viewer {
        login
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                color
              }
            }
          }
        }
      }
    }
  `;

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        variables: { username, from, to },
      }),
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data: GitHubGraphQLResponse = await response.json();

    if (data.errors) {
      // If user is not found, data.user will be null, but we might have viewer
      // If we have other errors, throw them
      const userNotFoundError = data.errors.find(e => e.message.includes('Could not resolve to a User'));
      if (!userNotFoundError || !data.data?.viewer) {
        throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
      }
    }

    let calendarData;

    // Check if we should use viewer data (if authenticated user is the requested user)
    if (data.data?.viewer && data.data.viewer.login.toLowerCase() === username.toLowerCase()) {
      calendarData = data.data.viewer.contributionsCollection.contributionCalendar;
    } else if (data.data?.user) {
      calendarData = data.data.user.contributionsCollection.contributionCalendar;
    } else {
      throw new Error(`User ${username} not found`);
    }

    const contributions: ContributionDay[] = [];
    const weeks = calendarData.weeks;

    for (const week of weeks) {
      for (const day of week.contributionDays) {
        contributions.push({
          date: day.date,
          count: day.contributionCount,
          level: getContributionLevel(day.contributionCount),
        });
      }
    }

    return contributions;
  } catch (error) {
    console.error(`Error fetching contributions for ${username}:`, error);
    throw error;
  }
}

/**
 * Fetches contributions for multiple users
 */
export async function fetchMultipleUserContributions(
  usernames: string[],
  years?: number[],
  token?: string
): Promise<Map<string, ContributionDay[]>> {
  const results = new Map<string, ContributionDay[]>();
  const currentYear = new Date().getFullYear();
  const targetYears = years || [currentYear];

  for (const username of usernames) {
    try {
      const allContributions: ContributionDay[] = [];

      for (const year of targetYears) {
        const contributions = await fetchUserContributions(username, year, token);
        allContributions.push(...contributions);
      }

      results.set(username, allContributions);
    } catch (error) {
      console.error(`Failed to fetch contributions for ${username}:`, error);
      // Continue with other users even if one fails
    }
  }

  return results;
}

/**
 * Fetches all contributors from a GitHub repository
 * @param repoName - Format: "owner/repo" (e.g., "facebook/react")
 * @param token - Optional GitHub personal access token
 * @returns Array of contributor usernames
 */
export async function fetchRepositoryContributors(
  repoName: string,
  token?: string
): Promise<string[]> {
  try {
    const [owner, repo] = repoName.split('/');

    if (!owner || !repo) {
      throw new Error('Invalid repository name. Format should be "owner/repo"');
    }

    const contributors: string[] = [];
    let page = 1;
    const perPage = 100;

    // Fetch all contributors (handling pagination)
    while (true) {
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=${perPage}&page=${page}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.length === 0) {
        break; // No more contributors
      }

      // Extract usernames from contributors
      for (const contributor of data) {
        if (contributor.login && contributor.type === 'User') {
          contributors.push(contributor.login);
        }
      }

      // If we got less than perPage results, we've reached the end
      if (data.length < perPage) {
        break;
      }

      page++;
    }

    return contributors;
  } catch (error) {
    console.error(`Error fetching contributors for ${repoName}:`, error);
    throw error;
  }
}

/**
 * Determines the contribution level based on count
 * This mimics GitHub's level system
 */
function getContributionLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count <= 3) return 1;
  if (count <= 6) return 2;
  if (count <= 9) return 3;
  return 4;
}
