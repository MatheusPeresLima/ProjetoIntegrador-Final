import { FC } from 'react'
import { Col, Row, Form, Card, Divider, Button, Input, Typography } from 'antd'
import { Content } from 'antd/lib/layout/layout'
import HeaderMain from '../components/HeaderMain'
const { Title } = Typography
import axios from 'axios'
import Swal from 'sweetalert2'
import { useDispatch } from 'react-redux'
import { setLoading } from '../redux/Stock.store'
import { GetServerSideProps } from 'next'
import { checkToken } from '../auth'
import { useRouter } from 'next/router'

interface PropsLogin {
  auth: boolean
  user: {
    id: string
    name: string
    email: string
  }
}
const Login: FC<PropsLogin> = ({ auth }) => {
  const dispatch = useDispatch()
  const router = useRouter()

  const onFinish = (values: any) => {
    dispatch(setLoading(true))
    axios.post('/api/auth', values).then(({ data }) => {
      if (data.error) {
        Swal.fire('Ops!', data.error, 'error')
        dispatch(setLoading(false))
      } else {
        localStorage.setItem('address', JSON.stringify(data.address))
        router.push('/').then(() => {
          dispatch(setLoading(false))
        })
      }
    })
  }

  return (
    <>
      <HeaderMain title='MyDelivery | Login' auth={auth} />
      <Content>
        <Row justify='center' style={{ alignItems: 'center', height: 'calc(100vh - 150px)' }}>
          <Col md={6}>
            <Card>
              <Divider>
                <Title level={4}>Acesse sua conta</Title>
              </Divider>
              <Form name='login' onFinish={onFinish}>
                <Form.Item label='E-mail' name='email' rules={[{ required: true, message: 'E-mail obrigatório!' }]}>
                  <Input />
                </Form.Item>

                <Form.Item label='Senha' name='password' rules={[{ required: true, message: 'Senha Obrigatória!' }]}>
                  <Input.Password />
                </Form.Item>
                <Divider />
                <Form.Item>
                  <Row justify='center'>
                    <Col span={24}>
                      <Button type='primary' htmlType='submit' block>
                        Entrar
                      </Button>
                    </Col>
                  </Row>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </Content>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const { auth } = await checkToken(req, res)
  if (auth) {
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

export default Login
