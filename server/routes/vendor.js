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
    const { data, error } = await supabase.from('vendor_profiles').insert({
      user_id,
      phone,
      gst_number,
      certification,
      location,
      certification_image,
    })
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
    const { data, error } = await supabase.from('stalls').insert({
      vendor_id,
      name,
      location,
      lat,
      lng,
      cuisine,
      hygiene_score,
    })
    if (error) throw error
    res.status(200).json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// CREATE TABLE tags (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   name TEXT UNIQUE NOT NULL,  -- Tag name, e.g., "veg", "fast food"
//   created_at TIMESTAMP DEFAULT now()
// );

router.post('/createTag', async (req, res) => {
  try {
    const { name } = req.body
    const { data, error } = await supabase.from('tags').insert({ name })
    if (error) throw error
    res.status(200).json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// CREATE TABLE stall_tags (
//   stall_id UUID REFERENCES stalls(id) ON DELETE CASCADE,
//   tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
//   PRIMARY KEY (stall_id, tag_id)
// );

router.post('/createStallTag', async (req, res) => {
  try {
    const { stall_id, tag_id } = req.body
    const { data, error } = await supabase.from('stall_tags').insert({
      stall_id,
      tag_id,
    })
    if (error) throw error
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
    const { data, error } = await supabase.from('images').insert({
      stall_id,
      user_id,
      image_url,
    })
    if (error) throw error
    res.status(200).json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
