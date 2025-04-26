import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBox = () => {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (event) => {
        event.preventDefault();
        if (query.trim()) {
            navigate(`/search?query=${query}`); 
        }
    };

    return (
        <div className="search-box me-3">
            <form onSubmit={handleSearch} name="search">
                <input
                    name="query"
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button type="submit">
                    <i className="fa fa-search" aria-hidden="true"></i>
                </button>
            </form>
        </div>
    );
};

export default SearchBox;
