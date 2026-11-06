const STORAGE_KEY = 'tableflow-demo-data'
const SESSION_KEY = 'tableflow-demo-session'
const PAGE_SIZE = 9

const initialCategories = [
  { id: 1, name: 'Burgers', slug: 'burgers' },
  { id: 2, name: 'Main Courses', slug: 'main-courses' },
  { id: 3, name: 'Sides', slug: 'sides' },
  { id: 4, name: 'Desserts', slug: 'desserts' },
  { id: 5, name: 'Drinks', slug: 'drinks' },
]

const initialMeals = [
  { id: 1, name: 'Classic Beef Burger', description: 'A juicy grilled beef patty with crisp lettuce, tomato, and our house sauce.', price: '32.00', category_id: 1, is_available: true, image_url: '/menu-images/burger.jpg' },
  { id: 2, name: 'Crispy Chicken', description: 'Golden crispy chicken served with fresh greens and a creamy garlic dip.', price: '29.00', category_id: 1, is_available: true, image_url: '/menu-images/chicken.jpg' },
  { id: 3, name: 'Margherita Pizza', description: 'Classic tomato, mozzarella, and basil on our freshly baked crust.', price: '38.00', category_id: 2, is_available: true, image_url: '/menu-images/pizza.jpg' },
  { id: 4, name: 'Creamy Pasta', description: 'Penne pasta tossed in a smooth cream sauce with parmesan.', price: '34.00', category_id: 2, is_available: true, image_url: '/menu-images/pasta.jpg' },
  { id: 5, name: 'Garden Salad', description: 'A refreshing mix of seasonal greens, cucumber, and lemon dressing.', price: '22.00', category_id: 2, is_available: true, image_url: '/menu-images/salad.jpg' },
  { id: 6, name: 'Golden Fries', description: 'Crispy golden potato fries, lightly seasoned and served hot.', price: '12.00', category_id: 3, is_available: true, image_url: '/menu-images/fries.jpg' },
  { id: 7, name: 'Chocolate Cake', description: 'Rich chocolate cake with a soft center and silky ganache.', price: '18.00', category_id: 4, is_available: true, image_url: '/menu-images/cake.jpg' },
  { id: 8, name: 'New York Cheesecake', description: 'Creamy baked cheesecake on a buttery biscuit base.', price: '20.00', category_id: 4, is_available: true, image_url: '/menu-images/cheesecake.jpg' },
  { id: 9, name: 'Fresh Lemonade', description: 'Freshly squeezed lemons with a hint of mint.', price: '14.00', category_id: 5, is_available: true, image_url: '/menu-images/lemon.jpg' },
  { id: 10, name: 'House Coffee', description: 'Freshly brewed coffee with a smooth, balanced flavor.', price: '11.00', category_id: 5, is_available: true, image_url: '/menu-images/coffee.jpg' },
]

const clone = (value) => JSON.parse(JSON.stringify(value))
const now = () => new Date().toISOString()
const demoUsers = [
  { id: 1, name: 'Demo Admin', email: 'admin@example.test', password: 'TableFlow!2026', role: 'admin' },
  { id: 2, name: 'Demo Customer', email: 'customer@example.test', password: 'DemoUser!2026', role: 'customer' },
]

function readData() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) {
    const data = { categories: clone(initialCategories), meals: clone(initialMeals), users: [], orders: [], nextCategoryId: 6, nextMealId: 11, nextUserId: 3, nextOrderId: 1 }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return data
  }
  try {
    return JSON.parse(saved)
  } catch (error) {
    throw new Error('Saved demo data is invalid. Clear this site’s local storage and reload.')
  }
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    throw new Error('Could not save demo data in this browser. Check available local storage space.')
  }
}

function currentUser(data) {
  const sessionId = Number(localStorage.getItem(SESSION_KEY))
  if (!sessionId) return null
  return demoUsers.find((user) => user.id === sessionId) || data.users.find((user) => user.id === sessionId) || null
}

function requireUser(data, adminOnly = false) {
  const user = currentUser(data)
  if (!user) throw new LocalError(401, 'Please sign in to continue.')
  if (adminOnly && user.role !== 'admin') throw new LocalError(403, 'You do not have permission to perform this action.')
  return user
}

function categoryOf(data, meal) {
  return data.categories.find((category) => category.id === Number(meal.category_id)) || null
}

function mealView(data, meal) {
  return { ...meal, category: categoryOf(data, meal) }
}

function paginate(items, page) {
  const lastPage = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const currentPage = Math.min(Math.max(1, Number(page) || 1), lastPage)
  return { data: items.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), current_page: currentPage, last_page: lastPage, per_page: PAGE_SIZE, total: items.length }
}

function lineItems(data, order) {
  return order.items.map((item, index) => {
    const meal = data.meals.find((entry) => entry.id === item.meal_id)
    return {
      id: item.id || index + 1,
      meal_id: item.meal_id,
      meal_name: item.meal_name || meal?.name || 'Removed item',
      quantity: item.quantity,
      price: item.price,
      line_total: (Number(item.price) * item.quantity).toFixed(2),
      notes: item.notes || '',
    }
  })
}

function orderView(data, order) {
  const user = data.users.find((entry) => entry.id === order.user_id) || demoUsers.find((entry) => entry.id === order.user_id)
  return { ...order, items: lineItems(data, order), user: user ? { id: user.id, name: user.name, email: user.email } : null }
}

function get(path, data, params) {
  if (path === '/user') {
    const user = currentUser(data)
    if (!user) throw new LocalError(401, 'Please sign in to continue.')
    return { data: { id: user.id, name: user.name, email: user.email, role: user.role } }
  }
  if (path === '/meals') {
    let meals = data.meals.map((meal) => mealView(data, meal))
    const search = String(params.get('search') || '').toLowerCase()
    const categoryId = Number(params.get('category_id'))
    if (search) meals = meals.filter((meal) => `${meal.name} ${meal.description}`.toLowerCase().includes(search))
    if (categoryId) meals = meals.filter((meal) => meal.category_id === categoryId)
    return paginate(meals, params.get('page'))
  }
  if (path.startsWith('/meals/')) {
    const meal = data.meals.find((entry) => entry.id === Number(path.split('/')[2]))
    if (!meal) throw new LocalError(404, 'Meal not found.')
    return { data: mealView(data, meal) }
  }
  if (path === '/categories') {
    return { data: data.categories.map((category) => ({
      ...category,
      meals_count: data.meals.filter((meal) => meal.category_id === category.id).length,
    })) }
  }
  if (path === '/orders') {
    const user = requireUser(data)
    const orders = data.orders.filter((order) => user.role === 'admin' || order.user_id === user.id)
    return paginate(orders.sort((a, b) => b.id - a.id).map((order) => orderView(data, order)), params.get('page'))
  }
  if (path.startsWith('/orders/')) {
    const user = requireUser(data)
    const order = data.orders.find((entry) => entry.id === Number(path.split('/')[2]))
    if (!order || (user.role !== 'admin' && order.user_id !== user.id)) throw new LocalError(404, 'Order not found.')
    return { data: orderView(data, order) }
  }
  if (path === '/admin/statistics') {
    requireUser(data, true)
    return { data: {
      orders: data.orders.length,
      pending: data.orders.filter((order) => order.status === 'pending').length,
      delivered_sales: data.orders.filter((order) => order.status === 'delivered').reduce((sum, order) => sum + Number(order.total), 0).toFixed(2),
      meals: data.meals.length,
      customers: data.users.filter((user) => user.role === 'customer').length + 1,
    } }
  }
  if (path === '/admin/orders') {
    requireUser(data, true)
    let orders = [...data.orders]
    const search = String(params.get('search') || '').toLowerCase()
    const status = params.get('status')
    if (status) orders = orders.filter((order) => order.status === status)
    if (search) orders = orders.filter((order) => `${order.order_number} ${order.customer_name} ${order.phone}`.toLowerCase().includes(search))
    return paginate(orders.sort((a, b) => b.id - a.id).map((order) => orderView(data, order)), params.get('page'))
  }
  if (path.startsWith('/admin/orders/')) {
    requireUser(data, true)
    const order = data.orders.find((entry) => entry.id === Number(path.split('/')[3]))
    if (!order) throw new LocalError(404, 'Order not found.')
    return { data: orderView(data, order) }
  }
  throw new LocalError(404, 'Page not found.')
}

async function post(path, data, body) {
  if (path === '/login') {
    const email = String(body.email || '').trim().toLowerCase()
    const user = [...demoUsers, ...data.users].find((entry) => entry.email.toLowerCase() === email)
    const validPassword = user && (user.password
      ? user.password === body.password
      : await verifyPassword(body.password, user.passwordSalt, user.passwordHash))
    if (!validPassword) throw new LocalError(422, 'The email or password is incorrect.')
    localStorage.setItem(SESSION_KEY, String(user.id))
    return { data: { id: user.id, name: user.name, email: user.email, role: user.role } }
  }
  if (path === '/register') {
    const name = String(body.name || '').trim()
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')
    const errors = {}
    if (name.length < 2 || name.length > 120) errors.name = ['Enter a name between 2 and 120 characters.']
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = ['Enter a valid email address.']
    if ([...demoUsers, ...data.users].some((user) => user.email.toLowerCase() === email)) errors.email = ['This email address is already registered.']
    if (password.length < 8) errors.password = ['Password must contain at least 8 characters.']
    if (password !== body.password_confirmation) errors.password_confirmation = ['The password confirmation does not match.']
    if (Object.keys(errors).length) throw new LocalError(422, 'Please check the form and try again.', errors)
    const credentials = await hashPassword(password)
    const user = { id: data.nextUserId++, name, email, ...credentials, role: 'customer' }
    data.users.push(user)
    saveData(data)
    localStorage.setItem(SESSION_KEY, String(user.id))
    return { data: { id: user.id, name: user.name, email: user.email, role: user.role } }
  }
  if (path === '/logout') {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
  if (path === '/orders') {
    const user = requireUser(data)
    const errors = {}
    if (!String(body.customer_name || '').trim()) errors.customer_name = ['Enter your name.']
    if (!String(body.phone || '').trim()) errors.phone = ['Enter your phone number.']
    if (String(body.delivery_address || '').trim().length < 8) errors.delivery_address = ['Enter a delivery address of at least 8 characters.']
    if (!Array.isArray(body.items) || !body.items.length) errors.items = ['Your cart is empty.']
    if (Object.keys(errors).length) throw new LocalError(422, 'Please check the form and try again.', errors)
    const items = body.items.map((item) => {
      const meal = data.meals.find((entry) => entry.id === Number(item.meal_id))
      if (!meal || !meal.is_available) throw new LocalError(422, 'One or more meals are no longer available.')
      const quantity = Math.min(20, Math.max(1, Math.trunc(Number(item.quantity) || 1)))
      return { id: data.orders.length + 1, meal_id: meal.id, meal_name: meal.name, quantity, price: Number(meal.price).toFixed(2), notes: String(item.notes || '').slice(0, 250) }
    })
    const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0).toFixed(2)
    const order = {
      id: data.nextOrderId++,
      order_number: `TF-${String(Date.now()).slice(-8)}-${String(data.nextOrderId).padStart(3, '0')}`,
      user_id: user.id,
      customer_name: String(body.customer_name).trim(),
      phone: String(body.phone).trim(),
      delivery_address: String(body.delivery_address).trim(),
      notes: String(body.notes || '').trim().slice(0, 500),
      status: 'pending',
      total,
      items,
      created_at: now(),
    }
    data.orders.push(order)
    saveData(data)
    return { data: orderView(data, order) }
  }
  if (path === '/admin/meals') {
    requireUser(data, true)
    const meal = mealFromBody(data, body, data.nextMealId++)
    data.meals.push(meal)
    saveData(data)
    return { data: mealView(data, meal) }
  }
  if (path === '/admin/categories') {
    requireUser(data, true)
    const category = categoryFromBody(data, body, data.nextCategoryId++)
    data.categories.push(category)
    saveData(data)
    return { data: category }
  }
  throw new LocalError(404, 'Page not found.')
}

function mealFromBody(data, body, id, previous = {}) {
  const categoryId = Number(body.get('category_id') || body.category_id)
  if (!data.categories.some((category) => category.id === categoryId)) throw new LocalError(422, 'Choose a valid category.')
  const name = String(body.get('name') ?? body.name ?? '').trim()
  const description = String(body.get('description') ?? body.description ?? '').trim()
  const price = Number(body.get('price') ?? body.price)
  if (!name || !description || !Number.isFinite(price) || price <= 0) throw new LocalError(422, 'Enter a name, description, and valid price.')
  const file = body.get?.('image')
  const update = (imageUrl) => ({
    ...previous,
    id,
    name,
    description,
    price: price.toFixed(2),
    category_id: categoryId,
    is_available: body.get ? body.get('is_available') === '1' : Boolean(body.is_available),
    image_url: imageUrl || previous.image_url || '/menu-images/default.svg',
  })
  if (file instanceof File && file.size) {
    if (file.size > 2 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      throw new LocalError(422, 'Choose a JPG, PNG, or WebP image smaller than 2 MB.')
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(update(reader.result))
      reader.onerror = () => reject(new Error('The image could not be read.'))
      reader.readAsDataURL(file)
    })
  }
  return update()
}

function categoryFromBody(data, body, id, currentId = null) {
  const name = String(body.name || '').trim()
  const slug = String(body.slug || '').trim()
  if (name.length < 2 || name.length > 80 || !/^[A-Za-z0-9_-]{2,100}$/.test(slug)) {
    throw new LocalError(422, 'Enter a category name and a valid English slug.')
  }
  if (data.categories.some((category) => category.id !== currentId && (category.slug === slug || category.name.toLowerCase() === name.toLowerCase()))) {
    throw new LocalError(422, 'A category with this name or slug already exists.')
  }
  return { id, name, slug }
}

function patch(path, data, body) {
  const mealMatch = path.match(/^\/admin\/meals\/(\d+)$/)
  if (mealMatch) {
    requireUser(data, true)
    const index = data.meals.findIndex((meal) => meal.id === Number(mealMatch[1]))
    if (index < 0) throw new LocalError(404, 'Meal not found.')
    const meal = mealFromBody(data, body, data.meals[index].id, data.meals[index])
    return Promise.resolve(meal).then((savedMeal) => {
      data.meals[index] = savedMeal
      saveData(data)
      return { data: mealView(data, savedMeal) }
    })
  }
  const categoryMatch = path.match(/^\/admin\/categories\/(\d+)$/)
  if (categoryMatch) {
    requireUser(data, true)
    const index = data.categories.findIndex((category) => category.id === Number(categoryMatch[1]))
    if (index < 0) throw new LocalError(404, 'Category not found.')
    data.categories[index] = categoryFromBody(data, body, data.categories[index].id, data.categories[index].id)
    saveData(data)
    return { data: data.categories[index] }
  }
  const statusMatch = path.match(/^\/admin\/orders\/(\d+)\/status$/)
  if (statusMatch) {
    requireUser(data, true)
    const order = data.orders.find((entry) => entry.id === Number(statusMatch[1]))
    if (!order) throw new LocalError(404, 'Order not found.')
    if (order.status !== body.expected_status) throw new LocalError(409, 'This order was updated. Refresh and try again.')
    if (!transitions[order.status]?.includes(body.status)) throw new LocalError(422, 'This status change is not allowed.')
    order.status = body.status
    order.updated_at = now()
    saveData(data)
    return { data: orderView(data, order) }
  }
  throw new LocalError(404, 'Page not found.')
}

function remove(path, data) {
  const mealMatch = path.match(/^\/admin\/meals\/(\d+)$/)
  if (mealMatch) {
    requireUser(data, true)
    data.meals = data.meals.filter((meal) => meal.id !== Number(mealMatch[1]))
    saveData(data)
    return null
  }
  const categoryMatch = path.match(/^\/admin\/categories\/(\d+)$/)
  if (categoryMatch) {
    requireUser(data, true)
    const id = Number(categoryMatch[1])
    if (data.meals.some((meal) => meal.category_id === id)) throw new LocalError(422, 'Move or remove this category’s meals first.')
    data.categories = data.categories.filter((category) => category.id !== id)
    saveData(data)
    return null
  }
  throw new LocalError(404, 'Page not found.')
}

const transitions = {
  pending: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
}

class LocalError extends Error {
  constructor(status, message, errors = {}) {
    super(message)
    this.status = status
    this.data = { message, errors }
  }
}

async function hashPassword(password, salt = crypto.getRandomValues(new Uint8Array(16))) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' }, key, 256)
  return {
    passwordSalt: Array.from(salt, (byte) => byte.toString(16).padStart(2, '0')).join(''),
    passwordHash: Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, '0')).join(''),
  }
}

async function verifyPassword(password, saltHex, expected) {
  const salt = new Uint8Array(saltHex.match(/.{2}/g).map((byte) => Number.parseInt(byte, 16)))
  const actual = await hashPassword(password, salt)
  return actual.passwordHash === expected
}

export async function localRequest(pathname, options = {}) {
  const url = new URL(pathname, window.location.origin)
  const data = readData()
  const method = (options.method || 'GET').toUpperCase()
  if (method === 'GET') return get(url.pathname, data, url.searchParams)
  if (method === 'POST' && url.pathname === '/logout') return post(url.pathname, data, {})
  let body = options.body || {}
  if (body instanceof FormData) {
    if (body.get('_method') === 'PATCH') {
      body.delete('_method')
      return await patch(url.pathname, data, body)
    }
    return await post(url.pathname, data, body)
  }
  if (typeof body === 'string') body = JSON.parse(body)
  if (method === 'POST') return await post(url.pathname, data, body)
  if (method === 'PATCH') return await patch(url.pathname, data, body)
  if (method === 'DELETE') return remove(url.pathname, data)
  throw new LocalError(405, 'This action is not supported in demo mode.')
}

export function getLocalSession() {
  const data = readData()
  const user = currentUser(data)
  return user ? { id: user.id, name: user.name, email: user.email, role: user.role } : null
}

export function setLocalSession(user) {
  if (user) localStorage.setItem(SESSION_KEY, String(user.id))
  else localStorage.removeItem(SESSION_KEY)
}

export function localMessage(error) {
  return error?.data?.message || error?.message || 'Something went wrong. Please try again.'
}
