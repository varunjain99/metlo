const os = require("node:os")
const Modules = require("./modules")
const WorkerPool = require("./pool");
const path = require("path")

const pool = new WorkerPool(os.cpus().length, './workerTarget.js');

function exit() {
    pool.close()
}

console.log(require(path.resolve(__dirname, "../package.json")).dependencies)

process.on('exit', exit);
process.on('SIGTERM', exit);

module.exports = function (key, host) {
    Modules({ host, key, pool })
}