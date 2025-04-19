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

export default router
