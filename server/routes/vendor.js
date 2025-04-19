import express from 'express'
import supabase from '../db.js'
const router = express.Router()

// CREATE TABLE vendor_profiles (
//   user_id UUID PRIMARY KEY REFERENCES users(id),
//   phone TEXT,
//   gst_number TEXT,
//   certification TEXT,
//   location TEXT,
//   certification_image TEXT,
//   created_at TIMESTAMP DEFAULT now()
// );

router.post('/createVendorProfile', async (req, res) => {
  try {
    const {
      user_id,
      phone,
      gst_number,
      certification,
      location,
      certification_image,
    } = req.body
    const { data, error } = await supabase
      .from('vendor_profiles')
      .insert({
        user_id,
        phone,
        gst_number,
        certification,
        location,
        certification_image,
      })
      .select()
    if (error) throw error
    res.status(200).json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// CREATE TABLE stalls (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   vendor_id UUID REFERENCES users(id),
//   name TEXT NOT NULL,
//   location TEXT,
//   lat DOUBLE PRECISION,
//   lng DOUBLE PRECISION,
//   cuisine TEXT,
//   hygiene_score INTEGER,
//   is_verified BOOLEAN DEFAULT FALSE,
//   created_at TIMESTAMP DEFAULT now()
// );

router.post('/createStall', async (req, res) => {
  try {
    const { vendor_id, name, location, lat, lng, cuisine, hygiene_score } =
      req.body
    const { data, error } = await supabase
      .from('stalls')
      .insert({
        vendor_id,
        name,
        location,
        lat,
        lng,
        cuisine,
        hygiene_score,
      })
      .select()
    if (error) throw error
    console.log(data)
    res.status(200).json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// CREATE TABLE images (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   stall_id UUID REFERENCES stalls(id),
//   user_id UUID REFERENCES users(id),
//   image_url TEXT,
//   uploaded_at TIMESTAMP DEFAULT now()
// );

router.post('/createImage', async (req, res) => {
  try {
    const { stall_id, user_id, image_url } = req.body
    const { data, error } = await supabase
      .from('images')
      .insert({
        stall_id,
        user_id,
        image_url,
      })
      .select()
    if (error) throw error
    res.status(200).json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// CREATE TABLE orders (
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     stall_id UUID REFERENCES stalls(id) ON DELETE CASCADE,
//     customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
//     menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,  -- Optional
//     order_value NUMERIC(10, 2) DEFAULT 0.00,
//     order_expenses NUMERIC(10, 2) DEFAULT 0.00,
//     date TIMESTAMP DEFAULT now(),
//     created_at TIMESTAMP DEFAULT now(),
//     updated_at TIMESTAMP DEFAULT now()
// );

router.post('/createOrder', async (req, res) => {
  try {
    const { stall_id, customer_id, menu_item_id, order_value, order_expenses } =
      req.body
    const { data, error } = await supabase
      .from('orders')
      .insert({
        stall_id,
        customer_id,
        menu_item_id,
        order_value,
        order_expenses,
      })
      .select()
    if (error) throw error
    res.status(200).json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
