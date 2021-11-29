import { Col, Row, InputNumber, Form, Card, Image, Divider, Button, Badge, List, Avatar, Select, Tooltip } from 'antd'
import { Content } from 'antd/lib/layout/layout'
import { Typography } from 'antd'
import type { GetServerSideProps } from 'next'
import styled from 'styled-components'
import { FC, useEffect, useState } from 'react'
const { Title, Text } = Typography
import { ShoppingCart } from '@styled-icons/remix-line'
import { CheckmarkCircle } from '@styled-icons/ionicons-sharp'
import { Trash } from '@styled-icons/octicons'
import { Hamburger, MoneyBill } from '@styled-icons/fa-solid'
import { CreditCard } from '@styled-icons/bootstrap'
import { DrinkToGo, Add } from '@styled-icons/fluentui-system-filled'
import { Minus } from '@styled-icons/boxicons-regular'
import { listDrinksInit, listFoodsInit } from '../data'
import { numberToCurrency, randomInt } from '../helpers'
import { checkToken } from '../auth'
import HeaderMain from '../components/HeaderMain'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import { addItemCart, clearCart, removeItemCart, setLoading, updateItemCart } from '../redux/Stock.store'
import axios from 'axios'
import Swal from 'sweetalert2'

interface PropsHome {
  auth: boolean
  user: {
    id: string
    name: string
    email: string
  }
}

const Home: FC<PropsHome> = ({ auth }) => {
  const [activeTab, setActiveTab] = useState('lanches')
  const [listFoods] = useState(listFoodsInit)
  const [listDrinks] = useState(listDrinksInit)
  const [address, setAddress] = useState([])
  const stock = useSelector((state: RootState) => state.stock)
  const dispatch = useDispatch()
  const [timeDelivery, setTimeDelivery] = useState(0)

  const onFinish = (values: any) => {
    const data = { ...values, cart: stock.cart }
    dispatch(setLoading(true))
    axios.post('/api/orders', data).then(({ data }) => {
      if (data.error) {
        Swal.fire('Ops!', data.error, 'error')
      } else {
        Swal.fire('Sucesso!', 'Pedido realizado com sucesso!', 'success')
        dispatch(clearCart())
      }
      dispatch(setLoading(false))
    })
  }

  useEffect(() => {
    setAddress(JSON.parse(localStorage.getItem('address') || '[]'))
    setTimeDelivery(randomInt(25, 38))
  }, [])
  return (
    <>
      <HeaderMain title='MyDelivery | Fazer Pedido' auth={auth} />
      <Content>
        <Row justify='center' style={{ marginTop: 35 }}>
          <Col>
            <Title level={3}>Fazer Pedido</Title>
          </Col>
        </Row>
        <Row justify='center'>
          <Col span={16}>
            <Card
              tabList={[
                {
                  key: 'lanches',
                  tab: (
                    <>
                      <Badge
                        count={stock.cart.filter(lc => [1, 2, 3, 4].includes(lc.id)).length}
                        offset={[108, 0]}
                        showZero
                        style={{
                          background: !stock.cart.filter(lc => [1, 2, 3, 4].includes(lc.id)).length ? '#d1d1d1' : ''
                        }}
                      />
                      Lanches <IconHamburger size={20} />
                    </>
                  )
                },
                {
                  key: 'bebidas',
                  tab: (
                    <>
                      <Badge
                        count={stock.cart.filter(lc => [5, 6, 7, 8].includes(lc.id)).length}
                        offset={[108, 0]}
                        showZero
                        style={{
                          background: !stock.cart.filter(lc => [5, 6, 7, 8].includes(lc.id)).length ? '#d1d1d1' : ''
                        }}
                      />
                      Bebidas <IconDrinkToGo size={25} />
                    </>
                  )
                },
                {
                  key: 'carrinho',
                  tab: (
                    <>
                      <Badge
                        count={stock.cart.length}
                        offset={[114, 0]}
                        showZero
                        style={{
                          background: !stock.cart.length ? '#d1d1d1' : ''
                        }}
                      />
                      Carrinho <IconShoppingCart size={25} />
                    </>
                  )
                }
              ]}
              activeTabKey={activeTab}
              onTabChange={key => {
                setActiveTab(key)
              }}
              tabBarExtraContent={
                <TabExtraContent>
                  <ItemTrash
                    count={stock.cart.length}
                    onClick={() => {
                      dispatch(clearCart())
                    }}
                  >
                    <IconTrash size={18} />
                    Esvaziar Carrinho
                  </ItemTrash>
                  <Text style={{ fontSize: 15, fontWeight: 800, marginLeft: 30 }}>Total:</Text>
                  <PriceAmount>{numberToCurrency(stock.cart.reduce((acc, lc) => acc + lc.price * lc.quantity, 0))}</PriceAmount>
                </TabExtraContent>
              }
            >
              {activeTab === 'lanches' && (
                <>
                  <Row justify='center' style={{ marginTop: 50 }}>
                    {listFoods.map(food => (
                      <Col span={12} key={food.id}>
                        <Divider style={{ marginTop: 0 }}>{food.name}</Divider>
                        <ContentImage>
                          <ItemImg
                            onClick={() => {
                              if (stock.cart.find(cart => cart.id === food.id)) dispatch(removeItemCart(food))
                              else dispatch(addItemCart({ ...food, quantity: 1 }))
                            }}
                          >
                            <Image preview={false} src={food.image} height={150} alt={food.name}></Image>
                            <IconCheckmarkCircle selected={stock.cart.find(lc => lc.id === food.id) ? true : false} size={30} />
                          </ItemImg>
                          <ItemLeft>
                            <Tooltip title='Remover'>
                              <Button
                                shape='circle'
                                size='middle'
                                disabled={stock.cart.find(lc => lc.id === food.id)?.quantity === 1 || !stock.cart.find(cart => cart.id === food.id)}
                                onClick={() => {
                                  const sc = stock.cart.find(lc => lc.id === food.id)
                                  if (sc && sc?.quantity > 1) dispatch(updateItemCart({ ...food, quantity: sc?.quantity - 1 }))
                                }}
                                danger
                                icon={<IconMinus size={20} />}
                              />
                            </Tooltip>
                          </ItemLeft>
                          <ItemRight>
                            <Tooltip title='Adicionar'>
                              <Button
                                shape='circle'
                                size='middle'
                                disabled={!stock.cart.find(cart => cart.id === food.id)}
                                onClick={() => {
                                  const sc = stock.cart.find(lc => lc.id === food.id)
                                  if (sc) dispatch(updateItemCart({ ...food, quantity: sc?.quantity + 1 }))
                                }}
                                danger
                                icon={<IconAdd size={20} />}
                              />
                            </Tooltip>
                          </ItemRight>
                        </ContentImage>
                        <Row justify='center' style={{ marginTop: 20 }}>
                          <Col>
                            <Form.Item label='Qnt.'>
                              <InputNumber
                                min={1}
                                disabled={!stock.cart.find(lc => lc.id === food.id)}
                                value={stock.cart.find(lc => lc.id === food.id)?.quantity || 1}
                                onChange={value => {
                                  dispatch(updateItemCart({ ...food, quantity: value }))
                                }}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Description>
                          <TextPrice>{numberToCurrency(food.price)}</TextPrice>
                          {!stock.cart.find(lc => lc.id === food.id) && (
                            <Button
                              type='primary'
                              danger
                              ghost
                              onClick={() => {
                                if (stock.cart.find(cart => cart.id === food.id)) dispatch(removeItemCart(food))
                                else dispatch(addItemCart({ ...food, quantity: 1 }))
                              }}
                            >
                              Selecionar
                            </Button>
                          )}
                          {stock.cart.find(lc => lc.id === food.id) && (
                            <Button
                              type='primary'
                              danger
                              onClick={() => {
                                dispatch(removeItemCart(food))
                              }}
                            >
                              Remover
                            </Button>
                          )}
                        </Description>
                      </Col>
                    ))}
                  </Row>
                </>
              )}

              {activeTab === 'bebidas' && (
                <>
                  <Row justify='center' style={{ marginTop: 50 }}>
                    {listDrinks.map(drink => (
                      <Col span={12} key={drink.id}>
                        <Divider style={{ marginTop: 0 }}>{drink.name}</Divider>
                        <ItemImg
                          onClick={() => {
                            if (stock.cart.find(cart => cart.id === drink.id)) dispatch(removeItemCart(drink))
                            else dispatch(addItemCart({ ...drink, quantity: 1 }))
                          }}
                        >
                          <Image preview={false} src={drink.image} height={150}></Image>
                          <IconCheckmarkCircle selected={stock.cart.find(lc => lc.id === drink.id) ? true : false} size={30} />
                        </ItemImg>
                        <Row justify='center' style={{ marginTop: 20 }}>
                          <Col>
                            <Form.Item label='Qnt.'>
                              <InputNumber
                                min={0}
                                disabled={!stock.cart.find(lc => lc.id === drink.id)}
                                value={stock.cart.find(lc => lc.id === drink.id)?.quantity || 0}
                                onChange={value => {
                                  dispatch(updateItemCart({ ...drink, quantity: value }))
                                }}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Description>
                          <Divider style={{ marginTop: 0 }}>{drink.name}</Divider>
                          <TextPrice>{numberToCurrency(drink.price)}</TextPrice>
                          {!stock.cart.find(lc => lc.id === drink.id) && (
                            <Button
                              type='primary'
                              danger
                              ghost
                              onClick={() => {
                                if (stock.cart.find(cart => cart.id === drink.id)) dispatch(removeItemCart(drink))
                                else dispatch(addItemCart({ ...drink, quantity: 1 }))
                              }}
                            >
                              Selecionar
                            </Button>
                          )}
                          {stock.cart.find(lc => lc.id === drink.id) && (
                            <Button
                              type='primary'
                              danger
                              onClick={() => {
                                dispatch(removeItemCart(drink))
                              }}
                            >
                              Remover
                            </Button>
                          )}
                        </Description>
                      </Col>
                    ))}
                  </Row>
                </>
              )}

              {activeTab === 'carrinho' && (
                <>
                  <Row justify='center'>
                    <Col span={24}>
                      <List
                        dataSource={stock.cart}
                        header={<Title level={5}>Item(s)</Title>}
                        renderItem={item => (
                          <List.Item actions={[<>{numberToCurrency(item.price * item.quantity)}</>]}>
                            <List.Item.Meta avatar={<Avatar style={{ width: 32 }} src={item.image} />} title={item.name} description={`Quantidade: ${item.quantity}`} />
                          </List.Item>
                        )}
                      />
                    </Col>
                  </Row>
                </>
              )}
            </Card>
            {activeTab === 'carrinho' && (
              <>
                <Card style={{ marginTop: 30 }}>
                  <Row justify='center'>
                    <Col span={24}>
                      <List
                        dataSource={address}
                        header={<Title level={5}>Endereço de entrega</Title>}
                        renderItem={(item: any) => (
                          <List.Item.Meta
                            title={`${item.street},${item.number} - ${item.neighborhood}`}
                            description={
                              <>
                                {`${item.city}-${item.state}`}
                                <br />
                                <br />
                                {stock.cart.length > 0 && <Text> Tempo estimado {timeDelivery} minutos</Text>}
                              </>
                            }
                          />
                        )}
                      />
                    </Col>
                  </Row>
                </Card>
                <Form name='cart' size='large' layout='horizontal' initialValues={{ payment: '1' }} onFinish={onFinish} autoComplete='off'>
                  <Card style={{ marginTop: 30 }}>
                    <Row>
                      <Col span={12} style={{ paddingTop: 10 }}>
                        <Form.Item label='Forma de pagamento' name='payment' rules={[{ required: true, message: 'Selecione a forma de pagamento!' }]}>
                          <Select style={{ width: '100%' }} disabled={!stock.cart.length}>
                            <Select.Option value='1'>
                              <IconMoneyBill size={20} style={{ marginRight: 10 }} /> Dinheiro
                            </Select.Option>
                            <Select.Option value='2'>
                              <IconCreditCard size={20} style={{ marginRight: 10 }} /> Cartão Crédito/Débito
                            </Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                  <Row justify='center' style={{ marginTop: 30 }}>
                    <Col span={15}>
                      <Button size='large' disabled={!stock.cart.length} type='primary' htmlType='submit' block>
                        Finalizar
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </>
            )}
          </Col>
        </Row>
      </Content>
    </>
  )
}

const ContentImage = styled.div`
  position: relative;
`

const ItemImg = styled.div`
  padding: 0 25px;
  cursor: pointer;
  text-align: center;
  position: relative;
  img {
    transition: all 0.2s ease-in-out;
  }
  img:hover {
    transform: scale(1.1);
  }
`

const ItemTrash = styled.div<{ count: number }>`
  cursor: ${props => (props.count ? 'pointer' : '')};
  color: ${props => (props.count ? '#db3333' : '#a5a5a5c3')};
  font-size: 12px;
  user-select: none;
  :hover {
    color: ${props => (props.count ? '#db3333' : '#a5a5a5c3')};
  }
`

const ItemLeft = styled.div`
  position: absolute;
  left: 8%;
  top: 50%;
`

const ItemRight = styled.div`
  position: absolute;
  right: 8%;
  top: 50%;
`

const TextPrice = styled.div`
  font-size: 33px;
  color: #db3333;
  font-family: 'Josefin Sans', sans-serif;
`
const TabExtraContent = styled.div`
  display: flex;
  align-items: center;
`

const PriceAmount = styled.div`
  margin-left: 5px;
`

const Description = styled.div`
  text-align: center;
  margin-bottom: 35px;
`

const IconShoppingCart = styled(ShoppingCart)``

const IconCreditCard = styled(CreditCard)``

const IconHamburger = styled(Hamburger)``
const IconMinus = styled(Minus)``
const IconAdd = styled(Add)``

const IconMoneyBill = styled(MoneyBill)``

const IconDrinkToGo = styled(DrinkToGo)``

const IconTrash = styled(Trash)`
  margin-right: 4px;
`

const IconCheckmarkCircle = styled(CheckmarkCircle)<{ selected: boolean }>`
  position: absolute;
  left: 15px;
  fill: ${props => (props.selected ? '#ff4d4f' : '#e4e4e4')};
`

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

export default Home
