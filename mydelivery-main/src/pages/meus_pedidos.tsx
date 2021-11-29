import { OrderItems, Orders } from '.prisma/client'
import { Card, Col, Row, Typography, List, Divider, Badge } from 'antd'
import { Content } from 'antd/lib/layout/layout'
import axios from 'axios'
import { GetServerSideProps } from 'next'
import { FC, Fragment, useEffect, useState } from 'react'
import { checkToken } from '../auth'
import HeaderMain from '../components/HeaderMain'
import { convertDateTime, numberToCurrency } from '../helpers'

interface PropsMeusPedidos {
  auth: boolean
  user: {
    id: string
    name: string
    email: string
  }
}

const MeusPerdidos: FC<PropsMeusPedidos> = ({ auth }) => {
  const [orders, setOrders] = useState<(Orders & { items: OrderItems[] })[] | []>([])

  useEffect(() => {
    axios.get('/api/orders').then(res => setOrders(res.data.orders || []))
  }, [])
  return (
    <>
      <HeaderMain title='MyDelivery | Meus Pedidos' auth={auth} />
      <Content>
        <Row justify='center' style={{ marginTop: 35 }}>
          <Col>
            <Typography.Title level={3}>Pedido(s)</Typography.Title>
          </Col>
        </Row>
        <Row justify='center'>
          <Col md={12}>
            <Card>
              <List
                dataSource={orders}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <>
                          <Divider>{`Pedido: ${item.cod} - ${convertDateTime(item.createdAt.toString())}`}</Divider>
                        </>
                      }
                      description={
                        <>
                          {item.status === 0 && <Badge status='processing' text='Em andamento' />}
                          {item.status === 1 && <Badge status='warning' text='Saiu para entrega' />}
                          {item.status === 2 && <Badge status='success' text='Finalizado' />}
                          {item.status === 3 && <Badge status='error' text='Cancelado' />}
                          <br />
                          Pagamento: {item.payment === 1 ? 'Dinheiro' : 'Cartão Crédito/Débito'}
                          {item.items.map(item => (
                            <Fragment key={item.id}>
                              <Row>
                                <Col style={{ minWidth: 145 }}>
                                  {item.quantity} x {item.name}
                                </Col>
                                {numberToCurrency(item.price * item.quantity)}
                              </Row>
                            </Fragment>
                          ))}
                          <Row style={{ marginTop: 7 }}>
                            <Typography.Text> Total: {numberToCurrency(item.items.reduce((acc, item) => acc + item.price * item.quantity, 0))}</Typography.Text>
                          </Row>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </Content>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const { auth } = await checkToken(req, res)
  if (!auth) {
    return {
      redirect: {
        permanent: false,
        destination: '/login'
      }
    }
  }
  return {
    props: {
      auth
    }
  }
}

export default MeusPerdidos
