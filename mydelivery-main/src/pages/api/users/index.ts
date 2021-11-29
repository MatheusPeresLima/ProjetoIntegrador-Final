import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../config'
import bcrypt from 'bcrypt'
import { checkToken } from '../../../auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') getUsers(req, res)
  else if (req.method === 'POST') postUser(req, res)
  else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

const getUsers = async (req: NextApiRequest, res: NextApiResponse) => {
  const { auth, user } = await checkToken(req, res)

  if (!auth) return res.status(200).json({ error: 'Sem autorização' })
  else {
    const users = await prisma.users.findMany({ ...(!user?.admin && { where: { id: user?.id } }), include: { orders: true } })
    res.status(200).json({ users })
  }
}

const postUser = async (req: NextApiRequest, res: NextApiResponse) => {
  const { name, email, phone, password, zip, street, number, neighborhood, city, state } = req.body

  if (!name) return res.status(200).json({ error: 'Nome obrigatório!' })
  else if (!email) return res.status(200).json({ error: 'Email obrigatório!' })
  else if (await prisma.users.findFirst({ where: { email } })) return res.status(200).json({ error: 'Email já cadastrado!' })
  else if (!password) return res.status(200).json({ error: 'Senha obrigatória!' })
  else if (!zip) return res.status(200).json({ error: 'CEP obrigatório!' })
  else if (!street) return res.status(200).json({ error: 'Rua obrigatória!' })
  else if (!number) return res.status(200).json({ error: 'Número obrigatório!' })
  else if (!neighborhood) return res.status(200).json({ error: 'Bairro obrigatório!' })
  else if (!city) return res.status(200).json({ error: 'Cidade obrigatória!' })
  else if (!state) return res.status(200).json({ error: 'UF obrigatório!' })
  else {
    const hash = bcrypt.hashSync(password, 10)
    const user = await prisma.users.create({
      data: {
        name,
        email,
        phone,
        hash,
        zip,
        street,
        number,
        neighborhood,
        city,
        state,
        admin: false
      }
    })
    res.status(200).json({ user: { id: user.id, name: user.name, email: user.email } })
  }
}
