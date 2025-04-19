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
    const { data, error } = await supabase
      .from('customer_profiles')
      .insert({
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

export default router
