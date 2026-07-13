//Importar solo lo que se necesita para los ENDPOINT
//No llamar a toda la libreria Express
import {Router} from 'express'
import prisma from '../lib/prisma.js'
import {z} from 'zod' //mandar a traer zod para validar los datos que vienen del cliente
import bcrypt from 'bcryptjs'; // O 'bcrypt', dependiendo de cuál use tu tutor
//para no solo crear o usar cualquier ENDPOINT, vamos a darle un nivel mas de seguridad, 
// para eso vamos a importar un middleware que se encargue de validar la API Key que viene en los headers de la peticion
import {authMiddleware} from '../middleware/auth.middleware.js'

const userRouter = Router()
//instalar Zod pnpm add zod
const studentSchema = z.object({ //definir un esquema de validacion para los datos que vienen del cliente
    studentCode: z.string().min(5, {message: "El código de estudiante debe tener al menos 5 caracteres"}), //validar que sea un string y que tenga al menos 5 caracteres
    firstName: z.string().min(2, {message: "El nombre debe tener al menos 5 caracteres"}), //validar que sea un string y que tenga al menos 2 caracteres
    lastName: z.string().min(2, {message: "El apellido debe tener al menos 2 caracteres"}), //validar que sea un string y que tenga al menos 2 caracteres
    email: z.string().email({message: "El email no es válido"}), //validar que sea un email válido
    password: z.string().min(6, {message: "La contraseña debe tener al menos 6 caracteres"}), //validar que sea un string y que tenga al menos 6 caracteres
    phone: z.string().optional(), //validar que sea un string y que sea opcional
    birthDate: z.string().optional() //validar que sea una fecha y que sea opcional
})

    const validate = (schema) => (req, res, next) => { //funcion que recibe un esquema y devuelve una funcion que recibe req, res y next
        const result = schema.safeParse(req.body) //validar los datos que vienen del cliente con el esquema
        if (!result.success) { //si la validacion falla
            res.status(400).json({success: false, errors: result.error.flatten().fieldErrors}) 
        }
        req.validatedData = result.data //si la validacion es exitosa, se guarda los datos validados en req.validatedData
        next()
    }
 
//ENDPOINT DE TIPO GET
userRouter.get("/", async (req, res) => {
    // BUSCAR EN LA BASE DE DATOS
    try {
        const students = await prisma.student.findMany()
        res.status(200).json({success: true, students})
    } catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: "Error interno del servidor"})
    }
})

//ENDPOINT DE TIPO POST, tambien vamos a hacer asincrono para poder guardar en la base de datos
userRouter.post("/create", authMiddleware, validate(studentSchema), async (req, res) => {// se agrega authMiddleware para validar la API Key
    // y validate(studentSchema) para validar los datos que vienen del cliente con el esquema studentSchema
    //nuevo codigo para guardar en la base de datos
    //EXTRACCION DE LOS DATOS
    const {studentCode, firstName, lastName, email, password, phone, birthDate} = req.body
   
    try {
        const hashedPassword = await bcrypt.hash(password, 12) //encriptar la contraseña con bcrypt
        const newStudent = await prisma.student.create({
           data: {
             "studentCode": studentCode, 
            "firstName": firstName,
            "lastName": lastName,
            "email": email,
            "password": hashedPassword,
            "phone": phone,
            "birthDate": birthDate ? new Date(birthDate) : null
           }
        })
        res.status(201).json({success: true, message: "Estudiante creado exitosamente", student: newStudent})
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, message: "Error interno del servidor"})}
    })


    /*const {name, age} = req.body
    if (!name || !age){
        return res.status(400).json({message: "Faltan datos: nombre o edad"})
    }
    res.status(201).json({message: `El usuario ${name} de ${age} se ha creado`})*/


//VAMOS A ACTUALIZAR
// cuando hay : es para obtener un dato dinamico
userRouter.put("/update/:id", async (req, res) => {
    const { id } = req.params 
    const {studentCode, firstName, lastName, email, password, phone, birthDate} = req.body

    try {
        const hashedPassword = await bcrypt.hash(password, 12)
        const updatedStudent = await prisma.student.update({
            where: { id: parseInt(id) },
            data: {
             "studentCode": studentCode, 
            "firstName": firstName,
            "lastName": lastName,
            "email": email,
            "password": hashedPassword, //encriptar la contraseña con bcrypt
            "phone": phone,
            "birthDate": birthDate ? new Date(birthDate) : null
           }
        })
         res.status(200).json({success: true, message: "Estudiante creado exitosamente", student: newStudent})
   } catch (error) {
        res.status(500).json({success: false, message: "Error interno del servidor"})
    }
})

//VAMOS A ELIMINAR
userRouter.delete("/delete/:id", async (req, res) => {
    const { id } = req.params 
    try {
        const deletedStudent = await prisma.student.delete({
            where: { id: parseInt(id) }
        })
        res.status(200).json({success: true, data: deletedStudent})
    } catch (error) {
    res.status(500).json({success: false, message: "Error interno del servidor"})
    }
})


export default userRouter