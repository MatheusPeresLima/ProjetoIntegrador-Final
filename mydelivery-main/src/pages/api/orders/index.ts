import { NextApiRequest, NextApiResponse } from 'next'
import { checkToken } from '../../../auth'
import prisma from '../../../config'
import { PropsCart } from '../../../redux/Stock.store'
import { customAlphabet } from 'nanoid'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') getOrders(req, res)
  else if (req.method === 'POST') postOrder(req, res)
  else res.status(200).end(`Method ${req.method} Not Allowed`)
}

const getOrders = async (req: NextApiRequest, res: NextApiResponse) => {
  const { auth, user } = await checkToken(req, res)
  if (!auth || !user) return res.status(200).json({ error: 'Sem autorização' })
  else {
    const orders = await prisma.orders.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, include: { items: true } })
    res.status(200).json({ orders })
  }
}

const postOrder = async (req: NextApiRequest, res: NextApiResponse) => {
  const { payment, cart }: { payment: string; cart: PropsCart[] } = req.body
  if (!payment) return res.status(200).json({ error: 'Pagamento obrigatório!' })
  else if (!cart.length) return res.status(200).json({ error: 'Carrinho vazio!' })
  else {
    const { auth, user } = await checkToken(req, res)
    if (!auth || !user) return res.status(200).json({ error: 'Sem autorização' })
    else {
      const amount = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
      const nanoid = customAlphabet('ABCDEFGHIJ0123456789', 10)
      const order = await prisma.orders.create({
        data: {
          cod: nanoid().toUpperCase(),
          payment: parseInt(payment),
          amount,
          userId: user.id
        }
      })
      cart.forEach(async item => {
        await prisma.orderItems.create({
          data: {
            orderId: order.id,
            name: item.name,
            price: parseFloat(item.price.toFixed(2)),
            quantity: item.quantity,
            image: item.image
          }
        })
      })
      res.status(200).json({ order })
    }
  }
}
