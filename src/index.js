import "dotenv/config"
import express from 'express'
//traer userRouter
import userRouter from './routes/users.routes.js' //importar userRouter para manejar las rutas de usuarios
import authRouter from './routes/auth.routes.js' //importar authRouter para manejar las rutas de autenticacion
import { apikeyMiddleware } from './middleware/apikey.middleware.js' //importar apikeyMiddleware para validar la API Key

//CREAR INSTANCIA
const app = express()
//llamar una variable de entorno del archivo .env
// hay que instalar dotenv con pnpm add dotenv
//PORT es el nombre de la variable de entorno
const PORT = process.env.PORT

//ESPECIFICAR JSON
app.use(express.json()) //para que express pueda entender JSON en el body de las peticiones

//MIDDLEWARES
app.use(apikeyMiddleware) //para validar la API Key

//LLAMAR A LOS ENDPOINTS
app.use("/", userRouter) //para manejar las rutas de usuarios
app.use("/auth", authRouter) //para manejar las rutas de autenticacion


//CREAR EL SERVIDOR
app.listen(PORT, () => {
    console.log(`server running in ${PORT} 🚀🚀🚀`)
})