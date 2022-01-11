'use strict';

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2,
  pin: 1111,

  movementsDates: [
    '2021-12-04T21:31:17.178Z',
    '2021-12-07T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2021-12-01T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT',
};

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
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementDate = date => {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) {
    return 'Today';
  }
  if (daysPassed === 1) {
    return 'Yesterday';
  }
  if (daysPassed <= 7) {
    return `${daysPassed} days ago`;
  }
  const day = `${date.getDate()}`.padStart(2, 0);
  const month = `${date.getMonth() + 1}`.padStart(2, 0); // zero-based, need to add 1
  const year = date.getFullYear();
  const displayDate = `${month}/${day}/${year}`;

  return displayDate;
};

const displayMovements = (account, sort = false) => {
  // Removes dummy movements
  containerMovements.innerHTML = '';

  // Sort
  const movs = sort
    ? account.movements.slice().sort((a, b) => a - b)
    : account.movements;

  // Process to create DOM elements using an array
  // 1. Loop through each movement
  movs.forEach((mov, i) => {
    // 2. Create formatted time string
    const date = new Date(account.movementsDates[i]);
    const displayDate = formatMovementDate(date);

    // 3. Create HTML for each movement
    const type = mov < 0 ? 'withdrawal' : 'deposit';
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${mov.toFixed(2)}€</div>
      </div>`;

    // 4. Insert adjacentHTML
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = account => {
  account.balance = account.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${account.balance.toFixed(2)}€`;
};

// Loops through all accounts, computes a username based on the
// account owner's name, and creates a new attribute within
// the object
// Example: 'Steven Thomas Williams' => 'stw'
const createUsernames = accounts => {
  accounts.forEach(account => {
    account.username = account.owner
      .toLowerCase()
      .split(' ')
      .map(word => word[0])
      .join('');
  });
  return accounts;
};
createUsernames(accounts);

const calcDisplaySummary = account => {
  const incomes = account.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes.toFixed(2)}€`;

  const withdrawals = account.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc - mov, 0);
  labelSumOut.textContent = `${withdrawals.toFixed(2)}€`;

  const interest = account.movements
    .filter(mov => mov > 0)
    .map(mov => mov * (account.interestRate / 100))
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
};

/////////////////////////////////////////////////
// LOGIN
let currentAccount, timer;

const handleLogin = e => {
  e.preventDefault();
  const username = inputLoginUsername.value;
  const pin = +inputLoginPin.value;

  const account = accounts.find(
    account => username === account.username && pin === account.pin
  );
  if (account) {
    currentAccount = account;

    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 1;

    // Create current date
    const now = new Date();
    const day = `${now.getDate()}`.padStart(2, 0);
    const month = `${now.getMonth() + 1}`.padStart(2, 0); // zero-based, need to add 1
    const year = now.getFullYear();
    const hour = `${now.getHours()}`.padStart(2, 0);
    const min = `${now.getMinutes()}`.padStart(2, 0);
    labelDate.textContent = `${month}/${day}/${year}, ${hour}:${min}`;

    // Clear user input fields on log-in
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur(); // remove focus on pin input

    // Start countdown timer
    if (timer) {
      clearInterval(timer);
    }
    timer = startLogOutTimer();

    updateUI(currentAccount);
  }
};

const updateUI = account => {
  // Display account movements
  displayMovements(account);

  // Display balance
  calcDisplayBalance(account);

  // Display summary
  calcDisplaySummary(account);
};

btnLogin.addEventListener('click', handleLogin);

/////////////////////////////////////////////////
// TRANSFER

const handleTransfer = e => {
  e.preventDefault();
  const accountName = inputTransferTo.value;
  const account = accounts.find(acc => acc.username === accountName);
  const amount = +inputTransferAmount.value;

  if (
    amount > 0 &&
    account &&
    currentAccount.balance >= amount &&
    account?.username !== currentAccount.username
  ) {
    // Push transfer value to both accounts
    currentAccount.movements.push(-amount);
    account.movements.push(amount);

    // Push transfer date to both accounts' movementsDates
    currentAccount.movementsDates.push(new Date().toISOString());
    account.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // Reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
  inputTransferAmount.value = inputTransferTo.value = '';
  inputTransferAmount.blur();
};
btnTransfer.addEventListener('click', handleTransfer);

/////////////////////////////////////////////////
// LOAN

const handleLoan = e => {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount / 10)) {
    setTimeout(() => {
      // Add movement
      currentAccount.movements.push(amount);

      // Add date
      currentAccount.movementsDates.push(new Date().toISOString());
      updateUI(currentAccount);

      // Reset timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
  inputLoanAmount.blur();
};

btnLoan.addEventListener('click', handleLoan);

/////////////////////////////////////////////////
// TRANSFER

const closeAccount = e => {
  e.preventDefault();
  const username = inputCloseUsername.value;
  const pin = +inputClosePin.value;

  if (currentAccount.username === username && currentAccount.pin === pin) {
    const accountIdx = accounts.findIndex(
      acc => acc.username === username && acc.pin === pin
    );

    // Remove from `accounts` array
    accounts.splice(accountIdx, 1);

    // Hide UI
    containerApp.style.opacity = 0;

    // Clear fields
    inputCloseUsername.value = inputClosePin.value = '';
    inputClosePin.blur();
  }
};
btnClose.addEventListener('click', closeAccount);

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// SORTING

// const toggleSort = () => {
//   isSorted = !isSorted;
//   if (isSorted) {
//     currentAccount.movements.sort((a, b) => a - b);
//   } else {
//     currentAccount.movements.sort((a, b) => b - a);
//   }
//   updateUI(currentAccount);
// };

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

// IMPLEMENTING A COUNTDOWN TIMER

const startLogOutTimer = () => {
  const tick = () => {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const seconds = String(time % 60).padStart(2, 0);

    // In each call, print the remaining time to the UI
    labelTimer.textContent = `${min}:${seconds}`;

    // When 0 seconds, stop timer and log out the user
    if (time === 0) {
      clearTimeout(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }

    // Decrease time
    time--;
  };

  // Set time to 5 minutes
  let time = 300;

  // Call timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};
