const express = require('express')
const mongoose = require('mongoose')
const axios = require('axios')
const dotenv = require('dotenv')
const cors = require('cors')
const Shipment = require('./db/Schema')
dotenv.config()

const app = express();
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT;

app.get('/shipments', async (req, res) => {
    try{
        const shipments = await Shipment.find();
        res.json(shipments)
    }catch(error){
        res.status(500).json({ message: error.message });
    }
})

app.get('/shipment/:id', async (req, res) => {
    try {
        const shipment = await Shipment.findById(req.params.id);
        if (!shipment) return res.status(404).json({ message: 'Shipment not found' });
        res.json(shipment);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
})

app.post('/shipment/:id/update-location', async (req, res) => {
    const { latitude, longitude } = req.body;
    
    try {
      const shipment = await Shipment.findById(req.params.id);
      if (!shipment) return res.status(404).json({ message: 'Shipment not found' });
      
      shipment.currentLocation = { latitude, longitude };
  
      const eta = await calculateETA(shipment);
      shipment.currentETA = eta;
  
      await shipment.save();
      res.json(shipment);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  
  async function calculateETA(shipment) {
    const { latitude, longitude } = shipment.currentLocation;
    const destination = shipment.route[shipment.route.length - 1];
  
    const destinationCoordinates = await getCoordinatesForAddress(destination);
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${latitude},${longitude}&destinations=${destinationCoordinates}&key=${apiKey}`;
    
    const response = await axios.get(url);
    const data = response.data;
  
    if (data.status === 'OK') {
      const etaDuration = data.rows[0].elements[0].duration.value;
      const currentTime = new Date();
      currentTime.setSeconds(currentTime.getSeconds() + etaDuration);
      return currentTime;
    } else {
      throw new Error('Error calculating ETA');
    }
  }
  
  async function getCoordinatesForAddress(address) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY; 
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${apiKey}`;
    
    const response = await axios.get(url);
    const data = response.data;
  
    if (data.status === 'OK') {
      const { lat, lng } = data.results[0].geometry.location;
      return `${lat},${lng}`;
    } else {
      throw new Error('Error fetching coordinates for destination');
    }
  }

app.get('/shipment/:id/eta', async (req, res) => {
    try {
      const shipment = await Shipment.findById(req.params.id);
      if (!shipment) return res.status(404).json({ message: 'Shipment not found' });
  
      const eta = shipment.currentETA;
      
      if (!eta) {
        return res.status(404).json({ message: 'ETA not found for this shipment' });
      }
  
      res.json({ eta });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  

app.post('/shipment', async (req, res) => {
    const { shipmentId, containerId, route, currentLocation, currentETA, status } = req.body;
    try {
        const newShipment = new Shipment({ shipmentId, containerId, route, currentLocation, currentETA, status });
        await newShipment.save();
        res.status(201).json(newShipment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));