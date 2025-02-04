const mongoose = require('mongoose');

const ShipmentSchema = new mongoose.Schema({
  shipmentId: { type: String, required: true, unique: true },
  containerId: { type: String, required: true },
  route: [{ type: String, required: true }],
  currentLocation: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  currentETA: { type: Date, required: true },
  status: { type: String, enum: ['In Transit', 'Delivered', 'Pending'], default: 'Pending' },
}, { timestamps: true });

const Shipment = mongoose.model('Shipment', ShipmentSchema);

module.exports = Shipment