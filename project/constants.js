function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import React from 'react';
import { Screen } from './types.js';
const HomeIcon = props => /*#__PURE__*/React.createElement("svg", _extends({
  xmlns: "http://www.w3.org/2000/svg",
  fill: "none",
  viewBox: "0 0 24 24",
  strokeWidth: 1.5,
  stroke: "currentColor"
}, props), /*#__PURE__*/React.createElement("path", {
  strokeLinecap: "round",
  strokeLinejoin: "round",
  d: "M2.25 12l8.954-8.955a1.5 1.5 0 012.122 0l8.954 8.955M11.25 6v13.5M12.75 6v13.5m-3-9h6"
}));
const CalendarIcon = props => /*#__PURE__*/React.createElement("svg", _extends({
  xmlns: "http://www.w3.org/2000/svg",
  fill: "none",
  viewBox: "0 0 24 24",
  strokeWidth: 1.5,
  stroke: "currentColor"
}, props), /*#__PURE__*/React.createElement("path", {
  strokeLinecap: "round",
  strokeLinejoin: "round",
  d: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M-4.5 12h22.5"
}));
const ChartBarIcon = props => /*#__PURE__*/React.createElement("svg", _extends({
  xmlns: "http://www.w3.org/2000/svg",
  fill: "none",
  viewBox: "0 0 24 24",
  strokeWidth: 1.5,
  stroke: "currentColor"
}, props), /*#__PURE__*/React.createElement("path", {
  strokeLinecap: "round",
  strokeLinejoin: "round",
  d: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
}));
const DocumentScanIcon = props => /*#__PURE__*/React.createElement("svg", _extends({
  xmlns: "http://www.w3.org/2000/svg",
  fill: "none",
  viewBox: "0 0 24 24",
  strokeWidth: 1.5,
  stroke: "currentColor"
}, props), /*#__PURE__*/React.createElement("path", {
  strokeLinecap: "round",
  strokeLinejoin: "round",
  d: "M15 12H9m6 4H9m-2 4h10a2 2 0 002-2V7.414a2 2 0 00-.586-1.414l-4.414-4.414A2 2 0 0012.586 1H5a2 2 0 00-2 2v14a2 2 0 002 2z"
}));
const CalculatorIcon = props => /*#__PURE__*/React.createElement("svg", _extends({
  xmlns: "http://www.w3.org/2000/svg",
  fill: "none",
  viewBox: "0 0 24 24",
  strokeWidth: 1.5,
  stroke: "currentColor"
}, props), /*#__PURE__*/React.createElement("path", {
  strokeLinecap: "round",
  strokeLinejoin: "round",
  d: "M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5zm2 4h10v2H7V7zm0 4h10v2H7v-2zm0 4h4v2H7v-2z"
}));
const Cog6ToothIcon = props => /*#__PURE__*/React.createElement("svg", _extends({
  xmlns: "http://www.w3.org/2000/svg",
  fill: "none",
  viewBox: "0 0 24 24",
  strokeWidth: 1.5,
  stroke: "currentColor"
}, props), /*#__PURE__*/React.createElement("path", {
  strokeLinecap: "round",
  strokeLinejoin: "round",
  d: "M10.343 3.94c.09-.542.56-1.007 1.11-1.226l.46-.162a2.25 2.25 0 012.16 0l.46.162c.55.219 1.02.684 1.11 1.226l.09.542a2.25 2.25 0 003.352 1.393l.42-.327a2.25 2.25 0 012.91.493l.429.43c.635.635.932 1.488.75 2.28l-.18.791a2.25 2.25 0 001.393 3.352l.542.09c.788.134 1.258.922.932 1.636l-.33.746a2.25 2.25 0 01-2.023 1.348l-.791-.18a2.25 2.25 0 00-3.352 1.393l-.09.542c-.09.542-.56 1.007-1.11 1.226l-.46.162a2.25 2.25 0 01-2.16 0l-.46-.162c-.55-.219-1.02-.684-1.11-1.226l-.09-.542a2.25 2.25 0 00-3.352-1.393l-.42.327a2.25 2.25 0 01-2.91-.493l-.429-.43c-.635-.635-.932-1.488-.75-2.28l.18-.791a2.25 2.25 0 00-1.393-3.352l-.542-.09c-.788-.134-1.258-.922-.932-1.636l.33-.746a2.25 2.25 0 012.023-1.348l.791.18a2.25 2.25 0 003.352-1.393l.09-.542z"
}), /*#__PURE__*/React.createElement("path", {
  strokeLinecap: "round",
  strokeLinejoin: "round",
  d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z"
}));
export const NAV_ITEMS = [{
  label: 'Dashboard',
  screen: Screen.Dashboard,
  icon: HomeIcon
}, {
  label: 'Schedule',
  screen: Screen.Schedule,
  icon: CalendarIcon
}, {
  label: 'Grades',
  screen: Screen.Grades,
  icon: ChartBarIcon
}, {
  label: 'Scanner',
  screen: Screen.Scanner,
  icon: DocumentScanIcon
}, {
  label: 'Solver',
  screen: Screen.Solver,
  icon: CalculatorIcon
}, {
  label: 'Settings',
  screen: Screen.Settings,
  icon: Cog6ToothIcon
}];
export const COURSE_COLORS = ['bg-red-200', 'bg-blue-200', 'bg-green-200', 'bg-yellow-200', 'bg-purple-200', 'bg-pink-200', 'bg-indigo-200', 'bg-teal-200'];
export const MOCK_COURSES = [{
  id: 'C1',
  name: 'Calculus II',
  teacher: 'Dr. Evelyn Reed',
  color: 'bg-sky-200',
  schedule: [{
    dayOfWeek: 'Monday',
    startTime: '10:00',
    endTime: '11:30'
  }, {
    dayOfWeek: 'Wednesday',
    startTime: '10:00',
    endTime: '11:30'
  }],
  resources: [{
    id: 'R1',
    type: 'lesson',
    title: 'Chapter 5: Integrals',
    content: 'Integration is the reverse process of differentiation. The fundamental theorem of calculus connects the two.'
  }, {
    id: 'R2',
    type: 'document',
    title: 'Derivative Formulas',
    content: 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='
  } // Placeholder
  ]
}, {
  id: 'C2',
  name: 'Physics I',
  teacher: 'Prof. Alan Grant',
  color: 'bg-amber-200',
  schedule: [{
    dayOfWeek: 'Tuesday',
    startTime: '13:00',
    endTime: '14:30'
  }, {
    dayOfWeek: 'Thursday',
    startTime: '13:00',
    endTime: '14:30'
  }],
  resources: [{
    id: 'R3',
    type: 'lesson',
    title: 'Newton\'s Laws of Motion',
    content: '1. An object in motion stays in motion. 2. F=ma. 3. For every action, there is an equal and opposite reaction.'
  }]
}, {
  id: 'C3',
  name: 'Intro to CompSci',
  teacher: 'Dr. Ada Lovelace',
  color: 'bg-violet-200',
  schedule: [{
    dayOfWeek: 'Friday',
    startTime: '09:00',
    endTime: '12:00'
  }]
}];
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date();
nextWeek.setDate(nextWeek.getDate() + 7);
const twoWeeks = new Date();
twoWeeks.setDate(twoWeeks.getDate() + 14);
export const MOCK_ASSIGNMENTS = [{
  id: 'A1',
  courseId: 'C1',
  name: 'Problem Set 5',
  dueDate: tomorrow.toISOString(),
  grade: {
    score: 9,
    total: 10
  },
  weight: 15
}, {
  id: 'A2',
  courseId: 'C2',
  name: 'Lab Report 3',
  dueDate: nextWeek.toISOString(),
  grade: {
    score: null,
    total: 25
  },
  weight: 20
}, {
  id: 'A3',
  courseId: 'C1',
  name: 'Midterm Exam',
  dueDate: twoWeeks.toISOString(),
  grade: {
    score: null,
    total: 100
  },
  weight: 40
}, {
  id: 'A4',
  courseId: 'C3',
  name: 'Project Milestone 1',
  dueDate: tomorrow.toISOString(),
  grade: {
    score: 20,
    total: 20
  },
  weight: 25
}, {
  id: 'A5',
  courseId: 'C2',
  name: 'Homework 4',
  dueDate: tomorrow.toISOString(),
  grade: {
    score: 18,
    total: 20
  },
  weight: 10
}];