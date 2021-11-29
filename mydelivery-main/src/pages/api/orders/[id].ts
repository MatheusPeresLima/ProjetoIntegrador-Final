import { NextApiRequest, NextApiResponse } from 'next'
import { checkToken } from '../../../auth'
import prisma from '../../../config'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') getOrder(req, res)
  else if (req.method === 'PUT') updateOrder(req, res)
  else res.status(200).end(`Method ${req.method} Not Allowed`)
}

const getOrder = async (req: NextApiRequest, res: NextApiResponse) => {
  const { auth, user } = await checkToken(req, res)
  const { id }: any = req.query
  if (!auth || !user) return res.status(200).json({ error: 'Sem autorização' })
  else if (!req.query.id) return res.status(200).end('ID Obrigatório')
  else {
    const order = await prisma.orders.findFirst({ where: { id, userId: user.id } })
    res.status(200).json({ order })
  }
}

const updateOrder = async (req: NextApiRequest, res: NextApiResponse) => {
  const { auth, user } = await checkToken(req, res)
  if (!auth || !user?.admin) return res.status(200).json({ error: 'Sem autorização' })
  else {
    const { id }: any = req.query
    const { status }: any = req.body
    if (!id) return res.status(200).end('ID Obrigatório')
    else if (!status) return res.status(200).end('Status Obrigatório')
    else {
      const order = await prisma.orders.update({
        where: { id },
        data: { status }
      })
      res.status(200).json({ order })
    }
  }
}
