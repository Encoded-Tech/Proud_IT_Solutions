import {
  MapPin,
  CreditCard,
  Upload,
  Info,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function CheckoutInstructions() {
  const steps = [
    {
      number: 1,
      icon: <MapPin className="w-5 h-5" />,
      title: "Delivery Information",
      description:
        "Provide your full name, contact number, and complete delivery address to ensure accurate and timely shipment.",
      bg: "bg-primary/10",
      text: "text-primary",
    },
    {
      number: 2,
      icon: <CreditCard className="w-5 h-5" />,
      title: "Select Payment Method",
      description:
       "Choose your payment method pay cash on delivery (COD) or complete an online payment and upload the receipt before placing your order",
      bg: "bg-primary/10",
      text: "text-primary",
    },
    {
      number: 3,
      icon: <Upload className="w-5 h-5" />,
      title: "Upload Payment Receipt",
      description:
        "Upload a clear image or screenshot of your payment receipt. Orders without a valid receipt may be delayed or rejected.",
      bg: "bg-primary/10",
      text: "text-primary",
    },
  ];

  const importantNotes = [
    "Please review all order details carefully before placing your order.",
    "Ensure uploaded images are clear and readable (JPG, PNG formats recommended).",
    "Duplicate orders may be automatically blocked to prevent errors.",
    "Once an order is placed, modifications may not be possible.",
  ];

  return (
    <div className="mb-10 rounded-xl border border-gray-200 shadow-md bg-white overflow-hidden">
      {/* Header */}
      <div className="px-6 py-7 md:px-8 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
              Ensure Your checkout is Completed Correctly
            </h2>
            <p className="mt-1 text-sm text-gray-600 max-w-3xl">
              Please follow the steps below carefully to ensure your order is
              processed smoothly and without delays.
            </p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="px-6 py-8 md:px-8 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative rounded-lg border border-gray-200 bg-white p-6 hover:shadow-md transition"
            >
              {/* Step Number */}
              <div className="absolute -top-4 -left-4 w-9 h-9 rounded-full bg-green-500 text-white text-gray-900 text-sm font-semibold flex items-center justify-center">
                {step.number}
              </div>

              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-lg ${step.bg} ${step.text} flex items-center justify-center mb-4`}
              >
                {step.icon}
              </div>

              <p className="font-semibold text-gray-900 mb-1">
                {step.title}
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Important Notes */}
      <div className="px-6 pb-8 md:px-8">
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-6 py-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <p className="font-semibold text-gray-900">
              Important Information
            </p>
          </div>

          <ul className="space-y-2 text-sm text-gray-700">
            {importantNotes.map((note, index) => (
              <li key={index} className="flex items-start gap-3">
                <Info className="w-4 h-4 mt-0.5 text-yellow-500" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Subtle Footer Divider */}
      <div className="h-px bg-gray-200" />
    </div>
  );
}
