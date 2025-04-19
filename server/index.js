import express from 'express'
import cors from 'cors'
import customerRouter from './routes/customer.js'
import vendorRouter from './routes/vendor.js'

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use('/customer', customerRouter)
app.use('/vendor', vendorRouter)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, '0.0.0.0', () => {
  console.log(`Example app listening on port ${port}`)
})
