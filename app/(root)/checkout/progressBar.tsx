import ContinueShoppingLink from "@/components/shared/ContinueShopping";
import { Check } from "lucide-react";

export interface ProgressStep {
  number: number;
  title: string;
  subtitle: string;
}

export function ProgressBar({
  currentStep,
  steps,
}: {
  currentStep: number;
  steps: ProgressStep[];
}) {
  return (
    <>
    <ContinueShoppingLink />
    <div className="w-full my-10 bg-white">
      <div className="flex overflow-hidden rounded-lg border border-gray-200 shadow-md">
        {steps.map((step, index) => {
          const stepNum = index + 1;
          const isCompleted = currentStep > stepNum;
          const isActive = currentStep === stepNum;
          const isLast = index === steps.length - 1;

          return (
            <div
              key={step.number}
              className={`relative flex-1 border-r border-gray-200 ${
                isActive ? "bg-primary" : "bg-white"
              }`}
            >
              {/* Step Content */}
              <div className="flex items-start gap-4 px-6 py-5 relative z-10">
                {/* Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                    isCompleted
                      ? "bg-primary text-white"
                      : isActive
                      ? "bg-white text-primary"
                      : "bg-gray-100 text-gray-400 border border-gray-300"
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : step.number}
                </div>

                {/* Text */}
                <div>
                  <div
                    className={`font-semibold text-sm ${
                      isActive ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {step.title}
                  </div>
                  <div
                    className={`text-xs mt-0.5 ${
                      isActive ? "text-white/80" : "text-gray-500"
                    }`}
                  >
                    {step.subtitle}
                  </div>
                </div>
              </div>

              {/* Arrow Connector */}
              {!isLast && (
                <>
                  {/* Arrow fill */}
                  <div
                    className={`absolute top-0 right-[-24px] z-20 h-full w-0 
                    border-t-[40px] border-b-[40px] border-l-[24px] 
                    ${
                      isActive
                        ? "border-l-primary"
                        : "border-l-white"
                    } 
                    border-t-transparent border-b-transparent`}
                  />

                  {/* Arrow border */}
                  <div
                    className="absolute top-0 right-[-25px] z-10 h-full w-0 
                    border-t-[40px] border-b-[40px] border-l-[24px] 
                    border-l-gray-350 
                    border-t-transparent border-b-transparent"
                  />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div></>
  );
}
