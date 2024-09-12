// link: https://babeljs.io/repl#?browsers=chrome%2050&build=&builtIns=false&corejs=3.21&spec=false&loose=false&code_lz=IYZwngdgxgBAZgV2gFwJYHsIwLbFRACgEoBvAKBhmAHc9kYBGAbjIF8zd9ig&debug=false&forceAllTransforms=false&modules=umd&shippedProposals=false&evaluate=false&fileSize=false&timeTravel=false&sourceType=script&lineWrap=true&presets=env%2Creact%2Cstage-2&prettier=true&targets=&version=7.22.20&externalPlugins=&assumptions=%7B%7D

/*
async function main(){
  await 1;
}
main()
*/


function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }
    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }
  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
        args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);
        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }
        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }
        _next(undefined);
      });
    };
  }
  function main() {
    return _main.apply(this, arguments);
  }
  function _main() {
    _main = _asyncToGenerator(function* () {
      yield 1;
    });
    return _main.apply(this, arguments);
  }
  main();
  