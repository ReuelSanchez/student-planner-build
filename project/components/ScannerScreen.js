import React, { useState, useRef, useCallback, useEffect } from 'react';
import { generateSummaryFromImage } from '../services/geminiService.js';
import Spinner from './common/Spinner.js';
const ScannerScreen = () => {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOn(false);
  }, []);
  useEffect(() => {
    if (isCameraOn) {
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
            setError('Camera not supported by this browser.');
            setIsCameraOn(false);
          }
        } catch (err) {
          console.error(err);
          setError('Could not access the camera. Please ensure permissions are granted.');
          setIsCameraOn(false); // Revert state on error
        }
      };
      openCamera();
    }

    // Cleanup when isCameraOn becomes false or component unmounts
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOn]);
  const handleStartCamera = () => {
    setCapturedImage(null);
    setSummary(null);
    setError(null);
    setIsCameraOn(true);
  };
  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };
  const handleSummarize = async () => {
    if (!capturedImage) return;
    setIsLoading(true);
    setSummary(null);
    setError(null);
    try {
      const base64Data = capturedImage.split(',')[1];
      const result = await generateSummaryFromImage(base64Data);
      setSummary(result);
    } catch (err) {
      console.error(err);
      let errorMessage = 'Failed to generate summary. Please try again.';
      if (err instanceof Error && err.message.toLowerCase().includes('api key')) {
        errorMessage = 'AI service is not configured. Please ensure the API key is set correctly.';
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-lg font-bold text-slate-800 dark:text-slate-100 mb-2"
  }, "Document Scanner & Summarizer"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-slate-600 dark:text-slate-400"
  }, "Capture an image of a document to get an AI-powered summary.")), !isCameraOn && !capturedImage && /*#__PURE__*/React.createElement("div", {
    className: "text-center"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: handleStartCamera,
    className: "w-full py-3 px-4 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
  }, "Start Camera")), isCameraOn && /*#__PURE__*/React.createElement("div", {
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
    alt: "Captured document",
    className: "w-full rounded-lg shadow-sm"
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: handleStartCamera,
    className: "flex-1 py-2 px-4 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
  }, "Retake"), /*#__PURE__*/React.createElement("button", {
    onClick: handleSummarize,
    disabled: isLoading,
    className: "flex-1 py-2 px-4 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 disabled:bg-slate-400 dark:disabled:bg-slate-600"
  }, isLoading ? 'Summarizing...' : 'Summarize'))), isLoading && /*#__PURE__*/React.createElement(Spinner, null), error && /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-center text-red-600 dark:text-red-400 p-4 bg-red-50 dark:bg-red-500/10 rounded-lg"
  }, error), summary && /*#__PURE__*/React.createElement("div", {
    className: "p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-md font-bold text-slate-800 dark:text-slate-100"
  }, "Summary"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap"
  }, summary)));
};
export default ScannerScreen;