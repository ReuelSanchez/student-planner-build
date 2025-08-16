import React, { useState, useMemo, useCallback } from 'react';
import DayDetailModal from './DayDetailModal.js';
const MonthlyCalendar = ({
  courses,
  assignments
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = useMemo(() => {
    const days = [];
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday

    const endDate = new Date(lastDayOfMonth);
    if (endDate.getDay() !== 6) {
      endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); // End on Saturday
    }
    for (let dt = new Date(startDate); dt <= endDate; dt.setDate(dt.getDate() + 1)) {
      days.push(new Date(dt));
    }
    return days;
  }, [currentDate]);
  const eventsByDate = useMemo(() => {
    const events = new Map();
    assignments.forEach(assignment => {
      const dueDate = new Date(assignment.dueDate);
      const key = dueDate.toISOString().split('T')[0];
      if (!events.has(key)) events.set(key, {
        coursesOnDay: [],
        assignmentsDue: []
      });
      events.get(key).assignmentsDue.push(assignment);
    });
    daysInMonth.forEach(day => {
      const key = day.toISOString().split('T')[0];
      const dayOfWeek = day.toLocaleDateString('en-US', {
        weekday: 'long'
      });
      const coursesOnThisDay = [];
      courses.forEach(course => {
        course.schedule.forEach(s => {
          if (s.dayOfWeek === dayOfWeek) {
            coursesOnThisDay.push({
              course,
              schedule: s
            });
          }
        });
      });
      if (coursesOnThisDay.length > 0) {
        if (!events.has(key)) events.set(key, {
          coursesOnDay: [],
          assignmentsDue: []
        });
        events.get(key).coursesOnDay.push(...coursesOnThisDay);
      }
    });
    return events;
  }, [courses, assignments, daysInMonth]);
  const handleDayClick = useCallback(day => {
    setSelectedDate(day);
    setIsDetailModalOpen(true);
  }, []);
  const changeMonth = offset => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };
  const ChevronLeft = () => /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: 1.5,
    stroke: "currentColor",
    className: "w-5 h-5"
  }, /*#__PURE__*/React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    d: "M15.75 19.5L8.25 12l7.5-7.5"
  }));
  const ChevronRight = () => /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: 1.5,
    stroke: "currentColor",
    className: "w-5 h-5"
  }, /*#__PURE__*/React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    d: "M8.25 4.5l7.5 7.5-7.5 7.5"
  }));
  const eventsForSelectedDay = useMemo(() => {
    if (!selectedDate) return {
      coursesOnDay: [],
      assignmentsDue: []
    };
    return eventsByDate.get(selectedDate.toISOString().split('T')[0]) || {
      coursesOnDay: [],
      assignmentsDue: []
    };
  }, [selectedDate, eventsByDate]);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(DayDetailModal, {
    isOpen: isDetailModalOpen,
    onClose: () => setIsDetailModalOpen(false),
    selectedDate: selectedDate,
    events: eventsForSelectedDay
  }), /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center mb-4"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => changeMonth(-1),
    className: "p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
  }, /*#__PURE__*/React.createElement(ChevronLeft, null)), /*#__PURE__*/React.createElement("h3", {
    className: "text-lg font-bold text-slate-800 dark:text-slate-100"
  }, currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => changeMonth(1),
    className: "p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
  }, /*#__PURE__*/React.createElement(ChevronRight, null))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 dark:text-slate-400"
  }, ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => /*#__PURE__*/React.createElement("div", {
    key: day,
    className: "py-2"
  }, day))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-7 gap-1"
  }, daysInMonth.map((day, index) => {
    const dayKey = day.toISOString().split('T')[0];
    const dayEvents = eventsByDate.get(dayKey);
    const isToday = new Date().toISOString().split('T')[0] === dayKey;
    const isCurrentMonth = day.getMonth() === currentDate.getMonth();
    return /*#__PURE__*/React.createElement("div", {
      key: index,
      onClick: () => handleDayClick(day),
      className: `h-16 p-1 border border-transparent rounded-lg flex flex-col items-start cursor-pointer transition-colors ${isCurrentMonth ? 'hover:bg-sky-50 dark:hover:bg-slate-700 hover:border-sky-200 dark:hover:border-slate-600' : 'text-slate-300 dark:text-slate-600'}`
    }, /*#__PURE__*/React.createElement("span", {
      className: `w-6 h-6 flex items-center justify-center rounded-full text-sm font-medium ${isToday ? 'bg-sky-600 dark:bg-sky-500 text-white' : ''} ${isCurrentMonth ? 'text-slate-700 dark:text-slate-200' : ''}`
    }, day.getDate()), /*#__PURE__*/React.createElement("div", {
      className: "flex-1 overflow-hidden mt-1 w-full"
    }, dayEvents && /*#__PURE__*/React.createElement("div", {
      className: "flex flex-wrap gap-1"
    }, dayEvents.coursesOnDay.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "w-1.5 h-1.5 bg-blue-500 rounded-full",
      title: "Class scheduled"
    }), dayEvents.assignmentsDue.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "w-1.5 h-1.5 bg-rose-500 rounded-full",
      title: "Assignment due"
    }))));
  }))));
};
export default MonthlyCalendar;