import { NextApiRequest, NextApiResponse } from 'next'
import { checkToken } from '../../../auth'
import prisma from '../../../config'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') getOrders(req, res)
  else res.status(200).end(`Method ${req.method} Not Allowed`)
}

const getOrders = async (req: NextApiRequest, res: NextApiResponse) => {
  const { auth, user } = await checkToken(req, res)
  if (!auth || !user?.admin) return res.status(200).json({ error: 'Sem autorização' })
  else {
    const orders = await prisma.orders.findMany({ orderBy: { createdAt: 'desc' }, include: { items: true, user: true } })
    res.status(200).json({ orders })
  }
}
