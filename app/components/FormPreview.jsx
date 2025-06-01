import { useEffect, useState } from "react";
import FormFieldPreview from "./FormFieldPreview";
import { ArrowRight, Smartphone, Tablet, Monitor } from "lucide-react";

const RECENT_SUBMISSIONS_KEY = "recentFormSubmissions";

const FormPreview = ({ form, previewMode, darkMode }) => {
  const [isBrowser, setIsBrowser] = useState(false);
  const [recentForms, setRecentForms] = useState([]);

  useEffect(() => {
    setIsBrowser(true);
    const storedForms = JSON.parse(localStorage.getItem(RECENT_SUBMISSIONS_KEY)) || [];
    setRecentForms(storedForms);
  }, []);

  const handleFormSubmit = () => {
    const newEntry = {
      id: Date.now(),
      title: form.title || "Untitled Form",
      description: form.description || "",
      fields: form.fields || []
    };

    const updatedForms = [newEntry, ...recentForms].slice(0, 3); // Keep only 3
    localStorage.setItem(RECENT_SUBMISSIONS_KEY, JSON.stringify(updatedForms));
    setRecentForms(updatedForms);
  };

  const getPreviewStyles = () => {
    switch (previewMode) {
      case "mobile":
        return {
          width: "320px",
          containerClass: "min-w-[320px]",
          icon: <Smartphone size={16} className="mr-2" />,
        };
      case "tablet":
        return {
          width: "568px",
          containerClass: "min-w-[568px]",
          icon: <Tablet size={16} className="mr-2" />,
        };
      default:
        return {
          width: "768px",
          containerClass: "min-w-[768px]",
          icon: <Monitor size={16} className="mr-2" />,
        };
    }
  };

  const { width, containerClass, icon } = getPreviewStyles();

  return (
    <div className={`${containerClass} border-l p-4 overflow-x-auto ${
      darkMode ? "bg-gray-900 border-gray-700" : "bg-white/80 border-white/20 backdrop-blur-lg"
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          {icon}
          <h3 className={`font-bold ${darkMode ? "text-[#65000b]" : "text-[#d3011c]"}`}>
            {previewMode.charAt(0).toUpperCase() + previewMode.slice(1)} Preview
          </h3>
        </div>
      </div>

      <div className="flex justify-center">
        <div
          style={{ width }}
          className={`relative overflow-hidden p-5 rounded-xl border shadow-xl transition-all duration-300 ${
            darkMode ? "bg-gray-800 border-gray-600" : "bg-white/80 border-white/30 backdrop-blur-md"
          }`}
        >
          <div className="relative">
            <h2 className={`text-2xl font-bold mb-4 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
              {form.title || "Untitled Form"}
            </h2>

            {form.description && (
              <p className={`mb-8 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                {form.description}
              </p>
            )}

            {form.fields.length === 0 ? (
              <div className={`text-center py-12 px-5 rounded-lg border-2 border-dashed ${
                darkMode
                  ? "text-gray-500 border-gray-700 bg-gray-800/50"
                  : "text-gray-400 border-[#c0e6e9]/40 bg-[#c0e6e9]/10"
              }`}>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gray-200">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="font-medium">No fields added yet</p>
                <p className="text-sm">Drag fields from the palette to get started</p>
              </div>
            ) : (
              <div className="space-y-6">
                {form.fields.map((field) => (
                  <div key={field.id} className="group">
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}>
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {isBrowser && <FormFieldPreview field={field} darkMode={darkMode} />}
                    {field.helpText && (
                      <p className={`text-xs mt-1.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        💡 {field.helpText}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleFormSubmit}
                className={`w-full py-3 px-6 rounded-xl font-medium text-white transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg ${
                  darkMode
                    ? "bg-[#65000b] hover:bg-[#7a0010] hover:shadow-red-500/20"
                    : "bg-[#d3011c] hover:bg-[#e8112c] hover:shadow-red-600/30"
                }`}
              >
                <span>Submit Form</span>
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {/* RECENT SUBMISSIONS */}
            {recentForms.length > 0 && (
              <div className="mt-10">
                <h4 className={`font-semibold mb-4 ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
                  Recent Submissions
                </h4>
                <ul className="space-y-3 text-sm">
                  {recentForms.map((item) => (
                    <li
                      key={item.id}
                      className={`p-4 rounded-lg border ${
                        darkMode
                          ? "bg-gray-700 text-gray-200 border-gray-600"
                          : "bg-gray-50 text-gray-700 border-gray-200"
                      }`}
                    >
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs">{item.description}</p>
                      <p className="text-xs mt-1 text-gray-400">Fields: {item.fields.length}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormPreview;
