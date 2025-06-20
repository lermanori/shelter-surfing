import React from 'react';
import { useNavigate } from 'react-router-dom';

const getDistanceColor = (distance) => {
    if (distance <= 5) return 'text-green-600';
    if (distance <= 15) return 'text-yellow-600';
    return 'text-red-600';
};

const ShelterMatchInfo = ({ match, onContact, connectionStatus, connectionLoading }) => {
    const navigate = useNavigate();
    if (!match || !match.shelter) return null;

    const { shelter, distance, seeker } = match;

    const getButtonState = () => {
        if (connectionLoading) {
            return { text: 'Loading...', disabled: true, className: 'bg-gray-400' };
        }
        if (connectionStatus?.connected) {
            return { text: 'Message Seeker', disabled: false, className: 'bg-green-600 hover:bg-green-700' };
        }
        if (connectionStatus?.status === 'PENDING') {
            return { text: 'Request Sent', disabled: true, className: 'bg-gray-400' };
        }
        return { text: 'Request Connection', disabled: false, className: 'bg-blue-600 hover:bg-blue-700' };
    };

    const buttonState = getButtonState();

    return (
        <div className="flex-1">
            <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">🏠</span>
                <h3 className="text-xl font-bold text-green-900">Your Matching Shelter</h3>
            </div>
            <div className="text-sm text-gray-700 space-y-1 mb-4">
                <p><span className="font-semibold">Shelter:</span> {shelter.title}</p>
                <p><span className="font-semibold">Location:</span> {shelter.locationInput}</p>
                <p className={`font-bold ${getDistanceColor(distance)}`}>
                    Distance: {distance} km
                </p>
            </div>
            
            <div className="mt-auto pt-4 flex flex-col sm:flex-row gap-2">
                <button
                    onClick={() => onContact(match)}
                    disabled={buttonState.disabled}
                    className={`w-full sm:w-auto flex-1 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:cursor-not-allowed ${buttonState.className}`}
                >
                    {buttonState.text}
                </button>
                <button
                    onClick={() => navigate(`/user/${seeker.id}`)}
                    className="w-full sm:w-auto flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 text-sm font-medium transition-colors"
                >
                    View Profile
                </button>
            </div>
        </div>
    );
};

export default ShelterMatchInfo; 