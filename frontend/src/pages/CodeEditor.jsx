import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import {
  FiPlay,
  FiCopy,
  FiSun,
  FiMoon,
  FiMaximize,
  FiMinimize,
  FiCode,
  FiTerminal,
  FiLoader,
  FiCheck,
  FiSettings
} from 'react-icons/fi';

// Monaco Editor (simulated with textarea for this demo - in real app use @monaco-editor/react)
const MonacoEditor = ({ value, onChange, language, theme, height }) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleKeyDown = (e) => {
      // Tab support
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = value.substring(0, start) + '  ' + value.substring(end);
        onChange(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }, 0);
      }
    };

    textarea.addEventListener('keydown', handleKeyDown);
    return () => textarea.removeEventListener('keydown', handleKeyDown);
  }, [value, onChange]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full resize-none outline-none font-mono text-sm leading-6 p-4 rounded-lg transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-gray-900/50 text-gray-100 placeholder-gray-500'
          : 'bg-white/50 text-gray-900 placeholder-gray-400'
      }`}
      style={{ height }}
      placeholder="Start coding..."
      spellCheck={false}
    />
  );
};

// Language templates
const templates = {
  javascript: `// Welcome to JavaScript!
console.log("Hello, World!");

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci(10):", fibonacci(10));`,

  python: `# Welcome to Python!
print("Hello, World!")

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(f"Fibonacci(10): {fibonacci(10)}")`,

  cpp: `// Welcome to C++!
#include <iostream>
using namespace std;

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    cout << "Hello, World!" << endl;
    cout << "Fibonacci(10): " << fibonacci(10) << endl;
    return 0;
}`,

  java: `// Welcome to Java!
public class Main {
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }

    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.println("Fibonacci(10): " + fibonacci(10));
    }
}`
};

// Simulated code execution
const executeCode = async (code, language) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (language === 'javascript') {
        // Simple JavaScript execution simulation
        if (code.includes('console.log')) {
          const output = code.match(/console\.log\((.*?)\)/g)?.map(match => {
            const content = match.match(/console\.log\((.*?)\)/)[1];
            return content.replace(/['"]/g, '');
          }).join('\n') || 'No output';
          resolve({ output, error: null });
        } else {
          resolve({ output: 'Code executed successfully', error: null });
        }
      } else {
        resolve({
          output: `${language} code executed successfully!\nHello, World!\nFibonacci(10): 55`,
          error: null
        });
      }
    }, 1000 + Math.random() * 1000);
  });
};

const CodeEditor = () => {
  // State management
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('dark');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editorHeight, setEditorHeight] = useState(400);
  const [isDragging, setIsDragging] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const dragRef = useRef(null);
  const startY = useRef(0);
  const startHeight = useRef(0);

  // Language options
  const languages = [
    { value: 'javascript', label: 'JavaScript', icon: '🟨' },
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'cpp', label: 'C++', icon: '⚡' },
    { value: 'java', label: 'Java', icon: '☕' }
  ];

  // Load saved code and preferences
  useEffect(() => {
    const savedCode = localStorage.getItem(`code-${language}`);
    const savedTheme = localStorage.getItem('editor-theme');

    if (savedCode) {
      setCode(savedCode);
    } else {
      setCode(templates[language] || '');
    }

    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, [language]);

  // Auto-save code
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (code.trim()) {
        localStorage.setItem(`code-${language}`, code);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [code, language]);

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('editor-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runCode();
      }
      if (e.key === 'F11') {
        e.preventDefault();
        setIsFullscreen(!isFullscreen);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Resize functionality
  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    startY.current = e.clientY;
    startHeight.current = editorHeight;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [editorHeight]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const deltaY = e.clientY - startY.current;
    const newHeight = Math.max(200, Math.min(800, startHeight.current + deltaY));
    setEditorHeight(newHeight);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Run code function
  const runCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first!');
      return;
    }

    setIsRunning(true);
    setOutput('');
    setError('');

    toast.promise(
      executeCode(code, language),
      {
        loading: `Running ${language} code...`,
        success: 'Code executed successfully!',
        error: 'Failed to execute code'
      }
    ).then((result) => {
      if (result.error) {
        setError(result.error);
      } else {
        setOutput(result.output);
      }
      setIsRunning(false);
    }).catch(() => {
      setIsRunning(false);
    });
  };

  // Copy code function
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Code copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy code');
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const panelVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900'
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    } ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          className: `${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} backdrop-blur-lg`,
          style: {
            backdropFilter: 'blur(20px)',
            border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          }
        }}
      />

      <motion.div
        className="container mx-auto p-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.header
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FiCode className={`text-2xl ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              <h1 className={`text-3xl font-bold bg-gradient-to-r ${
                theme === 'dark'
                  ? 'from-blue-400 to-purple-400'
                  : 'from-blue-600 to-purple-600'
              } bg-clip-text text-transparent`}>
                CodeEditor Pro
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Language Selector */}
            <motion.select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={`px-4 py-2 rounded-xl backdrop-blur-lg border transition-all duration-300 focus:outline-none focus:ring-2 ${
                theme === 'dark'
                  ? 'bg-gray-800/50 border-gray-600 text-white focus:ring-blue-400'
                  : 'bg-white/50 border-gray-300 text-gray-900 focus:ring-blue-500'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.icon} {lang.label}
                </option>
              ))}
            </motion.select>

            {/* Theme Toggle */}
            <motion.button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-3 rounded-xl backdrop-blur-lg border transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-gray-800/50 border-gray-600 text-yellow-400 hover:bg-gray-700/50'
                  : 'bg-white/50 border-gray-300 text-gray-600 hover:bg-gray-50/50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
            </motion.button>

            {/* Fullscreen Toggle */}
            <motion.button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={`p-3 rounded-xl backdrop-blur-lg border transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50'
                  : 'bg-white/50 border-gray-300 text-gray-600 hover:bg-gray-50/50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isFullscreen ? <FiMinimize size={20} /> : <FiMaximize size={20} />}
            </motion.button>
          </div>
        </motion.header>

        {/* Main Editor Panel */}
        <motion.div
          className={`rounded-2xl backdrop-blur-2xl border shadow-2xl overflow-hidden ${
            theme === 'dark'
              ? 'bg-gray-800/20 border-gray-600/30'
              : 'bg-white/20 border-gray-300/30'
          }`}
          variants={panelVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Editor Header */}
          <div className={`flex items-center justify-between p-4 border-b ${
            theme === 'dark' ? 'border-gray-600/30' : 'border-gray-300/30'
          }`}>
            <div className="flex items-center space-x-3">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className={`text-sm font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {languages.find(l => l.value === language)?.label}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {/* Copy Button */}
              <motion.button
                onClick={copyCode}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  theme === 'dark'
                    ? 'hover:bg-gray-700/50 text-gray-300'
                    : 'hover:bg-gray-200/50 text-gray-600'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Copy code (Ctrl+C)"
              >
                <FiCopy size={16} />
              </motion.button>

              {/* Run Button */}
              <motion.button
                onClick={runCode}
                disabled={isRunning}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                  isRunning
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg hover:shadow-xl'
                } text-white`}
                whileHover={!isRunning ? { scale: 1.02 } : {}}
                whileTap={!isRunning ? { scale: 0.98 } : {}}
              >
                {isRunning ? (
                  <>
                    <FiLoader className="animate-spin" size={16} />
                    <span>Running...</span>
                  </>
                ) : (
                  <>
                    <FiPlay size={16} />
                    <span>Run Code</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Code Editor */}
          <div className="relative">
            <MonacoEditor
              value={code}
              onChange={setCode}
              language={language}
              theme={theme}
              height={`${editorHeight}px`}
            />

            {/* Resize Handle */}
            <div
              ref={dragRef}
              onMouseDown={handleMouseDown}
              className={`absolute bottom-0 left-0 right-0 h-2 cursor-row-resize transition-all duration-300 ${
                isDragging ? 'bg-blue-500/50' : 'hover:bg-gray-400/20'
              }`}
            >
              <div className="flex justify-center pt-0.5">
                <div className={`w-8 h-1 rounded-full ${
                  theme === 'dark' ? 'bg-gray-600' : 'bg-gray-400'
                }`}></div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Output Panel */}
        <AnimatePresence>
          {(output || error) && (
            <motion.div
              className={`mt-6 rounded-2xl backdrop-blur-2xl border shadow-2xl overflow-hidden ${
                theme === 'dark'
                  ? 'bg-gray-800/20 border-gray-600/30'
                  : 'bg-white/20 border-gray-300/30'
              }`}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className={`flex items-center justify-between p-4 border-b ${
                theme === 'dark' ? 'border-gray-600/30' : 'border-gray-300/30'
              }`}>
                <div className="flex items-center space-x-2">
                  <FiTerminal className={theme === 'dark' ? 'text-green-400' : 'text-green-600'} />
                  <span className={`font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Output
                  </span>
                </div>
                {output && (
                  <FiCheck className={theme === 'dark' ? 'text-green-400' : 'text-green-600'} />
                )}
              </div>

              <div className="p-4">
                {error ? (
                  <pre className={`font-mono text-sm whitespace-pre-wrap ${
                    theme === 'dark' ? 'text-red-400' : 'text-red-600'
                  }`}>
                    {error}
                  </pre>
                ) : (
                  <pre className={`font-mono text-sm whitespace-pre-wrap ${
                    theme === 'dark' ? 'text-green-400' : 'text-green-600'
                  }`}>
                    {output}
                  </pre>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Keyboard Shortcuts Help */}
        <motion.div
          className={`mt-6 text-center text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p>Press <kbd className={`px-2 py-1 rounded ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          }`}>Ctrl+Enter</kbd> to run code • <kbd className={`px-2 py-1 rounded ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          }`}>F11</kbd> for fullscreen</p>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default CodeEditor;