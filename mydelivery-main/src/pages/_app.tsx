import '../styles/globals.css'
import 'antd/dist/antd.css'
import 'antd-button-color/dist/css/style.css'

import type { AppProps } from 'next/app'
import { Layout } from 'antd'
import { Provider } from 'react-redux'
import store from '../redux/store'
import Preloader from '../components/Preloader'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Provider store={store}>
        <Preloader />
        <Layout style={{ minHeight: '100vh' }}>
          <Component {...pageProps} />;
        </Layout>
      </Provider>
    </>
  )
}

export default MyApp
