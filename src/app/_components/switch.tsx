import React, { useState } from 'react';

const SwitchComponent: React.FC = () => {
    const [isAllowed, setIsAllowed] = useState<boolean>(false);

    const toggleSwitch = () => {
        setIsAllowed(!isAllowed); // Toggle between true/false when clicked
    };

    return (
        <div className="flex items-center gap-4">
            {/* Box-shaped switch with larger size */}
            <div
                onClick={toggleSwitch} // Clicking on the whole switch toggles it
                className={`w-16 h-9 flex items-center p-1 cursor-pointer transition-colors duration-300 ease-in-out ${
                    isAllowed ? 'bg-red-300' : 'bg-gray-300'
                }`}
                style={{ borderRadius: '5px' }} // True box shape with sharp corners
            >
                {/* Inner circle (knob) */}
                <div
                    className={`h-6 w-6 bg-white rounded-md shadow-md transform transition-transform duration-300 ease-in-out ${
                        isAllowed ? 'translate-x-8' : 'translate-x-0'
                    }`}
                />
            </div>

            {/* The text that changes based on the switch state */}
            <span className="text-lg">{isAllowed ? 'Allowed' : 'Not Allowed'}</span>
        </div>
    );
};

export default SwitchComponent;
