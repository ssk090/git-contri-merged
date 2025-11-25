# Merged GitHub Contribution Calendar
A React component that combines and visualizes GitHub contributions from multiple users in a single, merged contribution graph. Perfect for team projects, organizations, or collaborative repositories where you want to see the combined effort of all contributors.

<img width="1024" height="1024" alt="image" src="https://github.com/user-attachments/assets/4f0f9016-2255-43ca-8c33-1057a7a67b22" />


## Features

- 📊 **Merged Contributions**: Combine contribution data from multiple GitHub users
- 🏢 **Repository Mode**: Automatically fetch all contributors from any repository
- 👥 **Manual Mode**: Specify individual GitHub usernames
- 🔑 **GitHub Token Support**: Access private repositories and avoid rate limits
- 🎨 **Customizable Themes**: Support for light and dark modes (dark mode default)
- 📅 **Full Calendar View**: GitHub-style contribution calendar with tooltips
- ⚡ **Fast & Lightweight**: Built with React and TypeScript
- 🎯 **Flexible API**: Easily customize appearance and behavior
- 📱 **Responsive**: Works on all screen sizes
- 💾 **Token Persistence**: Securely store token in localStorage

## Demo

The example app lets you:
- **Repository Mode**: Enter a repository name (e.g., "facebook/react") to automatically fetch and visualize all contributors
- **Manual Mode**: Add individual GitHub usernames to see their combined contribution graph in real-time
- **GitHub Token**: Optional token input for private repos and higher rate limits (persisted in localStorage)
- **Submit Button**: Click "Load Contributions" to fetch data (no auto-fetching)

## Installation

```bash
npm install git-contri-merged
# or
pnpm add git-contri-merged
# or
yarn add git-contri-merged
```

## Usage

The component supports two modes:
1. **Repository Mode**: Automatically fetch all contributors from a repository
2. **Manual Mode**: Specify individual GitHub usernames

### Repository Mode (Recommended)

Simply provide a repository name and the component will automatically fetch and merge contributions from all contributors:

```tsx
import { MergedGitHubCalendar } from 'git-contri-merged';

function App() {
  return (
    <MergedGitHubCalendar
      repoName="facebook/react"
      colorScheme="light"
    />
  );
}
```

With callback to get the list of contributors:

```tsx
<MergedGitHubCalendar
  repoName="vercel/next.js"
  colorScheme="dark"
  onContributorsLoad={(contributors) => {
    console.log(`Found ${contributors.length} contributors:`, contributors);
  }}
/>
```

### Manual Mode

Specify individual GitHub usernames:

```tsx
import { MergedGitHubCalendar } from 'git-contri-merged';

function App() {
  return (
    <MergedGitHubCalendar
      usernames={['torvalds', 'gaearon', 'tj']}
      colorScheme="light"
    />
  );
}
```

### With GitHub Token (for Private Repos)

```tsx
<MergedGitHubCalendar
  repoName="your-org/private-repo"
  githubToken="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  colorScheme="dark"
/>
```

### With All Options

```tsx
<MergedGitHubCalendar
  usernames={['user1', 'user2', 'user3']}
  years={[2023, 2024]}
  colorScheme="dark"
  githubToken="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  blockSize={12}
  blockMargin={3}
  fontSize={14}
  showWeekdayLabels={true}
  showMonthLabels={true}
  loading={<div>Loading...</div>}
  error={<div>Error loading data</div>}
  onDataLoad={(data) => console.log('Loaded:', data)}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `repoName` | `string` | - | Repository name in "owner/repo" format (use this OR usernames) |
| `usernames` | `string[]` | - | Array of GitHub usernames to merge (use this OR repoName) |
| `githubToken` | `string` | `undefined` | GitHub personal access token for private repos and higher rate limits |
| `years` | `number[]` | `[current year]` | Years to fetch contributions for |
| `colorScheme` | `'light' \| 'dark'` | `'dark'` | Color theme for the calendar |
| `blockSize` | `number` | `12` | Size of each contribution block (px) |
| `blockMargin` | `number` | `3` | Margin between blocks (px) |
| `fontSize` | `number` | `14` | Font size for labels and text |
| `showWeekdayLabels` | `boolean` | `true` | Show weekday labels (Mon, Wed, Fri) |
| `showMonthLabels` | `boolean` | `true` | Show month labels (Jan, Feb, etc.) |
| `loading` | `React.ReactNode` | `'Loading...'` | Custom loading component |
| `error` | `React.ReactNode` | `'Error: ...'` | Custom error component |
| `onDataLoad` | `(data: ContributionData) => void` | `undefined` | Callback when data is loaded |
| `onContributorsLoad` | `(contributors: string[]) => void` | `undefined` | Callback when contributors are fetched (repo mode only) |

**Note**: You must provide either `repoName` OR `usernames`, but not both.

## Running the Demo

Start the development server:

```bash
pnpm dev
```

Open your browser to `http://localhost:5173` to see the example app.

## How It Works

### Repository Mode
1. **Fetches** all contributors from the specified repository
2. **Retrieves** contribution data for each contributor
3. **Merges** all contributions by date, summing up the counts
4. **Visualizes** the merged data in a GitHub-style calendar grid
5. **Adjusts** contribution levels based on the merged totals

### Manual Mode
1. **Fetches** contribution data from GitHub's API for each specified user
2. **Merges** contributions by date, summing up the counts
3. **Visualizes** the merged data in a GitHub-style calendar grid
4. **Adjusts** contribution levels based on the merged totals

## GitHub Token Setup

### Why Use a Token?

A GitHub personal access token provides several benefits:
- ✅ **Private Repositories**: Access contributions from private repos
- ✅ **Higher Rate Limits**: 5,000 requests/hour instead of 60
- ✅ **Better Reliability**: Avoid rate limit errors
- ✅ **GraphQL API Access**: Required for fetching contribution data

### Creating a GitHub Token

1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a descriptive name (e.g., "Contribution Calendar")
4. Set expiration (recommended: 90 days or No expiration for personal use)
5. Select scopes:
   - For **public repos only**: No scopes needed
   - For **private repos**: Select `repo` (Full control of private repositories)
6. Click "Generate token"
7. **Important**: Copy the token immediately (you won't see it again!)

### Using the Token

**In the Demo App:**
1. Click the "🔑 Set GitHub Token" button
2. Paste your token in the password field
3. Token is automatically saved in localStorage
4. Click "Load Contributions" to fetch data with authentication

**In Your Code:**

```tsx
<MergedGitHubCalendar
  repoName="your-org/your-repo"
  githubToken="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  colorScheme="dark"
/>
```

### Security Notes

- ⚠️ **Never commit tokens to version control**
- ⚠️ **Never expose tokens in client-side code in production**
- ✅ Token is stored in localStorage for demo convenience
- ✅ For production apps, fetch token from your secure backend
- ✅ Use environment variables for build-time tokens

### API Rate Limits

| Authentication | Requests/Hour |
|----------------|---------------|
| No token | 60 |
| With token | 5,000 |

## Project Structure

```
git-contri-merged/
├── src/
│   ├── components/
│   │   ├── MergedGitHubCalendar.tsx  # Main component
│   │   └── CalendarGrid.tsx          # Calendar visualization
│   ├── utils/
│   │   ├── api.ts                    # GitHub API fetching
│   │   ├── merge.ts                  # Contribution merging logic
│   │   └── themes.ts                 # Color themes
│   ├── types/
│   │   └── index.ts                  # TypeScript types
│   ├── styles/
│   │   └── App.css                   # Styling
│   ├── App.tsx                       # Example app
│   ├── main.tsx                      # Entry point
│   └── index.ts                      # Library exports
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## TypeScript Types

```typescript
interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface ContributionData {
  total: {
    [year: number]: number;
  };
  contributions: ContributionDay[];
}
```

## Customization

### Custom Themes

You can import the theme utilities and create custom themes:

```typescript
import { CalendarTheme } from './types';

const customTheme: CalendarTheme = {
  level0: '#ebedf0',
  level1: '#9be9a8',
  level2: '#40c463',
  level3: '#30a14e',
  level4: '#216e39',
  text: '#24292f',
  background: '#ffffff',
};
```

### Contribution Level Calculation

The component uses adaptive levels for merged contributions:
- Level 0: 0 contributions
- Level 1: 1-5 contributions
- Level 2: 6-10 contributions
- Level 3: 11-15 contributions
- Level 4: 16+ contributions

These thresholds can be adjusted in `src/utils/merge.ts`.

## Building for Production

Build the library:

```bash
pnpm build:lib
```

Build the demo app:

```bash
pnpm build
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Similar Projects

- [react-github-calendar](https://github.com/grubersjoe/react-github-calendar) - Single user GitHub contribution calendar
- [github-contributions-api](https://github.com/grubersjoe/github-contributions-api) - API for fetching GitHub contributions

## Acknowledgments

Inspired by [react-github-calendar](https://github.com/grubersjoe/react-github-calendar) and GitHub's contribution graph design.
