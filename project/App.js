import React, { useState, useMemo, useEffect, useContext } from 'react';
import { Screen } from './types.js';
import { NAV_ITEMS, MOCK_COURSES, MOCK_ASSIGNMENTS } from './constants.js';
import DashboardScreen from './components/DashboardScreen.js';
import ScheduleScreen from './components/ScheduleScreen.js';
import GradesScreen from './components/GradesScreen.js';
import ScannerScreen from './components/ScannerScreen.js';
import SolverScreen from './components/SolverScreen.js';
import AuthScreen from './components/AuthScreen.js';
import SettingsScreen from './components/SettingsScreen.js';
import ShareReceiverScreen from './components/ShareReceiverScreen.js';
import { ThemeProvider, ThemeContext } from './contexts/ThemeContext.js';
import { scheduleNotifications, clearScheduledNotifications } from './services/notificationService.js';

// Icons for theme toggle
const SunIcon = () => /*#__PURE__*/React.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  fill: "none",
  viewBox: "0 0 24 24",
  strokeWidth: 1.5,
  stroke: "currentColor",
  className: "w-6 h-6"
}, /*#__PURE__*/React.createElement("path", {
  strokeLinecap: "round",
  strokeLinejoin: "round",
  d: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
}));
const MoonIcon = () => /*#__PURE__*/React.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  fill: "none",
  viewBox: "0 0 24 24",
  strokeWidth: 1.5,
  stroke: "currentColor",
  className: "w-6 h-6"
}, /*#__PURE__*/React.createElement("path", {
  strokeLinecap: "round",
  strokeLinejoin: "round",
  d: "M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
}));
// Main application component, shown after authentication
const MainApp = () => {
  const {
    theme,
    toggleTheme
  } = useContext(ThemeContext);
  const [screen, setScreen] = useState(Screen.Dashboard);
  const [sharedData, setSharedData] = useState(null);
  const [courses, setCourses] = useState(() => {
    try {
      const savedCourses = localStorage.getItem('planner_courses');
      return savedCourses ? JSON.parse(savedCourses) : MOCK_COURSES;
    } catch (error) {
      console.error("Error parsing courses from localStorage", error);
      return MOCK_COURSES;
    }
  });
  const [assignments, setAssignments] = useState(() => {
    try {
      const savedAssignments = localStorage.getItem('planner_assignments');
      return savedAssignments ? JSON.parse(savedAssignments) : MOCK_ASSIGNMENTS;
    } catch (error) {
      console.error("Error parsing assignments from localStorage", error);
      return MOCK_ASSIGNMENTS;
    }
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem('planner_notifications_enabled');
    return saved ? JSON.parse(saved) : false;
  });
  useEffect(() => {
    localStorage.setItem('planner_courses', JSON.stringify(courses));
  }, [courses]);
  useEffect(() => {
    localStorage.setItem('planner_assignments', JSON.stringify(assignments));
  }, [assignments]);
  useEffect(() => {
    localStorage.setItem('planner_notifications_enabled', JSON.stringify(notificationsEnabled));
  }, [notificationsEnabled]);
  useEffect(() => {
    if (notificationsEnabled && Notification.permission === 'granted') {
      scheduleNotifications(courses, assignments);
    } else {
      clearScheduledNotifications();
    }
    // Cleanup on unmount
    return () => clearScheduledNotifications();
  }, [notificationsEnabled, courses, assignments]);
  useEffect(() => {
    const handleServiceWorkerMessage = event => {
      if (event.data && event.data.type === 'share-data') {
        console.log("Received share data:", event.data.payload);
        setSharedData(event.data.payload);
        setScreen(Screen.ShareReceiver);
      }
    };
    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

    // Handle launching from a shortcut or a share
    const params = new URLSearchParams(window.location.search);
    const shared = params.has('shared');
    const shortcutScreen = params.get('screen');
    if (shortcutScreen) {
      const screenKey = shortcutScreen.toUpperCase();
      if (Object.values(Screen).includes(screenKey)) {
        setScreen(screenKey);
      }
    }
    if (shared || shortcutScreen) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, []);
  const handleAddCourse = course => {
    setCourses(prev => [...prev, {
      ...course,
      id: `C${Date.now()}`
    }]);
  };
  const handleDeleteCourse = courseId => {
    setCourses(prev => prev.filter(c => c.id !== courseId));
    // Also delete assignments associated with this course
    setAssignments(prev => prev.filter(a => a.courseId !== courseId));
  };
  const handleAddAssignment = assignment => {
    setAssignments(prev => [...prev, {
      ...assignment,
      id: `A${Date.now()}`
    }]);
  };
  const handleDeleteAssignment = assignmentId => {
    setAssignments(prev => prev.filter(a => a.id !== assignmentId));
  };
  const handleUpdateAssignmentGrade = (assignmentId, grade) => {
    setAssignments(prev => prev.map(a => a.id === assignmentId ? {
      ...a,
      grade
    } : a));
  };
  const handleAddResource = (courseId, resource) => {
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        const newResource = {
          ...resource,
          id: `R${Date.now()}`
        };
        const existingResources = c.resources || [];
        return {
          ...c,
          resources: [...existingResources, newResource]
        };
      }
      return c;
    }));
  };
  const handleDeleteResource = (courseId, resourceId) => {
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        const updatedResources = (c.resources || []).filter(r => r.id !== resourceId);
        return {
          ...c,
          resources: updatedResources
        };
      }
      return c;
    }));
  };
  const handleShareDone = () => {
    setSharedData(null);
    setScreen(Screen.Dashboard);
  };
  const ScreenComponent = useMemo(() => {
    if (screen === Screen.ShareReceiver && sharedData) {
      return /*#__PURE__*/React.createElement(ShareReceiverScreen, {
        sharedData: sharedData,
        courses: courses,
        onAddResource: handleAddResource,
        onDone: handleShareDone
      });
    }
    switch (screen) {
      case Screen.Dashboard:
        return /*#__PURE__*/React.createElement(DashboardScreen, {
          courses: courses,
          assignments: assignments
        });
      case Screen.Schedule:
        return /*#__PURE__*/React.createElement(ScheduleScreen, {
          courses: courses,
          assignments: assignments,
          onAddCourse: handleAddCourse,
          onDeleteCourse: handleDeleteCourse,
          onAddResource: handleAddResource,
          onDeleteResource: handleDeleteResource
        });
      case Screen.Grades:
        return /*#__PURE__*/React.createElement(GradesScreen, {
          courses: courses,
          assignments: assignments,
          onUpdateGrade: handleUpdateAssignmentGrade,
          onAddAssignment: handleAddAssignment,
          onDeleteAssignment: handleDeleteAssignment
        });
      case Screen.Scanner:
        return /*#__PURE__*/React.createElement(ScannerScreen, null);
      case Screen.Solver:
        return /*#__PURE__*/React.createElement(SolverScreen, null);
      case Screen.Settings:
        return /*#__PURE__*/React.createElement(SettingsScreen, {
          notificationsEnabled: notificationsEnabled,
          onSetNotificationsEnabled: setNotificationsEnabled
        });
      default:
        return /*#__PURE__*/React.createElement(DashboardScreen, {
          courses: courses,
          assignments: assignments
        });
    }
  }, [screen, courses, assignments, notificationsEnabled, sharedData]);
  if (screen === Screen.ShareReceiver && !sharedData) {
    return /*#__PURE__*/React.createElement("div", {
      className: "bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-200 flex items-center justify-center"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-center"
    }, /*#__PURE__*/React.createElement("p", {
      className: "text-slate-500 dark:text-slate-400"
    }, "Receiving shared content...")));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-200 flex flex-col items-center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-full max-w-md mx-auto bg-white dark:bg-slate-800 flex flex-col h-screen shadow-2xl"
  }, /*#__PURE__*/React.createElement("header", {
    className: "p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    className: "text-2xl font-bold text-slate-900 dark:text-white capitalize"
  }, screen.toLowerCase()), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-slate-500 dark:text-slate-400"
  }, "Your academic life, organized.")), /*#__PURE__*/React.createElement("button", {
    onClick: toggleTheme,
    className: "p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
  }, theme === 'light' ? /*#__PURE__*/React.createElement(MoonIcon, null) : /*#__PURE__*/React.createElement(SunIcon, null))), /*#__PURE__*/React.createElement("main", {
    className: "flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900"
  }, ScreenComponent), /*#__PURE__*/React.createElement("footer", {
    className: "w-full border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
  }, /*#__PURE__*/React.createElement("nav", {
    className: "flex justify-around p-2"
  }, NAV_ITEMS.map(item => /*#__PURE__*/React.createElement("button", {
    key: item.screen,
    onClick: () => setScreen(item.screen),
    className: `flex flex-col items-center justify-center w-full p-2 rounded-lg transition-colors duration-200 ${screen === item.screen ? 'bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`
  }, /*#__PURE__*/React.createElement(item.icon, {
    className: "h-6 w-6 mb-1"
  }), /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-medium"
  }, item.label)))))));
};

// Top-level App component handling authentication
const AppContent = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  if (!isAuthenticated) {
    return /*#__PURE__*/React.createElement(AuthScreen, {
      onLoginSuccess: () => setIsAuthenticated(true)
    });
  }
  return /*#__PURE__*/React.createElement(MainApp, null);
};
const App = () => {
  return /*#__PURE__*/React.createElement(ThemeProvider, null, /*#__PURE__*/React.createElement(AppContent, null));
};
export default App;