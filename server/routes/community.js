import express from 'express'
import supabase from '../db.js'

const router = express.Router()

// CREATE TABLE posts (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),           -- Unique post ID
//   user_id UUID REFERENCES users(id) ON DELETE CASCADE,     -- Author of the post
//   title TEXT NOT NULL,                                     -- Title
//   content TEXT,                                            -- Optional content
//   image_url TEXT,                                          -- Optional image
//   tags TEXT[],                                             -- Optional tags
//   location GEOGRAPHY(Point, 4326),                         -- Geolocation (longitude, latitude)
//   upvotes INTEGER DEFAULT 0,                               -- Upvote count
//   created_at TIMESTAMP DEFAULT now(),                      -- When created
//   updated_at TIMESTAMP DEFAULT now()                       -- When last updated
// );

router.post('/createPost', async (req, res) => {
  const { lat, lng, title, content, image_url, tags, user_id } = req.body

  try {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id,
        title,
        content,
        image_url,
        tags,
        location: `POINT(${lng} ${lat})`,
      })
      .select()

    if (error) {
      throw error
    }

    res.status(200).json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

//get nearby posts of radius 2km
router.post('/getNearbyPosts', async (req, res) => {
  try {
    const { lat, lng, radius } = req.body // lat, lng, and radius should be sent in the request body

    // Validate that lat, lng, and radius are provided
    if (!lat || !lng || !radius) {
      return res
        .status(400)
        .json({ error: 'Latitude, longitude, and radius are required.' })
    }

    // SQL query to get nearby stalls within the radius (radius in meters)
    const { data, error } = await supabase.rpc('get_nearby_posts', {
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

//upvote a post without rpc
router.post('/upvotePost', async (req, res) => {
  try {
    const { post_id } = req.body

    const { data, error } = await supabase
      .from('posts')
      .select()
      .eq('id', post_id)
      .single()

    if (error) throw error

    const { upvotes } = data

    const { data: updatedPost, error: updateError } = await supabase
      .from('posts')
      .update({
        upvotes: upvotes + 1,
      })
      .eq('id', post_id) // ✅ This line fixes the issue
      .select()
      .single()

    if (updateError) throw updateError

    res.status(200).json(updatedPost)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.post('/downvotePost', async (req, res) => {
  try {
    const { post_id } = req.body

    const { data, error } = await supabase
      .from('posts')
      .select()
      .eq('id', post_id)
      .single()

    if (error) throw error

    const { upvotes, downvotes } = data

    const { data: updatedPost, error: updateError } = await supabase
      .from('posts')
      .update({
        upvotes: upvotes - 1,
      })
      .eq('id', post_id) // ✅ This line fixes the issue
      .select()
      .single()

    if (updateError) throw updateError

    res.status(200).json(updatedPost)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

export default router
