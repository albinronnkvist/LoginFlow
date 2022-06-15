import axios from 'axios';

// Create a new axios instance with custom defaults.
export default axios.create({
  baseURL: 'https://localhost:5001/api/v1'
});