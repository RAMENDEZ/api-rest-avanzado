import jwt from 'jsonwebtoken' //importar jsonwebtoken para generar el token de autenticacion

export const authMiddleware = (req, res, next) => {//funcion que recibe req, res y next para validar la API Key
    const autheader = req.headers['authorization'] //sirve para obtener la API Key que viene en los headers de la peticion
    if (!autheader?.startsWith('Bearer ')) { //si no empieza con Bearer y bearer es la palabra que se usa para indicar que es un token de autenticacion
        return res.status(401).json({success: false, message: "Token Requerido..."}) //retornar error 401
    }
    
    const token = autheader.split(' ')[1] //separar el token de la palabra Bearer y obtener solo el token

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET) //verificar el token con la clave secreta del archivo .env y guardar el payload en req.user
        next() //si el token es valido, pasar al siguiente middleware o ruta
    } catch (error) {
        return res.status(401).json({success: false, message: "Token de acceso invalido..."}) //retornar error 401
    }
}