import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    default: 'piece'
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  priceAtOrder: {
    type: Number,
    required: true,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: true });

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  changedByName: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String, trim: true }
}, { _id: false });

const modificationChangeSchema = new mongoose.Schema({
  field: { type: String, required: true },
  oldValue: { type: mongoose.Schema.Types.Mixed },
  newValue: { type: mongoose.Schema.Types.Mixed }
}, { _id: false });

const modificationHistorySchema = new mongoose.Schema({
  modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  modifiedByName: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  changes: [modificationChangeSchema],
  previousTotal: { type: Number, required: true },
  newTotal: { type: Number, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String
  },
  customerBusinessName: {
    type: String
  },
  status: {
    type: String,
    enum: ['placed', 'accepted', 'modified', 'preparing', 'ready', 'delivered', 'completed', 'cancelled'],
    default: 'placed'
  },
  items: {
    type: [orderItemSchema],
    validate: {
      validator: function(v) { return v.length > 0; },
      message: 'Order must have at least one item'
    }
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  itemCount: {
    type: Number,
    required: true,
    min: 1
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  paidAt: Date,
  paidMarkedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  internalNotes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  statusHistory: [statusHistorySchema],
  modificationHistory: [modificationHistorySchema]
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ customerId: 1, status: 1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;
