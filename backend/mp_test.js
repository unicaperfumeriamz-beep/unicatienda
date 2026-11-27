import { MercadoPagoConfig, Preference } from 'mercadopago';
const client = new MercadoPagoConfig({ accessToken: 'APP_USR-1517491838312595-112718-c7722c674102066292ce992e8ba10a1e-3710657511' });
const preference = new Preference(client);
preference.create({ body: { items: [{ id: 'item-1', title: 'Test UNICA Perfumería', quantity: 1, unit_price: 100 }] } })
  .then(res => { console.log("SUCCESS! id:", res.id, "init_point:", res.init_point); })
  .catch(err => console.error("CLIENT TOKEN ERROR:", err));
