import { MercadoPagoConfig, Preference } from 'mercadopago';
const client = new MercadoPagoConfig({ accessToken: 'APP_USR-6043156222001743-100723-a023ae19f1870f0235c84dd92bb82f0b-3748828072' });
const preference = new Preference(client);
preference.create({ body: { items: [{ id: 'item-1', title: 'Test', quantity: 1, unit_price: 100 }] } })
  .then(res => { console.log("KEYS:", Object.keys(res)); console.log("id:", res.id, "init_point:", res.init_point); })
  .catch(err => console.error(err));
