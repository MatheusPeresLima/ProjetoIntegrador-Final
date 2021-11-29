import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../config'
import bcrypt from 'bcrypt'
import { checkToken } from '../../../auth'
import { is } from 'immer/dist/internal'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') getUser(req, res)
  else if (req.method === 'PUT') updateUser(req, res)
  else if (req.method === 'DELETE') deleteUser(req, res)
  else res.status(405).end(`Method ${req.method} Not Allowed`)
}

const getUser = async (req: NextApiRequest, res: NextApiResponse) => {
  const { auth, user } = await checkToken(req, res)

  if (!auth) return res.status(200).json({ error: 'Sem autorização' })
  else {
    const users = await prisma.users.findFirst({ where: { id: user?.id }, include: { orders: true } })
    res.status(200).json({ user: users })
  }
}

const updateUser = async (req: NextApiRequest, res: NextApiResponse) => {
  const { auth, user } = await checkToken(req, res)
  const { id }: any = req.query
  if (!auth) return res.status(200).json({ error: 'Sem autorização' })
  else if (!user?.admin && !user?.id === id) return res.status(200).json({ error: 'Sem autorização' })
  else {
    let { name, email, phone, password, zip, street, number, neighborhood, city, state, admin } = req.body

    if (!user?.admin) admin = false

    if (!id) return res.status(200).json({ error: 'ID Obrigatório' })
    else if (!(await prisma.users.findFirst({ where: { id } }))) res.status(404).json({ error: 'Usuario não encontrado' })
    else if (!name) return res.status(200).json({ error: 'Nome obrigatório!' })
    else if (!email) return res.status(200).json({ error: 'Email obrigatório!' })
    else if (await prisma.users.findFirst({ where: { email, NOT: { id } } })) return res.status(200).json({ error: 'Email já cadastrado!' })
    else if (!zip) return res.status(200).json({ error: 'CEP obrigatório!' })
    else if (!street) return res.status(200).json({ error: 'Rua obrigatória!' })
    else if (!number) return res.status(200).json({ error: 'Número obrigatório!' })
    else if (!neighborhood) return res.status(200).json({ error: 'Bairro obrigatório!' })
    else if (!city) return res.status(200).json({ error: 'Cidade obrigatória!' })
    else if (!state) return res.status(200).json({ error: 'UF obrigatório!' })
    else {
      let hash
      if (password) hash = bcrypt.hashSync(password, 10)

      const user = await prisma.users.update({
        where: { id },
        data: {
          name,
          email,
          phone,
          ...(password ? { hash } : {}),
          zip,
          street,
          number,
          neighborhood,
          city,
          state,
          admin
        }
      })
      res.status(200).json({ user: { id: user.id, name: user.name, email: user.email } })
    }
  }
}

const deleteUser = async (req: NextApiRequest, res: NextApiResponse) => {
  const { auth } = await checkToken(req, res)
  if (!auth) return res.status(200).json({ error: 'Sem autorização' })
  else {
    const { id }: any = req.query
    if (!id) return res.status(200).json({ error: 'Missing id' })
    else if (!(await prisma.users.findFirst({ where: { id } }))) res.status(404).json({ error: 'User not found' })
    else {
      const user = await prisma.users.delete({ where: { id } })
      res.status(200).json({ user: { id: user.id } })
    }
  }
}
