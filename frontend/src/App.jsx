import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './index.css';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';


const mapContainerStyle = { width: '100%', height: '400px' };
const defaultCenter = { lat: 20.5937, lng: 78.9629 };

const Dashboard = () => {
  const [shipments, setShipments] = useState([]);

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const response = await axios.get('http://localhost:3000/shipments');
        setShipments(response.data);
      } catch (error) {
        console.error('Error fetching shipments:', error);
      }
    };
    fetchShipments();
  }, []);

  return (
    <div>
      <h1>Shipments Dashboard</h1>
      <Link to="/add-shipment">Add Shipment</Link>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Container ID</th>
            <th>Current Location</th>
            <th>ETA</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {shipments.map((shipment) => (
            <tr key={shipment._id}>
              <td>{shipment.shipmentId}</td>
              <td>{shipment.containerId}</td>
              <td>{shipment.currentLocation?.latitude}, {shipment.currentLocation?.longitude}</td>
              <td>{shipment.currentETA}</td>
              <td>{shipment.status}</td>
              <td><Link to={`/shipment/${shipment._id}`}>View</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ShipmentDetails = () => {
  const { id } = useParams();
  const [shipment, setShipment] = useState(null);

  useEffect(() => {
    const fetchShipment = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/shipment/${id}`);
        setShipment(response.data);
      } catch (error) {
        console.error('Error fetching shipment:', error);
      }
    };
    fetchShipment();
  }, [id]);

  if (!shipment) return <p>Loading...</p>;

  return (
    <div>
      <h1>Shipment Details</h1>
      <p><strong>ID:</strong> {shipment.shipmentId}</p>
      <p><strong>Container ID:</strong> {shipment.containerId}</p>
      <p><strong>Current Location:</strong> {shipment.currentLocation?.latitude}, {shipment.currentLocation?.longitude}</p>
      <p><strong>ETA:</strong> {shipment.currentETA}</p>
      <p><strong>Status:</strong> {shipment.status}</p>


      <APIProvider apiKey="AIzaSyC01jEPA__4hZ_Fuz-BCwrxdLxQvjL9_4A">
        <div style={{height: "80vh"}}>
          <Map center={{lat: shipment.currentLocation.latitude, lng: shipment.currentLocation.longitude} || defaultCenter} defaultZoom={10} mapId='a1af423cbdaaca '>
            <AdvancedMarker position={{lat: shipment.currentLocation.latitude, lng: shipment.currentLocation.longitude}}></AdvancedMarker>
          </Map>
        </div>
      </APIProvider>
    </div>
  );
};

const AddShipment = () => {
  const [shipmentId, setShipmentId] = useState('');
  const [containerId, setContainerId] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [status, setStatus] = useState('In Transit');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/shipment', {
        shipmentId,
        containerId,
        currentLocation: { latitude, longitude },
        status,
      });
      navigate('/');
    } catch (error) {
      console.error('Error adding shipment:', error);
    }
  };

  return (
    <div>
      <h1>Add Shipment</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Shipment ID" value={shipmentId} onChange={(e) => setShipmentId(e.target.value)} required />
        <input type="text" placeholder="Container ID" value={containerId} onChange={(e) => setContainerId(e.target.value)} required />
        <input type="number" placeholder="Latitude" value={latitude} onChange={(e) => setLatitude(e.target.value)} required />
        <input type="number" placeholder="Longitude" value={longitude} onChange={(e) => setLongitude(e.target.value)} required />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="In Transit">In Transit</option>
          <option value="Delivered">Delivered</option>
          <option value="Pending">Pending</option>
        </select>
        <button type="submit">Add Shipment</button>
      </form>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/shipment/:id" element={<ShipmentDetails />} />
        <Route path="/add-shipment" element={<AddShipment />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App
