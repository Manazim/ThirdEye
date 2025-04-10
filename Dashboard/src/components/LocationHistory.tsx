import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaClock, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'font-awesome/css/font-awesome.min.css';

interface LocationData {
  timestamp: string;
  Latitude: number;
  Longitude: number;
  address?: string; // Add an optional field for the formatted address
}

const LocationHistory = () => {
  const [locationData, setLocationData] = useState<LocationData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [filteredData, setFilteredData] = useState<LocationData[]>([]);
  const navigate = useNavigate();

  const API_KEY = '';

  // Fetch location data from the API
  const fetchLocationData = async () => {
    try {
      const response = await axios.get('http://localhost:3001/locationHistory'); // Adjust this endpoint if needed
      const sortedData = response.data.sort((a: LocationData, b: LocationData) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // For each location, fetch the formatted address using OpenCage API
      const dataWithAddress = await Promise.all(
        sortedData.map(async (location) => {
          const address = await fetchAddress(location.Latitude, location.Longitude);
          return { ...location, address };
        })
      );

      setLocationData(dataWithAddress);
      setFilteredData(dataWithAddress);
    } catch (error) {
      console.error('Error fetching location data:', error);
    }
  };

  // Function to fetch address using OpenCage API
  const fetchAddress = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${lat}%2C${lng}&key=${API_KEY}`
      );
      const components = response.data.results[0]?.components;
      if (components) {
        const { road, suburb, postcode, city, state, country } = components;
        return `${road || ''}, ${suburb || ''}, ${postcode || ''}, ${state || ''}, ${country || ''}`
          .replace(/(,\s)+/g, ', ') // Remove redundant commas
          .trim();
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    }
    return 'Unknown Address';
  };

  useEffect(() => {
    fetchLocationData();
  }, []);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Filter by date
  const handleFilter = () => {
    if (!filterDate) {
      setFilteredData(locationData);
    } else {
      const filtered = locationData.filter((loc) => {
        const locDate = new Date(loc.timestamp).toDateString();
        return locDate === filterDate.toDateString();
      });
      setFilteredData(filtered);
    }
    setCurrentPage(1);
  };

  return (
    <div className="app-container">
      <div className="header-container">
        <div className="back-icon" onClick={() => navigate('/Home')}>
          <i className="fas fa-home back-icon-inner"></i>
          <span className="back-text">Back to Home</span>
        </div>
        <h1
          style={{
            color: 'beige',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
            fontFamily: 'Orbitron',
          }}
        >
          Location History
        </h1>
      </div>

      {/* Filter Section */}
      <div className="filter-container">
        <DatePicker
          selected={filterDate}
          onChange={(date: Date) => setFilterDate(date)}
          dateFormat="yyyy-MM-dd"
          placeholderText="Select a date"
          className="date-picker"
        />
        <button onClick={handleFilter} className="filter-button">
          Filter
        </button>
      </div>

      {/* Location List */}
      <div className="location-list">
        {currentData.length > 0 ? (
          currentData.map((loc, index) => (
            <div
              className="location-card"
              key={index}
              onClick={() => window.open(`https://www.google.com/maps?q=${loc.Latitude},${loc.Longitude}`, '_blank')}
            >
              <div className="card-content">
                <div className="card-row">
                  <FaClock className="icon" />
                  <div>
                    <span className="location-date">
                      {new Date(loc.timestamp).toLocaleDateString()}
                    </span>
                    <br />
                    <span className="location-time">
                      {new Date(loc.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                <div className="card-row">
                  <FaMapMarkerAlt className="icon" />
                  <span style={{ color: 'gold' }}>{loc.address}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No location data available.</p>
        )}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button
          className="page-button"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          <FaArrowLeft /> Previous
        </button>
        <button
          className="page-button"
          disabled={indexOfLastItem >= filteredData.length}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next <FaArrowRight />
        </button>
      </div>
    </div>
  );
};

export default LocationHistory;
