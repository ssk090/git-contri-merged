import React, { useState } from 'react';
import { MergedGitHubCalendar } from './components/MergedGitHubCalendar';
import { SkeletonCalendar } from './components/SkeletonCalendar';
import './styles/App.css';

type Mode = 'usernames' | 'repo';

function App() {
  const [mode, setMode] = useState<Mode>('repo');
  const [usernames, setUsernames] = useState<string[]>(['torvalds', 'gaearon']);
  const [repoName, setRepoName] = useState('facebook/react');
  const [inputValue, setInputValue] = useState('');
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('dark');
  const [contributors, setContributors] = useState<string[]>([]);
  const [githubToken, setGithubToken] = useState('');
  const [fetchKey, setFetchKey] = useState(0);
  const [showTokenInput, setShowTokenInput] = useState(false);

  // Load token from localStorage on mount
  React.useEffect(() => {
    const savedToken = localStorage.getItem('github_token');
    if (savedToken) {
      setGithubToken(savedToken);
    }
  }, []);

  const handleAddUsername = () => {
    if (inputValue.trim() && !usernames.includes(inputValue.trim())) {
      setUsernames([...usernames, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleRemoveUsername = (username: string) => {
    setUsernames(usernames.filter((u) => u !== username));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (mode === 'usernames') {
        handleAddUsername();
      }
    }
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setContributors([]);
    setFetchKey(0);
  };

  const handleTokenChange = (value: string) => {
    setGithubToken(value);
    // Save to localStorage
    if (value) {
      localStorage.setItem('github_token', value);
    } else {
      localStorage.removeItem('github_token');
    }
  };

  const handleClearToken = () => {
    setGithubToken('');
    localStorage.removeItem('github_token');
  };

  const handleSubmit = () => {
    setFetchKey(prev => prev + 1);
  };

  return (
    <div className="app" style={{ backgroundColor: colorScheme === 'dark' ? '#0d1117' : '#ffffff' }}>
      <div className="container">
        <header>
          <h1 style={{ color: colorScheme === 'dark' ? '#c9d1d9' : '#24292f' }}>
            Merged GitHub Contribution Calendar
          </h1>
          <p style={{ color: colorScheme === 'dark' ? '#8b949e' : '#57606a' }}>
            Visualize combined contributions from multiple GitHub users or a repository
          </p>
        </header>

        <div className="token-section">
          <div className="token-controls">
            <button
              className="token-toggle"
              onClick={() => setShowTokenInput(!showTokenInput)}
              style={{
                color: colorScheme === 'dark' ? '#c9d1d9' : '#24292f',
                backgroundColor: githubToken ? '#238636' : (colorScheme === 'dark' ? '#21262d' : '#f6f8fa'),
                borderColor: colorScheme === 'dark' ? '#30363d' : '#d0d7de',
              }}
            >
              {githubToken ? '🔑 Token Set' : '🔑 Set GitHub Token'} {showTokenInput ? '▼' : '▶'}
            </button>
            {githubToken && (
              <button
                className="clear-token"
                onClick={handleClearToken}
                style={{
                  color: colorScheme === 'dark' ? '#c9d1d9' : '#24292f',
                  backgroundColor: colorScheme === 'dark' ? '#21262d' : '#f6f8fa',
                  borderColor: colorScheme === 'dark' ? '#30363d' : '#d0d7de',
                }}
              >
                Clear Token
              </button>
            )}
          </div>
          {showTokenInput && (
            <div className="token-input-group">
              <input
                type="password"
                value={githubToken}
                onChange={(e) => handleTokenChange(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                style={{
                  backgroundColor: colorScheme === 'dark' ? '#0d1117' : '#ffffff',
                  color: colorScheme === 'dark' ? '#c9d1d9' : '#24292f',
                  borderColor: colorScheme === 'dark' ? '#30363d' : '#d0d7de',
                }}
              />
              <small style={{ color: colorScheme === 'dark' ? '#8b949e' : '#57606a' }}>
                For private repos or higher rate limits. Get one from{' '}
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#58a6ff' }}
                >
                  GitHub Settings
                </a>
              </small>
            </div>
          )}
        </div>

        <div className="mode-selector">
          <button
            className={mode === 'repo' ? 'active' : ''}
            onClick={() => handleModeChange('repo')}
            style={{
              backgroundColor: mode === 'repo' ? '#0969da' : (colorScheme === 'dark' ? '#21262d' : '#f6f8fa'),
              color: mode === 'repo' ? '#ffffff' : (colorScheme === 'dark' ? '#c9d1d9' : '#24292f'),
            }}
          >
            Repository Mode
          </button>
          <button
            className={mode === 'usernames' ? 'active' : ''}
            onClick={() => handleModeChange('usernames')}
            style={{
              backgroundColor: mode === 'usernames' ? '#0969da' : (colorScheme === 'dark' ? '#21262d' : '#f6f8fa'),
              color: mode === 'usernames' ? '#ffffff' : (colorScheme === 'dark' ? '#c9d1d9' : '#24292f'),
            }}
          >
            Manual Mode
          </button>
        </div>

        <div className="controls">
          {mode === 'repo' ? (
            <div className="input-group">
              <input
                type="text"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="owner/repo (e.g., facebook/react)"
                style={{
                  backgroundColor: colorScheme === 'dark' ? '#0d1117' : '#ffffff',
                  color: colorScheme === 'dark' ? '#c9d1d9' : '#24292f',
                  borderColor: colorScheme === 'dark' ? '#30363d' : '#d0d7de',
                }}
              />
            </div>
          ) : (
            <div className="input-group">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter GitHub username"
                style={{
                  backgroundColor: colorScheme === 'dark' ? '#0d1117' : '#ffffff',
                  color: colorScheme === 'dark' ? '#c9d1d9' : '#24292f',
                  borderColor: colorScheme === 'dark' ? '#30363d' : '#d0d7de',
                }}
              />
              <button onClick={handleAddUsername}>Add User</button>
            </div>
          )}

          <button
            className="submit-btn"
            onClick={handleSubmit}
            style={{
              backgroundColor: '#0969da',
              color: '#ffffff',
              padding: '10px 24px',
              fontWeight: '600',
            }}
          >
            Load Contributions
          </button>

          <div className="theme-toggle">
            <button onClick={() => setColorScheme(colorScheme === 'light' ? 'dark' : 'light')}>
              {colorScheme === 'light' ? '🌙 Dark' : '☀️ Light'} Mode
            </button>
          </div>
        </div>

        {mode === 'usernames' && usernames.length > 0 && (
          <div className="users-list">
            <strong style={{ color: colorScheme === 'dark' ? '#c9d1d9' : '#24292f' }}>
              Selected Users:
            </strong>
            {usernames.map((username) => (
              <div key={username} className="user-tag">
                <span>{username}</span>
                <button onClick={() => handleRemoveUsername(username)} className="remove-btn">
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {mode === 'repo' && contributors.length > 0 && (
          <div className="info-box" style={{
            color: colorScheme === 'dark' ? '#c9d1d9' : '#24292f',
            backgroundColor: colorScheme === 'dark' ? '#161b22' : '#f6f8fa',
            borderColor: colorScheme === 'dark' ? '#30363d' : '#d0d7de',
          }}>
            Found {contributors.length} contributor{contributors.length !== 1 ? 's' : ''} in {repoName}
          </div>
        )}

        <div className="calendar-wrapper">
          {fetchKey > 0 && mode === 'repo' && repoName ? (
            <MergedGitHubCalendar
              key={fetchKey}
              repoName={repoName}
              colorScheme={colorScheme}
              githubToken={githubToken}
              blockSize={12}
              blockMargin={3}
              showWeekdayLabels={true}
              showMonthLabels={true}
              onContributorsLoad={setContributors}
              loading={<SkeletonCalendar colorScheme={colorScheme} />}
            />
          ) : fetchKey > 0 && mode === 'usernames' && usernames.length > 0 ? (
            <MergedGitHubCalendar
              key={fetchKey}
              usernames={usernames}
              colorScheme={colorScheme}
              githubToken={githubToken}
              blockSize={12}
              blockMargin={3}
              showWeekdayLabels={true}
              showMonthLabels={true}
              loading={<SkeletonCalendar colorScheme={colorScheme} />}
            />
          ) : (
            <div className="empty-state" style={{ color: colorScheme === 'dark' ? '#8b949e' : '#57606a' }}>
              {mode === 'repo' ? (
                <p>Enter a repository name and click "Load Contributions" to see the merged contribution graph</p>
              ) : (
                <p>Add GitHub usernames and click "Load Contributions" to see the merged contribution graph</p>
              )}
            </div>
          )}
        </div>

        <footer style={{ color: colorScheme === 'dark' ? '#8b949e' : '#57606a' }}>
          <p>
            Built with React • Combines contribution data from multiple GitHub users
          </p>
          <p className="note">
            Note: GitHub API has rate limits. For production use, provide a GitHub token.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
