import React, { useState } from 'react';
import Modal from './common/Modal.js';
const AddAssignmentModal = ({
  isOpen,
  onClose,
  onAddAssignment,
  courseId
}) => {
  const [name, setName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [weight, setWeight] = useState('');
  const [total, setTotal] = useState('');
  const handleSubmit = e => {
    e.preventDefault();
    if (!courseId || !name || !dueDate || weight === '' || total === '') return;
    onAddAssignment({
      courseId,
      name,
      dueDate: new Date(dueDate).toISOString(),
      grade: {
        score: null,
        total: total
      },
      weight: weight
    });

    // Reset form
    setName('');
    setDueDate('');
    setWeight('');
    setTotal('');
    onClose();
  };
  if (!courseId) return null;
  return /*#__PURE__*/React.createElement(Modal, {
    isOpen: isOpen,
    onClose: onClose,
    title: "Add New Assignment"
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSubmit,
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-medium text-slate-700 dark:text-slate-300"
  }, "Assignment Name"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: name,
    onChange: e => setName(e.target.value),
    required: true,
    className: "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-medium text-slate-700 dark:text-slate-300"
  }, "Due Date"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: dueDate,
    onChange: e => setDueDate(e.target.value),
    required: true,
    className: "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm"
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-medium text-slate-700 dark:text-slate-300"
  }, "Weight (%)"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: weight,
    onChange: e => setWeight(e.target.value === '' ? '' : parseInt(e.target.value)),
    required: true,
    min: "0",
    className: "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-medium text-slate-700 dark:text-slate-300"
  }, "Total Points"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: total,
    onChange: e => setTotal(e.target.value === '' ? '' : parseInt(e.target.value)),
    required: true,
    min: "0",
    className: "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm"
  }))), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "w-full py-2 px-4 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
  }, "Add Assignment")));
};
export default AddAssignmentModal;