//import routes
import express from 'express'
import supabase from '../db.js'
const router = express.Router()

// //CREATE TABLE customer_profiles (
//   user_id UUID PRIMARY KEY REFERENCES users(id),
//   home_city TEXT,
//   dietary_preferences JSONB,
//   health_sensitivity JSONB,
//   is_tourist BOOLEAN DEFAULT FALSE,
//   created_at TIMESTAMP DEFAULT now()
// );

router.post('/createCustomerProfile', async (req, res) => {
  try {
    const {
      user_id,
      home_city,
      dietary_preferences,
      health_sensitivity,
      is_tourist,
    } = req.body
    console.log("entered createCustomerProfile");
    
    const { data, error } = await supabase.from('customer_profiles').insert({
      user_id,
      home_city,
      dietary_preferences,
      health_sensitivity,
      is_tourist,
    })
    if (error) {
      return res.status(400).json({ error: error.message })
    }
    return res.status(200).json(data)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})

// CREATE TABLE reviews (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   stall_id UUID REFERENCES stalls(id),
//   user_id UUID REFERENCES users(id),
//   rating INTEGER CHECK (rating >= 1 AND rating <= 5),
//   review_text TEXT,
//   created_at TIMESTAMP DEFAULT now()
// );

router.post('/createReview', async (req, res) => {
  try {
    const { stall_id, user_id, rating, review_text } = req.body
    const { data, error } = await supabase.from('reviews').insert({
      stall_id,
      user_id,
      rating,
      review_text,
    })
    if (error) throw error
    res.status(200).json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// CREATE TABLE visits (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   user_id UUID REFERENCES users(id),
//   stall_id UUID REFERENCES stalls(id),
//   visited_at TIMESTAMP DEFAULT now()
// );

router.post('/createVisit', async (req, res) => {
  try {
    const { user_id, stall_id } = req.body
    const { data, error } = await supabase.from('visits').insert({
      user_id,
      stall_id,
    })
    if (error) throw error
    res.status(200).json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
