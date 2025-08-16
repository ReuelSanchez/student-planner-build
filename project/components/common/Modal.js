import React from 'react';
const Modal = ({
  isOpen,
  onClose,
  title,
  children
}) => {
  if (!isOpen) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-50 flex justify-center items-center",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-sm m-4 p-6",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center mb-4"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-xl font-bold text-slate-900 dark:text-white"
  }, title), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
  }, /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    className: "h-6 w-6",
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor"
  }, /*#__PURE__*/React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M6 18L18 6M6 6l12 12"
  })))), /*#__PURE__*/React.createElement("div", null, children)));
};
export default Modal;