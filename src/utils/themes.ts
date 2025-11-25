import { CalendarTheme } from '../types';

export const lightTheme: CalendarTheme = {
  level0: '#ebedf0',
  level1: '#9be9a8',
  level2: '#40c463',
  level3: '#30a14e',
  level4: '#216e39',
  text: '#24292f',
  background: '#ffffff',
};

export const darkTheme: CalendarTheme = {
  level0: '#161b22',
  level1: '#0e4429',
  level2: '#006d32',
  level3: '#26a641',
  level4: '#39d353',
  text: '#c9d1d9',
  background: '#0d1117',
};

export function getTheme(scheme: 'light' | 'dark'): CalendarTheme {
  return scheme === 'light' ? lightTheme : darkTheme;
}
