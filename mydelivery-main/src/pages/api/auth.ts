import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcrypt'
import prisma from '../../config'
import jwt from 'jsonwebtoken'
import Cookies from 'cookies'

declare const process: {
  env: {
    JWT_SECRET: string
  }
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') authLogin(req, res)
  else if (req.method === 'DELETE') deleteAuth(req, res)
  else res.status(200).end(`Method ${req.method} Not Allowed`)
}

const authLogin = async (req: NextApiRequest, res: NextApiResponse) => {
  const { email, password } = req.body
  if (!email) return res.status(200).json({ error: 'Email obrigatório!' })
  else if (!password) return res.status(200).json({ error: 'Senha obrigatória!' })
  else {
    const user = await prisma.users.findFirst({ where: { email } })
    if (!user) return res.status(200).json({ error: 'Usuário ou Senha incorreto!' })
    else if (!bcrypt.compareSync(password, user.hash)) return res.status(200).json({ error: 'Usuário ou Senha incorreto!' })
    else {
      const token = jwt.sign({ id: user.id, name: user.name, email: user.email, admin: user.admin }, process.env.JWT_SECRET)
      const cookies = new Cookies(req, res)
      cookies.set('token', token, { httpOnly: true })
      res
        .status(200)
        .json({ auth: true, address: [{ zip: user.zip, street: user.street, number: user.number, neighborhood: user.neighborhood, city: user.city, state: user.state }] })
    }
  }
}

const deleteAuth = async (req: NextApiRequest, res: NextApiResponse) => {
  const cookies = new Cookies(req, res)
  cookies.set('token')
  res.status(200).json({ auth: false })
}
