// api.js

// Create Vendor Profile
export const createVendorProfile = async (vendorData) => {
  try {
    const response = await fetch('/api/createVendorProfile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vendorData),
    })

    if (response.ok) {
      const data = await response.json()
      console.log('Vendor profile created:', data)
      return data
    } else {
      const errorData = await response.json()
      console.log('Failed to create vendor profile:', errorData)
    }
  } catch (error) {
    console.error('Error creating vendor profile:', error)
  }
}

// Create Stall
export const createStall = async (stallData) => {
  try {
    const response = await fetch('/api/createStall', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stallData),
    })

    if (response.ok) {
      const data = await response.json()
      console.log('Stall created:', data)
      return data
    } else {
      const errorData = await response.json()
      console.log('Failed to create stall:', errorData)
    }
  } catch (error) {
    console.error('Error creating stall:', error)
  }
}

// Create Image
export const createImage = async (imageData) => {
  try {
    const response = await fetch('/api/createImage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(imageData),
    })

    if (response.ok) {
      const data = await response.json()
      console.log('Image uploaded:', data)
      return data
    } else {
      const errorData = await response.json()
      console.log('Failed to upload image:', errorData)
    }
  } catch (error) {
    console.error('Error uploading image:', error)
  }
}

// Create Order
export const createOrder = async (orderData) => {
  try {
    const response = await fetch('/api/createOrder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    })

    if (response.ok) {
      const data = await response.json()
      console.log('Order created:', data)
      return data
    } else {
      const errorData = await response.json()
      console.log('Failed to create order:', errorData)
    }
  } catch (error) {
    console.error('Error creating order:', error)
  }
}

// Create Menu Item
export const createMenuItem = async (menuItemData) => {
  try {
    const response = await fetch('', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(menuItemData),
    })

    if (response.ok) {
      const data = await response.json()
      console.log('Menu item created:', data)
      return data
    } else {
      const errorData = await response.json()
      console.log('Failed to create menu item:', errorData)
    }
  } catch (error) {
    console.error('Error creating menu item:', error)
  }
}

// Get Menu Items
export const getMenuItems = async (stall_id) => {
  try {
    const response = await fetch(
      'https://khalo-r5v5.onrender.com/vendor/getMenuItems', // ✅ updated route
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stall_id }),
      }
    )

    const data = await response.json()
    console.log(response.json())

    if (response.ok) {
      console.log('Menu items fetched:', data)
      return data
    } else {
      console.log('Failed to fetch menu items:', data)
      return []
    }
  } catch (error) {
    console.error('Error fetching menu items:', error)
    return []
  }
}
