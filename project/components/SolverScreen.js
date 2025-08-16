import React, { useState, useRef, useCallback, useEffect } from 'react';
import { solveMathProblem, solveMathProblemFromImage } from '../services/geminiService.js';
import Spinner from './common/Spinner.js';
const SolverScreen = () => {
  const [mode, setMode] = useState('text');
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const handleSolveText = async () => {
    if (!problem) return;
    setIsLoading(true);
    setSolution(null);
    setError(null);
    try {
      const result = await solveMathProblem(problem);
      setSolution(result);
    } catch (err) {
      console.error(err);
      let errorMessage = 'Failed to solve problem. Please try again.';
      if (err instanceof Error && err.message.toLowerCase().includes('api key')) {
        errorMessage = 'AI service is not configured. Please ensure the API key is set correctly.';
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSolveImage = async () => {
    if (!capturedImage) return;
    setIsLoading(true);
    setSolution(null);
    setError(null);
    try {
      const base64Data = capturedImage.split(',')[1];
      const result = await solveMathProblemFromImage(base64Data);
      setSolution(result);
    } catch (err) {
      console.error(err);
      let errorMessage = 'Failed to solve problem from image. Please try again.';
      if (err instanceof Error && err.message.toLowerCase().includes('api key')) {
        errorMessage = 'AI service is not configured. Please ensure the API key is set correctly.';
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOn(false);
  }, []);
  useEffect(() => {
    if (isCameraOn && mode === 'image') {
      const openCamera = async () => {
        try {
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: {
                facingMode: 'environment'
              }
            });
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              streamRef.current = stream;
            }
          } else {
            setError('Camera not supported.');
            setIsCameraOn(false);
          }
        } catch (err) {
          setError('Could not access camera.');
          setIsCameraOn(false);
        }
      };
      openCamera();
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOn, mode]);
  const handleStartCamera = () => {
    setCapturedImage(null);
    setSolution(null);
    setError(null);
    setIsCameraOn(true);
  };
  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };
  const reset = useCallback(() => {
    setProblem('');
    setCapturedImage(null);
    setSolution(null);
    setError(null);
    setIsLoading(false);
    stopCamera();
  }, [stopCamera]);
  const switchMode = newMode => {
    setMode(newMode);
    reset();
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-lg font-bold text-slate-800 dark:text-slate-100 mb-2"
  }, "AI Math Solver"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-slate-600 dark:text-slate-400"
  }, "Get step-by-step solutions for your math problems.")), /*#__PURE__*/React.createElement("div", {
    className: "flex bg-slate-200 dark:bg-slate-700 p-1 rounded-lg"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => switchMode('text'),
    className: `flex-1 py-2 text-sm font-semibold rounded-md transition-all ${mode === 'text' ? 'bg-white dark:bg-slate-800 shadow dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`
  }, "Text Input"), /*#__PURE__*/React.createElement("button", {
    onClick: () => switchMode('image'),
    className: `flex-1 py-2 text-sm font-semibold rounded-md transition-all ${mode === 'image' ? 'bg-white dark:bg-slate-800 shadow dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`
  }, "Image Input")), mode === 'text' && /*#__PURE__*/React.createElement("div", {
    className: "space-y-2"
  }, /*#__PURE__*/React.createElement("textarea", {
    value: problem,
    onChange: e => setProblem(e.target.value),
    placeholder: "e.g., solve for x in 2x + 5 = 15",
    rows: 4,
    className: "w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-sky-500 focus:border-sky-500 bg-white dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400"
  }), /*#__PURE__*/React.createElement("button", {
    onClick: handleSolveText,
    disabled: isLoading || !problem,
    className: "w-full py-2 px-4 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 disabled:bg-slate-400 dark:disabled:bg-slate-600"
  }, isLoading ? 'Solving...' : 'Solve')), mode === 'image' && /*#__PURE__*/React.createElement(React.Fragment, null, !isCameraOn && !capturedImage && /*#__PURE__*/React.createElement("button", {
    onClick: handleStartCamera,
    className: "w-full py-3 px-4 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700"
  }, "Start Camera"), isCameraOn && /*#__PURE__*/React.createElement("div", {
    className: "relative"
  }, /*#__PURE__*/React.createElement("video", {
    ref: videoRef,
    autoPlay: true,
    playsInline: true,
    className: "w-full rounded-lg"
  }), /*#__PURE__*/React.createElement("div", {
    className: "absolute bottom-4 left-0 right-0 flex justify-center gap-4"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: captureImage,
    className: "py-2 px-6 bg-white text-sky-600 font-semibold rounded-full shadow-lg"
  }, "Capture"), /*#__PURE__*/React.createElement("button", {
    onClick: stopCamera,
    className: "py-2 px-6 bg-red-500 text-white font-semibold rounded-full shadow-lg"
  }, "Cancel"))), capturedImage && /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("img", {
    src: capturedImage,
    alt: "Captured problem",
    className: "w-full rounded-lg shadow-sm"
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: handleStartCamera,
    className: "flex-1 py-2 px-4 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
  }, "Retake"), /*#__PURE__*/React.createElement("button", {
    onClick: handleSolveImage,
    disabled: isLoading,
    className: "flex-1 py-2 px-4 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 disabled:bg-slate-400 dark:disabled:bg-slate-600"
  }, isLoading ? 'Solving...' : 'Solve from Image')))), isLoading && /*#__PURE__*/React.createElement(Spinner, null), error && /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-center text-red-600 dark:text-red-400 p-4 bg-red-50 dark:bg-red-500/10 rounded-lg"
  }, error), solution && /*#__PURE__*/React.createElement("div", {
    className: "p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-md font-bold text-slate-800 dark:text-slate-100"
  }, "Solution"), /*#__PURE__*/React.createElement("div", {
    className: "text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono bg-slate-50 dark:bg-slate-700/50 p-3 rounded-md"
  }, solution)));
};
export default SolverScreen;