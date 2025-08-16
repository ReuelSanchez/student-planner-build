function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import React, { useState, useRef, useCallback } from 'react';
import Modal from './common/Modal.js';
const TrashIcon = props => /*#__PURE__*/React.createElement("svg", _extends({
  xmlns: "http://www.w3.org/2000/svg",
  fill: "none",
  viewBox: "0 0 24 24",
  strokeWidth: 1.5,
  stroke: "currentColor"
}, props), /*#__PURE__*/React.createElement("path", {
  strokeLinecap: "round",
  strokeLinejoin: "round",
  d: "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.043-2.124H8.916a2.043 2.043 0 00-2.043 2.124v.916m7.5 0a48.667 48.667 0 00-7.5 0"
}));
const CourseDetailModal = ({
  isOpen,
  onClose,
  course,
  onAddResource,
  onDeleteResource
}) => {
  const [activeTab, setActiveTab] = useState('lessons');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const resetForm = () => {
    setTitle('');
    setContent('');
  };
  const handleAddLesson = e => {
    e.preventDefault();
    if (!course || !title || !content) return;
    onAddResource(course.id, {
      type: 'lesson',
      title,
      content
    });
    resetForm();
  };
  const handleFileChange = event => {
    if (!course || !title || !event.target.files || event.target.files.length === 0) {
      if (!title) alert("Please enter a title for the document.");
      return;
    }
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = loadEvent => {
      const base64Content = loadEvent.target?.result;
      onAddResource(course.id, {
        type: 'document',
        title,
        content: base64Content
      });
      resetForm();
    };
    reader.readAsDataURL(file);
  };
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  }, []);
  const handleOpenCamera = async () => {
    if (!course || !title) {
      alert("Please enter a title before using the camera.");
      return;
    }
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment'
        }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setShowCamera(false);
    }
  };
  const handleCapture = () => {
    if (videoRef.current && course) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      onAddResource(course.id, {
        type: 'document',
        title,
        content: dataUrl
      });
      resetForm();
      stopCamera();
    }
  };
  const handleDelete = resourceId => {
    if (course && window.confirm('Are you sure you want to delete this item?')) {
      onDeleteResource(course.id, resourceId);
    }
  };
  if (!course) return null;
  const resources = course.resources || [];
  const lessons = resources.filter(r => r.type === 'lesson');
  const documents = resources.filter(r => r.type === 'document');
  return /*#__PURE__*/React.createElement(Modal, {
    isOpen: isOpen,
    onClose: onClose,
    title: course.name
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-h-[70vh] overflow-y-auto -mr-3 pr-3"
  }, showCamera && /*#__PURE__*/React.createElement("div", {
    className: "absolute inset-0 bg-black z-20 flex flex-col items-center justify-center p-4"
  }, /*#__PURE__*/React.createElement("video", {
    ref: videoRef,
    autoPlay: true,
    playsInline: true,
    className: "w-full h-auto max-h-[80%] rounded-lg mb-4"
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-4"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: handleCapture,
    className: "px-6 py-2 bg-sky-500 text-white font-semibold rounded-full"
  }, "Capture"), /*#__PURE__*/React.createElement("button", {
    onClick: stopCamera,
    className: "px-6 py-2 bg-slate-600 text-white font-semibold rounded-full"
  }, "Cancel"))), /*#__PURE__*/React.createElement("div", {
    className: "flex border-b border-slate-200 dark:border-slate-700 mb-4"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setActiveTab('lessons'),
    className: `px-4 py-2 text-sm font-semibold ${activeTab === 'lessons' ? 'border-b-2 border-sky-500 text-sky-600 dark:text-sky-400' : 'text-slate-500 dark:text-slate-400'}`
  }, "Lessons (", lessons.length, ")"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setActiveTab('documents'),
    className: `px-4 py-2 text-sm font-semibold ${activeTab === 'documents' ? 'border-b-2 border-sky-500 text-sky-600 dark:text-sky-400' : 'text-slate-500 dark:text-slate-400'}`
  }, "Documents (", documents.length, ")")), activeTab === 'lessons' && /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, lessons.map(lesson => /*#__PURE__*/React.createElement("div", {
    key: lesson.id,
    className: "p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "font-bold text-slate-800 dark:text-slate-100"
  }, lesson.title), /*#__PURE__*/React.createElement("button", {
    onClick: () => handleDelete(lesson.id),
    className: "text-slate-400 hover:text-red-500 dark:hover:text-red-400"
  }, /*#__PURE__*/React.createElement(TrashIcon, {
    className: "w-4 h-4"
  }))), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-wrap"
  }, lesson.content))), lessons.length === 0 && /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-slate-500 dark:text-slate-400 text-center py-4"
  }, "No lessons added yet."), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleAddLesson,
    className: "p-3 border-t border-slate-200 dark:border-slate-700 mt-4 space-y-2"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "font-semibold text-slate-700 dark:text-slate-200"
  }, "Add New Lesson"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Lesson Title",
    value: title,
    onChange: e => setTitle(e.target.value),
    required: true,
    className: "w-full input-style"
  }), /*#__PURE__*/React.createElement("textarea", {
    placeholder: "Lesson content...",
    value: content,
    onChange: e => setContent(e.target.value),
    required: true,
    rows: 3,
    className: "w-full input-style"
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "w-full py-2 bg-sky-600 text-white font-semibold rounded-lg text-sm"
  }, "Add Lesson"))), activeTab === 'documents' && /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, documents.map(doc => /*#__PURE__*/React.createElement("div", {
    key: doc.id,
    className: "p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "font-bold text-slate-800 dark:text-slate-100"
  }, doc.title), /*#__PURE__*/React.createElement("button", {
    onClick: () => handleDelete(doc.id),
    className: "text-slate-400 hover:text-red-500 dark:hover:text-red-400"
  }, /*#__PURE__*/React.createElement(TrashIcon, {
    className: "w-4 h-4"
  }))), /*#__PURE__*/React.createElement("img", {
    src: doc.content,
    alt: doc.title,
    className: "mt-2 rounded-md max-h-48 w-auto"
  }))), documents.length === 0 && /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-slate-500 dark:text-slate-400 text-center py-4"
  }, "No documents added yet."), /*#__PURE__*/React.createElement("div", {
    className: "p-3 border-t border-slate-200 dark:border-slate-700 mt-4 space-y-3"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "font-semibold text-slate-700 dark:text-slate-200"
  }, "Add New Document"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Document Title",
    value: title,
    onChange: e => setTitle(e.target.value),
    required: true,
    className: "w-full input-style"
  }), /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    ref: fileInputRef,
    onChange: handleFileChange,
    className: "hidden"
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => fileInputRef.current?.click(),
    className: "flex-1 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg text-sm dark:bg-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600"
  }, "Upload File"), /*#__PURE__*/React.createElement("button", {
    onClick: handleOpenCamera,
    className: "flex-1 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg text-sm dark:bg-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600"
  }, "Use Camera"))))), /*#__PURE__*/React.createElement("style", null, `.input-style { box-sizing: border-box; border: 1px solid #cbd5e1; border-radius: 0.375rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; width: 100%; } .dark .input-style { background-color: #334155; border-color: #475569; color: #e2e8f0; }`));
};
export default CourseDetailModal;