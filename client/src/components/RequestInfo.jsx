import React from 'react';

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const RequestInfo = ({ request }) => {
    if (!request) return null;

    const { seeker, locationInput, date, numberOfPeople, description } = request;

    return (
        <div className="flex-1 md:border-r md:pr-6 border-gray-200">
            <div className="flex items-center mb-4">
                {seeker?.profileImage1 ? (
                    <img src={seeker.profileImage1} alt={seeker.name} className="w-12 h-12 rounded-full mr-4 object-cover shadow-sm" />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                        <span className="text-xl font-bold text-blue-600">
                            {seeker?.name?.charAt(0).toUpperCase() || 'S'}
                        </span>
                    </div>
                )}
                <div>
                    <h3 className="text-xl font-bold text-blue-900">Surfer Request</h3>
                    <p className="text-sm text-gray-500">From: {seeker?.name}</p>
                </div>
            </div>
            <div className="text-sm text-gray-700 space-y-2 pl-3 border-l-2 border-blue-100">
                <p><span className="font-semibold text-gray-500">Location:</span> {locationInput}</p>
                <p><span className="font-semibold text-gray-500">Date:</span> {formatDate(date)}</p>
                <p><span className="font-semibold text-gray-500">People:</span> {numberOfPeople}</p>
                {description && (
                    <div className="pt-1">
                        <p className="font-semibold text-gray-500">Reason:</p>
                        <p className="text-gray-600 pl-2 text-sm italic">"{description}"</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequestInfo; 