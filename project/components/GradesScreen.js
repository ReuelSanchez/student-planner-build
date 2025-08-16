function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import React, { useState, useMemo } from 'react';
import Modal from './common/Modal.js';
import { generateStudyPlan } from '../services/geminiService.js';
import AddAssignmentModal from './AddAssignmentModal.js';
const GradesScreen = ({
  courses,
  assignments,
  onUpdateGrade,
  onAddAssignment,
  onDeleteAssignment
}) => {
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [selectedCourseForAI, setSelectedCourseForAI] = useState(null);
  const [targetGrade, setTargetGrade] = useState(90);
  const [isLoadingAiPlan, setIsLoadingAiPlan] = useState(false);
  const [studyPlan, setStudyPlan] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [isAddAssignmentModalOpen, setIsAddAssignmentModalOpen] = useState(false);
  const [selectedCourseIdForNewAssignment, setSelectedCourseIdForNewAssignment] = useState(null);
  const courseGrades = useMemo(() => {
    return courses.map(course => {
      const courseAssignments = assignments.filter(a => a.courseId === course.id);
      const gradedAssignments = courseAssignments.filter(a => a.grade.score !== null && a.grade.total !== null && a.weight > 0);
      if (gradedAssignments.length === 0) {
        return {
          ...course,
          currentGrade: null,
          assignments: courseAssignments
        };
      }
      const totalWeightedScore = gradedAssignments.reduce((acc, a) => acc + a.grade.score / a.grade.total * a.weight, 0);
      const totalWeight = gradedAssignments.reduce((acc, a) => acc + a.weight, 0);
      const currentGrade = totalWeight > 0 ? totalWeightedScore / totalWeight * 100 : 0;
      return {
        ...course,
        currentGrade: currentGrade,
        assignments: courseAssignments
      };
    });
  }, [courses, assignments]);
  const overallGPA = useMemo(() => {
    const getGradePoint = percentage => {
      if (percentage >= 93) return 4.0;
      if (percentage >= 90) return 3.7;
      if (percentage >= 87) return 3.3;
      if (percentage >= 83) return 3.0;
      if (percentage >= 80) return 2.7;
      if (percentage >= 77) return 2.3;
      if (percentage >= 73) return 2.0;
      if (percentage >= 70) return 1.7;
      if (percentage >= 67) return 1.3;
      if (percentage >= 63) return 1.0;
      if (percentage >= 60) return 0.7;
      return 0.0;
    };
    const gradedCourses = courseGrades.filter(c => c.currentGrade !== null);
    if (gradedCourses.length === 0) return 'N/A';
    const totalGradePoints = gradedCourses.reduce((acc, c) => {
      return acc + getGradePoint(c.currentGrade);
    }, 0);
    return (totalGradePoints / gradedCourses.length).toFixed(2);
  }, [courseGrades]);
  const handleGradeChange = (assignmentId, part, value) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;
    const numericValue = value === '' ? null : parseInt(value, 10);
    const newGrade = {
      ...assignment.grade,
      [part]: numericValue
    };
    onUpdateGrade(assignmentId, newGrade);
  };
  const handleOpenAiModal = course => {
    setSelectedCourseForAI(course);
    setStudyPlan(null);
    setAiError(null);
    setTargetGrade(90);
    setIsAiModalOpen(true);
  };
  const handleGeneratePlan = async () => {
    if (!selectedCourseForAI) return;
    setIsLoadingAiPlan(true);
    setStudyPlan(null);
    setAiError(null);
    try {
      const courseAssignments = assignments.filter(a => a.courseId === selectedCourseForAI.id);
      const plan = await generateStudyPlan(selectedCourseForAI, courseAssignments, targetGrade);
      setStudyPlan(plan);
    } catch (error) {
      console.error(error);
      let errorMessage = 'Failed to generate study plan. Please try again.';
      if (error instanceof Error && error.message.toLowerCase().includes('api key')) {
        errorMessage = 'AI service is not configured. Please ensure the API key is set correctly.';
      }
      setAiError(errorMessage);
    } finally {
      setIsLoadingAiPlan(false);
    }
  };
  const handleOpenAddAssignmentModal = courseId => {
    setSelectedCourseIdForNewAssignment(courseId);
    setIsAddAssignmentModalOpen(true);
  };
  const handleDeleteAssignmentWithConfirm = (assignmentId, assignmentName) => {
    if (window.confirm(`Are you sure you want to delete the assignment "${assignmentName}"?`)) {
      onDeleteAssignment(assignmentId);
    }
  };
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
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(AddAssignmentModal, {
    isOpen: isAddAssignmentModalOpen,
    onClose: () => setIsAddAssignmentModalOpen(false),
    onAddAssignment: onAddAssignment,
    courseId: selectedCourseIdForNewAssignment
  }), /*#__PURE__*/React.createElement("div", {
    className: "space-y-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex justify-between items-center"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-lg font-bold text-slate-800 dark:text-slate-100"
  }, "Overall GPA"), /*#__PURE__*/React.createElement("div", {
    className: "text-2xl font-bold text-sky-600 dark:text-sky-400"
  }, overallGPA)), /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, courseGrades.map(course => /*#__PURE__*/React.createElement("div", {
    key: course.id,
    className: "p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-start mb-3"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "text-lg font-bold text-slate-800 dark:text-slate-100"
  }, course.name), /*#__PURE__*/React.createElement("p", {
    className: `text-2xl font-bold ${course.currentGrade && course.currentGrade >= 80 ? 'text-green-600 dark:text-green-400' : course.currentGrade && course.currentGrade >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`
  }, course.currentGrade !== null ? `${course.currentGrade.toFixed(1)}%` : 'N/A')), /*#__PURE__*/React.createElement("button", {
    onClick: () => handleOpenAiModal(course),
    className: "text-xs font-semibold text-white bg-violet-600 px-3 py-1.5 rounded-full hover:bg-violet-700 transition-colors shadow-sm flex items-center gap-1"
  }, /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    className: "w-4 h-4"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
  })), "AI Study Plan")), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2"
  }, course.assignments.map(assignment => /*#__PURE__*/React.createElement("div", {
    key: assignment.id,
    className: "grid grid-cols-[1fr_auto_auto] items-center gap-2 text-sm"
  }, /*#__PURE__*/React.createElement("span", {
    className: "truncate dark:text-slate-300",
    title: assignment.name
  }, assignment.name), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1 w-28"
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    placeholder: "-",
    value: assignment.grade.score ?? '',
    onChange: e => handleGradeChange(assignment.id, 'score', e.target.value),
    className: "w-full text-center bg-slate-100 dark:bg-slate-700 dark:text-slate-200 rounded p-1"
  }), /*#__PURE__*/React.createElement("span", {
    className: "text-slate-400 dark:text-slate-500"
  }, "/"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    placeholder: "-",
    value: assignment.grade.total ?? '',
    onChange: e => handleGradeChange(assignment.id, 'total', e.target.value),
    className: "w-full text-center bg-slate-100 dark:bg-slate-700 dark:text-slate-200 rounded p-1"
  })), /*#__PURE__*/React.createElement("span", {
    className: "text-right text-slate-500 dark:text-slate-400 w-10"
  }, assignment.weight, "%")), /*#__PURE__*/React.createElement("button", {
    onClick: () => handleDeleteAssignmentWithConfirm(assignment.id, assignment.name),
    className: "text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-1"
  }, /*#__PURE__*/React.createElement(TrashIcon, {
    className: "w-4 h-4"
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "mt-4 border-t border-slate-200 dark:border-slate-700 pt-3"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => handleOpenAddAssignmentModal(course.id),
    className: "w-full text-center py-2 text-sm font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 rounded-md transition-colors"
  }, "+ Add Assignment"))))), /*#__PURE__*/React.createElement(Modal, {
    isOpen: isAiModalOpen,
    onClose: () => setIsAiModalOpen(false),
    title: `AI Plan for ${selectedCourseForAI?.name}`
  }, !studyPlan && /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    htmlFor: "targetGrade",
    className: "block text-sm font-medium text-slate-700 dark:text-slate-300"
  }, "Target Grade (%)"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    id: "targetGrade",
    value: targetGrade,
    onChange: e => setTargetGrade(parseInt(e.target.value)),
    className: "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
  })), /*#__PURE__*/React.createElement("button", {
    onClick: handleGeneratePlan,
    disabled: isLoadingAiPlan,
    className: "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
  }, isLoadingAiPlan ? 'Generating...' : 'Generate Plan'), aiError && /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-red-600 dark:text-red-400"
  }, aiError)), studyPlan && /*#__PURE__*/React.createElement("div", {
    className: "space-y-4 text-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-3 bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 rounded-lg"
  }, /*#__PURE__*/React.createElement("p", {
    className: "font-semibold text-sky-800 dark:text-sky-200"
  }, studyPlan.motivationalMessage)), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-around text-center"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-500 dark:text-slate-400"
  }, "TARGET"), /*#__PURE__*/React.createElement("p", {
    className: "text-xl font-bold text-slate-800 dark:text-slate-100"
  }, studyPlan.targetGrade, "%")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-500 dark:text-slate-400"
  }, "AVG. NEEDED"), /*#__PURE__*/React.createElement("p", {
    className: "text-xl font-bold text-green-600 dark:text-green-400"
  }, studyPlan.requiredAverage.toFixed(1), "%"))), /*#__PURE__*/React.createElement("ul", {
    className: "space-y-2"
  }, studyPlan.plan.map((item, index) => /*#__PURE__*/React.createElement("li", {
    key: index,
    className: "p-2 bg-slate-100 dark:bg-slate-700/50 rounded-md"
  }, /*#__PURE__*/React.createElement("p", {
    className: "font-semibold text-slate-900 dark:text-slate-100"
  }, item.topic), /*#__PURE__*/React.createElement("p", {
    className: "text-slate-600 dark:text-slate-300"
  }, item.action)))), /*#__PURE__*/React.createElement("button", {
    onClick: () => setStudyPlan(null),
    className: "w-full text-center mt-4 text-sm font-medium text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300"
  }, "\u2190 Back to settings")))));
};
export default GradesScreen;