import React, { useState, useEffect } from 'react';
const ShareReceiverScreen = ({
  sharedData,
  courses,
  onAddResource,
  onDone
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [title, setTitle] = useState('');
  useEffect(() => {
    // Pre-fill title from shared data or set a default if an image is shared
    if (sharedData) {
      if (sharedData.title) {
        setTitle(sharedData.title);
      } else if (sharedData.fileDataUrl) {
        setTitle('Shared Image');
      } else if (sharedData.text) {
        setTitle('Shared Note');
      }
    }
    // If there is only one course, pre-select it
    if (courses.length === 1) {
      setSelectedCourseId(courses[0].id);
    }
  }, [sharedData, courses]);
  const handleSave = () => {
    if (!selectedCourseId || !title) return;
    let resource = null;

    // Prioritize file over text if both are somehow shared
    if (sharedData.fileDataUrl) {
      resource = {
        type: 'document',
        title,
        content: sharedData.fileDataUrl
      };
    } else if (sharedData.text) {
      resource = {
        type: 'lesson',
        title,
        content: sharedData.text
      };
    }
    if (resource) {
      onAddResource(selectedCourseId, resource);
    }
    onDone(); // Navigate back to dashboard and clear state
  };
  const hasContent = sharedData.fileDataUrl || sharedData.text;
  return /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-lg font-bold text-slate-800 dark:text-slate-100 mb-2"
  }, "Save to Planner"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-slate-600 dark:text-slate-400"
  }, "Assign the shared content to a course.")), hasContent && /*#__PURE__*/React.createElement("div", {
    className: "p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-md font-semibold text-slate-700 dark:text-slate-200"
  }, "Content Preview:"), sharedData.fileDataUrl && /*#__PURE__*/React.createElement("img", {
    src: sharedData.fileDataUrl,
    alt: "Shared content",
    className: "w-full rounded-lg shadow-sm max-h-48 object-contain"
  }), sharedData.text && !sharedData.fileDataUrl && /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md max-h-48 overflow-y-auto"
  }, sharedData.text)), /*#__PURE__*/React.createElement("div", {
    className: "p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    htmlFor: "title",
    className: "block text-sm font-medium text-slate-700 dark:text-slate-300"
  }, "Title"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    id: "title",
    value: title,
    onChange: e => setTitle(e.target.value),
    required: true,
    className: "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    htmlFor: "course",
    className: "block text-sm font-medium text-slate-700 dark:text-slate-300"
  }, "Course"), /*#__PURE__*/React.createElement("select", {
    id: "course",
    value: selectedCourseId,
    onChange: e => setSelectedCourseId(e.target.value),
    required: true,
    className: "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
  }, /*#__PURE__*/React.createElement("option", {
    value: "",
    disabled: true
  }, "-- Select a course --"), courses.map(course => /*#__PURE__*/React.createElement("option", {
    key: course.id,
    value: course.id
  }, course.name))))), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onDone,
    className: "flex-1 py-2 px-4 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
  }, "Cancel"), /*#__PURE__*/React.createElement("button", {
    onClick: handleSave,
    disabled: !selectedCourseId || !title || !hasContent,
    className: "flex-1 py-2 px-4 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
  }, "Save")), courses.length === 0 && /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-center text-amber-600 dark:text-amber-400 p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg"
  }, "You need to add a course first before you can save shared items."));
};
export default ShareReceiverScreen;