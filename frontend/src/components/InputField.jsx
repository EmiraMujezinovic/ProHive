import React from 'react'

const InputField = ({ 
  label, 
  type = "text", 
  value, 
  onChange, 
  required = false, 
  name
}) => {
  return (
    <div className="mb-4">
      <label className="block mb-1">{label}</label>
      <input
        type={type}
        name={name} // Prosljeđujemo name prop
        className="w-full px-3 py-2 border rounded"
        value={value}
        onChange={onChange}
        required={required}
      />
    </div>
  );
};

export default InputField