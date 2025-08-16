import React, { useState } from 'react';
const AuthScreen = ({
  onLoginSuccess
}) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const handleSubmit = e => {
    e.preventDefault();
    setError('');
    if (isLoginView) {
      // Mock login
      if (email === 'student@example.com' && password === 'password123') {
        onLoginSuccess();
      } else {
        setError('Invalid email or password.');
      }
    } else {
      // Mock signup
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
      }
      // Simulate sending a verification email
      setIsVerificationSent(true);
    }
  };
  const EyeIcon = () => /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: 1.5,
    stroke: "currentColor",
    className: "w-5 h-5"
  }, /*#__PURE__*/React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    d: "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
  }), /*#__PURE__*/React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z"
  }));
  const EyeSlashIcon = () => /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: 1.5,
    stroke: "currentColor",
    className: "w-5 h-5"
  }, /*#__PURE__*/React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    d: "M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L6.228 6.228"
  }));
  if (isVerificationSent) {
    return /*#__PURE__*/React.createElement("div", {
      className: "bg-slate-50 dark:bg-slate-900 min-h-screen flex items-center justify-center p-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-full max-w-md mx-auto bg-white dark:bg-slate-800 p-8 rounded-lg shadow-2xl text-center"
    }, /*#__PURE__*/React.createElement("h2", {
      className: "text-2xl font-bold text-slate-900 dark:text-white mb-2"
    }, "Check Your Email"), /*#__PURE__*/React.createElement("p", {
      className: "text-slate-600 dark:text-slate-300 mb-6"
    }, "We've sent a verification link to ", /*#__PURE__*/React.createElement("span", {
      className: "font-semibold text-slate-800 dark:text-slate-100"
    }, email), ". Please click the link to complete your registration."), /*#__PURE__*/React.createElement("button", {
      onClick: onLoginSuccess // For demo purposes, this button will log the user in.
      ,
      className: "w-full py-2 px-4 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
    }, "Proceed to App (Demo)")));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "bg-slate-50 dark:bg-slate-900 min-h-screen flex items-center justify-center p-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-full max-w-md mx-auto bg-white dark:bg-slate-800 p-8 rounded-lg shadow-2xl"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-3xl font-bold text-slate-900 dark:text-white mb-2 text-center"
  }, isLoginView ? 'Welcome Back!' : 'Create Account'), /*#__PURE__*/React.createElement("p", {
    className: "text-slate-500 dark:text-slate-400 mb-8 text-center"
  }, isLoginView ? 'Sign in to continue' : 'Get your academic life organized'), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSubmit,
    className: "space-y-6"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    htmlFor: "email",
    className: "block text-sm font-medium text-slate-700 dark:text-slate-300"
  }, "Email address"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    id: "email",
    required: true,
    value: email,
    onChange: e => setEmail(e.target.value),
    className: "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
  })), /*#__PURE__*/React.createElement("div", {
    className: "relative"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "password",
    className: "block text-sm font-medium text-slate-700 dark:text-slate-300"
  }, "Password"), /*#__PURE__*/React.createElement("input", {
    type: showPassword ? 'text' : 'password',
    id: "password",
    required: true,
    value: password,
    onChange: e => setPassword(e.target.value),
    className: "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setShowPassword(!showPassword),
    className: "absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-sm leading-5 text-slate-500 hover:text-slate-700"
  }, showPassword ? /*#__PURE__*/React.createElement(EyeSlashIcon, null) : /*#__PURE__*/React.createElement(EyeIcon, null))), !isLoginView && /*#__PURE__*/React.createElement("div", {
    className: "relative"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "confirm-password",
    className: "block text-sm font-medium text-slate-700 dark:text-slate-300"
  }, "Confirm Password"), /*#__PURE__*/React.createElement("input", {
    type: showPassword ? 'text' : 'password',
    id: "confirm-password",
    required: true,
    value: confirmPassword,
    onChange: e => setConfirmPassword(e.target.value),
    className: "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
  })), error && /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-red-600 dark:text-red-400"
  }, error), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "w-full py-2 px-4 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
  }, isLoginView ? 'Sign In' : 'Sign Up'))), /*#__PURE__*/React.createElement("p", {
    className: "mt-8 text-center text-sm text-slate-500 dark:text-slate-400"
  }, isLoginView ? "Don't have an account?" : "Already have an account?", /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setIsLoginView(!isLoginView);
      setError('');
    },
    className: "font-semibold text-sky-600 hover:text-sky-500 ml-1"
  }, isLoginView ? 'Sign up' : 'Sign in')), /*#__PURE__*/React.createElement("div", {
    className: "text-center text-xs text-slate-400 dark:text-slate-500 mt-4"
  }, "For demo: student@example.com / password123")));
};
export default AuthScreen;