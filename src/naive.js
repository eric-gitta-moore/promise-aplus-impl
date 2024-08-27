const isFunction = obj => typeof obj === 'function'
  , isObject = obj => !!(obj && typeof obj === 'object')
  , isThenable = obj => (isFunction(obj) || isObject(obj)) && 'then' in obj
  , isPromise = promise => promise instanceof Promise
  , nextTick = queueMicrotask || setTimeout

const PENDING = 'pending', FULFILLED = 'fulfilled', REJECTED = 'rejected'

class Promise {
  result = null
  state = PENDING
  callbacks = []
  constructor(fn) {
    let onFulfilled = value => this.#transition(FULFILLED, value)
    let onRejected = reason => this.#transition(REJECTED, reason)

    let ignore = false
    let resolve = value => ignore || (ignore = true, this.#resolvePromise(value, onFulfilled, onRejected))
    let reject = reason => ignore || (ignore = true, onRejected(reason))

    try {
      fn(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }

  then(onFulfilled, onRejected) {
    return new Promise((resolve, reject) => {
      let callback = { onFulfilled, onRejected, resolve, reject }

      if (this.state === PENDING) this.callbacks.push(callback)
      else nextTick(() => handleCallback(callback, this.state, this.result))
    })
  }

  #transition(state, result) {
    this.state = state, this.result = result
    nextTick(() => (this.callbacks.map(e => handleCallback(e, state, result)), this.callbacks.length = 0))
  }

  #resolvePromise(result, resolve, reject) {
    if (result === this) return reject(new TypeError('Can not fufill promise with itself'))

    if (isPromise(result)) return result.then(resolve, reject)

    if (isThenable(result)) {
      try {
        let then = result.then
        if (isFunction(then)) return new Promise(then.bind(result)).then(resolve, reject)
      } catch (error) {
        return reject(error)
      }
    }

    resolve(result)
  }
}

const handleCallback = (callback, state, result) => {
  let { onFulfilled, onRejected, resolve, reject } = callback
  try {
    if (state === FULFILLED)
      isFunction(onFulfilled) ? resolve(onFulfilled(result)) : resolve(result)
    if (state === REJECTED)
      isFunction(onRejected) ? resolve(onRejected(result)) : reject(result)
  } catch (error) {
    reject(error)
  }
}

module.exports = Promise
