import { PrismaClient } from '@prisma/client'
import {PrismaPg} from '@prisma/adapter-pg'

const adapter = new PrismaPg(process.env.DATABASE_URL) //adaptador que se conecta a postgres
const prisma = new PrismaClient({adapter}) //Cliente que recibe la configuracion de donde se conecta

export default prisma //exportamos la instancia de prisma para poder usarla en otros archivos