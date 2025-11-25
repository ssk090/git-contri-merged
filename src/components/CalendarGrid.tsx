import React from 'react';
import { ContributionDay, CalendarTheme } from '../types';
import { groupByWeeks } from '../utils/merge';

interface CalendarGridProps {
  contributions: ContributionDay[];
  theme: CalendarTheme;
  blockSize?: number;
  blockMargin?: number;
  showWeekdayLabels?: boolean;
  showMonthLabels?: boolean;
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  contributions,
  theme,
  blockSize = 12,
  blockMargin = 3,
  showWeekdayLabels = true,
  showMonthLabels = true,
}) => {
  const weeks = groupByWeeks(contributions);

  const getLevelColor = (level: 0 | 1 | 2 | 3 | 4): string => {
    return theme[`level${level}`];
  };

  const getMonthLabel = (weekIndex: number): string | null => {
    if (!showMonthLabels || weekIndex >= weeks.length) return null;

    const firstDayOfWeek = weeks[weekIndex][0];
    const date = new Date(firstDayOfWeek.date);
    const month = date.getMonth();

    // Show month label if it's the first week or if the month changed
    if (weekIndex === 0) {
      return MONTHS[month];
    }

    const prevWeekFirstDay = weeks[weekIndex - 1][0];
    const prevDate = new Date(prevWeekFirstDay.date);
    const prevMonth = prevDate.getMonth();

    return month !== prevMonth ? MONTHS[month] : null;
  };

  const weekdayLabelWidth = showWeekdayLabels ? 30 : 0;
  const gridStartX = weekdayLabelWidth;

  return (
    <svg
      width={gridStartX + weeks.length * (blockSize + blockMargin) + blockMargin}
      height={showMonthLabels ? 7 * (blockSize + blockMargin) + 30 : 7 * (blockSize + blockMargin) + 10}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
    >
      {/* Month labels */}
      {showMonthLabels && (
        <g transform={`translate(${gridStartX}, 0)`}>
          {(() => {
            const labels: { x: number; label: string }[] = [];

            weeks.forEach((_, weekIndex) => {
              const label = getMonthLabel(weekIndex);
              if (label) {
                labels.push({
                  x: weekIndex * (blockSize + blockMargin),
                  label
                });
              }
            });

            // Filter labels to avoid overlap at the start
            // If the second label is too close to the first, remove the first one
            if (labels.length > 1) {
              const first = labels[0];
              const second = labels[1];
              // 2 weeks worth of space (approx 30px) is a good threshold
              const minDistance = 2 * (blockSize + blockMargin);

              if (second.x - first.x < minDistance) {
                labels.shift();
              }
            }

            return labels.map((item, index) => (
              <text
                key={`month-${index}-${item.label}`}
                x={item.x}
                y={10}
                fontSize="10"
                fill={theme.text}
              >
                {item.label}
              </text>
            ));
          })()}
        </g>
      )}

      {/* Weekday labels */}
      {showWeekdayLabels && (
        <g transform={`translate(0, ${showMonthLabels ? 20 : 0})`}>
          {[1, 3, 5].map((day) => (
            <text
              key={`weekday-${day}`}
              x={0}
              y={day * (blockSize + blockMargin) + blockSize}
              fontSize="9"
              fill={theme.text}
              textAnchor="start"
            >
              {WEEKDAY_LABELS[day]}
            </text>
          ))}
        </g>
      )}

      {/* Calendar grid */}
      <g transform={`translate(${gridStartX}, ${showMonthLabels ? 20 : 0})`}>
        {weeks.map((week, weekIndex) =>
          week.map((day, dayIndex) => {
            const x = weekIndex * (blockSize + blockMargin);
            const y = dayIndex * (blockSize + blockMargin);

            return (
              <rect
                key={`${day.date}`}
                x={x}
                y={y}
                width={blockSize}
                height={blockSize}
                rx={2}
                ry={2}
                fill={getLevelColor(day.level)}
                data-date={day.date}
                data-count={day.count}
              >
                <title>{`${day.date}: ${day.count} contribution${day.count !== 1 ? 's' : ''}`}</title>
              </rect>
            );
          })
        )}
      </g>
    </svg>
  );
};
