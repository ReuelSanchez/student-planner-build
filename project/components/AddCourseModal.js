import React, { useState } from 'react';
import { COURSE_COLORS } from '../constants.js';
import Modal from './common/Modal.js';
const AddCourseModal = ({
  isOpen,
  onClose,
  onAddCourse,
  onDeleteCourse,
  existingCourses
}) => {
  const [name, setName] = useState('');
  const [teacher, setTeacher] = useState('');
  const [color, setColor] = useState(COURSE_COLORS[0]);
  const [schedule, setSchedule] = useState([{
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '10:00'
  }]);
  const handleAddScheduleSlot = () => {
    setSchedule([...schedule, {
      dayOfWeek: 'Monday',
      startTime: '09:00',
      endTime: '10:00'
    }]);
  };
  const handleScheduleChange = (index, field, value) => {
    const newSchedule = [...schedule];
    newSchedule[index] = {
      ...newSchedule[index],
      [field]: value
    };
    setSchedule(newSchedule);
  };
  const handleRemoveScheduleSlot = index => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };
  const handleSubmit = e => {
    e.preventDefault();
    onAddCourse({
      name,
      teacher,
      color,
      schedule
    });
    // Reset form
    setName('');
    setTeacher('');
    setColor(COURSE_COLORS[0]);
    setSchedule([{
      dayOfWeek: 'Monday',
      startTime: '09:00',
      endTime: '10:00'
    }]);
    onClose();
  };
  const confirmDelete = (courseId, courseName) => {
    if (window.confirm(`Are you sure you want to delete "${courseName}"? This will also remove all associated assignments.`)) {
      onDeleteCourse(courseId);
    }
  };
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return /*#__PURE__*/React.createElement(Modal, {
    isOpen: isOpen,
    onClose: onClose,
    title: "Manage Classes"
  }, /*#__PURE__*/React.createElement("div", {
    className: "space-y-6 max-h-[80vh] overflow-y-auto p-1"
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSubmit,
    className: "space-y-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-lg font-semibold text-slate-800 dark:text-slate-100"
  }, "Add a New Class"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-medium text-slate-700 dark:text-slate-300"
  }, "Course Name"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: name,
    onChange: e => setName(e.target.value),
    required: true,
    className: "mt-1 block w-full input-style"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-medium text-slate-700 dark:text-slate-300"
  }, "Teacher"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: teacher,
    onChange: e => setTeacher(e.target.value),
    required: true,
    className: "mt-1 block w-full input-style"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-medium text-slate-700 dark:text-slate-300"
  }, "Color"), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-8 gap-2 mt-1"
  }, COURSE_COLORS.map(c => /*#__PURE__*/React.createElement("button", {
    key: c,
    type: "button",
    onClick: () => setColor(c),
    className: `h-8 w-8 rounded-full ${c} ${color === c ? 'ring-2 ring-offset-2 ring-sky-500' : ''}`
  })))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2"
  }, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-medium text-slate-700 dark:text-slate-300"
  }, "Schedule"), schedule.map((slot, index) => /*#__PURE__*/React.createElement("div", {
    key: index,
    className: "grid grid-cols-[2fr,1fr,1fr,auto] items-center gap-2"
  }, /*#__PURE__*/React.createElement("select", {
    value: slot.dayOfWeek,
    onChange: e => handleScheduleChange(index, 'dayOfWeek', e.target.value),
    className: "input-style"
  }, daysOfWeek.map(day => /*#__PURE__*/React.createElement("option", {
    key: day,
    value: day
  }, day))), /*#__PURE__*/React.createElement("input", {
    type: "time",
    value: slot.startTime,
    onChange: e => handleScheduleChange(index, 'startTime', e.target.value),
    className: "input-style"
  }), /*#__PURE__*/React.createElement("input", {
    type: "time",
    value: slot.endTime,
    onChange: e => handleScheduleChange(index, 'endTime', e.target.value),
    className: "input-style"
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => handleRemoveScheduleSlot(index),
    className: "text-red-500 hover:text-red-700 p-1 rounded-full w-6 h-6 flex items-center justify-center bg-red-100 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-900"
  }, /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: 1.5,
    stroke: "currentColor",
    className: "w-4 h-4"
  }, /*#__PURE__*/React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    d: "M6 18L18 6M6 6l12 12"
  }))))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleAddScheduleSlot,
    className: "text-sm text-sky-600 dark:text-sky-400 font-semibold"
  }, "+ Add time slot")), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "w-full py-2 px-4 bg-sky-600 text-white font-semibold rounded-lg"
  }, "Add Class")), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-lg font-semibold text-slate-800 dark:text-slate-100"
  }, "Existing Classes"), existingCourses.length > 0 ? /*#__PURE__*/React.createElement("ul", {
    className: "space-y-2"
  }, existingCourses.map(course => /*#__PURE__*/React.createElement("li", {
    key: course.id,
    className: "flex justify-between items-center p-2 bg-slate-100 dark:bg-slate-700/50 rounded-md"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-medium text-slate-800 dark:text-slate-200"
  }, course.name), /*#__PURE__*/React.createElement("button", {
    onClick: () => confirmDelete(course.id, course.name),
    className: "text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-semibold"
  }, "Delete")))) : /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-slate-500 dark:text-slate-400"
  }, "No classes added yet."))), /*#__PURE__*/React.createElement("style", null, `.input-style { box-sizing: border-box; border: 1px solid #cbd5e1; border-radius: 0.375rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; width: 100%; } .dark .input-style { background-color: #334155; border-color: #475569; color: #e2e8f0; }`));
};
export default AddCourseModal;