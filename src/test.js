const isFunction = obj => typeof obj === 'function'
const isObject = obj => !!(obj && typeof obj === 'object')
const isThenable = obj => (isFunction(obj) || isObject(obj)) && 'then' in obj
const isPromise = promise => promise instanceof Promise
const nextTick = queueMicrotask || setTimeout

const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

class Promise {
  result = null
  state = PENDING
  callbacks = []
  // { onFulfilled, onRejected, resolve, reject }
  constructor(fn) {
    const onFulfilled = val => this.#transition(FULFILLED, val)
    const onRejected = v => this.#transition(REJECTED, v)

    let first = true
    const resolve = val => {
      if (!first) return
      first = false
      this.#resolvePromise(val, onFulfilled, onRejected)
    }
    const reject = reason => {
      if (!first) return
      first = false
      onRejected(reason)
    }
    try {
      fn(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }

  then(onFulfilled, onRejected) {
    return new Promise((resolve, reject) => {
      const cb = { onFulfilled, onRejected, resolve, reject }
      if (this.state === PENDING)
        this.callbacks.push(cb)
      else
        nextTick(() => handleCallback(cb, this.state, this.result))
    })
  }

  #transition(state, result) {
    if (this.state !== PENDING) return
    this.state = state
    this.result = result
    nextTick(() => {
      while (this.callbacks.length)
        handleCallback(this.callbacks.shift(), state, result)
    })
  }

  #resolvePromise(result, resolve, reject) {
    if (result === this)
      return reject(new TypeError('result is this promise itself'))

    if (isPromise(result))
      return result.then(resolve, reject)

    if (isThenable(result)) {
      try {
        const then = result.then
        if (isFunction(then))
          return new Promise(then.bind(result)).then(resolve, reject)
      } catch (error) {
        reject(error)
      }
    }

    resolve(result)
  }
}

const handleCallback = (callback, state, result) => {
  const { onFulfilled, onRejected, resolve, reject } = callback
  try {
    if (state === FULFILLED)
      isFunction(onFulfilled) ? resolve(onFulfilled(result)) : resolve(result)
    else if (state === REJECTED)
      isFunction(onRejected) ? resolve(onRejected(result)) : reject(result)
  } catch (err) {
    reject(err)
  }
}

// ---
const resolved = value => new Promise(resolve => resolve(value))
const rejected = reason => new Promise((_, reject) => reject(reason))

const deferred = () => {
  let promise, resolve, reject
  promise = new Promise(($resolve, $reject) => {
    resolve = $resolve
    reject = $reject
  })
  return { promise, resolve, reject }
}

module.exports = { resolved, rejected, deferred }

