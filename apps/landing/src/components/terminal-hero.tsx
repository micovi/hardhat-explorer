import { useState, useEffect } from "react";
import { Copy, Check, ArrowRight, Github, Blocks } from "lucide-react";
import { Button } from "./ui/button";

const terminalSteps = [
  { text: "$ npx evmscan init", delay: 1000 },
  { text: "✓ Creating .evmscan directory...", delay: 1500 },
  { text: "✓ Setting up configuration...", delay: 800 },
  { text: "$ npx evmscan start", delay: 1200 },
  { text: "🚀 Starting explorer at http://localhost:3000", delay: 1000 },
  { text: "⚡ Connected to local node at http://localhost:8545", delay: 1000 },
  { text: "✅ evmscan is ready! Happy developing!", delay: 1000 },
];

export function TerminalHero() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [currentText, setCurrentText] = useState("");
  const [copied, setCopied] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(
      "npx evmscan init && npx evmscan start"
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetAnimation = () => {
    setCurrentStep(-1);
    setCurrentText("");
    setIsTyping(false);
  };

  useEffect(() => {
    if (currentStep >= terminalSteps.length) {
      // Reset after completion
      const timeout = setTimeout(resetAnimation, 3000);
      return () => clearTimeout(timeout);
    }

    if (currentStep === -1) {
      // Start animation
      const timeout = setTimeout(() => setCurrentStep(0), 500);
      return () => clearTimeout(timeout);
    }

    const step = terminalSteps[currentStep];
    setIsTyping(true);

    // Type out the text
    let charIndex = 0;
    const typeInterval = setInterval(() => {
      if (charIndex <= step.text.length) {
        setCurrentText(step.text.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        // Move to next step after delay
        setTimeout(() => {
          setCurrentStep((prev) => prev + 1);
        }, step.delay);
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, [currentStep]);

  // Generate floating shapes
  const shapes = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    type: ["cube", "circle", "diamond"][Math.floor(Math.random() * 3)],
    left: Math.random() * 100,
    animationDelay: Math.random() * 20,
    duration: 15 + Math.random() * 10,
  }));

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Grid background */}
      <div className="grid-background"></div>

      {/* Floating shapes */}
      <div className="floating-shapes">
        {shapes.map((shape) => (
          <div
            key={shape.id}
            className={`shape shape-${shape.type} text-gray-600`}
            style={{
              left: `${shape.left}%`,
              animationDelay: `${shape.animationDelay}s`,
              animationDuration: `${shape.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
        {/* Left side - Content */}
        <div className="space-y-8">
          {/* Brand */}
          <div className="fade-in-up">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <Blocks className="h-4 w-4 text-white" />
              </div>
              <span className="text-2xl font-bold">evmscan.org</span>
            </div>
          </div>

          {/* Main headline */}
          <div className="fade-in-up delay-100">
            <h1 className="text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Etherscan for your{" "}
              <span className="text-gray-500 relative">
                local node
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-gray-900 to-gray-400"></div>
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <div className="fade-in-up delay-200">
            <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
              Zero-config blockchain explorer that works with any EVM network.
              Perfect for local development with Hardhat, Anvil, or Ganache.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="fade-in-up delay-300 flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="px-8 py-4 text-lg group hover-lift relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg group hover-lift hover:bg-gray-900 hover:text-white transition-all duration-300"
            >
              <Github className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              View on GitHub
            </Button>
          </div>
        </div>

        {/* Right side - Interactive Terminal */}
        <div className="fade-in-up delay-200">
          <div className="terminal relative hover-lift group/terminal">
            {/* Terminal header */}
            <div className="terminal-header">
              <div className="terminal-dot bg-red-500 hover:bg-red-400 transition-colors cursor-pointer"></div>
              <div className="terminal-dot bg-yellow-500 hover:bg-yellow-400 transition-colors cursor-pointer"></div>
              <div className="terminal-dot bg-green-500 hover:bg-green-400 transition-colors cursor-pointer breathe"></div>
              <span className="text-gray-400 text-sm ml-4 group-hover/terminal:text-gray-300 transition-colors">
                evmscan-setup
              </span>
              <div className="ml-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className={`h-6 px-2 text-gray-400 hover:text-white transition-all duration-200 ${
                    copied ? "text-green-400 scale-110" : ""
                  }`}
                >
                  {copied ? (
                    <Check className="h-3 w-3 animate-pulse" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>

            {/* Terminal body */}
            <div className="terminal-body">
              {/* Previous steps */}
              {terminalSteps.slice(0, currentStep).map((step, index) => (
                <div key={index} className="mb-2">
                  <span className="terminal-prompt">~/dev $</span> {step.text}
                </div>
              ))}

              {/* Current typing step */}
              {currentStep >= 0 && currentStep < terminalSteps.length && (
                <div className="mb-2">
                  <span className="terminal-prompt">~/dev $</span> {currentText}
                  {isTyping && <span className="terminal-cursor">▋</span>}
                </div>
              )}

              {/* Restart prompt */}
              {currentStep >= terminalSteps.length && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <button
                    onClick={resetAnimation}
                    className="text-blue-400 hover:text-blue-300 underline text-sm transition-all duration-200 hover:scale-105 bounce-subtle"
                  >
                    ↻ Run demo again
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Install instruction */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-default">
              Check out demo directly at{" "}
              <a
                href="https://local.evmscan.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                local.evmscan.org
              </a>
            </p>
            <div className="mt-2 flex justify-center">
              <div className="w-12 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent breathe"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
