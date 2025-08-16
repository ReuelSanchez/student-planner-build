import React, { useState } from 'react';
import AddCourseModal from './AddCourseModal.js';
import CourseDetailModal from './CourseDetailModal.js';
import MonthlyCalendar from './MonthlyCalendar.js';
const ScheduleScreen = ({
  courses,
  assignments,
  onAddCourse,
  onDeleteCourse,
  onAddResource,
  onDeleteResource
}) => {
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [view, setView] = useState('weekly');
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = Array.from({
    length: 12
  }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`);
  const handleCourseClick = course => {
    setSelectedCourse(course);
    setIsDetailModalOpen(true);
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(AddCourseModal, {
    isOpen: isManageModalOpen,
    onClose: () => setIsManageModalOpen(false),
    onAddCourse: onAddCourse,
    onDeleteCourse: onDeleteCourse,
    existingCourses: courses
  }), /*#__PURE__*/React.createElement(CourseDetailModal, {
    isOpen: isDetailModalOpen,
    onClose: () => setIsDetailModalOpen(false),
    course: selectedCourse,
    onAddResource: onAddResource,
    onDeleteResource: onDeleteResource
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between mb-4"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-xl font-bold text-slate-800 dark:text-slate-100"
  }, "My Schedule"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setIsManageModalOpen(true),
    className: "px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 shadow-sm transition-all"
  }, "Manage Classes")), /*#__PURE__*/React.createElement("div", {
    className: "flex bg-slate-200 dark:bg-slate-700 p-1 rounded-lg mb-4"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setView('weekly'),
    className: `flex-1 py-2 text-sm font-semibold rounded-md transition-all ${view === 'weekly' ? 'bg-white dark:bg-slate-800 shadow text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`
  }, "Weekly"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setView('monthly'),
    className: `flex-1 py-2 text-sm font-semibold rounded-md transition-all ${view === 'monthly' ? 'bg-white dark:bg-slate-800 shadow text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`
  }, "Monthly")), view === 'monthly' && /*#__PURE__*/React.createElement(MonthlyCalendar, {
    courses: courses,
    assignments: assignments
  }), view === 'weekly' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "relative grid grid-cols-8 text-xs text-center font-semibold text-slate-600 dark:text-slate-400"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sticky top-0 z-10 bg-slate-50 dark:bg-slate-900 py-2 border-b border-slate-200 dark:border-slate-700"
  }, "\xA0"), daysOfWeek.map(day => /*#__PURE__*/React.createElement("div", {
    key: day,
    className: "sticky top-0 z-10 bg-slate-50 dark:bg-slate-900 py-2 border-b border-slate-200 dark:border-slate-700"
  }, day.slice(0, 3)))), /*#__PURE__*/React.createElement("div", {
    className: "relative grid grid-cols-8 flex-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-rows-12"
  }, timeSlots.map(time => /*#__PURE__*/React.createElement("div", {
    key: time,
    className: "h-16 flex items-start justify-center pt-1 text-xs text-slate-400 dark:text-slate-500 border-r border-slate-200 dark:border-slate-700"
  }, time))), daysOfWeek.map(day => /*#__PURE__*/React.createElement("div", {
    key: day,
    className: "relative grid grid-rows-12 col-span-1"
  }, timeSlots.map(time => /*#__PURE__*/React.createElement("div", {
    key: time,
    className: "h-16 border-b border-r border-slate-200 dark:border-slate-700"
  })), courses.flatMap(course => course.schedule.filter(s => s.dayOfWeek === day).map((s, index) => {
    const startHour = parseInt(s.startTime.split(':')[0]);
    const startMinute = parseInt(s.startTime.split(':')[1]);
    const endHour = parseInt(s.endTime.split(':')[0]);
    const endMinute = parseInt(s.endTime.split(':')[1]);
    const top = ((startHour - 8) * 60 + startMinute) / (12 * 60) * 100;
    const duration = endHour * 60 + endMinute - (startHour * 60 + startMinute);
    const height = duration / (12 * 60) * 100;
    return /*#__PURE__*/React.createElement("button", {
      key: `${course.id}-${index}`,
      onClick: () => handleCourseClick(course),
      className: `absolute w-full p-2 rounded-lg text-left ${course.color} bg-opacity-80 dark:bg-opacity-40 text-slate-900 dark:text-white overflow-hidden border border-slate-300 dark:border-slate-500/50 hover:ring-2 hover:ring-sky-500 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer`,
      style: {
        top: `${top}%`,
        height: `${height}%`
      }
    }, /*#__PURE__*/React.createElement("p", {
      className: "font-bold text-xs truncate"
    }, course.name), /*#__PURE__*/React.createElement("p", {
      className: "text-xs truncate"
    }, s.startTime, " - ", s.endTime));
  }))))))));
};
export default ScheduleScreen;