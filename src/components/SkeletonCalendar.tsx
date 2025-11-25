import React, { useMemo } from 'react';
import { CalendarGrid } from './CalendarGrid';
import { getTheme } from '../utils/themes';
import { fillMissingDates } from '../utils/merge';

interface SkeletonCalendarProps {
    colorScheme: 'light' | 'dark';
    blockSize?: number;
    blockMargin?: number;
}

export const SkeletonCalendar: React.FC<SkeletonCalendarProps> = ({
    colorScheme,
    blockSize = 12,
    blockMargin = 3,
}) => {
    const theme = getTheme(colorScheme);

    // Generate dummy data for the current year to match the default behavior of the real calendar
    const contributions = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const start = new Date(currentYear, 0, 1); // Jan 1st
        const end = new Date(currentYear, 11, 31); // Dec 31st
        return fillMissingDates([], start, end);
    }, []);

    return (
        <div
            style={{
                padding: '20px',
                backgroundColor: theme.background,
                borderRadius: '6px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
        >
            {/* Header Skeleton - Mimics the 3 lines of text in the real header */}
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    {/* Title */}
                    <div
                        style={{
                            height: '20px',
                            width: '250px',
                            backgroundColor: theme.level0,
                            borderRadius: '4px',
                            marginBottom: '8px',
                        }}
                    />
                    {/* Stats line */}
                    <div
                        style={{
                            height: '14px',
                            width: '180px',
                            backgroundColor: theme.level0,
                            borderRadius: '4px',
                            marginBottom: '4px',
                        }}
                    />
                    {/* Contributors list line */}
                    <div
                        style={{
                            height: '12px',
                            width: '300px',
                            backgroundColor: theme.level0,
                            borderRadius: '4px',
                            marginTop: '4px',
                        }}
                    />
                </div>
                {/* Download button placeholder */}
                <div
                    style={{
                        height: '28px',
                        width: '80px',
                        backgroundColor: theme.level0,
                        borderRadius: '4px',
                        opacity: 0.5,
                    }}
                />
            </div>

            <div className="skeleton-shimmer" style={{ display: 'inline-block', borderRadius: '4px' }}>
                <CalendarGrid
                    contributions={contributions}
                    theme={theme}
                    blockSize={blockSize}
                    blockMargin={blockMargin}
                    showWeekdayLabels={true}
                    showMonthLabels={true}
                />
            </div>

            {/* Footer Skeleton */}
            <div
                style={{
                    marginTop: '12px',
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                }}
            >
                <div
                    style={{
                        height: '10px',
                        width: '30px',
                        backgroundColor: theme.level0,
                        borderRadius: '2px',
                    }}
                />
                <div style={{ display: 'flex', gap: '3px' }}>
                    {[0, 1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            style={{
                                width: blockSize,
                                height: blockSize,
                                backgroundColor: theme.level0,
                                borderRadius: '2px',
                            }}
                        />
                    ))}
                </div>
                <div
                    style={{
                        height: '10px',
                        width: '30px',
                        backgroundColor: theme.level0,
                        borderRadius: '2px',
                    }}
                />
            </div>
        </div>
    );
};
