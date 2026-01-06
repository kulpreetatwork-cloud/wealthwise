import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for detecting clicks outside of an element
 * @param {Function} callback - Function to call when clicking outside
 * @returns {React.RefObject} Ref to attach to the element
 */
export const useClickOutside = (callback) => {
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                callback();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [callback]);

    return ref;
};

export default useClickOutside;
