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
  constructor(fn) {
    let onFulfilled = value => this.#transition(FULFILLED, value)
    let onRejected = reason => this.#transition(REJECTED, reason)

    let ignore = false
    let resolve = value => {
      if (ignore) return
      ignore = true
      this.#resolvePromise(value, onFulfilled, onRejected)
    }
    let reject = reason => {
      if (ignore) return
      ignore = true
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
      let callback = { onFulfilled, onRejected, resolve, reject }

      if (this.state === PENDING) {
        this.callbacks.push(callback)
      } else {
        nextTick(() => handleCallback(callback, this.state, this.result))
      }
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
    if (result === this) {
      let reason = new TypeError('Can not fufill promise with itself')
      return reject(reason)
    }

    if (isPromise(result)) {
      return result.then(resolve, reject)
    }

    if (isThenable(result)) {
      try {
        let then = result.then
        if (isFunction(then)) {
          return new Promise(then.bind(result)).then(resolve, reject)
        }
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
    if (state === FULFILLED) {
      isFunction(onFulfilled) ? resolve(onFulfilled(result)) : resolve(result)
    } else if (state === REJECTED) {
      isFunction(onRejected) ? resolve(onRejected(result)) : reject(result)
    }
  } catch (error) {
    reject(error)
  }
}

module.exports = Promise
