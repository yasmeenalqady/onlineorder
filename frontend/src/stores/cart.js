import { totalCents, clampQuantity } from './cartCore'

let saved = []
try {
  saved = JSON.parse(localStorage.getItem('tf-cart') || '[]')
  if (!Array.isArray(saved)) saved = []
} catch (error) {
  console.warn('Saved cart could not be read.', error)
}

export const cart = {
  items: saved
    .filter((item) => Number.isInteger(item.id) && Number.isFinite(Number(item.price)) && item.price > 0)
    .map((item) => ({ ...item, quantity: clampQuantity(item.quantity) })),
}

export function saveCart() {
  localStorage.setItem('tf-cart', JSON.stringify(cart.items))
}

export function total() {
  return totalCents(cart.items) / 100
}

export function count() {
  return cart.items.reduce((sum, item) => sum + item.quantity, 0)
}

export function add(meal, quantity = 1, notes = '') {
  const existing = cart.items.find((item) => item.id === meal.id)
  if (existing) {
    existing.quantity = clampQuantity(existing.quantity + quantity)
    if (notes) existing.notes = notes
  } else {
    cart.items.push({
      id: meal.id,
      name: meal.name,
      price: meal.price,
      image_url: meal.image_url,
      quantity: clampQuantity(quantity),
      notes,
    })
  }
  saveCart()
}

export function remove(id) {
  cart.items = cart.items.filter((item) => item.id !== id)
  saveCart()
}

export function clear() {
  cart.items = []
  saveCart()
}
