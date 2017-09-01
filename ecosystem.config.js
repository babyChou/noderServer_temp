module.exports = {
  apps : [{
    name   : "firstApp",
    script : "./bin/www",
    watch: true,
    "ignore_watch" : ["node_modules", "doc"],
    "node_args": ["--debug"],
    combine_logs : true,
    env: {
    	"PORT": "3000",
    }
  }]
}
