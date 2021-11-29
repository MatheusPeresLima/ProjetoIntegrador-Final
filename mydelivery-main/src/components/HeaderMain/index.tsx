import Head from 'next/head'
import { Header } from 'antd/lib/layout/layout'
import { Col, Row } from 'antd'
import styled from 'styled-components'
import axios from 'axios'
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'
import { setLoading } from '../../redux/Stock.store'

export const HeaderMain = ({ title, auth }: { title: string; auth: boolean }) => {
  const router = useRouter()
  const dispatch = useDispatch()

  const logout = () =>
    axios.delete('/api/auth').then(() => {
      dispatch(setLoading(true))
      router.push('/login').then(() => dispatch(setLoading(false)))
    })

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <Header style={{ background: '#531dab', color: '#fff' }}>
        <Row justify='center'>
          {auth && (
            <>
              <Col>
                <LinkItem
                  onClick={() => {
                    dispatch(setLoading(true))
                    router.push('/').then(() => dispatch(setLoading(false)))
                  }}
                >
                  Fazer pedido
                </LinkItem>
              </Col>
              <Col>
                <LinkItem
                  onClick={() => {
                    dispatch(setLoading(true))
                    router.push('/meus_pedidos').then(() => dispatch(setLoading(false)))
                  }}
                >
                  Meus Pedidos
                </LinkItem>
              </Col>
              <Col>
                <LinkItem onClick={logout}>Sair</LinkItem>
              </Col>
            </>
          )}
          {!auth && (
            <>
              <Col>
                <LinkItem
                  onClick={() => {
                    dispatch(setLoading(true))
                    router.push('/cadastro').then(() => dispatch(setLoading(false)))
                  }}
                >
                  Cadastre-se
                </LinkItem>
              </Col>
              <Col>
                <LinkItem
                  onClick={() => {
                    dispatch(setLoading(true))
                    router.push('/login').then(() => dispatch(setLoading(false)))
                  }}
                >
                  Login
                </LinkItem>
              </Col>
            </>
          )}
        </Row>
      </Header>
    </>
  )
}

const LinkItem = styled.div`
  padding: 0 10px;
  cursor: pointer;
  :hover {
    color: #ffffffc3;
  }
`
export default HeaderMain
