import express from 'express'
import supabase from '../db.js'
const router = express.Router()
// CREATE TABLE vendor_profiles (
//   user_id UUID PRIMARY KEY REFERENCES users(id),
//   phone TEXT,
//   gst_number TEXT,
//   certification TEXT,
//   location TEXT,
//   certification_image TEXT,  -- image of certification
//   profile_image TEXT,        -- ✅ new field for profile image
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
      profile_image,
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
        profile_image,
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
    const { vendor_id, name, lat, lng, cuisine, hygiene_score, is_verified } =
      req.body
    const { data, error } = await supabase
      .from('stalls')
      .insert({
        vendor_id,
        name,
        location: `POINT(${lng} ${lat})`, // Insert the geospatial location as a valid SQL statement
        cuisine,
        hygiene_score,
        is_verified,
      })
      .select()

    if (error) throw error

    console.log(data)
    res.status(200).json(data)
  } catch (error) {
    console.error(error)
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

// CREATE TABLE menu_items (
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- Unique menu item ID
//     stall_id UUID REFERENCES stalls(id) ON DELETE CASCADE,  -- Reference to the stall (foreign key)
//     name TEXT NOT NULL,  -- Name of the menu item
//     description TEXT,  -- Description of the menu item
//     price NUMERIC(10, 2) NOT NULL,  -- Price of the menu item
//     category TEXT,  -- Optional category (e.g., appetizer, main course, dessert)
//     image_url TEXT,  -- Optional image of the menu item
//     traits JSONB DEFAULT '{}',  -- JSONB column to store dynamic traits
//     created_at TIMESTAMP DEFAULT now(),  -- When the item was added to the menu
//     updated_at TIMESTAMP DEFAULT now()  -- When the item was last updated
// );

router.post('/createMenuItem', async (req, res) => {
  try {
    const { stall_id, name, description, price, category, image_url, traits } =
      req.body
    const { data, error } = await supabase
      .from('menu_items')
      .insert({
        stall_id,
        name,
        description,
        price,
        category,
        image_url,
        traits,
      })
      .select()
    if (error) throw error
    res.status(200).json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.post('/getMenuItems', async (req, res) => {
  try {
    const { stall_id } = req.body
    const { data, error } = await supabase
      .from('menu_items')
      .select()
      .eq('stall_id', stall_id)
    if (error) throw error
    res.status(200).json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get all stalls for a specific vendor
router.post('/getVendorStalls', async (req, res) => {
  try {
    const { vendor_id } = req.body
    
    if (!vendor_id) {
      return res.status(400).json({ error: 'Vendor ID is required' })
    }
    
    const { data, error } = await supabase
      .from('stalls')
      .select('*, images(*)')
      .eq('vendor_id', vendor_id)
    
    if (error) throw error
    
    res.status(200).json(data)
  } catch (error) {
    console.error('Error fetching vendor stalls:', error)
    res.status(400).json({ error: error.message })
  }
})

export default router
