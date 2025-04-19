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
      .select()
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
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        stall_id,
        user_id,
        rating,
        review_text,
      })
      .select()
    if (error) throw error

    res.status(200).json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

//get all reviews for a stall
router.get('/getReviews/:stall_id', async (req, res) => {
  try {
    const { stall_id } = req.params
    console.log('testing ')

    const { data, error } = await supabase
      .from('reviews')
      .select('rating, review_text')
      .eq('stall_id', stall_id)
      .select()
    if (error) throw error
    res.status(200).json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.post('/getNearbyStalls', async (req, res) => {
  try {
    const { lat, lng, radius = 2500 } = req.body // lat, lng, and radius should be sent in the request body

    // Validate that lat, lng, and radius are provided
    if (!lat || !lng || !radius) {
      return res
        .status(400)
        .json({ error: 'Latitude, longitude, and radius are required.' })
    }

    // SQL query to get nearby stalls within the radius (radius in meters)
    const { data, error } = await supabase.rpc('get_nearby_stalls', {
      lat: lat,
      lng: lng,
      radius: radius || 2500,
    })

    // If there is an error in the RPC function call
    if (error) {
      return res.status(400).json({ error: error.message })
    }

    // Respond with the fetched data (nearby stalls)
    res.status(200).json(data)
  } catch (error) {
    console.error(error) // Log the error for debugging
    res
      .status(500)
      .json({ error: 'Something went wrong. Please try again later.' })
  }
})
router.post('/getKeywordStalls', async (req, res) => {
  try {
    const { keywords } = req.body

    if (!Array.isArray(keywords) || keywords.length === 0) {
      return res
        .status(400)
        .json({ error: 'keywords must be a non-empty array of strings' })
    }

    // Call Supabase function with keywords
    const { data, error } = await supabase
      .rpc('search_menu_items_by_traits_fuzzy', {
        keywords: keywords,
      })
      .select()
    if (error) {
      console.error('Supabase RPC error:', error)
      return res.status(500).json({ error: error.message })
    }
    res.status(200).json(data)
  } catch (err) {
    console.error('Server error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

//get all stalls
router.get('/getAllStalls', async (req, res) => {
  try {
    const { data, error } = await supabase.from('stalls').select()
    if (error) throw error
    res.status(200).json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})
//based on preference get the stalls
export default router
