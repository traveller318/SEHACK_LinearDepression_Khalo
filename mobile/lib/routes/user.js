// router.post('/createReview', async (req, res) => {
//   try {
//     const { stall_id, user_id, rating, review_text } = req.body
//     const { data, error } = await supabase
//       .from('reviews')
//       .insert({
//         stall_id,
//         user_id,
//         rating,
//         review_text,
//       })
//       .select()
//     if (error) throw error

//     res.status(200).json(data)
//   } catch (error) {
//     res.status(400).json({ error: error.message })
//   }
// })

export const createReview = async (stall_id, user_id, rating, review_text) => {
  try {
    const response = await fetch(
      'https://khalo-r5v5.onrender.com/customer/createReview',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stall_id,
          user_id,
          rating,
          review_text,
        }),
      }
    )

    // Check if the response is successful
    if (response.ok) {
      const data = await response.json()
      console.log('Review created successfully:', data)
    } else {
      const errorData = await response.json()
      console.log('Failed to create review:', errorData)
    }
  } catch (error) {
    console.error('Error creating review:', error)
  }
}

export const getStallReview = async (stall_id) => {
  try {
    const response = await fetch(
      `https://khalo-r5v5.onrender.com/customer/getReviews/${stall_id}`
    )
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching stall reviews:', error)
    return []
  }
}

export const getKeywordStalls = async (keywords) => {
  try {
    const response = await fetch(
      'https://khalo-r5v5.onrender.com/customer/getKeywordStalls',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywords,
        }),
      }
    )
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching keyword stalls:', error)
    return []
  }
}

export const getSingleStall = async (stall_id) => {
  try {
    const response = await fetch(`/api/getSingleStall`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stall_id,
      }),
    })

    // Check if the response is successful
    if (response.ok) {
      const data = await response.json()
      console.log('Stall data:', data)
      return data // You can use this data as needed
    } else {
      const errorData = await response.json()
      console.log('Failed to fetch stall data:', errorData)
    }
  } catch (error) {
    console.error('Error fetching stall data:', error)
  }
}
