import { createSlice } from '@reduxjs/toolkit'

export interface PropsCart {
  id: number
  name: string
  price: number
  image: string
  quantity: number
}

const stock = createSlice({
  name: 'stock',
  initialState: {
    cart: [] as PropsCart[],
    loading: false
  },
  reducers: {
    addItemCart: (state, { payload }) => {
      state.cart = [...state.cart, payload]
    },
    removeItemCart: (state, { payload }) => {
      state.cart = state.cart.filter(item => item.id !== payload.id)
    },
    updateItemCart: (state, { payload }) => {
      state.cart = state.cart.map(item => {
        if (item.id === payload.id) {
          return payload
        }
        return item
      })
    },
    clearCart: state => {
      state.cart = []
    },
    setLoading: (state, { payload }) => {
      state.loading = payload
    }
  }
})

export const { addItemCart, removeItemCart, updateItemCart, clearCart, setLoading } = stock.actions

export default stock.reducer
