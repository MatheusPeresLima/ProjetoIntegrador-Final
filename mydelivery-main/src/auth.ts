import jwt from 'jsonwebtoken'
import Cookies from 'cookies'
import { NextApiRequest, NextApiResponse } from 'next'
import { NextApiRequestCookies } from 'next/dist/server/api-utils'
import { IncomingMessage, ServerResponse } from 'http'

declare const process: {
  env: {
    JWT_SECRET: string
  }
}

interface PropsAuthJwt {
  id: string
  name: string
  email: string
  admin: boolean
}

interface PropsCheckToken {
  auth: boolean
  user?: {
    id: string
    name: string
    email: string
    admin: boolean
  }
}

export const checkToken = async (
  req: IncomingMessage & {
    cookies: NextApiRequestCookies
  },
  res: ServerResponse
): Promise<PropsCheckToken> => {
  try {
    const cookies = new Cookies(req, res)
    const token = cookies.get('token')
    if (token) {
      const user = <PropsAuthJwt>jwt.verify(token, process.env.JWT_SECRET)
      return { auth: true, user }
    }
    return { auth: false }
  } catch (e) {
    return { auth: false }
  }
}
