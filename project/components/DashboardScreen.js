import React from 'react';
const DashboardScreen = ({
  courses,
  assignments
}) => {
  const today = new Date().toLocaleString('en-US', {
    weekday: 'long'
  });
  const todaysClasses = courses.filter(course => course.schedule.some(s => s.dayOfWeek === today)).sort((a, b) => {
    const timeA = a.schedule.find(s => s.dayOfWeek === today).startTime;
    const timeB = b.schedule.find(s => s.dayOfWeek === today).startTime;
    return timeA.localeCompare(timeB);
  });
  const upcomingAssignments = assignments.filter(a => new Date(a.dueDate) >= new Date() && a.grade.score === null).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 5);
  const getCourseName = courseId => {
    return courses.find(c => c.id === courseId)?.name || 'Unknown Course';
  };
  const formatDate = dateString => {
    const options = {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "space-y-6"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "text-xl font-bold text-slate-800 dark:text-slate-100 mb-3"
  }, "Today's Schedule"), todaysClasses.length > 0 ? /*#__PURE__*/React.createElement("div", {
    className: "space-y-3"
  }, todaysClasses.map(course => {
    const schedule = course.schedule.find(s => s.dayOfWeek === today);
    return /*#__PURE__*/React.createElement("div", {
      key: course.id,
      className: `p-4 rounded-lg flex items-center justify-between ${course.color} bg-opacity-70 dark:bg-opacity-30`
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
      className: "font-semibold text-slate-900 dark:text-slate-50"
    }, course.name), /*#__PURE__*/React.createElement("p", {
      className: "text-sm text-slate-700 dark:text-slate-200"
    }, course.teacher)), /*#__PURE__*/React.createElement("div", {
      className: "text-right"
    }, /*#__PURE__*/React.createElement("p", {
      className: "font-mono text-sm text-slate-900 dark:text-slate-100"
    }, schedule.startTime, " - ", schedule.endTime)));
  })) : /*#__PURE__*/React.createElement("div", {
    className: "text-center py-6 bg-slate-100 dark:bg-slate-800/50 rounded-lg"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-slate-500 dark:text-slate-400"
  }, "No classes scheduled for today. Enjoy your day off!"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "text-xl font-bold text-slate-800 dark:text-slate-100 mb-3"
  }, "Upcoming Assignments"), upcomingAssignments.length > 0 ? /*#__PURE__*/React.createElement("div", {
    className: "space-y-3"
  }, upcomingAssignments.map(assignment => /*#__PURE__*/React.createElement("div", {
    key: assignment.id,
    className: "p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex justify-between items-center"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "font-semibold text-slate-900 dark:text-slate-50"
  }, assignment.name), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-slate-500 dark:text-slate-400"
  }, getCourseName(assignment.courseId))), /*#__PURE__*/React.createElement("div", {
    className: "text-right"
  }, /*#__PURE__*/React.createElement("p", {
    className: "font-medium text-sm text-rose-600 dark:text-rose-400"
  }, formatDate(assignment.dueDate)))))) : /*#__PURE__*/React.createElement("div", {
    className: "text-center py-6 bg-slate-100 dark:bg-slate-800/50 rounded-lg"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-slate-500 dark:text-slate-400"
  }, "You're all caught up. No upcoming assignments!"))));
};
export default DashboardScreen;