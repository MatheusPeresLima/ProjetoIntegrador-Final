import Head from 'next/head'
import { Header } from 'antd/lib/layout/layout'
import { Col, Row } from 'antd'
import styled from 'styled-components'
import axios from 'axios'
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'
import { setLoading } from '../../redux/Stock.store'

const HeaderMainPanel = ({ title }: { title: string }) => {
  const router = useRouter()
  const dispatch = useDispatch()

  const logout = () => axios.delete('/api/auth').then(() => router.push('/login'))

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <Header style={{ background: '#531dab', color: '#fff' }}>
        <Row justify='center'>
          <Col>
            <LinkItem
              onClick={() => {
                dispatch(setLoading(true))
                router.push('/painel').then(() => dispatch(setLoading(false)))
              }}
            >
              Dashboard
            </LinkItem>
          </Col>
          <Col>
            <LinkItem onClick={logout}>Sair</LinkItem>
          </Col>
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
export default HeaderMainPanel
