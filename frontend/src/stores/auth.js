import { getLocalSession, localRequest } from '../services/localStore'

export const auth = { user: null, ready: false }

export async function initialize() {
  auth.user = getLocalSession()
  auth.ready = true
}

export async function login(data) {
  auth.user = (await localRequest('/login', { method: 'POST', body: data })).data
  auth.ready = true
}

export async function register(data) {
  auth.user = (await localRequest('/register', { method: 'POST', body: data })).data
  auth.ready = true
}

export async function logout() {
  await localRequest('/logout', { method: 'POST' })
  auth.user = null
}
