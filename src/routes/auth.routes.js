import {Router} from 'express' //importar router de express
import {z} from 'zod' //importar zod para validar los datos de entrada
import bcrypt from 'bcryptjs' //importar bcrypt para encriptar la contraseña
import prisma from '../lib/prisma.js' //importar prisma para conectarse a la base de datos
import jwt from 'jsonwebtoken' //importar jsonwebtoken para generar el token de autenticacion

const authRouter = Router() //crear una instancia de router para manejar las rutas de autenticacion

const loginSchema = z.object({//definir un esquema de validacion para los datos que vienen del cliente
    email: z.string().email({message: "El email no es válido"}), //validar que sea un email válido
    password: z.string().min(8, "La clave es muy corta").max(24, "La clave es muy larga")
})

const validate = (schema) => (req, res, next) => { //funcion que recibe un esquema y devuelve una funcion que recibe req, res y next
        const result = schema.safeParse(req.body) //validar los datos que vienen del cliente con el esquema
        if (!result.success) { //si la validacion falla
            res.status(400).json({success: false, errors: result.error.flatten().fieldErrors}) 
        }
        req.validatedData = result.data //si la validacion es exitosa, se guarda los datos validados en req.validatedData
        next()
    }

authRouter.post("/login", validate(loginSchema), async (req, res) => { //ruta para login de usuario y validacion de datos con el esquema loginSchema
    const {email, password} = req.body //extraer email y password del body de la peticion
    
    //hacer toda la logistica para el inicio de sesion y buscar en la base de datos si el usuario existe y si la contraseña es correcta
    try {
        const student = await prisma.student.findUnique({where: {email}}) //buscar el usuario en la base de datos por email
        if(!student) { //si el usuario no existe
            return res.status(401).json({success: false, message: "Usuario no encontrado"}) //retornar error 404
        }

        const isPasswordValid = await bcrypt.compare(password, student.password) //comparar la contraseña ingresada con la contraseña encriptada en la base de datos
        if(!isPasswordValid) { //si la contraseña es incorrecta
            return res.status(401).json({success: false, message: "Contraseña incorrecta"}) //retornar error 401
        }

        const payload = {id: student.id, email: student.email, studentCode: student.studentCode} //crear un payload con el id y email del usuario
        const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "8h"}) //generar un token con el payload y la clave secreta del archivo .env y solo va a durar 8 horas
        res.status(200).json({success: true, access_token: token}) //retornar el token al cliente

    } catch (error) {
        //console.log(error)
        res.status(500).json({success: false, message: "Error interno del servidor"})
    }
})

export default authRouter //exportar la instancia de router para poder usarla en otros archivos