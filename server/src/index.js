import express from "express"
import cors from "cors"
import "dotenv/config"
import authRoutes from "./routes/auth.routes.js"
import { connectDB } from "./db/connectDB.js"

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({
    origin: "*"
}))
app.use(express.json())

app.use("/auth", authRoutes)

app.get("/", (req, res) => {
    res.send("Hello from the server!")
})

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })
}).catch((error) => {
    console.error("Failed to connect to the database:", error)
})