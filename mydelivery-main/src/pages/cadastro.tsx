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
import { Mask } from '../helpers/MaskedValue'
import { MaskCel, MaskCep, MaskStringsWords } from '../helpers/masks'
import { useRouter } from 'next/router'

interface PropsCadastro {
  auth: boolean
  user: {
    id: string
    name: string
    email: string
  }
}
const formItemLayout = {
  labelCol: {
    xs: { span: 1 },
    sm: { span: 5 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 }
  }
}

const Cadastro: FC<PropsCadastro> = ({ auth }) => {
  const dispatch = useDispatch()
  const [form] = Form.useForm()
  const router = useRouter()

  const onFinish = (values: any) => {
    dispatch(setLoading(true))
    axios.post('/api/users', values).then(({ data }) => {
      if (data.error) {
        Swal.fire('Ops!', data.error, 'error')
      } else {
        Swal.fire('Sucesso!', 'Cadastro realizado com sucesso!', 'success')
        form.resetFields()
        router.push('/login')
      }
      dispatch(setLoading(false))
    })
  }

  return (
    <>
      <HeaderMain title='MyDelivery | Cadastro' auth={auth} />
      <Content>
        <Row justify='center' style={{ alignItems: 'center', height: 'calc(100vh - 150px)' }}>
          <Col md={6}>
            <Card>
              <Divider>
                <Title level={4}>Cadastro</Title>
              </Divider>
              <Form
                name='cadastro'
                form={form}
                {...formItemLayout}
                initialValues={{ remember: true }}
                onFinish={onFinish}
                onValuesChange={({ zip }, values) => {
                  if (zip?.length === 9) {
                    axios.get(`https://viacep.com.br/ws/${zip}/json/`).then(({ data }) => {
                      form.setFieldsValue({
                        street: data.logradouro,
                        neighborhood: data.bairro,
                        city: data.localidade,
                        state: data.uf
                      })
                    })
                  }
                }}
                onFinishFailed={() => {}}
                autoComplete='off'
              >
                <Form.Item label='Nome' name='name' rules={[{ required: true, message: 'Nome obrigatório!' }]}>
                  <Input onChangeCapture={({ currentTarget }) => (currentTarget.value = MaskStringsWords({ target: currentTarget }))} />
                </Form.Item>
                <Form.Item label='E-mail' name='email' rules={[{ required: true, message: 'E-mail obrigatório!' }]}>
                  <Input onChangeCapture={({ currentTarget }) => (currentTarget.value = currentTarget.value.toLowerCase())} />
                </Form.Item>
                <Form.Item label='Celular' name='phone'>
                  <Input onChangeCapture={({ currentTarget }) => (currentTarget.value = MaskCel({ target: currentTarget }))} />
                </Form.Item>
                <Form.Item label='Senha' name='password' rules={[{ required: true, message: 'Senha Obrigatória!' }]}>
                  <Input.Password />
                </Form.Item>
                <Form.Item label='CEP' name='zip' rules={[{ required: true, message: 'CEP Obrigatório!' }]}>
                  <Input onChangeCapture={({ currentTarget }) => (currentTarget.value = MaskCep({ target: currentTarget }))} />
                </Form.Item>
                <Form.Item label='Rua' name='street' rules={[{ required: true, message: 'Rua Obrigatório!' }]}>
                  <Input onChangeCapture={({ currentTarget }) => (currentTarget.value = MaskStringsWords({ target: currentTarget }))} />
                </Form.Item>
                <Form.Item label='Número' name='number' rules={[{ required: true, message: 'Número Obrigatório!' }]}>
                  <Input onChangeCapture={({ currentTarget }) => (currentTarget.value = currentTarget.value.toUpperCase())} />
                </Form.Item>
                <Form.Item label='Bairro' name='neighborhood' rules={[{ required: true, message: 'Bairro Obrigatório!' }]}>
                  <Input onChangeCapture={({ currentTarget }) => (currentTarget.value = MaskStringsWords({ target: currentTarget }))} />
                </Form.Item>
                <Form.Item label='Cidade' name='city' rules={[{ required: true, message: 'Cidade Obrigatório!' }]}>
                  <Input onChangeCapture={({ currentTarget }) => (currentTarget.value = MaskStringsWords({ target: currentTarget }))} />
                </Form.Item>
                <Form.Item label='Estado' name='state' rules={[{ required: true, message: 'Estado Obrigatório!' }]}>
                  <Input onChangeCapture={({ currentTarget }) => (currentTarget.value = currentTarget.value.toUpperCase())} />
                </Form.Item>

                <Form.Item>
                  <Button type='primary' htmlType='submit'>
                    Cadastrar
                  </Button>
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

export default Cadastro
