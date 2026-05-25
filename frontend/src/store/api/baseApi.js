import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Product', 'Order'],
  endpoints: (builder) => ({
    checkUsername: builder.query({
      query: (username) => `/auth/check-username?username=${encodeURIComponent(username)}`,
    }),

    registerUser: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),

    loginUser: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    getProducts: builder.query({
      query: () => '/products',
      providesTags: ['Product'],
    }),

    createProduct: builder.mutation({
      query: (productData) => ({
        url: '/products',
        method: 'POST',
        body: productData,
      }),
      invalidatesTags: ['Product'],
    }),

    updateProduct: builder.mutation({
      query: ({ id, productData }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body: productData,
      }),
      invalidatesTags: ['Product'],
    }),

    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),

    getOrders: builder.query({
      query: () => '/orders',
      providesTags: ['Order'],
    }),

    createOrder: builder.mutation({
      query: (productIds) => ({
        url: '/orders',
        method: 'POST',
        body: { productIds },
      }),
      invalidatesTags: ['Order'],
    }),

    updateOrder: builder.mutation({
      query: ({ orderId, productIds }) => ({
        url: `/orders/${orderId}`,
        method: 'PUT',
        body: { productIds },
      }),
      invalidatesTags: ['Order'],
    }),

    deleteOrder: builder.mutation({
      query: (orderId) => ({
        url: `/orders/${orderId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Order'],
    }),

    getWeather: builder.query({
      query: ({ lat, lon, city }) => ({
        url: '/weather',
        params: { lat, lon, city },
      }),
    }),
  }),
});

export const { useCheckUsernameQuery, useRegisterUserMutation, useLoginUserMutation, useGetProductsQuery, useCreateProductMutation, useUpdateProductMutation, useDeleteProductMutation, useGetOrdersQuery, useCreateOrderMutation, useUpdateOrderMutation, useDeleteOrderMutation, useGetWeatherQuery } = baseApi;
