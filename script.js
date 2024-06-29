'use strict'

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Mohamed Mohamed',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2024-06-25T23:36:17.929Z',
    '2024-06-20T10:51:36.790Z'
  ],
  currency: 'EUR',
  locale: 'pt-PT' // de-DE
}

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z'
  ],
  currency: 'USD',
  locale: 'en-US'
}

const accounts = [account1, account2]

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome')
const labelDate = document.querySelector('.date')
const labelBalance = document.querySelector('.balance__value')
const labelSumIn = document.querySelector('.summary__value--in')
const labelSumOut = document.querySelector('.summary__value--out')
const labelSumInterest = document.querySelector('.summary__value--interest')
const labelTimer = document.querySelector('.timer')

const containerApp = document.querySelector('.app')
const containerMovements = document.querySelector('.movements')

const btnLogin = document.querySelector('.login__btn')
const btnTransfer = document.querySelector('.form__btn--transfer')
const btnLoan = document.querySelector('.form__btn--loan')
const btnClose = document.querySelector('.form__btn--close')
const btnSort = document.querySelector('.btn--sort')

const inputLoginUsername = document.querySelector('.login__input--user')
const inputLoginPin = document.querySelector('.login__input--pin')
const inputTransferTo = document.querySelector('.form__input--to')
const inputTransferAmount = document.querySelector('.form__input--amount')
const inputLoanAmount = document.querySelector('.form__input--loan-amount')
const inputCloseUsername = document.querySelector('.form__input--user')
const inputClosePin = document.querySelector('.form__input--pin')

/////////////////////////////////////////////////
// Functions

const formatCurrency = function (locale, currencyType, value) {
  const options = {
    style: 'currency',
    currency: currencyType
  }
  return Intl.NumberFormat(locale, options).format(value)
}

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, cur) => acc + cur, 0)
  labelBalance.textContent = formatCurrency(
    acc.locale,
    acc.currency,
    acc.balance
  )
}

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0)
  labelSumIn.textContent = formatCurrency(acc.locale, acc.currency, incomes)

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0)
  labelSumOut.textContent = formatCurrency(acc.locale, acc.currency, out)

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, mov) => acc + mov, 0)
  labelSumInterest.textContent = formatCurrency(
    acc.locale,
    acc.currency,
    interest
  )
}

const convertTo12HourFormat = function (hrs, mins) {
  const period = +hrs >= 12 ? 'PM' : 'AM'
  hrs = hrs % 12 || 12
  return `${hrs}:${mins} ${period}`
}

const formatMovementsDate = function (date, locale) {
  const calcPassedDays = (date1, date2) =>
    Math.round(Math.abs(date1 - date2) / (1000 * 60 * 60 * 24))
  const daysPassed = calcPassedDays(new Date(), date)
  if (daysPassed === 0) return 'Today'
  if (daysPassed === 1) return 'Yesterday'
  if (daysPassed <= 7) return `${daysPassed} days ago`
  // Manually
  /*
  const day = `${date.getDate()}`.padStart(2, 0)
  const month = `${date.getMonth()}`.padStart(2, 0)
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
  */
  return new Intl.DateTimeFormat(locale).format(date)
}

const displayMovements = function (acc, sort = false) {
  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements
  containerMovements.innerHTML = ''
  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal'
    const date = formatMovementsDate(
      new Date(acc.movementsDates[i]),
      acc.locale
    )
    const formattedMovement = formatCurrency(acc.locale, acc.currency, mov)
    const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
          <div class="movements__date">${date}</div>
          <div class="movements__value">${formattedMovement}</div>
        </div>`
    containerMovements.insertAdjacentHTML('afterbegin', html)
  })
}

const createUserNames = function (accs) {
  accs.forEach(
    account =>
      (account.userName = account.owner
        .toLowerCase()
        .split(' ')
        .map(n => n[0])
        .join(''))
  )
}
createUserNames(accounts)

const updateInfo = function (acc) {
  displayMovements(acc)
  calcDisplaySummary(acc)
  calcDisplayBalance(acc)
}

const updateUI = function (opacity, ...inputs) {
  inputs.forEach(i => (i.value = ''))
  inputLoginPin.blur()
  containerApp.style.opacity = opacity
}

const startLogOutTimer = function () {
  let time = 10 * 60

  const tick = function () {
    const mins = `${Math.trunc(time / 60)}`.padStart(2, 0)
    const secs = `${time % 60}`.padStart(2, 0)
    labelTimer.textContent = `${mins}:${secs}`
    if (time === 0) {
      clearInterval()
      labelWelcome.textContent = `Log in to get started`
      containerApp.style.opacity = 0
    }
    time--
  }

  tick()
  const timer = setInterval(tick, 1000)
  return timer
}

let currentAccount, timer

const resetTimer = () => {
  clearInterval(timer)
  timer = startLogOutTimer()
}

btnLogin.addEventListener('click', e => {
  e.preventDefault()

  if (timer) clearInterval(timer)
  timer = startLogOutTimer()
  currentAccount = accounts.find(
    acc => acc.userName === inputLoginUsername.value
  )
  if (!currentAccount) return console.log('Invalid Account')
  if (!inputLoginPin.value) return console.log('PIN is required')
  if (currentAccount.pin !== +inputLoginPin.value)
    return console.log('Invalid Account')
  labelWelcome.textContent = `Welcome back ${
    currentAccount.owner.split(' ')[0]
  }`

  // Experimenting API
  const now = new Date()
  const options = {
    hour: 'numeric',
    minute: 'numeric',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
    // weekday: 'short'
  }
  // const locale = navigator.language
  // console.log(locale) // en-US
  labelDate.textContent = new Intl.DateTimeFormat(
    currentAccount.locale,
    options
  ).format(now)

  // Date and Time manully
  /*
  const now = new Date()
  const day = `${now.getDate()}`.padStart(2, 0)
  const month = `${now.getMonth()}`.padStart(2, 0)
  const year = now.getFullYear()
  const time = convertTo12HourFormat(
    `${now.getHours()}`.padStart(2, 0),
    `${now.getMinutes()}`.padStart(2, 0)
  )
  labelDate.textContent = `${day}/${month}/${year}   ${time}`
  */
  updateInfo(currentAccount)
  updateUI(100, inputLoginUsername, inputLoginPin)
})

btnTransfer.addEventListener('click', e => {
  e.preventDefault()
  const recieverAcc = accounts.find(
    acc => acc.userName === inputTransferTo.value
  )
  const amount = +inputTransferAmount.value
  if (!recieverAcc) return console.log('Invalid Account')
  if (recieverAcc === currentAccount)
    return console.log("You can't transfer to your self")
  if (!amount || amount <= 0)
    return console.log('Amount is required to transfer operation')
  if (amount > currentAccount.balance)
    return console.log(`You don't have ${amount}€`)
  currentAccount.movements.push(-amount)
  currentAccount.movementsDates.push(new Date().toISOString())
  recieverAcc.movements.push(amount)
  recieverAcc.movementsDates.push(new Date().toISOString())
  updateInfo(currentAccount)
  updateUI(100, inputTransferTo, inputTransferAmount)
  resetTimer()
})

btnClose.addEventListener('click', e => {
  e.preventDefault()
  if (!inputCloseUsername.value) return console.log('Username is required')
  if (!inputClosePin.value) return console.log('PIN is required')
  if (
    inputCloseUsername.value !== currentAccount.userName ||
    +inputClosePin.value !== currentAccount.pin
  ) {
    return console.log('Wrong Username or PIN')
  }
  const accIndex = accounts.findIndex(
    acc => acc.userName === inputCloseUsername.value
  )
  accounts.splice(accIndex, 1)
  updateUI(0, inputCloseUsername, inputClosePin)
})

btnLoan.addEventListener('click', e => {
  e.preventDefault()
  const amount = Math.floor(inputLoanAmount.value)
  const valid = currentAccount.movements.some(mov => mov >= amount * 0.1)
  if (!amount) return console.log('Amount is required')
  if (!valid) return console.log("Can't loan this amount")
  currentAccount.movements.push(amount)
  currentAccount.movementsDates.push(new Date().toISOString())
  updateInfo(currentAccount)
  updateUI(100, inputLoanAmount)
  resetTimer()
})

let sorted = false
btnSort.addEventListener('click', e => {
  e.preventDefault()
  displayMovements(currentAccount, !sorted)
  sorted = !sorted
})

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
