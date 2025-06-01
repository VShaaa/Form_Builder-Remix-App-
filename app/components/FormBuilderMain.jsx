import { useState, useReducer, useEffect } from 'react';
import { FileText, BarChart3, Save, Share } from 'lucide-react';
import { useNavigate } from '@remix-run/react';
import PreviewToggle from './PreviewToggle';
import ThemeToggle from './ThemeToggle';
import FieldPalette from './FieldPalette';
import FormCanvas from './FormCanvas';
import FormPreview from './FormPreview';
import FieldEditor from './FieldEditor';

const formReducer = (state, action) => {
  const newState = (() => {
    switch (action.type) {
      case 'ADD_FIELD':
        return {
          ...state,
          currentForm: {
            ...state.currentForm,
            fields: [...state.currentForm.fields, action.payload]
          }
        };
      
      case 'UPDATE_FIELD':
        return {
          ...state,
          currentForm: {
            ...state.currentForm,
            fields: state.currentForm.fields.map(field => 
              field.id === action.payload.id ? { ...field, ...action.payload.updates } : field
            )
          }
        };
      
      case 'DELETE_FIELD':
        return {
          ...state,
          currentForm: {
            ...state.currentForm,
            fields: state.currentForm.fields.filter(field => field.id !== action.payload)
          }
        };
      
      case 'REORDER_FIELDS':
        const fields = Array.from(state.currentForm.fields);
        const [reorderedField] = fields.splice(action.payload.source, 1);
        fields.splice(action.payload.destination, 0, reorderedField);
        return {
          ...state,
          currentForm: {
            ...state.currentForm,
            fields
          }
        };
      
      case 'SET_FORM':
        return {
          ...state,
          currentForm: action.payload
        };
      
      case 'ADD_STEP':
        return {
          ...state,
          currentForm: {
            ...state.currentForm,
            steps: [...(state.currentForm.steps || []), {
              id: Date.now().toString(),
              name: `Step ${(state.currentForm.steps?.length || 0) + 1}`,
              fields: []
            }]
          }
        };
      
      case 'UPDATE_FORM_SETTINGS':
        return {
          ...state,
          currentForm: {
            ...state.currentForm,
            ...action.payload
          }
        };
      
      default:
        return state;
    }
  })();

  if (action.type === 'UNDO' && state.historyIndex > 0) {
    return {
      ...state,
      currentForm: state.history[state.historyIndex - 1],
      historyIndex: state.historyIndex - 1
    };
  }
  
  if (action.type === 'REDO' && state.historyIndex < state.history.length - 1) {
    return {
      ...state,
      currentForm: state.history[state.historyIndex + 1],
      historyIndex: state.historyIndex + 1
    };
  }
  
  return newState;
};

const FORM_TEMPLATES = {
  contact: {
    name: 'Contact Us',
    fields: [
      { id: '1', type: 'text', label: 'Full Name', required: true, placeholder: 'Enter your name' },
      { id: '2', type: 'email', label: 'Email', required: true, placeholder: 'your@email.com' },
      { id: '3', type: 'phone', label: 'Phone', required: false, placeholder: '+1 (555) 123-4567' },
      { id: '4', type: 'textarea', label: 'Message', required: true, placeholder: 'Your message here...' }
    ]
  },
  survey: {
    name: 'Customer Survey',
    fields: [
      { id: '1', type: 'text', label: 'Name', required: true },
      { id: '2', type: 'select', label: 'Satisfaction', required: true, options: ['Excellent', 'Good', 'Fair', 'Poor'] },
      { id: '3', type: 'radio', label: 'Recommend?', required: true, options: ['Yes', 'No', 'Maybe'] },
      { id: '4', type: 'textarea', label: 'Comments', required: false }
    ]
  }
};

const FormBuilder = ({ setAppDarkMode }) => {
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (setAppDarkMode) {
      setAppDarkMode(darkMode);
    }
  }, [darkMode, setAppDarkMode]);
  
  const [previewMode, setPreviewMode] = useState('desktop');
  const [selectedField, setSelectedField] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [activeTab, setActiveTab] = useState('builder');
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [showShareNotification, setShowShareNotification] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [showDownloadPrompt, setShowDownloadPrompt] = useState(false);
  const [showThanksPrompt, setShowThanksPrompt] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState(null);

  const initialState = {
    currentForm: {
      id: Date.now().toString(),
      title: 'New Form',
      description: '',
      fields: [],
      steps: []
    },
    history: [],
    historyIndex: -1
  };

  const [state, dispatch] = useReducer(formReducer, initialState);

  useEffect(() => {
    try {
      const customTemplates = JSON.parse(localStorage.getItem('customFormTemplates') || '{}');
      Object.entries(customTemplates).forEach(([key, template]) => {
        if (!FORM_TEMPLATES[key]) {
          FORM_TEMPLATES[key] = template;
        }
      });
    } catch (error) {
      console.warn('Failed to load custom templates:', error);
    }
  }, []);

  const saveForm = () => {
  try {
    const formsData = JSON.parse(localStorage.getItem('formBuilderForms') || '{}');
    formsData[state.currentForm.id] = state.currentForm;
    localStorage.setItem('formBuilderForms', JSON.stringify(formsData));
    
    setShowSaveNotification(true);
    setShowDownloadPrompt(true); // Show download prompt after saving
    
    setTimeout(() => {
      setShowSaveNotification(false);
    }, 3000);
  } catch (error) {
    console.warn('Save failed:', error);
    alert('Failed to save form. Please try again.');
  }
};


  const handleFieldUpdate = (field) => {
    dispatch({
      type: 'UPDATE_FIELD',
      payload: { id: field.id, updates: field }
    });
  };

  const loadTemplate = (templateKey) => {
    const template = FORM_TEMPLATES[templateKey];
    if (template) {
      dispatch({
        type: 'SET_FORM',
        payload: {
          ...state.currentForm,
          title: template.name,
          fields: template.fields
        }
      });
      setShowTemplates(false);
    }
  };
  
  const saveAsTemplate = () => {
    setTemplateName(state.currentForm.title);
    setShowSaveTemplateModal(true);
  };
  
  

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }
    
    try {
      const templateKey = templateName.toLowerCase().replace(/\s+/g, '_');
      
      const newTemplate = {
        name: templateName,
        fields: state.currentForm.fields
      };
      
      const customTemplates = JSON.parse(localStorage.getItem('customFormTemplates') || '{}');
      
      customTemplates[templateKey] = newTemplate;
      
      localStorage.setItem('customFormTemplates', JSON.stringify(customTemplates));
      
      FORM_TEMPLATES[templateKey] = newTemplate;
      
      setShowSaveTemplateModal(false);
      setTemplateName('');
      alert(`Template "${templateName}" saved successfully!`);
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('Failed to save template. Please try again.');
    }
  };

  const generateFormId = () => {
    return 'form_' + Math.random().toString(36).substr(2, 9);
  };

  const shareForm = () => {
    try {
      const shareId = generateFormId();
      const shareableForm = { ...state.currentForm, shareId, createdAt: new Date().toISOString()};
      
      const sharedForms = JSON.parse(localStorage.getItem('sharedForms') || '{}');
      sharedForms[shareId] = shareableForm;
      localStorage.setItem('sharedForms', JSON.stringify(sharedForms));
      
      const url = `${window.location.origin}/?form=${shareId}`;
      setShareUrl(url);
      
      setShowShareNotification(true);
      setTimeout(() => {
        setShowShareNotification(false);
      }, 5000);
      
      navigator.clipboard.writeText(url);
    } catch (error) {
      console.warn('Failed to share form:', error);
    }
  };

  const viewResponses = () => {
    navigate('/?responses=true');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-background-dark text-gray-100 border-[#65000b]' 
        : 'bg-background-light text-gray-900 border-[#d3011c]'
    }`}>
      {/* Header */}
      <button
        onClick={() => dispatch({ type: 'UNDO' })}
        disabled={state.historyIndex <= 0}
        className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} ${state.historyIndex <= 0 ? 'opacity-50' : ''}`}
      >
        Undo
      </button>
      <button
        onClick={() => dispatch({ type: 'REDO' })}
        disabled={state.historyIndex >= state.history.length - 1}
        className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} ${state.historyIndex >= state.history.length - 1 ? 'opacity-50' : ''}`}
      >
        Redo
      </button>
      
      <header className={`relative px-6 py-4 ${
        darkMode 
          ? 'bg-gray-900 border-b border-[#65000b]' 
          : 'bg-white border-b border-[#d3011c]'
      }`}>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[#111828]"></div>
        </div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary-light to-primary-dark shadow-lg shadow-red-500/100`}>
                <FileText size={20} className="text-red" />
              </div>              
              <h1 className={`text-2xl font-bold ${
                darkMode 
                    ? 'bg-secondary-dark text-gray-100' 
                    : 'bg-secondary-light text-gray-900'
                }`}>
                Form Builder
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`w-px h-8 ${darkMode ? 'bg-[#65000b]' : 'bg-[#d3011c]'}`}></div>
              <div className="relative">
                <input
                  type="text"
                  value={state.currentForm.title}
                  onChange={(e) => dispatch({
                    type: 'UPDATE_FORM_SETTINGS',
                    payload: { title: e.target.value }
                  })}
                  className={`px-4 py-2.5 rounded-xl border-0 bg-transparent font-medium text-lg transition-all focus:outline-none focus:ring-2 ${
                    darkMode 
                      ? 'text-gray-200 focus:ring-cyan-500/30 focus:bg-gray-800/50' 
                      : 'text-gray-800 focus:ring-purple-500/30 focus:bg-white/80'
                  } placeholder-gray-400`}
                  placeholder="Form Title"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <PreviewToggle 
              previewMode={previewMode} 
              setPreviewMode={setPreviewMode}
              darkMode={darkMode}
            />
            
            <div className="flex items-center space-x-3">
              <button
                onClick={saveForm}
                className={`group px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${
                  darkMode 
                    ? 'border border-[#65000b] bg-gray-800 text-white hover:bg-[#65000b] hover:border-[#65000b]' 
                    : 'border border-[#d3011c] bg-white text-[#d3011c] hover:bg-[#d3011c] hover:text-white'
                }`}
              >
                <Save size={16} className="transition-transform group-hover:scale-110" />
                <span>Save</span>
              </button>
              
              <button
                onClick={saveAsTemplate}
                className={`group px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${
                  darkMode 
                    ?'border border-[#65000b] bg-gray-800 text-white hover:bg-[#65000b] hover:border-[#65000b]' 
                    : 'border border-[#d3011c] bg-white text-[#d3011c] hover:bg-[#d3011c] hover:text-white'
                }`}
              >
                <layout-template size={16} className="transition-transform group-hover:scale-110" />
                <span>Template it</span>
              </button>

              <button
                onClick={() => setShowTemplates(true)}
                className={`group px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${
                  darkMode 
                    ? 'border border-[#65000b] bg-gray-800 text-white hover:bg-[#65000b] hover:border-[#65000b]' 
                    : 'border border-[#d3011c] bg-white text-[#d3011c] hover:bg-[#d3011c] hover:text-white'
                }`}
              >
                <layout-template size={16} className="transition-transform group-hover:scale-110" />
                <span>Templates</span>
              </button>
              
              <button
                onClick={viewResponses}
                className={`group px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${
                  darkMode 
                    ? 'border border-[#65000b] bg-gray-800 text-white hover:bg-[#65000b] hover:border-[#65000b]' 
                    : 'border border-[#d3011c] bg-white text-[#d3011c] hover:bg-[#d3011c] hover:text-white'
                }`}
              >
                <BarChart3 size={16} className="transition-transform group-hover:scale-110" />
                <span>Responses</span>
              </button>
              
              <button
                onClick={shareForm}
                className={`group px-4 py-2.5 rounded-xl font-medium text-red transition-all duration-200 flex items-center space-x-2 bg-gradient-to-r from-primary-light to-primary-dark hover:from-primary-dark hover:to-primary-light`}
              >
                <Share size={16} className="transition-transform group-hover:scale-110" />
                <span>Share</span>
              </button>
            </div>
            
            <div className={`w-px h-8 ${darkMode ? 'bg-[#65000b]' : 'bg-[#d3011c]'}`}></div>
            <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-85px)] flex-row-reverse">
        <FieldPalette 
          darkMode={darkMode} 
          className={`border-r ${darkMode ? 'border-[#65000b]' : 'border-[#d3011c]'}`} 
        />
        
        <FormCanvas
          form={state.currentForm}
          dispatch={dispatch}
          selectedField={selectedField}
          setSelectedField={setSelectedField}
          darkMode={darkMode}
          className={`border-x ${darkMode ? 'border-[#65000b]' : 'border-[#d3011c]'}`}
        />
        
        <FormPreview
          form={state.currentForm}
          previewMode={previewMode}
          darkMode={darkMode}
          className={`border-l ${darkMode ? 'border-[#65000b]' : 'border-[#d3011c]'}`}
        />
      </div>

      {/* Field Editor Modal */}
      {selectedField && (
        <FieldEditor
          field={selectedField}
          onUpdate={handleFieldUpdate}
          onClose={() => setSelectedField(null)}
          darkMode={darkMode}
        />
      )}

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`w-[450px] max-h-[80vh] overflow-y-auto rounded-2xl shadow-2xl border ${
            darkMode ? 'bg-gray-800 text-gray-200 border-[#65000b]' : 'bg-white text-gray-800 border-[#d3011c]'
          }`}>
            <div className="p-6 border-b border-[#65000b] dark:border-[#65000b] flex items-center justify-between">
              <h3 className={`text-xl font-bold ${
                darkMode ? 'text-[#65000b]' : 'text-[#d3011c]'
              }`}>
                Choose Template
              </h3>
              <button 
                onClick={() => setShowTemplates(false)}
                className={`p-2 rounded-full hover:bg-gray-600 dark:hover:bg-gray-700`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(FORM_TEMPLATES).map(([key, template]) => (
                  <div
                    key={key}
                    onClick={() => loadTemplate(key)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-lg ${
                      darkMode 
                        ? 'border-[#65000b] hover:border-[#65000b] bg-gray-700/50 hover:bg-gray-700/80' 
                        : 'border-[#d3011c] hover:border-[#d3011c] bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary-light to-primary-dark shadow-lg shadow-red-500/25`}>
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {template.fields.length} fields included
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 border-t border-[#65000b] dark:border-[#65000b] flex justify-end">
              <button
                onClick={() => setShowTemplates(false)}
                className={`py-2.5 px-5 rounded-xl font-medium transition-all ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Template Modal */}
      {showSaveTemplateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`w-[450px] rounded-2xl shadow-2xl overflow-hidden border ${
            darkMode ? 'bg-gray-800 text-gray-200 border-[#65000b]' : 'bg-white text-gray-800 border-[#d3011c]'
          }`}>
            <div className="p-6 border-b border-[#65000b] dark:border-[#65000b] flex items-center justify-between">
              <h3 className={`text-xl font-bold ${
                darkMode ? 'text-[#65000b]' : 'text-[#d3011c]'
              }`}>
                Save as Template
              </h3>
              <button 
                onClick={() => setShowSaveTemplateModal(false)}
                className={`p-2 rounded-full hover:bg-gray-400 dark:hover:bg-gray-700`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Template Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Enter template name"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      darkMode 
                        ? 'bg-gray-700 border-[#65000b] text-gray-200' 
                        : 'bg-gray-50 border-[#d3011c] text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-opacity-20 ${
                      darkMode ? 'focus:ring-gray-500' : 'focus:ring-gray-300'
                    }`}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  This template will be available in your templates list for future use.
                </p>
              </div>
              
              <div className="flex items-center p-3 rounded-lg bg-blue-50 dark:bg-gray-700/50 text-blue-800 dark:text-blue-300">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">Template will include {state.currentForm.fields.length} fields</span>
              </div>
            </div>
            
            <div className="p-6 border-t border-[#65000b] dark:border-[#65000b] flex justify-end space-x-3">
              <button
                onClick={() => setShowSaveTemplateModal(false)}
                className={`py-2.5 px-5 rounded-xl font-medium transition-all ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                className={`py-2.5 px-5 rounded-xl font-medium transition-all ${
                  darkMode 
                    ? 'bg-[#65000b] hover:bg-[#65000b]/80 text-white' 
                    : 'bg-[#d3011c] hover:bg-[#d3011c]/80 text-white'
                } shadow-lg hover:shadow-xl`}
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto-save Notification */}
      <div className={`fixed bottom-4 left-4 transform transition-all duration-500 z-50 ${
        showSaveNotification 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-full opacity-0 pointer-events-none'
      }`}>
        <div className={`px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 border ${
          darkMode 
            ? 'bg-gray-800 border-[#65000b] text-gray-200' 
            : 'bg-white border-[#d3011c] text-gray-800'
        }`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${
            darkMode ? 'bg-green-400' : 'bg-green-500'
          }`}></div>
          <span className="text-sm font-medium">Form saved</span>
          <div className={`text-xs px-2 py-1 rounded ${
            darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
          }`}>
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
      
      {/* Share Notification */}
      <div className={`fixed top-4 right-4 transform transition-all duration-300 z-50 ${
        showShareNotification 
          ? 'translate-y-0 opacity-100' 
          : '-translate-y-12 opacity-0 pointer-events-none'
      }`}>
        <div className={`px-5 py-4 rounded-xl shadow-xl border ${
          darkMode 
            ? 'bg-gray-800 border-[#65000b]' 
            : 'bg-white border-[#d3011c]'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            darkMode ? 'bg-emerald-900/50 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
          }`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <div className="font-medium">Form shared successfully!</div>
            <div className="text-sm mt-1">Share ID: {shareUrl.split('form=')[1]}</div>
            <div className="text-xs mt-2">Link copied to clipboard</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;

