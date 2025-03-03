import React from 'react';

interface SwitchComponentProps {
    isAllowed: boolean;
    onToggle: (isAllowed: boolean) => void;
}

const SwitchComponent: React.FC<SwitchComponentProps> = ({ isAllowed, onToggle }) => {
    const toggleSwitch = () => onToggle(!isAllowed);

    return (
        <div className="flex items-center gap-4">
            <div
                onClick={toggleSwitch}
                className={`w-16 h-9 flex items-center p-1 cursor-pointer transition-colors duration-300 ease-in-out ${
                    isAllowed ? 'bg-green' : 'bg-gray'
                }`}
                style={{ borderRadius: '5px' }}
            >
                <div
                    className={`h-6 w-6 bg-white rounded-md shadow-md transform transition-transform duration-300 ease-in-out ${
                        isAllowed ? 'translate-x-8' : 'translate-x-0'
                    }`}
                />
            </div>
            <span className="text-lg">{isAllowed ? 'Allowed' : 'Not Allowed'}</span>
        </div>
    );
};

export default SwitchComponent;