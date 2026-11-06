import { auth, initialize, login, logout, register } from './stores/auth'
import { add, cart, clear, count, remove, saveCart, total } from './stores/cart'
import { clampQuantity } from './stores/cartCore'
import { date, money, statuses, transitions } from './composables/format'
import { localMessage as message, localRequest as request } from './services/localStore'

const root = document.querySelector('#app')
const appState = { toast: '', notice: '', errors: {}, error: '', busy: false, formDraft: {} }
const englishLabels = new Map([
  ['جرّب تغيير البحث أو العودة إلى القائمة.', 'Try a different search or return to the menu.'],
  ['طلب واضح، وتجربة على راحتك', 'Clear ordering, made easy.'],
  ['استعرض القائمة', 'Browse menu'],
  ['اختَر وجبتك', 'Choose your meal'],
  ['القائمة كاملة', 'Full menu'],
  ['قائمة بأسعار واضحة', 'Clear menu prices'],
  ['الدفع عند الاستلام · قائمة بأسعار واضحة', 'Cash on delivery · Clear menu prices'],
  ['برجر دجاج مع خضار طازجة', 'Chicken burger with fresh vegetables'],
  ['JPG أو PNG أو WebP، بحد أقصى ٢ ميجابايت.', 'JPG, PNG, or WebP, up to 2 MB.'],
  ['أو', 'or'],
  ['أهلًا بعودتك', 'Welcome back'],
  ['طعام تحبه، وخطوات بسيطة', 'Food you love, made simple'],
  ['والباقي علينا', 'We’ll take care of the rest.'],
  ['تصفّح قائمتنا، اكتب ملاحظاتك، وتابع طلبك من التحضير حتى التسليم', 'Browse our menu, add your notes, and follow your order from preparation to delivery.'],
  ['كيف تطلب؟', 'How it works'],
  ['اختر وجباتك وأضفها للسلة، ثم سجّل الدخول واكتب عنوان التوصيل. سنعرض لك رقم الطلب وحالته، ويمكنك العودة إليه في صفحة طلباتي', 'Choose your meals and add them to your cart. Sign in, enter your delivery address, and follow your order status from My Orders.'],
  ['وجبات تستحق التجربة', 'Meals worth trying'],
  ['طازج ومحضّر بعناية', 'Freshly prepared with care'],
  ['أقسام القائمة', 'Menu categories'],
  ['مثلًا: بدون بصل', 'For example: no onions'],
  ['لأي حساسية غذائية، تواصل مع المطعم قبل الطلب. الملاحظات لا تضمن إزالة مسببات الحساسية', 'For food allergies, contact the restaurant before ordering. Notes cannot guarantee that allergens will be removed.'],
  ['الأسعار التجريبية شاملة. لا توجد رسوم توصيل إضافية في هذا النموذج. يؤكد الخادم السعر والتوفر عند الإرسال', 'Sample prices are inclusive. This demo has no additional delivery fees. Prices and availability are normally confirmed when an order is submitted.'],
  ['الدفع عند الاستلام. يؤكد الخادم الأسعار الحالية عند إنشاء الطلب؛ سيظهر المبلغ النهائي في التأكيد', 'Cash on delivery. The final amount is normally confirmed when an order is placed.'],
  ['تتحدث الحالة كل ١٠ ثوانٍ أثناء فتح الصفحة. لا تمثل تتبعًا لموقع مندوب', 'The status refreshes every 10 seconds while this page is open. It does not show a courier’s location.'],
  ['العملاء المسجلون', 'Registered customers'],
  ['قيمة الطلبات المسلّمة مؤشر تجريبي ولا تثبت استلام مبالغ فعلية', 'Delivered order totals are demo data and do not represent actual payments.'],
  ['البريد الإلكتروني', 'Email address'],
  ['رقم الجوال', 'Phone number'],
  ['عنوان التوصيل', 'Delivery address'],
  ['ملاحظات إضافية (اختياري)', 'Additional notes (optional)'],
  ['ملاحظات للمطبخ', 'Kitchen notes'],
  ['ملاحظات الوجبة', 'Meal notes'],
  ['صورة الوجبة (اختياري)', 'Meal image (optional)'],
  ['السعر بالريال', 'Price (SAR)'],
  ['المعرّف الإنجليزي', 'English slug'],
  ['العودة للقائمة', 'Back to menu'],
  ['العودة للرئيسية', 'Back to home'],
  ['لمطعم واحد', 'for one restaurant'],
  ['من قائمتنا', 'From our menu'],
  ['الصفحة غير موجودة', 'Page not found'],
  ['تعذّر العثور على الصفحة المطلوبة', 'We could not find that page.'],
  ['لا تملك صلاحية الوصول إلى هذه الصفحة', 'You do not have permission to access this page.'],
  ['لا توجد أقسام. أضف قسمًا أولًا', 'No categories yet. Add a category first.'],
  ['رقم الطلب أو اسم العميل أو الجوال', 'Order number, customer name, or phone'],
  ['اختر كمية من 1 إلى 20.', 'Choose a quantity between 1 and 20.'],
  ['لا توجد نتائج حاليًا', 'No results yet'],
  ['غير متاح حاليًا', 'Currently unavailable'],
  ['إعادة المحاولة', 'Try again'],
  ['جارٍ التحميل…', 'Loading…'],
  ['انتقل إلى المحتوى', 'Skip to content'],
  ['الرئيسية', 'Home'],
  ['التنقل الرئيسي', 'Main navigation'],
  ['قائمة الطعام', 'Menu'],
  ['طلباتي', 'My Orders'],
  ['الإدارة', 'Admin'],
  ['السلة', 'Cart'],
  ['تسجيل الخروج', 'Log out'],
  ['تسجيل الدخول', 'Sign in'],
  ['نموذج جامعي تجريبي', 'Demo project'],
  ['الدفع عند الاستلام', 'Cash on delivery'],
  ['طازج ومحضّر بعناية', 'Freshly prepared'],
  ['ابحث عن وجبة', 'Search meals'],
  ['ابحث عن وجبة أو مكوّن', 'Search meals or ingredients'],
  ['الكل', 'All'],
  ['السابق', 'Previous'],
  ['التالي', 'Next'],
  ['تفاصيل الوجبة', 'Meal details'],
  ['الكمية', 'Quantity'],
  ['اختياري', 'optional'],
  ['إضافة إلى السلة', 'Add to cart'],
  ['إضافة', 'Add'],
  ['سلة الطلب', 'Your cart'],
  ['أضف وجبة أخرى', 'Add another meal'],
  ['سلتك فارغة', 'Your cart is empty'],
  ['اختر ما يناسبك من قائمتنا', 'Find something you love on our menu.'],
  ['تقليل كمية', 'Decrease quantity'],
  ['زيادة كمية', 'Increase quantity'],
  ['حذف', 'Remove'],
  ['ملخص الطلب', 'Order summary'],
  ['إجمالي الوجبات', 'Meals subtotal'],
  ['متابعة الطلب', 'Continue to checkout'],
  ['إتمام الطلب', 'Checkout'],
  ['السلة فارغة', 'Your cart is empty.'],
  ['بيانات التوصيل', 'Delivery details'],
  ['الاسم', 'Name'],
  ['المدينة، الحي، الشارع ورقم المبنى', 'City, district, street, and building number'],
  ['مراجعة الطلب', 'Review your order'],
  ['الإجمالي المعروض', 'Estimated total'],
  ['جارٍ إرسال الطلب', 'Placing your order'],
  ['تأكيد الطلب', 'Place order'],
  ['أدخل حسابك لمتابعة طلباتك', 'Sign in to view and manage your orders.'],
  ['كلمة المرور', 'Password'],
  ['جارٍ الدخول', 'Signing in'],
  ['دخول', 'Sign in'],
  ['ليس لديك حساب؟', 'New here?'],
  ['إنشاء حساب', 'Create an account'],
  ['احتفظ بطلباتك وتابع حالتها من مكان واحد', 'Keep track of your orders in one place.'],
  ['٨ أحرف على الأقل، تشمل حروفًا وأرقامًا', 'At least 8 characters. Use a mix of letters and numbers.'],
  ['تأكيد كلمة المرور', 'Confirm password'],
  ['جارٍ الإنشاء', 'Creating account'],
  ['إنشاء الحساب', 'Create account'],
  ['لديّ حساب بالفعل', 'I already have an account'],
  ['تحديث', 'Refresh'],
  ['تفاصيل وتتبع الطلب', 'View order and track status'],
  ['تم تأكيد طلبك وحفظه بنجاح', 'Your order has been placed successfully.'],
  ['تفاصيل الطلب', 'Order details'],
  ['تحديث الحالة', 'Refresh status'],
  ['حالة طلبك', 'Order status'],
  ['أُلغي هذا الطلب', 'This order was cancelled.'],
  ['تفاصيل التوصيل', 'Delivery information'],
  ['الإجمالي النهائي', 'Final total'],
  ['إدارة المطعم', 'Restaurant administration'],
  ['صلاحية الإدارة', 'Administrator access'],
  ['لوحة الإدارة', 'Admin navigation'],
  ['نظرة عامة', 'Overview'],
  ['إدارة الوجبات', 'Manage meals'],
  ['إدارة الأقسام', 'Manage categories'],
  ['إدارة الطلبات', 'Manage orders'],
  ['إجمالي الطلبات', 'Total orders'],
  ['طلبات جديدة', 'New orders'],
  ['قيمة الطلبات المسلّمة', 'Delivered order total'],
  ['الوجبات في القائمة', 'Meals on menu'],
  ['تعديل الوجبة', 'Edit meal'],
  ['وجبة جديدة', 'New meal'],
  ['الوصف', 'Description'],
  ['القسم', 'Category'],
  ['متاح للطلب', 'Available to order'],
  ['بحد أقصى ٢ ميجابايت', 'up to 2 MB'],
  ['جارٍ الحفظ', 'Saving'],
  ['حفظ', 'Save'],
  ['إلغاء', 'Cancel'],
  ['إضافة وجبة', 'Add meal'],
  ['بحث الوجبات', 'Search meals'],
  ['بحث', 'Search'],
  ['الوجبة', 'Meal'],
  ['السعر', 'Price'],
  ['التوفر', 'Availability'],
  ['الإجراءات', 'Actions'],
  ['متاح', 'Available'],
  ['غير متاح', 'Unavailable'],
  ['تعديل', 'Edit'],
  ['تعديل القسم', 'Edit category'],
  ['إضافة قسم', 'Add category'],
  ['اسم القسم', 'Category name'],
  ['حفظ القسم', 'Save category'],
  ['الوجبات', 'Meals'],
  ['غير مسموح', 'Access denied'],
  ['غير مسموح حاليًا', 'Currently unavailable'],
  ['أُضيفت', 'Added'],
  ['أُضيف', 'Added'],
  ['إلى السلة', 'to your cart'],
  ['من القائمة؟', 'from the menu?'],
  ['تم حذف الوجبة', 'Meal deleted.'],
  ['حذف القسم', 'Delete category'],
  ['تم حذف القسم', 'Category deleted.'],
  ['تم حفظ الوجبة', 'Meal saved.'],
  ['تم حفظ القسم', 'Category saved.'],
  ['تم تحديث حالة الطلب', 'Order status updated.'],
  ['إغلاق التفاصيل', 'Close details'],
  ['ملاحظات', 'Notes'],
  ['الإجمالي', 'Total'],
  ['الحالة الحالية', 'Current status'],
  ['الحالة الجديدة', 'New status'],
  ['هذه حالة نهائية', 'This is a final status.'],
  ['البحث عن طلب', 'Search orders'],
  ['تصفية الحالة', 'Filter by status'],
  ['كل الحالات', 'All statuses'],
  ['رقم الطلب', 'Order number'],
  ['العميل', 'Customer'],
  ['الحالة', 'Status'],
  ['التفاصيل', 'Details'],
  ['عرض الطلب', 'View order'],
])
let toastTimer
let routeVersion = 0
let searchTimer
let detailTimer
let checkoutKey = crypto.randomUUID()
let lastCheckoutBody = ''

const esc = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char])
const image = (url, alt, classes = '') => `<img src="${esc(url || '/menu-images/default.svg')}" alt="${esc(alt)}" class="${classes}" loading="lazy">`
const path = () => window.location.pathname.replace(/\/+$/, '') || '/'
const query = () => new URLSearchParams(window.location.search)
const pageHeading = (title, extra = '') => `<div class="page-heading"><h1>${title}</h1>${extra}</div>`
const showToast = (text) => {
  appState.toast = text
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    appState.toast = ''
    render()
  }, 2400)
  render()
}
const errorMessage = (error) => message(error)
const formErrors = (error = '', errors = {}) => {
  const entries = Object.values(errors || {}).flat()
  if (!error && !entries.length) return ''
  return `<div class="error my-4" role="alert">${error ? `<p>${esc(error)}</p>` : ''}${entries.length ? `<ul class="list-disc ps-5">${entries.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>` : ''}</div>`
}
const statePanel = (loading, error, empty, content, retry = 'إعادة المحاولة') => {
  if (loading) return '<div class="state" role="status"><span class="spinner"></span> جارٍ التحميل…</div>'
  if (error) return `<div class="state error" role="alert"><p>${esc(error)}</p><button class="btn secondary mt-4" data-action="retry">${retry}</button></div>`
  if (empty) return '<div class="state"><h2>لا توجد نتائج حاليًا</h2><p class="muted">جرّب تغيير البحث أو العودة إلى القائمة.</p></div>'
  return content
}
const mealCard = (meal) => `<article class="meal-card">
  <a href="/meals/${meal.id}" data-link>${image(meal.image_url, meal.name, 'meal-image')}${meal.is_available ? '' : '<span class="unavailable">غير متاح حاليًا</span>'}</a>
  <div class="p-5"><p class="eyebrow">${esc(meal.category?.name || '')}</p>
    <a href="/meals/${meal.id}" data-link><h3 class="text-xl mt-2">${esc(meal.name)}</h3></a>
    <p class="muted text-sm mt-2 min-h-12">${esc(meal.description)}</p>
    <div class="flex items-center justify-between gap-2 mt-4"><strong>${money(meal.price)}</strong>
      <button class="btn small" data-action="add-meal" data-id="${meal.id}" data-name="${esc(meal.name)}" data-price="${esc(meal.price)}" data-image="${esc(meal.image_url)}" ${meal.is_available ? '' : 'disabled'}>إضافة +</button>
    </div>
  </div>
</article>`

function header() {
  const user = auth.user
  return `<a class="skip" href="#content">انتقل إلى المحتوى</a>
    <header class="site-header"><div class="shell flex items-center justify-between gap-4 flex-wrap py-4">
      <a href="/" data-link class="brand" aria-label="TableFlow الرئيسية"><span class="brand-mark">t.</span><span dir="ltr">TableFlow</span></a>
      <nav aria-label="التنقل الرئيسي" class="flex gap-4 items-center flex-wrap">
        <a href="/menu" data-link>قائمة الطعام</a>${user ? '<a href="/orders" data-link>طلباتي</a>' : ''}
        ${user?.role === 'admin' ? '<a href="/admin" data-link>الإدارة</a>' : ''}
        <a href="/cart" data-link class="cart-link">السلة <span>${count()}</span></a>
        ${user ? '<button data-action="logout" class="text-sm">تسجيل الخروج</button>' : '<a href="/login" data-link class="btn small secondary">تسجيل الدخول</a>'}
      </nav>
    </div></header>
    ${appState.error ? `<p class="shell error" role="alert">${esc(appState.error)}</p>` : ''}
    <main id="content" tabindex="-1">${appState.content || ''}</main>
    <footer class="footer"><div class="shell flex justify-between gap-4 flex-wrap"><div><strong dir="ltr">TableFlow</strong><p>طلب واضح، وتجربة على راحتك.</p></div><p>نموذج جامعي تجريبي لمطعم واحد · الدفع عند الاستلام</p></div></footer>
    ${appState.toast ? `<div class="toast" role="status">${esc(appState.toast)}</div>` : ''}`
}

async function home() {
  const version = ++routeVersion
  appState.content = `<section class="hero"><div class="shell hero-grid"><div><p class="eyebrow mb-4">طعام تحبه، وخطوات بسيطة</p><h1>اختَر وجبتك.<br>والباقي علينا.</h1><p class="muted text-lg my-6 max-w-lg">تصفّح قائمتنا، اكتب ملاحظاتك، وتابع طلبك من التحضير حتى التسليم.</p><a href="/menu" data-link class="btn">استعرض القائمة</a><p class="mt-5 text-sm muted">الدفع عند الاستلام · قائمة بأسعار واضحة</p></div>${image('/menu-images/burger.jpg', 'برجر دجاج مع خضار طازجة', 'hero-photo')}</div></section><section class="shell page"><div class="page-heading"><div><p class="eyebrow">من قائمتنا</p><h2>وجبات تستحق التجربة</h2></div><a href="/menu" data-link class="btn secondary small">القائمة كاملة</a></div><div class="state"><span class="spinner"></span> جارٍ التحميل…</div><div class="mt-12 max-w-3xl"><h2>كيف تطلب؟</h2><p class="muted mt-4">اختر وجباتك وأضفها للسلة، ثم سجّل الدخول واكتب عنوان التوصيل. سنعرض لك رقم الطلب وحالته، ويمكنك العودة إليه في صفحة طلباتي.</p></div></section>`
  render()
  try {
    const response = await request('/meals')
    if (version !== routeVersion) return
    const meals = response.data.filter((meal) => meal.is_available).slice(0, 3)
    appState.content = appState.content.replace('<div class="state"><span class="spinner"></span> جارٍ التحميل…</div>', meals.length
      ? `<div class="meal-grid">${meals.map(mealCard).join('')}</div>` : '<div class="state"><h2>لا توجد نتائج حاليًا</h2></div>')
  } catch (error) {
    if (version !== routeVersion) return
    appState.content = appState.content.replace('<div class="state"><span class="spinner"></span> جارٍ التحميل…</div>', `<div class="state error">${esc(errorMessage(error))}<button class="btn secondary mt-4" data-action="retry">إعادة المحاولة</button></div>`)
  }
  render()
}

async function menu() {
  const version = ++routeVersion
  let currentPage = Number(query().get('page') || 1)
  let search = query().get('search') || ''
  let category = query().get('category_id') || ''
  let meals = []
  let categories = []
  let lastPage = 1
  let loading = true
  let error = ''
  let categoriesError = ''
  const draw = () => {
    appState.content = `<section class="shell page"><div class="page-heading"><div><p class="eyebrow">طازج ومحضّر بعناية</p><h1>قائمة الطعام</h1></div><label class="w-full sm:w-80"><span class="sr-only">ابحث عن وجبة</span><input class="input" type="search" data-input="menu-search" value="${esc(search)}" placeholder="ابحث عن وجبة أو مكوّن…"></label></div>
    ${categoriesError ? `<p class="error my-4" role="alert">${esc(categoriesError)}</p>` : ''}
    <div class="menu-filter" aria-label="أقسام القائمة"><button data-action="category" data-id="" class="${category ? '' : 'selected'}" aria-pressed="${!category}">الكل</button>${categories.map((item) => `<button data-action="category" data-id="${item.id}" class="${String(item.id) === category ? 'selected' : ''}" aria-pressed="${String(item.id) === category}">${esc(item.name)}</button>`).join('')}</div>
    ${statePanel(loading, error, !meals.length && !loading && !error, `<div class="meal-grid mt-8">${meals.map(mealCard).join('')}</div>${lastPage > 1 ? `<div class="flex justify-center gap-4 mt-8"><button class="btn secondary" data-action="menu-page" data-page="${currentPage - 1}" ${currentPage <= 1 ? 'disabled' : ''}>السابق</button><span>${currentPage} / ${lastPage}</span><button class="btn secondary" data-action="menu-page" data-page="${currentPage + 1}" ${currentPage >= lastPage ? 'disabled' : ''}>التالي</button></div>` : ''}`)}
    </section>`
    render()
  }
  async function load() {
    loading = true
    error = ''
    draw()
    try {
      const params = new URLSearchParams({ page: String(currentPage) })
      if (search) params.set('search', search)
      if (category) params.set('category_id', category)
      const response = await request(`/meals?${params}`)
      if (version !== routeVersion) return
      meals = response.data
      lastPage = response.last_page
      loading = false
      draw()
    } catch (cause) {
      if (version !== routeVersion) return
      error = errorMessage(cause)
      loading = false
      draw()
    }
  }
  draw()
  try {
    categories = (await request('/categories')).data
  } catch (error) {
    categoriesError = errorMessage(error)
  }
  if (version !== routeVersion) return
  await load()
}

async function mealDetails(id) {
  const version = ++routeVersion
  appState.content = `<section class="shell page"><p class="crumb"><a href="/menu" data-link>قائمة الطعام</a> / تفاصيل الوجبة</p><div class="state"><span class="spinner"></span> جارٍ التحميل…</div></section>`
  render()
  try {
    const meal = (await request(`/meals/${encodeURIComponent(id)}`)).data
    if (version !== routeVersion) return
    appState.content = `<section class="shell page"><p class="crumb"><a href="/menu" data-link>قائمة الطعام</a> / تفاصيل الوجبة</p><div class="split">${image(meal.image_url, meal.name, 'w-full object-cover rounded-3xl max-h-[520px]')}<div class="card"><p class="eyebrow">${esc(meal.category?.name || '')}</p><h1 class="text-3xl mt-2">${esc(meal.name)}</h1><p class="muted my-5">${esc(meal.description)}</p><strong class="text-2xl">${money(meal.price)}</strong><form data-form="add-meal-details" data-id="${meal.id}"><div class="field"><label for="qty">الكمية</label><input id="qty" name="quantity" type="number" class="input" value="1" min="1" max="20" required></div><div class="field"><label for="meal-notes">ملاحظات للمطبخ <span class="font-normal">(اختياري)</span></label><textarea id="meal-notes" name="notes" class="input" maxlength="250" placeholder="مثلًا: بدون بصل"></textarea></div><p class="notice mb-4">لأي حساسية غذائية، تواصل مع المطعم قبل الطلب. الملاحظات لا تضمن إزالة مسببات الحساسية.</p><button class="btn w-full" ${meal.is_available ? '' : 'disabled'}>${meal.is_available ? 'إضافة إلى السلة' : 'غير متاح حاليًا'}</button></form></div></div></section>`
    render()
  } catch (error) {
    if (version !== routeVersion) return
    appState.content = `<section class="shell page"><p class="crumb"><a href="/menu" data-link>قائمة الطعام</a> / تفاصيل الوجبة</p>${statePanel(false, errorMessage(error), false, '', 'إعادة المحاولة')}</section>`
    render()
  }
}

function cartPage() {
  const items = cart.items
  appState.content = `<section class="shell page">${pageHeading('سلة الطلب', '<a href="/menu" data-link class="btn secondary small">أضف وجبة أخرى</a>')}
    ${!items.length ? '<div class="state"><h2>سلتك فارغة</h2><p class="muted my-4">اختر ما يناسبك من قائمتنا.</p><a class="btn" href="/menu" data-link>استعرض القائمة</a></div>' : `<div class="split"><div class="space-y-4">${items.map((item) => `<article class="card"><div class="flex gap-4">${image(item.image_url, item.name, 'w-24 h-24 rounded-xl object-cover')}<div class="grow"><h2 class="text-lg">${esc(item.name)}</h2><p>${money(item.price)}</p><div class="flex items-center justify-between gap-2 mt-3"><div class="qty"><button data-action="quantity" data-id="${item.id}" data-delta="-1" aria-label="تقليل كمية ${esc(item.name)}" ${item.quantity <= 1 ? 'disabled' : ''}>−</button><span>${item.quantity}</span><button data-action="quantity" data-id="${item.id}" data-delta="1" aria-label="زيادة كمية ${esc(item.name)}" ${item.quantity >= 20 ? 'disabled' : ''}>+</button></div><button class="text-red-800 underline text-sm" data-action="remove-cart" data-id="${item.id}" aria-label="حذف ${esc(item.name)}">حذف</button></div></div></div><label class="field"><span class="text-sm">ملاحظات الوجبة</span><input class="input" data-cart-notes="${item.id}" value="${esc(item.notes || '')}" maxlength="250"></label></article>`).join('')}</div><aside class="card summary"><h2>ملخص الطلب</h2><div class="flex justify-between my-5"><span>إجمالي الوجبات</span><strong>${money(total())}</strong></div><p class="notice mb-5">الأسعار التجريبية شاملة. لا توجد رسوم توصيل إضافية في هذا النموذج. يؤكد الخادم السعر والتوفر عند الإرسال.</p><a class="btn w-full" href="/checkout" data-link>متابعة الطلب</a></aside></div>`}</section>`
}

function checkoutPage() {
  const draft = appState.formDraft
  const form = `<section class="shell page"><h1 class="text-3xl mb-7">إتمام الطلب</h1>${!cart.items.length
    ? '<div class="state"><p>السلة فارغة.</p><a href="/menu" data-link class="btn mt-4">العودة للقائمة</a></div>'
    : `<form data-form="checkout" class="split"><div class="card"><h2>بيانات التوصيل</h2>${formErrors(appState.error, appState.errors)}<div class="field"><label for="customer_name">الاسم</label><input id="customer_name" name="customer_name" class="input" value="${esc(draft.customer_name ?? auth.user?.name ?? '')}" maxlength="120" autocomplete="name" required></div><div class="field"><label for="phone">رقم الجوال</label><input id="phone" name="phone" class="input" dir="ltr" type="tel" value="${esc(draft.phone || '')}" autocomplete="tel" maxlength="24" required></div><div class="field"><label for="address">عنوان التوصيل</label><textarea id="address" name="delivery_address" class="input" autocomplete="street-address" minlength="8" maxlength="500" required placeholder="المدينة، الحي، الشارع ورقم المبنى">${esc(draft.delivery_address || '')}</textarea></div><div class="field"><label for="notes">ملاحظات إضافية (اختياري)</label><textarea id="notes" name="notes" class="input" maxlength="500">${esc(draft.notes || '')}</textarea></div></div><aside class="card summary"><h2>مراجعة الطلب</h2><ul class="space-y-3 mt-5">${cart.items.map((item) => `<li class="flex justify-between gap-3"><span>${esc(item.name)} × ${item.quantity}</span><strong>${money(Number(item.price) * item.quantity)}</strong></li>`).join('')}</ul><div class="divider"></div><div class="flex justify-between"><strong>الإجمالي المعروض</strong><strong>${money(total())}</strong></div><p class="notice my-4">الدفع عند الاستلام. يؤكد الخادم الأسعار الحالية عند إنشاء الطلب؛ سيظهر المبلغ النهائي في التأكيد.</p><button class="btn w-full" ${appState.busy ? 'disabled' : ''}>${appState.busy ? 'جارٍ إرسال الطلب…' : 'تأكيد الطلب'}</button></aside></form>`}</section>`
  appState.content = form
}

function loginPage() {
  const draft = appState.formDraft
  appState.content = `<section class="shell page"><div class="card auth-panel"><p class="eyebrow">أهلًا بعودتك</p><h1 class="text-3xl mt-2">تسجيل الدخول</h1><p class="muted mt-3">أدخل حسابك لمتابعة طلباتك.</p>${formErrors(appState.error, appState.errors)}<form data-form="login"><div class="field"><label for="email">البريد الإلكتروني</label><input id="email" name="email" class="input" value="${esc(draft.email || '')}" dir="ltr" type="email" autocomplete="username" required></div><div class="field"><label for="password">كلمة المرور</label><input id="password" name="password" class="input" value="${esc(draft.password || '')}" dir="ltr" type="password" autocomplete="current-password" required></div><button class="btn w-full" ${appState.busy ? 'disabled' : ''}>${appState.busy ? 'جارٍ الدخول…' : 'دخول'}</button></form><div class="notice mt-5"><strong>Demo accounts</strong><br>Admin: admin@example.test / TableFlow!2026<br>Customer: customer@example.test / DemoUser!2026<br><small>Demo data is stored in this browser only.</small></div><p class="mt-5 text-center">ليس لديك حساب؟ <a href="/register" data-link class="underline">إنشاء حساب</a></p></div></section>`
}

function registerPage() {
  const draft = appState.formDraft
  appState.content = `<section class="shell page"><div class="card auth-panel"><h1 class="text-3xl">إنشاء حساب</h1><p class="muted mt-3">احتفظ بطلباتك وتابع حالتها من مكان واحد.</p>${formErrors(appState.error, appState.errors)}<form data-form="register"><div class="field"><label for="name">الاسم</label><input id="name" name="name" class="input" value="${esc(draft.name || '')}" autocomplete="name" required maxlength="120"></div><div class="field"><label for="email">البريد الإلكتروني</label><input id="email" name="email" class="input" value="${esc(draft.email || '')}" dir="ltr" type="email" autocomplete="email" required></div><div class="field"><label for="password">كلمة المرور</label><input id="password" name="password" class="input" value="${esc(draft.password || '')}" dir="ltr" type="password" autocomplete="new-password" minlength="8" required><small class="muted">٨ أحرف على الأقل، تشمل حروفًا وأرقامًا.</small></div><div class="field"><label for="confirm">تأكيد كلمة المرور</label><input id="confirm" name="password_confirmation" class="input" value="${esc(draft.password_confirmation || '')}" dir="ltr" type="password" autocomplete="new-password" required></div><button class="btn w-full" ${appState.busy ? 'disabled' : ''}>${appState.busy ? 'جارٍ الإنشاء…' : 'إنشاء الحساب'}</button></form><p class="mt-5 text-center"><a href="/login" data-link class="underline">لديّ حساب بالفعل</a></p></div></section>`
}

function ordersPage(items, currentPage, lastPage, loading, error) {
  return `<section class="shell page">${pageHeading('طلباتي', '<button data-action="orders-refresh" class="btn secondary small">تحديث</button>')}${statePanel(loading, error, !items.length && !loading && !error, `<div class="space-y-4">${items.map((order) => `<article class="card"><div class="flex items-start justify-between gap-3 flex-wrap"><div><h2 class="text-xl" dir="ltr">${esc(order.order_number)}</h2><p class="muted text-sm">${date(order.created_at)}</p></div><span class="tag">${esc(statuses[order.status] || order.status)}</span></div><p class="my-4">${order.items.map((item) => `${esc(item.meal_name)} × ${item.quantity}`).join('، ')}</p><div class="flex justify-between items-center"><strong>${money(order.total)}</strong><a class="btn secondary small" href="/orders/${order.id}" data-link>تفاصيل وتتبع الطلب</a></div></article>`).join('')}</div>${lastPage > 1 ? `<div class="flex gap-4 mt-5"><button class="btn secondary" data-action="orders-page" data-page="${currentPage - 1}" ${currentPage <= 1 ? 'disabled' : ''}>السابق</button><span>${currentPage} / ${lastPage}</span><button class="btn secondary" data-action="orders-page" data-page="${currentPage + 1}" ${currentPage >= lastPage ? 'disabled' : ''}>التالي</button></div>` : ''}`)}</section>`
}

async function loadOrders(pageNumber = 1) {
  const version = ++routeVersion
  appState.content = ordersPage([], pageNumber, 1, true, '')
  render()
  try {
    const response = await request(`/orders?page=${pageNumber}`)
    if (version !== routeVersion) return
    appState.content = ordersPage(response.data, pageNumber, response.last_page, false, '')
  } catch (error) {
    if (version !== routeVersion) return
    appState.content = ordersPage([], pageNumber, 1, false, errorMessage(error))
  }
  render()
}

async function loadOrder(id, confirmed = false, initial = true) {
  const version = initial ? ++routeVersion : routeVersion
  if (initial) {
    appState.content = `<section class="shell page">${confirmed ? '<p class="success mb-6" role="status">تم تأكيد طلبك وحفظه بنجاح.</p>' : ''}<div class="state"><span class="spinner"></span> جارٍ التحميل…</div></section>`
    render()
  }
  try {
    const order = (await request(`/orders/${encodeURIComponent(id)}`)).data
    if (version !== routeVersion) return
    appState.content = `<section class="shell page">${confirmed ? '<p class="success mb-6" role="status">تم تأكيد طلبك وحفظه بنجاح.</p>' : ''}<div class="page-heading"><div><p class="eyebrow">تفاصيل الطلب</p><h1 class="text-2xl" dir="ltr">${esc(order.order_number)}</h1><p class="muted">${date(order.created_at)}</p></div><button class="btn secondary small" data-action="refresh-order">تحديث الحالة</button></div><div class="split"><div class="card"><h2>حالة طلبك</h2>${order.status === 'cancelled' ? '<p class="error mt-5">أُلغي هذا الطلب.</p>' : `<ol class="status-list my-6">${['pending', 'preparing', 'ready', 'delivered'].map((status) => `<li class="${order.status === status ? 'active' : ''}" ${order.status === status ? 'aria-current="step"' : ''}>${statuses[status]}</li>`).join('')}</ol>`}<p class="notice">تتحدث الحالة كل ١٠ ثوانٍ أثناء فتح الصفحة. لا تمثل تتبعًا لموقع مندوب.</p><div class="divider"></div><h3>تفاصيل التوصيل</h3><p class="mt-3">${esc(order.customer_name)} · <bdi>${esc(order.phone)}</bdi></p><p>${esc(order.delivery_address)}</p>${order.notes ? `<p class="muted mt-2">${esc(order.notes)}</p>` : ''}</div><aside class="card"><h2>ملخص الطلب</h2><ul class="space-y-4 mt-5">${order.items.map((item) => `<li><div class="flex justify-between gap-3"><span>${esc(item.meal_name)} × ${item.quantity}</span><strong>${money(item.line_total)}</strong></div>${item.notes ? `<small class="muted">${esc(item.notes)}</small>` : ''}</li>`).join('')}</ul><div class="divider"></div><div class="flex justify-between"><strong>الإجمالي النهائي</strong><strong>${money(order.total)}</strong></div><p class="notice mt-3">الدفع عند الاستلام</p></aside></div></section>`
    render()
  } catch (error) {
    if (version !== routeVersion) return
    appState.content = `<section class="shell page">${confirmed ? '<p class="success mb-6" role="status">تم تأكيد طلبك وحفظه بنجاح.</p>' : ''}${statePanel(false, errorMessage(error), false, '')}</section>`
    render()
  }
}

function adminShell(content) {
    return `<div class="shell page"><div class="page-heading"><h1>إدارة المطعم</h1><span class="tag">صلاحية الإدارة</span></div><div class="admin-layout"><nav class="admin-nav" aria-label="لوحة الإدارة"><a href="/admin" data-link class="${path() === '/admin' ? 'router-link-exact-active' : ''}">نظرة عامة</a><a href="/admin/meals" data-link class="${path() === '/admin/meals' ? 'router-link-exact-active' : ''}">إدارة الوجبات</a><a href="/admin/categories" data-link class="${path() === '/admin/categories' ? 'router-link-exact-active' : ''}">إدارة الأقسام</a><a href="/admin/orders" data-link class="${path() === '/admin/orders' ? 'router-link-exact-active' : ''}">إدارة الطلبات</a></nav><div class="min-w-0">${content}</div></div></div>`
  }

  async function adminDashboard() {
    const version = ++routeVersion
    appState.content = adminShell('<div class="state"><span class="spinner"></span> جارٍ التحميل…</div>')
    render()
    try {
      const stats = (await request('/admin/statistics')).data
      if (version !== routeVersion) return
      appState.content = adminShell(`<div class="page-heading"><h2>نظرة عامة</h2><button class="btn secondary small" data-action="retry">تحديث</button></div><div class="stats"><div class="card"><p class="muted">إجمالي الطلبات</p><strong>${stats.orders}</strong></div><div class="card"><p class="muted">طلبات جديدة</p><strong>${stats.pending}</strong></div><div class="card"><p class="muted">قيمة الطلبات المسلّمة</p><strong class="text-2xl">${money(stats.delivered_sales)}</strong></div><div class="card"><p class="muted">الوجبات في القائمة</p><strong>${stats.meals}</strong></div></div><p class="notice mt-5">العملاء المسجلون: ${stats.customers}. قيمة الطلبات المسلّمة مؤشر تجريبي ولا تثبت استلام مبالغ فعلية.</p><a href="/admin/orders" data-link class="btn mt-6">إدارة الطلبات</a>`)
    } catch (error) {
      if (version !== routeVersion) return
      appState.content = adminShell(statePanel(false, errorMessage(error), false, ''))
    }
    render()
  }

  const adminState = {
    mealSearch: '',
    mealPage: 1,
    mealEditing: null,
    mealShowForm: false,
    mealImage: null,
    categoryEditing: null,
    categoryForm: { name: '', slug: '' },
    orderSearch: '',
    orderStatus: '',
    orderPage: 1,
    selectedOrder: null,
    orderTarget: '',
    mealsData: [],
    categoriesData: [],
  }

  function mealEditor(categories) {
    if (!adminState.mealShowForm) return ''
    const item = adminState.mealEditing
    return `<form data-form="admin-meal" class="card mb-6"><h3>${item ? 'تعديل الوجبة' : 'وجبة جديدة'}</h3>${formErrors(appState.error, appState.errors)}<div class="field"><label for="mname">الاسم</label><input id="mname" name="name" class="input" value="${esc(item?.name || '')}" maxlength="120" required></div><div class="field"><label for="mdesc">الوصف</label><textarea id="mdesc" name="description" class="input" maxlength="2000" required>${esc(item?.description || '')}</textarea></div><div class="grid sm:grid-cols-2 gap-4"><label class="field"><span>السعر بالريال</span><input name="price" class="input" value="${esc(item?.price || '')}" type="number" min="0.01" max="9999.99" step="0.01" required></label><label class="field"><span>القسم</span><select name="category_id" class="input" required>${categories.map((category) => `<option value="${category.id}" ${String(category.id) === String(item?.category_id || categories[0]?.id) ? 'selected' : ''}>${esc(category.name)}</option>`).join('')}</select></label></div><label class="flex items-center gap-3"><input type="checkbox" name="is_available" ${item?.is_available ?? true ? 'checked' : ''}>متاح للطلب</label><label class="field"><span>صورة الوجبة (اختياري)</span><input name="image" class="input" type="file" accept="image/jpeg,image/png,image/webp"><small>JPG أو PNG أو WebP، بحد أقصى ٢ ميجابايت.</small></label><div class="flex gap-3"><button class="btn" ${appState.busy ? 'disabled' : ''}>${appState.busy ? 'جارٍ الحفظ…' : 'حفظ'}</button><button class="btn secondary" type="button" data-action="cancel-meal">إلغاء</button></div></form>`
  }

  async function adminMeals() {
    const version = ++routeVersion
    appState.content = adminShell('<div class="state"><span class="spinner"></span> جارٍ التحميل…</div>')
    render()
    try {
      const params = new URLSearchParams({ page: String(adminState.mealPage) })
      if (adminState.mealSearch) params.set('search', adminState.mealSearch)
      const [mealResponse, categoryResponse] = await Promise.all([
        request(`/meals?${params}`), request('/categories'),
      ])
      if (version !== routeVersion) return
      adminState.mealsData = mealResponse.data
      adminState.categoriesData = categoryResponse.data
      appState.content = adminShell(`<div class="page-heading"><h2>إدارة الوجبات</h2><button class="btn small" data-action="new-meal">إضافة وجبة</button></div>${appState.notice ? `<p class="success mb-4" role="status">${esc(appState.notice)}</p>` : ''}<form data-form="meal-search" class="flex gap-3 mb-5"><label class="grow"><span class="sr-only">بحث الوجبات</span><input name="search" class="input" value="${esc(adminState.mealSearch)}" placeholder="ابحث عن وجبة…"></label><button class="btn secondary">بحث</button></form>${formErrors(appState.error, appState.errors)}${mealEditor(categoryResponse.data)}${!mealResponse.data.length ? '<div class="state"><h2>لا توجد نتائج حاليًا</h2></div>' : `<div class="table-scroll card p-0"><table><thead><tr><th>الوجبة</th><th>القسم</th><th>السعر</th><th>التوفر</th><th>الإجراءات</th></tr></thead><tbody>${mealResponse.data.map((meal) => `<tr><td>${image(meal.image_url, meal.name, 'w-14 h-14 object-cover rounded-lg mb-2')}${esc(meal.name)}</td><td>${esc(meal.category?.name || '')}</td><td>${money(meal.price)}</td><td>${meal.is_available ? 'متاح' : 'غير متاح'}</td><td><button class="underline me-3" data-action="edit-meal" data-id="${meal.id}">تعديل</button><button class="underline text-red-800" data-action="delete-meal" data-id="${meal.id}">حذف</button></td></tr>`).join('')}</tbody></table></div>`}${mealResponse.last_page > 1 ? `<div class="flex gap-3 mt-4"><button class="btn secondary" data-action="admin-meal-page" data-page="${adminState.mealPage - 1}" ${adminState.mealPage <= 1 ? 'disabled' : ''}>السابق</button><span>${adminState.mealPage} / ${mealResponse.last_page}</span><button class="btn secondary" data-action="admin-meal-page" data-page="${adminState.mealPage + 1}" ${adminState.mealPage >= mealResponse.last_page ? 'disabled' : ''}>التالي</button></div>` : ''}`)
    } catch (error) {
      if (version !== routeVersion) return
      appState.content = adminShell(statePanel(false, errorMessage(error), false, ''))
    }
    render()
  }

  function categoryEditor() {
    const editing = adminState.categoryEditing
    return `<form data-form="admin-category" class="card mb-6"><h3>${editing ? 'تعديل القسم' : 'إضافة قسم'}</h3>${formErrors(appState.error, appState.errors)}<div class="field"><label for="cname">اسم القسم</label><input id="cname" name="name" class="input" value="${esc(adminState.categoryForm.name)}" maxlength="80" required></div><div class="field"><label for="slug">المعرّف الإنجليزي</label><input id="slug" name="slug" class="input" dir="ltr" value="${esc(adminState.categoryForm.slug)}" maxlength="100" pattern="[A-Za-z0-9_-]+" required placeholder="main-courses"></div><div class="flex gap-3"><button class="btn" ${appState.busy ? 'disabled' : ''}>حفظ القسم</button>${editing ? '<button type="button" class="btn secondary" data-action="cancel-category">إلغاء</button>' : ''}</div></form>`
  }

  async function adminCategories() {
    const version = ++routeVersion
    appState.content = adminShell('<div class="state"><span class="spinner"></span> جارٍ التحميل…</div>')
    render()
    try {
      const categories = (await request('/categories')).data
      if (version !== routeVersion) return
      adminState.categoriesData = categories
      appState.content = adminShell(`<h2 class="mb-5">إدارة الأقسام</h2>${appState.notice ? `<p class="success mb-4" role="status">${esc(appState.notice)}</p>` : ''}${categoryEditor()}<div class="card table-scroll p-0"><table><thead><tr><th>القسم</th><th>الوجبات</th><th>الإجراءات</th></tr></thead><tbody>${categories.length ? categories.map((category) => `<tr><td>${esc(category.name)}<small class="block muted" dir="ltr">${esc(category.slug)}</small></td><td>${category.meals_count}</td><td><button class="underline me-4" data-action="edit-category" data-id="${category.id}">تعديل</button><button class="underline text-red-800" data-action="delete-category" data-id="${category.id}">حذف</button></td></tr>`).join('') : '<tr><td colspan="3">لا توجد أقسام. أضف قسمًا أولًا.</td></tr>'}</tbody></table></div>`)
    } catch (error) {
      if (version !== routeVersion) return
      appState.content = adminShell(`<h2 class="mb-5">إدارة الأقسام</h2>${formErrors(errorMessage(error))}${categoryEditor()}`)
    }
    render()
  }

  function render() {
    let html = header()
    const labels = [...englishLabels].sort((a, b) => b[0].length - a[0].length)
    for (const [source, replacement] of labels) html = html.replaceAll(source, replacement)
    html = html.replaceAll('..', '.')
    root.innerHTML = html
  }

  async function loadRoute() {
    await initialize()
    const currentPath = path()
    const needsAuth = ['/checkout', '/orders'].includes(currentPath) || currentPath.startsWith('/orders/')
    const needsAdmin = currentPath === '/admin' || currentPath.startsWith('/admin/')
    if (needsAuth && !auth.user) {
      navigate(`/login?redirect=${encodeURIComponent(currentPath + window.location.search)}`, true)
      return
    }
    if (needsAdmin && auth.user?.role !== 'admin') {
      navigate('/forbidden', true)
      return
    }
    appState.error = ''
    appState.errors = {}
    appState.notice = ''
    appState.formDraft = {}
    clearInterval(detailTimer)
    if (currentPath === '/') return home()
    if (currentPath === '/menu') return menu()
    if (currentPath.startsWith('/meals/')) return mealDetails(currentPath.split('/')[2])
    if (currentPath === '/cart') {
      cartPage()
      return render()
    }
    if (currentPath === '/checkout') {
      checkoutPage()
      return render()
    }
    if (currentPath === '/login') {
      loginPage()
      return render()
    }
    if (currentPath === '/register') {
      registerPage()
      return render()
    }
    if (currentPath === '/orders') return loadOrders(Number(query().get('page') || 1))
    if (currentPath.startsWith('/orders/')) {
      const confirmed = query().get('confirmed') === '1'
      const id = currentPath.split('/')[2]
      await loadOrder(id, confirmed)
      detailTimer = setInterval(() => {
        if (document.visibilityState === 'visible' && path() === currentPath) loadOrder(id, confirmed, false)
      }, 10000)
      return
    }
    if (currentPath === '/admin') return adminDashboard()
    if (currentPath === '/admin/meals') return adminMeals()
    if (currentPath === '/admin/categories') return adminCategories()
    if (currentPath === '/admin/orders') return adminOrders()
    if (currentPath === '/forbidden') {
      appState.content = '<section class="shell page state"><h1>غير مسموح</h1><p class="muted my-4">لا تملك صلاحية الوصول إلى هذه الصفحة.</p><a href="/" data-link class="btn">العودة للرئيسية</a></section>'
      return render()
    }
    appState.content = '<section class="shell page state"><h1>الصفحة غير موجودة</h1><p class="muted my-4">تعذّر العثور على الصفحة المطلوبة.</p><a href="/" data-link class="btn">العودة للرئيسية</a></section>'
    render()
  }

  function navigate(url, replace = false) {
    const target = new URL(url, window.location.origin)
    if (replace) history.replaceState({}, '', target)
    else history.pushState({}, '', target)
    appState.busy = false
    appState.error = ''
    appState.errors = {}
    appState.notice = ''
    void loadRoute()
    window.scrollTo({ top: 0 })
  }

  function setFormError(error) {
    appState.error = errorMessage(error)
    appState.errors = error?.data?.errors || {}
  }

  document.addEventListener('click', async (event) => {
    const anchor = event.target.closest('a[data-link]')
    if (anchor && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      event.preventDefault()
      navigate(anchor.getAttribute('href'))
      return
    }
    const button = event.target.closest('[data-action]')
    if (!button || button.disabled) return
    const id = Number(button.dataset.id)
    try {
      switch (button.dataset.action) {
        case 'add-meal':
          add({ id, name: button.dataset.name, price: button.dataset.price, image_url: button.dataset.image })
          showToast(`أُضيف ${button.dataset.name} إلى السلة`)
          break
        case 'remove-cart':
          remove(id)
          cartPage()
          render()
          break
        case 'quantity': {
          const item = cart.items.find((entry) => entry.id === id)
          if (item) item.quantity = clampQuantity(item.quantity + Number(button.dataset.delta))
          saveCart()
          cartPage()
          render()
          break
        }
        case 'category': {
          const params = new URLSearchParams()
          if (button.dataset.id) params.set('category_id', button.dataset.id)
          const searchInput = document.querySelector('[data-input="menu-search"]')
          if (searchInput?.value) params.set('search', searchInput.value)
          navigate(`/menu${params.size ? `?${params}` : ''}`)
          break
        }
        case 'menu-page': {
          const params = new URLSearchParams(window.location.search)
          params.set('page', button.dataset.page)
          navigate(`/menu?${params}`)
          break
        }
        case 'orders-page':
          navigate(`/orders?page=${button.dataset.page}`)
          break
        case 'orders-refresh':
          loadOrders(Number(query().get('page') || 1))
          break
        case 'refresh-order':
          loadOrder(path().split('/')[2], query().get('confirmed') === '1', false)
          break
        case 'retry':
          void loadRoute()
          break
        case 'logout':
          await logout()
          navigate('/')
          break
        case 'new-meal':
          adminState.mealEditing = null
          adminState.mealShowForm = true
          appState.error = ''
          await adminMeals()
          break
        case 'cancel-meal':
          adminState.mealShowForm = false
          adminState.mealEditing = null
          appState.error = ''
          await adminMeals()
          break
        case 'edit-meal':
          adminState.mealEditing = adminState.mealsData.find((meal) => meal.id === id) || null
          adminState.mealShowForm = Boolean(adminState.mealEditing)
          await adminMeals()
          break
        case 'delete-meal': {
          const item = adminState.mealsData.find((meal) => meal.id === id)
          if (item && window.confirm(`حذف ${item.name} من القائمة؟`)) {
            await request(`/admin/meals/${id}`, { method: 'DELETE' })
            appState.notice = 'تم حذف الوجبة.'
            await adminMeals()
          }
          break
        }
        case 'admin-meal-page':
          adminState.mealPage = Number(button.dataset.page)
          await adminMeals()
          break
        case 'edit-category': {
          const category = adminState.categoriesData.find((entry) => entry.id === id)
          if (category) {
            adminState.categoryEditing = category.id
            adminState.categoryForm = { name: category.name, slug: category.slug }
            await adminCategories()
          }
          break
        }
        case 'cancel-category':
          adminState.categoryEditing = null
          adminState.categoryForm = { name: '', slug: '' }
          await adminCategories()
          break
        case 'delete-category': {
          const category = adminState.categoriesData.find((entry) => entry.id === id)
          if (category && window.confirm(`حذف القسم ${category.name}؟`)) {
            await request(`/admin/categories/${id}`, { method: 'DELETE' })
            appState.notice = 'تم حذف القسم.'
            await adminCategories()
          }
          break
        }
        case 'view-order':
          adminState.selectedOrder = (await request(`/admin/orders/${id}`)).data
          adminState.orderTarget = transitions[adminState.selectedOrder.status]?.[0] || ''
          await adminOrders()
          break
        case 'close-order':
          adminState.selectedOrder = null
          await adminOrders()
          break
        case 'admin-order-page':
          adminState.orderPage = Number(button.dataset.page)
          await adminOrders()
          break
      }
    } catch (error) {
      setFormError(error)
      render()
    }
  })

  document.addEventListener('input', (event) => {
    if (event.target.matches('[data-input="menu-search"]')) {
      const value = event.target.value
      clearTimeout(searchTimer)
      searchTimer = setTimeout(() => {
        const params = new URLSearchParams(window.location.search)
        params.set('search', value)
        params.delete('page')
        navigate(`/menu?${params}`)
      }, 300)
    }
  })

  document.addEventListener('change', (event) => {
    const notesField = event.target.closest('[data-cart-notes]')
    if (notesField) {
      const item = cart.items.find((entry) => entry.id === Number(notesField.dataset.cartNotes))
      if (item) {
        item.notes = notesField.value
        saveCart()
      }
    }
    if (event.target.matches('[data-form="admin-order-status"] select')) {
      adminState.orderTarget = event.target.value
    }
  })

  document.addEventListener('submit', async (event) => {
    const form = event.target.closest('form[data-form]')
    if (!form) return
    event.preventDefault()
    const data = new FormData(form)
    try {
      switch (form.dataset.form) {
        case 'add-meal-details': {
          const quantity = Number(data.get('quantity'))
          if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
            form.elements.quantity.setCustomValidity('اختر كمية من 1 إلى 20.')
            form.elements.quantity.reportValidity()
            form.elements.quantity.setCustomValidity('')
            return
          }
          const meal = (await request(`/meals/${encodeURIComponent(form.dataset.id)}`)).data
          add(meal, quantity, String(data.get('notes') || ''))
          showToast(`أُضيفت ${meal.name} إلى السلة`)
          break
        }
        case 'login': {
          appState.busy = true
          appState.error = ''
          appState.errors = {}
          appState.formDraft = Object.fromEntries(data.entries())
          loginPage()
          render()
          await login({ email: data.get('email'), password: data.get('password') })
          const target = query().get('redirect')
          navigate(target?.startsWith('/') && !target.startsWith('//') ? target : auth.user.role === 'admin' ? '/admin' : '/menu')
          break
        }
        case 'register':
          appState.busy = true
          appState.error = ''
          appState.errors = {}
          appState.formDraft = Object.fromEntries(data.entries())
          registerPage()
          render()
          await register({
            name: data.get('name'),
            email: data.get('email'),
            password: data.get('password'),
            password_confirmation: data.get('password_confirmation'),
          })
          navigate('/menu')
          break
        case 'checkout': {
          appState.busy = true
          appState.error = ''
          appState.errors = {}
          appState.formDraft = Object.fromEntries(data.entries())
          checkoutPage()
          render()
          const body = {
            customer_name: data.get('customer_name'),
            phone: data.get('phone'),
            delivery_address: data.get('delivery_address'),
            notes: data.get('notes'),
            items: cart.items.map((item) => ({
              meal_id: item.id,
              quantity: item.quantity,
              notes: item.notes || '',
            })),
          }
          const signature = JSON.stringify(body)
          if (lastCheckoutBody && lastCheckoutBody !== signature) checkoutKey = crypto.randomUUID()
          lastCheckoutBody = signature
          const response = await request('/orders', {
            method: 'POST',
            body: { ...body, idempotency_key: checkoutKey },
          })
          clear()
          navigate(`/orders/${response.data.id}?confirmed=1`, true)
          break
        }
        case 'meal-search':
          adminState.mealSearch = String(data.get('search') || '')
          adminState.mealPage = 1
          await adminMeals()
          break
        case 'admin-meal': {
          appState.busy = true
          appState.error = ''
          appState.errors = {}
          const formData = new FormData(form)
          formData.set('is_available', form.elements.is_available.checked ? '1' : '0')
          const selectedImage = formData.get('image')
          if (selectedImage instanceof File && selectedImage.size === 0) formData.delete('image')
          if (adminState.mealEditing) formData.append('_method', 'PATCH')
          const mealPath = adminState.mealEditing ? `/admin/meals/${adminState.mealEditing.id}` : '/admin/meals'
          await request(mealPath, { method: 'POST', body: formData })
          appState.busy = false
          appState.notice = 'تم حفظ الوجبة.'
          adminState.mealShowForm = false
          adminState.mealEditing = null
          await adminMeals()
          break
        }
        case 'admin-category': {
          appState.busy = true
          appState.error = ''
          appState.errors = {}
          const payload = { name: data.get('name'), slug: data.get('slug') }
          if (adminState.categoryEditing) {
            await request(`/admin/categories/${adminState.categoryEditing}`, {
              method: 'PATCH',
              body: payload,
            })
          } else {
            await request('/admin/categories', { method: 'POST', body: payload })
          }
          appState.busy = false
          appState.notice = 'تم حفظ القسم.'
          adminState.categoryEditing = null
          adminState.categoryForm = { name: '', slug: '' }
          await adminCategories()
          break
        }
        case 'admin-order-search':
          adminState.orderSearch = String(data.get('search') || '')
          adminState.orderStatus = String(data.get('status') || '')
          adminState.orderPage = 1
          await adminOrders()
          break
        case 'admin-order-status': {
          if (!adminState.selectedOrder || !adminState.orderTarget) return
          appState.busy = true
          appState.error = ''
          const response = await request(`/admin/orders/${adminState.selectedOrder.id}/status`, {
            method: 'PATCH',
            body: {
              status: adminState.orderTarget,
              expected_status: adminState.selectedOrder.status,
            },
          })
          adminState.selectedOrder = response.data
          adminState.orderTarget = transitions[response.data.status]?.[0] || ''
          appState.busy = false
          appState.notice = 'تم تحديث حالة الطلب.'
          await adminOrders()
          break
        }
      }
    } catch (error) {
      appState.busy = false
      setFormError(error)
      if (form.dataset.form === 'login') loginPage()
      else if (form.dataset.form === 'register') registerPage()
      else if (form.dataset.form === 'checkout') checkoutPage()
      else if (form.dataset.form === 'admin-meal') {
        adminState.mealShowForm = true
        void adminMeals()
      } else if (form.dataset.form === 'admin-category') void adminCategories()
      else render()
    }
  })

  window.addEventListener('popstate', () => {
    appState.error = ''
    appState.errors = {}
    void loadRoute()
  })

  void loadRoute()

  function orderDetailsAdmin(order) {
    if (!order) return ''
    const available = transitions[order.status] || []
    return `<article class="card mb-6"><div class="flex justify-between gap-3"><h3 dir="ltr">${esc(order.order_number)}</h3><button class="underline" data-action="close-order">إغلاق التفاصيل</button></div><p class="mt-3">${esc(order.customer_name)} · <bdi>${esc(order.phone)}</bdi></p><p>${esc(order.delivery_address)}</p>${order.user ? `<p class="muted">${esc(order.user.email)}</p>` : ''}<p class="muted">${esc(order.notes || '')}</p><ul class="my-4 space-y-3">${order.items.map((item) => `<li>${esc(item.meal_name)} × ${item.quantity} — ${money(item.line_total)}${item.notes ? `<small class="block muted">ملاحظات: ${esc(item.notes)}</small>` : ''}</li>`).join('')}</ul><strong>الإجمالي: ${money(order.total)}</strong><div class="divider"></div><p>الحالة الحالية: ${esc(statuses[order.status] || order.status)}</p>${available.length ? `<form data-form="admin-order-status" class="flex gap-3 mt-4 flex-wrap"><label class="grow"><span class="sr-only">الحالة الجديدة</span><select class="input" name="status">${available.map((status) => `<option value="${status}" ${status === adminState.orderTarget ? 'selected' : ''}>${esc(statuses[status])}</option>`).join('')}</select></label><button class="btn" ${appState.busy ? 'disabled' : ''}>تحديث الحالة</button></form>` : '<p class="notice mt-3">هذه حالة نهائية.</p>'}${formErrors(appState.error)}</article>`
  }

  async function adminOrders() {
    const version = ++routeVersion
    appState.content = adminShell('<div class="state"><span class="spinner"></span> جارٍ التحميل…</div>')
    render()
    try {
      const params = new URLSearchParams({ page: String(adminState.orderPage) })
      if (adminState.orderSearch) params.set('search', adminState.orderSearch)
      if (adminState.orderStatus) params.set('status', adminState.orderStatus)
      const response = await request(`/admin/orders?${params}`)
      if (version !== routeVersion) return
      appState.content = adminShell(`<div class="page-heading"><h2>إدارة الطلبات</h2><button data-action="retry" class="btn secondary small">تحديث</button></div>${appState.notice ? `<p class="success mb-4" role="status">${esc(appState.notice)}</p>` : ''}<form data-form="admin-order-search" class="flex gap-3 flex-wrap mb-6"><label class="grow"><span class="sr-only">البحث عن طلب</span><input name="search" class="input" value="${esc(adminState.orderSearch)}" placeholder="رقم الطلب أو اسم العميل أو الجوال"></label><label><span class="sr-only">تصفية الحالة</span><select name="status" class="input"><option value="">كل الحالات</option>${Object.entries(statuses).map(([key, label]) => `<option value="${key}" ${key === adminState.orderStatus ? 'selected' : ''}>${label}</option>`).join('')}</select></label><button class="btn secondary">بحث</button></form>${orderDetailsAdmin(adminState.selectedOrder)}${formErrors(appState.error)}${!response.data.length ? '<div class="state"><h2>لا توجد نتائج حاليًا</h2></div>' : `<div class="card p-0 table-scroll"><table><thead><tr><th>رقم الطلب</th><th>العميل</th><th>الإجمالي</th><th>الحالة</th><th>التفاصيل</th></tr></thead><tbody>${response.data.map((order) => `<tr><td><bdi>${esc(order.order_number)}</bdi><small class="block muted">${date(order.created_at)}</small></td><td>${esc(order.customer_name)}</td><td>${money(order.total)}</td><td>${esc(statuses[order.status] || order.status)}</td><td><button class="underline" data-action="view-order" data-id="${order.id}">عرض الطلب</button></td></tr>`).join('')}</tbody></table></div>`}${response.last_page > 1 ? `<div class="flex gap-3 mt-4"><button class="btn secondary" data-action="admin-order-page" data-page="${adminState.orderPage - 1}" ${adminState.orderPage <= 1 ? 'disabled' : ''}>السابق</button><span>${adminState.orderPage} / ${response.last_page}</span><button class="btn secondary" data-action="admin-order-page" data-page="${adminState.orderPage + 1}" ${adminState.orderPage >= response.last_page ? 'disabled' : ''}>التالي</button></div>` : ''}`)
    } catch (error) {
      if (version !== routeVersion) return
      appState.content = adminShell(`<h2>إدارة الطلبات</h2>${formErrors(errorMessage(error))}`)
    }
    render()
}
