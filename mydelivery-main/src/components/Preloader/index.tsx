import { FC } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import { RootState } from '../../redux/store'
import Spinner from '../Spinner'

const Preloader: FC = () => {
  const { loading } = useSelector((state: RootState) => state.stock)
  return (
    <>
      {loading && (
        <PreloaderContainer>
          <Spinner color='#6e6e6e' />
        </PreloaderContainer>
      )}
    </>
  )
}

const PreloaderContainer = styled.div`
  height: 100vh;
  width: 100vw;
  position: fixed;
  z-index: 99999999999999;
  /* background: rgba(255, 255, 255, 0.2); // Make sure this color has an opacity of less than 1 */
  backdrop-filter: blur(18px);
  display: flex;
  align-items: center;
  justify-content: center;
  svg {
    /* fill: ${({ theme }) => theme.colors.primary}; */
  }
`

export default Preloader
