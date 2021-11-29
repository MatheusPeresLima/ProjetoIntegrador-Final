import { OrderItems, Orders, Users } from '.prisma/client'
import { Badge, Card, Col, Row, Typography, List, Divider, Select, Table, Tag, Tooltip } from 'antd'
import { Content } from 'antd/lib/layout/layout'
import axios from 'axios'
import { GetServerSideProps } from 'next'
import { FC, useEffect, useState } from 'react'
import { checkToken } from '../../auth'
import HeaderMainPanel from '../../components/HeaderMainPanel'
import { convertDateTime, numberToCurrency } from '../../helpers'
import Button from 'antd-button-color'
import Swal from 'sweetalert2'
import { Admin } from '@styled-icons/remix-line'
import { Admin as AdminFill } from '@styled-icons/remix-fill'
import styled from 'styled-components'
import { useDispatch } from 'react-redux'
import { setLoading } from '../../redux/Stock.store'

const Dashboard: FC = () => {
  const [activeTab, setActiveTab] = useState('pedidos')
  const [orders, setOrders] = useState<(Orders & { items: OrderItems[]; user: Users })[] | []>([])
  const [orderStatus, setOrderStatus] = useState('0')
  const [users, setUsers] = useState<Users[]>([])
  const dispatch = useDispatch()

  const updateStatus = async (id: string, status: number) => {
    let text = ''
    if (status === 1) text = 'Você confirma que vai sair para entrega?'
    if (status === 2) text = 'Você confirma que foi finalizado?'
    if (status === 3) text = 'Você confirma que vai cancelar?'
    Swal.fire({
      title: `Atenção`,
      text,
      showDenyButton: true,
      confirmButtonText: `Confirmar`,
      denyButtonText: `Cancelar`,
      icon: 'warning'
    }).then(async result => {
      if (result.isConfirmed) {
        await axios.put(`/api/orders/${id}`, { status }).then(() => {
          setOrders(
            orders.map(order => {
              if (order.id === id) {
                order.status = status
              }
              return order
            })
          )
        })
      }
    })
  }

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Total de Pedidos',
      dataIndex: 'orders',
      render: (text: string, record: any) => record.orders.length
    },
    {
      title: 'Admin',
      dataIndex: 'admin',
      key: 'admin',
      render: (admin: boolean) => (admin ? <Tag color='green'>Sim</Tag> : <Tag color='red'>Não</Tag>)
    },
    {
      dataIndex: 'admin',
      render: (admin: boolean, record: Users) => (
        <>
          {admin && (
            <Tooltip title='Remover Privilégios ADM'>
              <ItemIcon onClick={() => changeUserAdmin(record, false)}>
                <IconAdmin size={20} />
              </ItemIcon>
            </Tooltip>
          )}
          {!admin && (
            <Tooltip title='Adicionar Privilégios ADM'>
              <ItemIcon onClick={() => changeUserAdmin(record, true)}>
                <IconAdminFill size={20} />
              </ItemIcon>
            </Tooltip>
          )}
        </>
      )
    }
  ]

  const changeUserAdmin = async (user: Users, admin: boolean) => {
    dispatch(setLoading(true))
    await axios.put(`/api/users/${user.id}`, { ...user, admin }).then(() => {
      setUsers(users.map(u => (u.id === user.id ? { ...u, admin } : u)))
      dispatch(setLoading(false))
    })
  }

  useEffect(() => {
    axios.get('/api/orders/all').then(({ data }) => setOrders(data.orders || []))
    axios.get('/api/users').then(({ data }) => setUsers(data.users || []))
  }, [])
  return (
    <>
      <HeaderMainPanel title='MyDelivery | Painel' />
      <Content>
        <Row justify='center' style={{ marginTop: 35 }}>
          <Col>
            <Typography.Title level={3}>Painel</Typography.Title>
          </Col>
        </Row>
        <Row justify='center'>
          <Col span={18}>
            <Card
              tabList={[
                {
                  key: 'pedidos',
                  tab: <>Pedidos</>
                },
                {
                  key: 'usuarios',
                  tab: <>Usuarios</>
                }
              ]}
              activeTabKey={activeTab}
              tabBarExtraContent={
                activeTab === 'pedidos' && (
                  <>
                    <Select style={{ width: 300 }} size='large' defaultValue='0' onChange={value => setOrderStatus(value)}>
                      <Select.Option value=''>Todos</Select.Option>
                      <Select.Option value='0'>Em andamento</Select.Option>
                      <Select.Option value='1'>Saiu para entrega</Select.Option>
                      <Select.Option value='2'>Finalizado</Select.Option>
                      <Select.Option value='3'>Cancelado</Select.Option>
                    </Select>
                  </>
                )
              }
              onTabChange={key => {
                setActiveTab(key)
              }}
            >
              {activeTab === 'pedidos' && (
                <>
                  <List
                    dataSource={orderStatus === '' ? orders : orders.filter(order => order.status === Number(orderStatus))}
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
                              <Typography.Text style={{ marginLeft: 15 }} strong>{`Cliente: ${item.user.name}`}</Typography.Text>
                              <br />
                              <br />
                              {item.items.map(item => (
                                <Typography.Text strong key={item.id}>
                                  <Row>
                                    <Col style={{ minWidth: 145 }}>
                                      {item.quantity} x {item.name}
                                    </Col>
                                    {numberToCurrency(item.price * item.quantity)}
                                  </Row>
                                </Typography.Text>
                              ))}
                              <br />
                              Pagamento: {item.payment === 1 ? 'Dinheiro' : 'Cartão Crédito/Débito'}
                              <Row style={{ marginTop: 7 }}>
                                <Typography.Text> Total: {numberToCurrency(item.items.reduce((acc, item) => acc + item.price * item.quantity, 0))}</Typography.Text>
                              </Row>
                              <Row>
                                <Divider />
                                {item.status === 0 && (
                                  <>
                                    <Button type='primary' onClick={() => updateStatus(item.id, 3)} style={{ marginRight: 15 }} danger>
                                      Cancelar Pedido
                                    </Button>
                                    <Button type='warning' onClick={() => updateStatus(item.id, 1)} style={{ marginRight: 15 }}>
                                      Sair para entrega
                                    </Button>
                                  </>
                                )}
                                {item.status === 1 && (
                                  <>
                                    <Button type='success' onClick={() => updateStatus(item.id, 2)} style={{ marginRight: 15 }}>
                                      Finalizar
                                    </Button>
                                  </>
                                )}
                              </Row>
                            </>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </>
              )}
              {activeTab === 'usuarios' && (
                <>
                  <Table dataSource={users} columns={columns} />
                </>
              )}
            </Card>
          </Col>
        </Row>
      </Content>
    </>
  )
}

const ItemIcon = styled.div`
  display: block;
`

const IconAdmin = styled(Admin)`
  cursor: pointer;
  color: red;
`

const IconAdminFill = styled(AdminFill)`
  cursor: pointer;
  color: green;
`

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const { auth, user } = await checkToken(req, res)
  if (!auth) {
    return {
      redirect: {
        permanent: false,
        destination: '/login'
      }
    }
  } else if (!user?.admin) {
    return {
      redirect: {
        permanent: false,
        destination: '/'
      }
    }
  }
  return {
    props: {
      auth
    }
  }
}

export default Dashboard
