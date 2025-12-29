const steps = [
  { id: 1, label: "Customer Info" },
  { id: 2, label: "Delivery & Payment" },
  { id: 3, label: "Review & Place Order" },
];


export default function CheckoutStepper({
  currentStep,
}: {
  currentStep: number;
}) {
  return (
    <div className="flex items-center justify-between mb-10">
      {steps.map((step, idx) => {
        const completed = currentStep > step.id;
        const active = currentStep === step.id;

        return (
          <div key={step.id} className="flex items-center w-full">
            {/* Circle */}
            <div
              className={`flex items-center justify-center w-9 h-9 rounded-full border-2
                ${
                  completed
                    ? "bg-primary border-primary text-white"
                    : active
                    ? "border-primary text-primary"
                    : "border-gray-300 text-gray-400"
                }`}
            >
              {completed ? "✓" : step.id}
            </div>

            {/* Label */}
            <span
              className={`ml-3 text-sm font-medium
                ${
                  completed || active
                    ? "text-gray-900"
                    : "text-gray-400"
                }`}
            >
              {step.label}
            </span>

            {/* Line */}
            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-[2px] mx-6
                  ${
                    completed
                      ? "bg-primary"
                      : "bg-gray-200"
                  }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
