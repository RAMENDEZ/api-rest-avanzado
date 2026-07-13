export const apikeyMiddleware = (req, res, next) => {
    const apikey = req.headers['x-api-key'] //cuando haya una solicitud vamos a extraer el valor de un header que se llame x-api-key
    
    if (!apikey || apikey !== process.env.APIKEY) { //si no hay apikey o si la apikey no es igual a la que esta en el archivo .env
        return res.status(401).json({message: "API Key no valida"})
    }

    next() //si todo esta bien, se llama a next para que continue con la siguiente funcion

}