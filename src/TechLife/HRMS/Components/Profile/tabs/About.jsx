import React, { useState, useEffect } from 'react';

const About = () => {
  const [responses, setResponses] = useState(() => {
    const savedResponses = localStorage.getItem('aboutResponses');
    return savedResponses ? JSON.parse(savedResponses) : {
      about: { text: '', isEditing: false },
      jobLove: { text: '', isEditing: false },
      interests: { text: '', isEditing: false }
    };
  });

  useEffect(() => {
    localStorage.setItem('aboutResponses', JSON.stringify(responses));
  }, [responses]);

  const handleEdit = (field) => {
    setResponses(prev => ({
      ...prev,
      [field]: { ...prev[field], isEditing: true }
    }));
  };

  const handleSave = (field, value) => {
    setResponses(prev => ({
      ...prev,
      [field]: { text: value, isEditing: false }
    }));
  };

  const handleCancel = (field) => {
    setResponses(prev => ({
      ...prev,
      [field]: { ...prev[field], isEditing: false }
    }));
  };

  const renderResponseSection = (field, title) => {
    const { text, isEditing } = responses[field];

    if (!text && !isEditing) {
      return (
        <button
          onClick={() => handleEdit(field)}
          className="text-purple-600 border border-purple-600 rounded-md px-4 py-2 hover:bg-purple-50"
        >
          Add your response
        </button>
      );
    }

    if (isEditing) {
      return (
        <div className="space-y-2">
          <textarea
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
            rows="4"
            defaultValue={text}
            id={`${field}-textarea`}
            placeholder="Type your response here..."
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => handleCancel(field)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSave(field, document.getElementById(`${field}-textarea`).value)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Save
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gray-50 p-4 rounded-md relative group">
        <p className="text-gray-700 whitespace-pre-wrap">{text}</p>
        <button
          onClick={() => handleEdit(field)}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity
            px-3 py-1 bg-white border border-gray-200 rounded-md shadow-sm
            text-gray-600 hover:text-gray-800 hover:border-gray-300"
        >
          Edit
        </button>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">About</h2>
        
        <div className="space-y-6">
          {renderResponseSection('about', 'About')}

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">What I love about my job?</h3>
              {renderResponseSection('jobLove', 'Job Love')}
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">My interests and hobbies</h3>
              {renderResponseSection('interests', 'Interests')}
            </div>
          </div>
        </div>

        {Object.values(responses).every(response => !response.text) && (
          <div className="mt-8 text-center">
            <div className="inline-block">
             
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default About;