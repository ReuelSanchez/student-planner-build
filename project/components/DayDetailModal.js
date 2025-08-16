import React from 'react';
import Modal from './common/Modal.js';
const DayDetailModal = ({
  isOpen,
  onClose,
  selectedDate,
  events
}) => {
  if (!isOpen || !selectedDate) return null;
  const title = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
  return /*#__PURE__*/React.createElement(Modal, {
    isOpen: isOpen,
    onClose: onClose,
    title: title
  }, /*#__PURE__*/React.createElement("div", {
    className: "space-y-4 max-h-[60vh] overflow-y-auto"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "font-semibold text-slate-800 dark:text-slate-100 mb-2 border-b dark:border-slate-700 pb-1"
  }, "Classes"), events.coursesOnDay.length > 0 ? /*#__PURE__*/React.createElement("ul", {
    className: "space-y-2"
  }, events.coursesOnDay.sort((a, b) => a.schedule.startTime.localeCompare(b.schedule.startTime)).map(({
    course,
    schedule
  }, index) => /*#__PURE__*/React.createElement("li", {
    key: `course-${index}`,
    className: `p-2 rounded-md ${course.color} bg-opacity-70 dark:bg-opacity-30`
  }, /*#__PURE__*/React.createElement("p", {
    className: "font-bold text-sm text-slate-900 dark:text-slate-50"
  }, course.name), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-700 dark:text-slate-200"
  }, schedule.startTime, " - ", schedule.endTime)))) : /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-slate-500 dark:text-slate-400"
  }, "No classes scheduled.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "font-semibold text-slate-800 dark:text-slate-100 mb-2 border-b dark:border-slate-700 pb-1"
  }, "Assignments Due"), events.assignmentsDue.length > 0 ? /*#__PURE__*/React.createElement("ul", {
    className: "space-y-2"
  }, events.assignmentsDue.map(assignment => /*#__PURE__*/React.createElement("li", {
    key: assignment.id,
    className: "p-2 bg-slate-100 dark:bg-slate-700/50 rounded-md"
  }, /*#__PURE__*/React.createElement("p", {
    className: "font-bold text-sm text-slate-900 dark:text-slate-100"
  }, assignment.name), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-rose-600 dark:text-rose-400 font-medium"
  }, "Due today")))) : /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-slate-500 dark:text-slate-400"
  }, "No assignments due."))));
};
export default DayDetailModal;