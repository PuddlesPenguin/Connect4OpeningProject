import React from 'react';

const openingsJSON = `[ 
    "2456",
    "1357",
    "4567",
    "2345",
    "1234"
]`;

const BasicExample = ({ onSelect }) => {
    const openings = JSON.parse(openingsJSON);

    return (
        <div className="DropDown">
            <select onChange={x => onSelect(x.target.value)}>
                <option value="">Select an opening</option>
                {openings.map((opening, index) => (
                    <option key={index} value={opening}>
                        Opening {index + 1}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default BasicExample;