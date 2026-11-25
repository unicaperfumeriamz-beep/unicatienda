import jwt from 'jsonwebtoken';
import axios from 'axios';
const token = jwt.sign({ id: 1 }, 'super_secret_jwt_key', { expiresIn: '1h' });
axios.post('http://localhost:3000/api/checkout/create-order', {
  shippingAddress: '123 Fake St'
}, {
  headers: { Authorization: `Bearer ${token}` }
}).then(res => console.log(res.data)).catch(err => console.error(err.response ? err.response.data : err));
