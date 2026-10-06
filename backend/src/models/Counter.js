import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: Number,
    default: 0
  }
});

/**
 * Atomically increment and return the next value for a named counter.
 * @param {string} name - Counter name (e.g., 'orderNumber')
 * @returns {Promise<number>} The next counter value
 */
counterSchema.statics.getNextValue = async function(name) {
  const counter = await this.findOneAndUpdate(
    { name },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  return counter.value;
};

const Counter = mongoose.model('Counter', counterSchema);
export default Counter;
